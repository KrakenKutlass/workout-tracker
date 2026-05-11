const express = require('express');
const router = express.Router();
const db = require('../db');
const { getWorkoutTypeForDay, getWeekNumber, getWorkoutMeta, getPhase, WORKOUT_ROTATION } = require('../workoutData');

function getDayIndex(startDate) {
  const start = new Date(startDate);
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffMs = today - start;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function getDateDayIndex(startDate, targetDate) {
  const start = new Date(startDate);
  const target = new Date(targetDate);
  start.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffMs = target - start;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

// GET /api/workouts/today - get today's workout info
router.get('/today', (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = 1').get();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const today = new Date().toISOString().split('T')[0];
    const dayIndex = getDayIndex(user.start_date);

    if (dayIndex < 0) {
      return res.json({
        programDay: dayIndex,
        message: 'Program has not started yet',
        startDate: user.start_date,
      });
    }

    const clampedDay = Math.min(dayIndex, 83); // 12 weeks max
    const weekNumber = Math.min(getWeekNumber(clampedDay), 12);
    const workoutType = getWorkoutTypeForDay(clampedDay);
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
    const streak = calculateStreak(user.id, user.start_date, today);

    res.json({
      today,
      programDay: dayIndex + 1,
      weekNumber,
      phase: getPhase(weekNumber),
      workoutType,
      workout: workoutMeta,
      log: {
        ...log,
        completed_exercises: JSON.parse(log.completed_exercises || '[]'),
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

    const logs = db.prepare('SELECT * FROM workout_logs WHERE user_id = 1 ORDER BY date ASC').all();
    const logMap = {};
    logs.forEach(log => {
      logMap[log.date] = {
        ...log,
        completed_exercises: JSON.parse(log.completed_exercises || '[]'),
      };
    });

    const today = new Date().toISOString().split('T')[0];
    const currentDayIndex = getDayIndex(user.start_date);

    // Build 84-day grid (12 weeks × 7 days)
    const grid = [];
    for (let i = 0; i < 84; i++) {
      const date = new Date(user.start_date);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const weekNumber = Math.floor(i / 7) + 1;
      const workoutType = WORKOUT_ROTATION[i % 7];
      const log = logMap[dateStr];
      const isPast = dateStr < today;
      const isToday = dateStr === today;
      const isFuture = dateStr > today;

      let status = 'future';
      if (log) {
        status = log.status;
      } else if (isPast) {
        status = 'missed';
      } else if (isToday) {
        status = 'not_started';
      }

      grid.push({
        day: i + 1,
        date: dateStr,
        weekNumber,
        workoutType,
        status,
        isToday,
        isPast,
        isFuture,
      });
    }

    const streak = calculateStreak(user.id, user.start_date, today);
    const completedCount = logs.filter(l => l.status === 'completed').length;
    const missedCount = grid.filter(d => d.status === 'missed').length;

    res.json({
      grid,
      currentDayIndex,
      currentWeek: Math.min(Math.floor(currentDayIndex / 7) + 1, 12),
      streak,
      completedCount,
      missedCount,
      totalDays: Math.min(currentDayIndex + 1, 84),
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

    const dayIndex = getDateDayIndex(user.start_date, date);
    if (dayIndex < 0 || dayIndex >= 84) {
      return res.status(400).json({ error: 'Date is outside the 12-week program' });
    }

    const weekNumber = Math.min(getWeekNumber(dayIndex), 12);
    const workoutType = getWorkoutTypeForDay(dayIndex);
    const workoutMeta = getWorkoutMeta(workoutType, weekNumber, user.injury_mode === 1);
    const log = db.prepare('SELECT * FROM workout_logs WHERE user_id = 1 AND date = ?').get(date);

    res.json({
      date,
      programDay: dayIndex + 1,
      weekNumber,
      workoutType,
      workout: workoutMeta,
      log: log ? {
        ...log,
        completed_exercises: JSON.parse(log.completed_exercises || '[]'),
      } : null,
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

    // Auto-update status
    const user = db.prepare('SELECT * FROM users WHERE id = 1').get();
    const dayIndex = getDateDayIndex(user.start_date, date);
    const weekNumber = Math.min(getWeekNumber(dayIndex), 12);
    const workoutMeta = getWorkoutMeta(log.workout_type, weekNumber, user.injury_mode === 1);
    const totalExercises = workoutMeta.exercises.length;
    const completedCount = completedExercises.length;

    let newStatus = log.status;
    if (completedCount === 0) {
      newStatus = 'not_started';
    } else if (completedCount >= totalExercises) {
      newStatus = 'completed';
    } else {
      newStatus = 'in_progress';
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
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

function calculateStreak(userId, startDate, today) {
  const logs = db.prepare(
    "SELECT date, status FROM workout_logs WHERE user_id = ? AND status = 'completed' ORDER BY date DESC"
  ).all(userId);

  if (!logs.length) return 0;

  const completedDates = new Set(logs.map(l => l.date));
  let streak = 0;
  const current = new Date(today);

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
