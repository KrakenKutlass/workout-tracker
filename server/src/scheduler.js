const cron = require('node-cron');
const db = require('./db');
const { sendWorkoutReminder } = require('./notifications');
const { getWorkoutTypeForDay, getWeekNumber } = require('./workoutData');

// Track active cron jobs so we can restart them when settings change
let scheduledJobs = {};

function getDayIndex(startDate) {
  const start = new Date(startDate);
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffMs = today - start;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

async function checkAndNotifyUser(user) {
  const today = new Date().toISOString().split('T')[0];

  // Check how many notifications sent today for this user
  const notifCount = db.prepare(
    'SELECT COUNT(*) as count FROM notification_logs WHERE user_id = ? AND date = ?'
  ).get(user.id, today);

  if (notifCount.count >= 2) {
    console.log(`[Scheduler] Max notifications (2) already sent to user ${user.id} today`);
    return;
  }

  // Check if workout already completed
  const log = db.prepare(
    "SELECT status FROM workout_logs WHERE user_id = ? AND date = ?"
  ).get(user.id, today);

  if (log && log.status === 'completed') {
    console.log(`[Scheduler] User ${user.id} already completed workout today`);
    return;
  }

  // Calculate today's workout
  const dayIndex = getDayIndex(user.start_date);
  if (dayIndex < 0) {
    console.log(`[Scheduler] Program hasn't started yet for user ${user.id}`);
    return;
  }

  const workoutType = getWorkoutTypeForDay(dayIndex);
  const weekNumber = Math.min(getWeekNumber(dayIndex), 12);

  console.log(`[Scheduler] Sending reminder to user ${user.id} for workout ${workoutType} week ${weekNumber}`);

  const result = await sendWorkoutReminder(user, workoutType, weekNumber);

  // Log the notifications
  const insertNotif = db.prepare(
    'INSERT INTO notification_logs (user_id, date, type) VALUES (?, ?, ?)'
  );

  if (result.email) {
    insertNotif.run(user.id, today, 'email');
  }
  if (result.sms) {
    insertNotif.run(user.id, today, 'sms');
  }

  return result;
}

function scheduleReminders() {
  // Stop existing jobs
  Object.values(scheduledJobs).forEach(job => {
    if (job && job.stop) job.stop();
  });
  scheduledJobs = {};

  try {
    const users = db.prepare('SELECT * FROM users').all();

    users.forEach(user => {
      const [hours, minutes] = (user.reminder_time || '20:00').split(':');
      const cronExpression = `${minutes} ${hours} * * *`;

      if (!cron.validate(cronExpression)) {
        console.warn(`[Scheduler] Invalid cron expression for user ${user.id}: ${cronExpression}`);
        return;
      }

      const job = cron.schedule(cronExpression, async () => {
        console.log(`[Scheduler] Running reminder check for user ${user.id} at ${user.reminder_time}`);
        try {
          // Refresh user data before sending
          const freshUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
          if (freshUser) {
            await checkAndNotifyUser(freshUser);
          }
        } catch (err) {
          console.error(`[Scheduler] Error checking user ${user.id}:`, err.message);
        }
      }, { timezone: 'Europe/London' });

      scheduledJobs[user.id] = job;
      console.log(`[Scheduler] Scheduled reminder for user ${user.id} at ${user.reminder_time}`);
    });
  } catch (err) {
    console.error('[Scheduler] Error setting up schedules:', err.message);
  }
}

module.exports = { scheduleReminders, checkAndNotifyUser };
