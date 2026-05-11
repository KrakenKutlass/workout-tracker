const express = require('express');
const router = express.Router();
const db = require('../db');
const { getWorkoutMeta, getPhase, WORKOUT_ROTATION } = require('../workoutData');

function getCompletedCount(userId) {
  return db.prepare(
    "SELECT COUNT(*) as count FROM workout_logs WHERE user_id = ? AND status = 'completed'"
  ).get(userId).count;
}

// GET /api/workouts/today - get today's workout info
router.get('/today', (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = 1').get();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const today = new Date().toISOString().split('T')[0];
    const completedCount = getCompletedCount(user.id);

    if (completedCount >= 84) {
      return res.json({
        programDay: 84,
        message: 'Program complete! You have finished all 84 workouts.',
        completedCount,
      });
    }

    const programDay = completedCount + 1;
    const workoutType = WORKOUT_ROTATION[completedCount % 7];
    const weekNumber = Math.floor(completedCount / 7) + 1;
    const workoutMeta = getWorkoutMeta(workoutType, weekNumber, user.injury_mode === 1);

    // Get or create today's log
    let log = db.prepare('SELECT * FROM workout_logs WHERE user_id = 1 AND date = ?').get(today);

    if (!log) {
      db.prepare(
        "INSERT OR IGNORE INTO workout_logs (user_id, date, workout_type, status, completed_exercises) VALUES (1, ?, ?, 'not_started', '[]')"
      ).run(today, workoutType);
      log = db.prepare('SELECT * FROM workout_logs WHERE user_id = 1 AND date = ?').get(today);
    }

    // Calculate streak
    const streak = calculateStreak(user.id, today);

    res.json({
      today,
      programDay,
      weekNumber,
      phase: getPhase(weekNumber),
      workoutType,
      workout: workoutMeta,
      log: {
        ...log,
        completed_exercises: JSON.parse(log.completed_exercises || '[]'),
        stats: JSON.parse(log.stats || '{}'),
      },
      streak,
      injuryMode: user.injury_mode === 1,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/workouts/progress - get 12-week progress grid
router.get('/progress', (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = 1').get();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const today = new Date().toISOString().split('T')[0];
    const completedCount = getCompletedCount(user.id);

    // Get completed logs ordered by date
    const completedLogs = db.prepare(
      "SELECT * FROM workout_logs WHERE user_id = 1 AND status = 'completed' ORDER BY date ASC"
    ).all();

    // Check for in_progress log today
    const inProgressLog = db.prepare(
      "SELECT * FROM workout_logs WHERE user_id = 1 AND date = ? AND status = 'in_progress'"
    ).get(today);

    // Build 84-slot grid (completion-based, not calendar-based)
    const grid = [];
    for (let i = 0; i < 84; i++) {
      const workoutType = WORKOUT_ROTATION[i % 7];
      const weekNumber = Math.floor(i / 7) + 1;

      if (i < completedCount) {
        // Completed slot - use actual completion date
        const log = completedLogs[i];
        grid.push({
          day: i + 1,
          date: log ? log.date : null,
          weekNumber,
          workoutType,
          status: 'completed',
          isToday: false,
          isPast: true,
          isFuture: false,
        });
      } else if (i === completedCount) {
        // Current slot - today's workout
        grid.push({
          day: i + 1,
          date: today,
          weekNumber,
          workoutType,
          status: inProgressLog ? 'in_progress' : 'not_started',
          isToday: true,
          isPast: false,
          isFuture: false,
        });
      } else {
        // Future slot - no date yet
        grid.push({
          day: i + 1,
          date: null,
          weekNumber,
          workoutType,
          status: 'future',
          isToday: false,
          isPast: false,
          isFuture: true,
        });
      }
    }

    const streak = calculateStreak(user.id, today);

    res.json({
      grid,
      currentDayIndex: completedCount,
      currentWeek: Math.min(Math.floor(completedCount / 7) + 1, 12),
      streak,
      completedCount,
      missedCount: 0,
      totalDays: completedCount + 1,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/workouts/:date - get workout for a specific date
router.get('/:date', (req, res) => {
  try {
    const { date } = req.params;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = 1').get();
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Find the log for this date
    const log = db.prepare('SELECT * FROM workout_logs WHERE user_id = 1 AND date = ?').get(date);

    if (!log) {
      return res.status(404).json({ error: 'No workout log found for this date' });
    }

    // Get completion-based position of this log
    const completedLogs = db.prepare(
      "SELECT * FROM workout_logs WHERE user_id = 1 AND status = 'completed' ORDER BY date ASC"
    ).all();
    const logIndex = completedLogs.findIndex(l => l.date === date);

    // Determine day index: if completed, use its position; else use completedCount
    const completedCount = getCompletedCount(user.id);
    const dayIndex = logIndex >= 0 ? logIndex : completedCount;

    const weekNumber = Math.min(Math.floor(dayIndex / 7) + 1, 12);
    const workoutType = log.workout_type;
    const workoutMeta = getWorkoutMeta(workoutType, weekNumber, user.injury_mode === 1);

    res.json({
      date,
      programDay: dayIndex + 1,
      weekNumber,
      workoutType,
      workout: workoutMeta,
      log: {
        ...log,
        completed_exercises: JSON.parse(log.completed_exercises || '[]'),
        stats: JSON.parse(log.stats || '{}'),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/workouts/log - create or update a workout log
router.post('/log', (req, res) => {
  try {
    const { date, workout_type, status, completed_exercises, notes } = req.body;

    if (!date || !workout_type || !status) {
      return res.status(400).json({ error: 'date, workout_type and status are required' });
    }

    const validStatuses = ['not_started', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'status must be not_started, in_progress, or completed' });
    }

    const completedExercisesStr = JSON.stringify(completed_exercises || []);

    const existing = db.prepare('SELECT id FROM workout_logs WHERE user_id = 1 AND date = ?').get(date);

    if (existing) {
      db.prepare(`
        UPDATE workout_logs
        SET workout_type = ?, status = ?, completed_exercises = ?, notes = ?,
            updated_at = datetime('now')
        WHERE user_id = 1 AND date = ?
      `).run(workout_type, status, completedExercisesStr, notes || null, date);
    } else {
      db.prepare(`
        INSERT INTO workout_logs (user_id, date, workout_type, status, completed_exercises, notes)
        VALUES (1, ?, ?, ?, ?, ?)
      `).run(date, workout_type, status, completedExercisesStr, notes || null);
    }

    const log = db.prepare('SELECT * FROM workout_logs WHERE user_id = 1 AND date = ?').get(date);
    res.json({
      ...log,
      completed_exercises: JSON.parse(log.completed_exercises || '[]'),
      stats: JSON.parse(log.stats || '{}'),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/workouts/complete/:date - mark a workout as complete with stats
router.post('/complete/:date', (req, res) => {
  try {
    const { date } = req.params;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const { heart_rate_peak, heart_rate_avg, rpe, duration_minutes, notes } = req.body;
    const stats = JSON.stringify({ heart_rate_peak, heart_rate_avg, rpe, duration_minutes, notes });

    let log = db.prepare('SELECT * FROM workout_logs WHERE user_id = 1 AND date = ?').get(date);

    if (!log) {
      const user = db.prepare('SELECT * FROM users WHERE id = 1').get();
      const completedCount = getCompletedCount(user.id);
      const workoutType = WORKOUT_ROTATION[completedCount % 7];
      db.prepare(
        "INSERT INTO workout_logs (user_id, date, workout_type, status, completed_exercises, stats) VALUES (1, ?, ?, 'completed', '[]', ?)"
      ).run(date, workoutType, stats);
    } else {
      db.prepare(`
        UPDATE workout_logs
        SET status = 'completed', stats = ?, updated_at = datetime('now')
        WHERE user_id = 1 AND date = ?
      `).run(stats, date);
    }

    const updated = db.prepare('SELECT * FROM workout_logs WHERE user_id = 1 AND date = ?').get(date);
    res.json({
      ...updated,
      completed_exercises: JSON.parse(updated.completed_exercises || '[]'),
      stats: JSON.parse(updated.stats || '{}'),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/workouts/log/:date/exercise - toggle individual exercise completion
router.patch('/log/:date/exercise', (req, res) => {
  try {
    const { date } = req.params;
    const { exerciseId, completed } = req.body;

    if (!exerciseId) {
      return res.status(400).json({ error: 'exerciseId is required' });
    }

    let log = db.prepare('SELECT * FROM workout_logs WHERE user_id = 1 AND date = ?').get(date);

    if (!log) {
      return res.status(404).json({ error: 'Workout log not found for this date' });
    }

    let completedExercises = JSON.parse(log.completed_exercises || '[]');

    if (completed) {
      if (!completedExercises.includes(exerciseId)) {
        completedExercises.push(exerciseId);
      }
    } else {
      completedExercises = completedExercises.filter(id => id !== exerciseId);
    }

    // Update status: in_progress if exercises checked, not_started if none
    // Never auto-complete - only POST /complete/:date sets status to 'completed'
    let newStatus = log.status;
    if (log.status !== 'completed') {
      if (completedExercises.length === 0) {
        newStatus = 'not_started';
      } else {
        newStatus = 'in_progress';
      }
    }

    db.prepare(`
      UPDATE workout_logs
      SET completed_exercises = ?, status = ?, updated_at = datetime('now')
      WHERE user_id = 1 AND date = ?
    `).run(JSON.stringify(completedExercises), newStatus, date);

    const updated = db.prepare('SELECT * FROM workout_logs WHERE user_id = 1 AND date = ?').get(date);
    res.json({
      ...updated,
      completed_exercises: JSON.parse(updated.completed_exercises || '[]'),
      stats: JSON.parse(updated.stats || '{}'),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

function calculateStreak(userId, today) {
  const logs = db.prepare(
    "SELECT date, status FROM workout_logs WHERE user_id = ? AND status = 'completed' ORDER BY date DESC"
  ).all(userId);

  if (!logs.length) return 0;

  const completedDates = new Set(logs.map(l => l.date));
  let streak = 0;

  // Allow today to not be completed yet and still keep streak
  // Start checking from yesterday if today not done
  let checkDate = new Date(today);
  if (!completedDates.has(today)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (completedDates.has(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

module.exports = router;
