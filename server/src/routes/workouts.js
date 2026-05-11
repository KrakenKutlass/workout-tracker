const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { getWorkoutMeta, getPhase, WORKOUT_ROTATION } = require('../workoutData');

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

async function getCompletedCount(userId) {
  const { count, error } = await supabase
    .from('workout_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'completed');
  if (error) throw new Error(error.message);
  return count || 0;
}

// GET /api/workouts/today - get today's workout info
router.get('/today', async (req, res) => {
  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.userId)
      .single();
    if (userError) throw new Error(userError.message);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const today = getTodayInTimezone(user.timezone);
    const completedCount = await getCompletedCount(req.userId);

    if (completedCount >= 84) {
      return res.json({
        programDay: 84,
        message: 'Program complete! You have finished all 84 workouts.',
        completedCount,
      });
    }

    // Fetch today's log first so we can determine the correct workout index.
    // After completing today's workout, completedCount already includes it, so
    // WORKOUT_ROTATION[completedCount % 7] would point to tomorrow's workout.
    // We correct for this by stepping back one when today is already completed.
    let { data: log, error: logError } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', req.userId)
      .eq('date', today)
      .maybeSingle();
    if (logError) throw new Error(logError.message);

    const todayCompleted = log?.status === 'completed';

    // todayIndex = position in the 84-workout sequence for today's slot
    const todayIndex = todayCompleted ? completedCount - 1 : completedCount;
    const programDay = todayIndex + 1;
    const workoutType = log?.workout_type || WORKOUT_ROTATION[todayIndex % 7];
    const weekNumber = Math.floor(todayIndex / 7) + 1;
    const workoutMeta = getWorkoutMeta(workoutType, weekNumber, user.injury_mode === true);

    // Tomorrow's workout = always the next uncompleted slot
    const tomorrowIndex = completedCount; // after completion this is already +1
    const tomorrowWorkoutType = WORKOUT_ROTATION[tomorrowIndex % 7];
    const tomorrowWeekNumber = Math.min(Math.floor(tomorrowIndex / 7) + 1, 12);
    const tomorrowWorkout = todayCompleted && tomorrowIndex < 84
      ? getWorkoutMeta(tomorrowWorkoutType, tomorrowWeekNumber, user.injury_mode === true)
      : null;

    if (!log) {
      const { error: insertError } = await supabase
        .from('workout_logs')
        .upsert(
          { user_id: req.userId, date: today, workout_type: workoutType, status: 'not_started', completed_exercises: [] },
          { onConflict: 'user_id,date' }
        );
      if (insertError) throw new Error(insertError.message);

      const { data: newLog, error: newLogError } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', req.userId)
        .eq('date', today)
        .single();
      if (newLogError) throw new Error(newLogError.message);
      log = newLog;
    }

    // Calculate streak
    const streak = await calculateStreak(req.userId, today);

    res.json({
      today,
      programDay,
      weekNumber,
      phase: getPhase(weekNumber),
      workoutType,
      workout: workoutMeta,
      tomorrowWorkout,
      tomorrowWorkoutType: todayCompleted ? tomorrowWorkoutType : null,
      log: {
        ...log,
        completed_exercises: log.completed_exercises || [],
        stats: log.stats || {},
      },
      streak,
      injuryMode: user.injury_mode === true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/workouts/progress - get 12-week progress grid
router.get('/progress', async (req, res) => {
  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.userId)
      .single();
    if (userError) throw new Error(userError.message);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const today = getTodayInTimezone(user.timezone);
    const completedCount = await getCompletedCount(req.userId);

    // Get completed logs ordered by date
    const { data: completedLogs, error: logsError } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', req.userId)
      .eq('status', 'completed')
      .order('date', { ascending: true });
    if (logsError) throw new Error(logsError.message);

    // Check for in_progress log today
    const { data: inProgressLog, error: inProgressError } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', req.userId)
      .eq('date', today)
      .eq('status', 'in_progress')
      .maybeSingle();
    if (inProgressError) throw new Error(inProgressError.message);

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

    const streak = await calculateStreak(req.userId, today);

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
router.get('/:date', async (req, res) => {
  try {
    const { date } = req.params;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.userId)
      .single();
    if (userError) throw new Error(userError.message);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Find the log for this date
    const { data: log, error: logError } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', req.userId)
      .eq('date', date)
      .maybeSingle();
    if (logError) throw new Error(logError.message);

    if (!log) {
      return res.status(404).json({ error: 'No workout log found for this date' });
    }

    // Get completion-based position of this log
    const { data: completedLogs, error: completedLogsError } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', req.userId)
      .eq('status', 'completed')
      .order('date', { ascending: true });
    if (completedLogsError) throw new Error(completedLogsError.message);

    const logIndex = completedLogs.findIndex(l => l.date === date);

    // Determine day index: if completed, use its position; else use completedCount
    const completedCount = await getCompletedCount(req.userId);
    const dayIndex = logIndex >= 0 ? logIndex : completedCount;

    const weekNumber = Math.min(Math.floor(dayIndex / 7) + 1, 12);
    const workoutType = log.workout_type;
    const workoutMeta = getWorkoutMeta(workoutType, weekNumber, user.injury_mode === true);

    res.json({
      date,
      programDay: dayIndex + 1,
      weekNumber,
      workoutType,
      workout: workoutMeta,
      log: {
        ...log,
        completed_exercises: log.completed_exercises || [],
        stats: log.stats || {},
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/workouts/log - create or update a workout log
router.post('/log', async (req, res) => {
  try {
    const { date, workout_type, status, completed_exercises, notes } = req.body;

    if (!date || !workout_type || !status) {
      return res.status(400).json({ error: 'date, workout_type and status are required' });
    }

    const validStatuses = ['not_started', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'status must be not_started, in_progress, or completed' });
    }

    const { error: upsertError } = await supabase
      .from('workout_logs')
      .upsert(
        {
          user_id: req.userId,
          date,
          workout_type,
          status,
          completed_exercises: completed_exercises || [],
          notes: notes || null,
        },
        { onConflict: 'user_id,date' }
      );
    if (upsertError) throw new Error(upsertError.message);

    const { data: log, error: logError } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', req.userId)
      .eq('date', date)
      .single();
    if (logError) throw new Error(logError.message);

    res.json({
      ...log,
      completed_exercises: log.completed_exercises || [],
      stats: log.stats || {},
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/workouts/complete/:date - mark a workout as complete with stats
router.post('/complete/:date', async (req, res) => {
  try {
    const { date } = req.params;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const { heart_rate_peak, heart_rate_avg, rpe, duration_minutes, notes } = req.body;
    const stats = { heart_rate_peak, heart_rate_avg, rpe, duration_minutes, notes };

    const { data: existingLog, error: existingError } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', req.userId)
      .eq('date', date)
      .maybeSingle();
    if (existingError) throw new Error(existingError.message);

    if (!existingLog) {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', req.userId)
        .single();
      if (userError) throw new Error(userError.message);

      const completedCount = await getCompletedCount(req.userId);
      const workoutType = WORKOUT_ROTATION[completedCount % 7];

      const { error: insertError } = await supabase
        .from('workout_logs')
        .insert({
          user_id: req.userId,
          date,
          workout_type: workoutType,
          status: 'completed',
          completed_exercises: [],
          stats,
        });
      if (insertError) throw new Error(insertError.message);
    } else {
      const { error: updateError } = await supabase
        .from('workout_logs')
        .update({ status: 'completed', stats })
        .eq('user_id', req.userId)
        .eq('date', date);
      if (updateError) throw new Error(updateError.message);
    }

    const { data: updated, error: updatedError } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', req.userId)
      .eq('date', date)
      .single();
    if (updatedError) throw new Error(updatedError.message);

    res.json({
      ...updated,
      completed_exercises: updated.completed_exercises || [],
      stats: updated.stats || {},
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/workouts/log/:date/exercise - toggle individual exercise completion
router.patch('/log/:date/exercise', async (req, res) => {
  try {
    const { date } = req.params;
    const { exerciseId, completed } = req.body;

    if (!exerciseId) {
      return res.status(400).json({ error: 'exerciseId is required' });
    }

    const { data: log, error: logError } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', req.userId)
      .eq('date', date)
      .maybeSingle();
    if (logError) throw new Error(logError.message);

    if (!log) {
      return res.status(404).json({ error: 'Workout log not found for this date' });
    }

    let completedExercises = log.completed_exercises || [];

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

    const { error: updateError } = await supabase
      .from('workout_logs')
      .update({ completed_exercises: completedExercises, status: newStatus })
      .eq('user_id', req.userId)
      .eq('date', date);
    if (updateError) throw new Error(updateError.message);

    const { data: updated, error: updatedError } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', req.userId)
      .eq('date', date)
      .single();
    if (updatedError) throw new Error(updatedError.message);

    res.json({
      ...updated,
      completed_exercises: updated.completed_exercises || [],
      stats: updated.stats || {},
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

async function calculateStreak(userId, today) {
  const { data: logs, error } = await supabase
    .from('workout_logs')
    .select('date, status')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('date', { ascending: false });
  if (error) throw new Error(error.message);

  if (!logs || !logs.length) return 0;

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
