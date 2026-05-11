const express = require('express');
const router = express.Router();
const db = require('../db');
const { scheduleReminders } = require('../scheduler');

// GET /api/users/me - get current user settings
router.get('/me', (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = 1').get();
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      ...user,
      injury_mode: user.injury_mode === 1,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/users/me - update user settings
router.patch('/me', (req, res) => {
  try {
    const { name, email, phone, start_date, injury_mode, reminder_time } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE id = 1').get();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updatedName = name !== undefined ? name : user.name;
    const updatedEmail = email !== undefined ? email : user.email;
    const updatedPhone = phone !== undefined ? phone : user.phone;
    const updatedStartDate = start_date !== undefined ? start_date : user.start_date;
    const updatedInjuryMode = injury_mode !== undefined ? (injury_mode ? 1 : 0) : user.injury_mode;
    const updatedReminderTime = reminder_time !== undefined ? reminder_time : user.reminder_time;

    // Validate reminder_time format (HH:MM)
    if (reminder_time && !/^\d{2}:\d{2}$/.test(reminder_time)) {
      return res.status(400).json({ error: 'reminder_time must be in HH:MM format' });
    }

    db.prepare(`
      UPDATE users
      SET name = ?, email = ?, phone = ?, start_date = ?,
          injury_mode = ?, reminder_time = ?
      WHERE id = 1
    `).run(updatedName, updatedEmail, updatedPhone, updatedStartDate, updatedInjuryMode, updatedReminderTime);

    // Reschedule notifications if reminder time changed
    if (reminder_time !== undefined && reminder_time !== user.reminder_time) {
      scheduleReminders();
    }

    const updated = db.prepare('SELECT * FROM users WHERE id = 1').get();
    res.json({
      ...updated,
      injury_mode: updated.injury_mode === 1,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users/reset - reset the program start date to today
router.post('/reset', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    db.prepare("UPDATE users SET start_date = ? WHERE id = 1").run(today);

    // Clear all workout logs on reset
    db.prepare("DELETE FROM workout_logs WHERE user_id = 1").run();
    db.prepare("DELETE FROM notification_logs WHERE user_id = 1").run();

    const user = db.prepare('SELECT * FROM users WHERE id = 1').get();
    res.json({
      message: 'Program reset successfully',
      user: { ...user, injury_mode: user.injury_mode === 1 },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
