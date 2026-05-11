const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { scheduleReminders } = require('../scheduler');

// GET /api/users/me - get current user settings
router.get('/me', async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', 1)
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
      .eq('id', 1)
      .single();
    if (userError) throw new Error(userError.message);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updatedName = name !== undefined ? name : user.name;
    const updatedEmail = email !== undefined ? email : user.email;
    const updatedPhone = phone !== undefined ? phone : user.phone;
    const updatedStartDate = start_date !== undefined ? start_date : user.start_date;
    const updatedInjuryMode = injury_mode !== undefined ? !!injury_mode : user.injury_mode;
    const updatedReminderTime = reminder_time !== undefined ? reminder_time : user.reminder_time;

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
      })
      .eq('id', 1)
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
      .eq('id', 1);
    if (updateError) throw new Error(updateError.message);

    // Clear all workout logs on reset
    const { error: deleteLogsError } = await supabase
      .from('workout_logs')
      .delete()
      .eq('user_id', 1);
    if (deleteLogsError) throw new Error(deleteLogsError.message);

    const { error: deleteNotifsError } = await supabase
      .from('notification_logs')
      .delete()
      .eq('user_id', 1);
    if (deleteNotifsError) throw new Error(deleteNotifsError.message);

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', 1)
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

module.exports = router;
