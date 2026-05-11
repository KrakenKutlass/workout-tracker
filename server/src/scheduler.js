const cron = require('node-cron');
const supabase = require('./supabase');
const { sendWorkoutReminder } = require('./notifications');
const { WORKOUT_ROTATION, getWorkoutMeta } = require('./workoutData');

let scheduledJobs = {};
let midnightJob = null;

function getTodayInTimezone(timezone) {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone || 'Europe/London',
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date());
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
}

function getYesterdayInTimezone(timezone) {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone || 'Europe/London',
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(yesterday);
  } catch (e) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }
}

async function markMissedWorkouts() {
  try {
    const { data: users, error } = await supabase.from('users').select('*');
    if (error || !users) return;

    for (const user of users) {
      const yesterday = getYesterdayInTimezone(user.timezone);
      const { error: updateError } = await supabase
        .from('workout_logs')
        .update({ status: 'missed' })
        .eq('user_id', user.id)
        .eq('date', yesterday)
        .in('status', ['not_started', 'in_progress']);
      if (updateError) {
        console.error(`[Scheduler] Error marking missed for user ${user.id}:`, updateError.message);
      }
    }
    console.log('[Scheduler] Missed workout check complete');
  } catch (err) {
    console.error('[Scheduler] Error in markMissedWorkouts:', err.message);
  }
}

async function checkAndNotifyUser(user) {
  const today = getTodayInTimezone(user.timezone);

  const { count, error: countError } = await supabase
    .from('notification_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('date', today);
  if (countError) throw new Error(countError.message);
  if (count >= 2) return;

  const { data: log, error: logError } = await supabase
    .from('workout_logs')
    .select('status')
    .eq('user_id', user.id)
    .eq('date', today)
    .maybeSingle();
  if (logError) throw new Error(logError.message);
  if (log && log.status === 'completed') return;

  // Get completion-based workout type
  const { count: completedCount } = await supabase
    .from('workout_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed');

  const workoutType = WORKOUT_ROTATION[(completedCount || 0) % 7];
  const weekNumber = Math.min(Math.floor((completedCount || 0) / 7) + 1, 12);

  const result = await sendWorkoutReminder(user, workoutType, weekNumber);

  if (result.email?.success) {
    await supabase.from('notification_logs').insert({ user_id: user.id, date: today, type: 'email' });
  }
  if (result.sms?.success) {
    await supabase.from('notification_logs').insert({ user_id: user.id, date: today, type: 'sms' });
  }

  return result;
}

async function scheduleReminders() {
  Object.values(scheduledJobs).forEach(job => job?.stop?.());
  scheduledJobs = {};
  midnightJob?.stop?.();

  // Hourly midnight check — marks yesterday's incomplete logs as missed
  // Runs every hour so it catches all user timezones near their midnight
  midnightJob = cron.schedule('0 * * * *', async () => {
    console.log('[Scheduler] Running hourly missed workout check');
    await markMissedWorkouts();
  });

  try {
    const { data: users, error } = await supabase.from('users').select('*');
    if (error) throw new Error(error.message);

    users.forEach(user => {
      const [hours, minutes] = (user.reminder_time || '20:00').split(':');
      const cronExpression = `${minutes} ${hours} * * *`;
      const userTimezone = user.timezone || 'Europe/London';

      if (!cron.validate(cronExpression)) {
        console.warn(`[Scheduler] Invalid cron expression for user ${user.id}: ${cronExpression}`);
        return;
      }

      const job = cron.schedule(cronExpression, async () => {
        try {
          const { data: freshUser } = await supabase.from('users').select('*').eq('id', user.id).maybeSingle();
          if (freshUser) await checkAndNotifyUser(freshUser);
        } catch (err) {
          console.error(`[Scheduler] Error checking user ${user.id}:`, err.message);
        }
      }, { timezone: userTimezone });

      scheduledJobs[user.id] = job;
      console.log(`[Scheduler] Scheduled reminder for user ${user.id} at ${user.reminder_time} (${userTimezone})`);
    });
  } catch (err) {
    console.error('[Scheduler] Error setting up schedules:', err.message);
  }
}

module.exports = { scheduleReminders, checkAndNotifyUser };
