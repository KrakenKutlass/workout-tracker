const express = require('express');
const router = express.Router();
const db = require('../db');
const { sendWorkoutReminder, sendEmail, sendSMS } = require('../notifications');
const { getWorkoutTypeForDay, getWeekNumber } = require('../workoutData');
const { checkAndNotifyUser } = require('../scheduler');

function getDayIndex(startDate) {
  const start = new Date(startDate);
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffMs = today - start;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

// GET /api/notifications/config-status - check which credentials are configured
router.get('/config-status', (req, res) => {
  const emailUser = process.env.NODEMAILER_USER;
  const emailPass = process.env.NODEMAILER_PASS;
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_FROM;

  const emailConfigured = !!(emailUser && emailPass &&
    emailUser !== 'placeholder@gmail.com' &&
    emailPass !== 'placeholder_password');

  const smsConfigured = !!(twilioSid && twilioToken && twilioFrom &&
    !twilioSid.startsWith('ACplaceholder') &&
    twilioToken !== 'placeholder_auth_token_00000000000000');

  res.json({
    email: {
      configured: emailConfigured,
      missing: emailConfigured ? [] : [
        !emailUser || emailUser === 'placeholder@gmail.com' ? 'NODEMAILER_USER' : null,
        !emailPass || emailPass === 'placeholder_password' ? 'NODEMAILER_PASS' : null,
      ].filter(Boolean),
    },
    sms: {
      configured: smsConfigured,
      missing: smsConfigured ? [] : [
        !twilioSid || twilioSid.startsWith('ACplaceholder') ? 'TWILIO_ACCOUNT_SID' : null,
        !twilioToken || twilioToken === 'placeholder_auth_token_00000000000000' ? 'TWILIO_AUTH_TOKEN' : null,
        !twilioFrom || twilioFrom === '+15005550006' ? 'TWILIO_FROM' : null,
      ].filter(Boolean),
    },
  });
});

// GET /api/notifications/logs - get notification history
router.get('/logs', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const logs = db.prepare(
      'SELECT * FROM notification_logs WHERE user_id = 1 ORDER BY sent_at DESC LIMIT ?'
    ).all(limit);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications/test - send a test notification
router.post('/test', async (req, res) => {
  try {
    const { type } = req.body; // 'email', 'sms', or 'both'
    const user = db.prepare('SELECT * FROM users WHERE id = 1').get();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const results = {};

    if (type === 'email' || type === 'both' || !type) {
      results.email = await sendEmail({
        to: user.email,
        subject: 'Rehab Loop - Test Notification',
        text: 'This is a test notification from Rehab Loop. Your notifications are configured correctly!',
        html: '<p>This is a test notification from <strong>Rehab Loop</strong>. Your notifications are configured correctly!</p>',
      });
    }

    if (type === 'sms' || type === 'both') {
      results.sms = await sendSMS({
        to: user.phone,
        body: 'Rehab Loop: Test notification. Your SMS reminders are working!',
      });
    }

    res.json({ message: 'Test notification sent', results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications/trigger - manually trigger the daily check
router.post('/trigger', async (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = 1').get();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const result = await checkAndNotifyUser(user);
    res.json({ message: 'Notification check triggered', result: result || { message: 'Already completed or max notifications sent' } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications/reminder - send a workout reminder directly
router.post('/reminder', async (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = 1').get();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const dayIndex = getDayIndex(user.start_date);
    const clampedDay = Math.max(0, Math.min(dayIndex, 83));
    const workoutType = getWorkoutTypeForDay(clampedDay);
    const weekNumber = Math.min(getWeekNumber(clampedDay), 12);

    const result = await sendWorkoutReminder(user, workoutType, weekNumber);

    // Log it
    const today = new Date().toISOString().split('T')[0];
    const insertNotif = db.prepare(
      'INSERT INTO notification_logs (user_id, date, type) VALUES (?, ?, ?)'
    );
    if (result.email && result.email.success) insertNotif.run(user.id, today, 'email');
    if (result.sms && result.sms.success) insertNotif.run(user.id, today, 'sms');

    res.json({ message: 'Reminder sent', result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
