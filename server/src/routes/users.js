const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { scheduleReminders } = require('../scheduler');

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

function calcStreak(completedDates, today) {
  if (!completedDates.length) return 0;
  const dateSet = new Set(completedDates);
  let streak = 0;
  let check = new Date(today + 'T12:00:00Z');
  if (!dateSet.has(today)) check.setDate(check.getDate() - 1);
  while (true) {
    const d = check.toISOString().split('T')[0];
    if (dateSet.has(d)) { streak++; check.setDate(check.getDate() - 1); }
    else break;
  }
  return streak;
}

// GET /api/users/me - get current user settings
router.get('/me', async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.userId)
      .single();
    if (error) throw new Error(error.message);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      ...user,
      injury_mode: user.injury_mode === true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/users/me - update user settings
router.patch('/me', async (req, res) => {
  try {
    const { name, email, phone, start_date, injury_mode, reminder_time } = req.body;

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.userId)
      .single();
    if (userError) throw new Error(userError.message);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updatedName = name !== undefined ? name : user.name;
    const updatedEmail = email !== undefined ? email : user.email;
    const updatedPhone = phone !== undefined ? phone : user.phone;
    const updatedStartDate = start_date !== undefined ? start_date : user.start_date;
    const updatedInjuryMode = injury_mode !== undefined ? !!injury_mode : user.injury_mode;
    const updatedReminderTime = reminder_time !== undefined ? reminder_time : user.reminder_time;
    const updatedTimezone = req.body.timezone !== undefined ? req.body.timezone : (user.timezone || 'Europe/London');

    // Validate reminder_time format (HH:MM)
    if (reminder_time && !/^\d{2}:\d{2}$/.test(reminder_time)) {
      return res.status(400).json({ error: 'reminder_time must be in HH:MM format' });
    }

    const { data: updated, error: updateError } = await supabase
      .from('users')
      .update({
        name: updatedName,
        email: updatedEmail,
        phone: updatedPhone,
        start_date: updatedStartDate,
        injury_mode: updatedInjuryMode,
        reminder_time: updatedReminderTime,
        timezone: updatedTimezone,
      })
      .eq('id', req.userId)
      .select()
      .single();
    if (updateError) throw new Error(updateError.message);

    // Reschedule notifications if reminder time changed
    if (reminder_time !== undefined && reminder_time !== user.reminder_time) {
      scheduleReminders();
    }

    res.json({
      ...updated,
      injury_mode: updated.injury_mode === true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users/reset - reset the program start date to today
router.post('/reset', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { error: updateError } = await supabase
      .from('users')
      .update({ start_date: today })
      .eq('id', req.userId);
    if (updateError) throw new Error(updateError.message);

    // Clear all workout logs on reset
    const { error: deleteLogsError } = await supabase
      .from('workout_logs')
      .delete()
      .eq('user_id', req.userId);
    if (deleteLogsError) throw new Error(deleteLogsError.message);

    const { error: deleteNotifsError } = await supabase
      .from('notification_logs')
      .delete()
      .eq('user_id', req.userId);
    if (deleteNotifsError) throw new Error(deleteNotifsError.message);

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.userId)
      .single();
    if (userError) throw new Error(userError.message);

    res.json({
      message: 'Program reset successfully',
      user: { ...user, injury_mode: user.injury_mode === true },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/leaderboard - streak scoreboard (no emails exposed)
router.get('/leaderboard', async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, timezone');
    if (error) throw new Error(error.message);

    const entries = await Promise.all(users.map(async (u) => {
      const today = getTodayInTimezone(u.timezone);
      const { data: logs } = await supabase
        .from('workout_logs')
        .select('date')
        .eq('user_id', u.id)
        .eq('status', 'completed')
        .order('date', { ascending: false });
      const streak = calcStreak((logs || []).map(l => l.date), today);
      return { name: u.name || 'Anonymous', streak, isMe: u.id === req.userId };
    }));

    // Filter out zero-streak users, sort descending
    const ranked = entries
      .filter(e => e.streak > 0)
      .sort((a, b) => b.streak - a.streak);

    res.json(ranked);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/me - delete account and all data
router.delete('/me', async (req, res) => {
  try {
    // Get the auth_id before deleting the user record
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('auth_id')
      .eq('id', req.userId)
      .single();
    if (userError) throw new Error(userError.message);

    // Delete all user data
    await supabase.from('notification_logs').delete().eq('user_id', req.userId);
    await supabase.from('workout_logs').delete().eq('user_id', req.userId);
    const { error: deleteUserError } = await supabase.from('users').delete().eq('id', req.userId);
    if (deleteUserError) throw new Error(deleteUserError.message);

    // Delete the Supabase Auth user (requires service role)
    if (user?.auth_id) {
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user.auth_id);
      if (authDeleteError) console.error('[DeleteAccount] Auth delete error:', authDeleteError.message);
    }

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
