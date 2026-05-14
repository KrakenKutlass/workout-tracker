const nodemailer = require('nodemailer');
require('dotenv').config();

let twilioClient = null;

// Initialize Twilio client lazily to handle missing credentials gracefully
function getTwilioClient() {
  if (twilioClient) return twilioClient;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (
    sid && token &&
    !sid.startsWith('ACplaceholder') &&
    token !== 'placeholder_auth_token_00000000000000'
  ) {
    try {
      twilioClient = require('twilio')(sid, token);
    } catch (err) {
      console.warn('Twilio initialization failed:', err.message);
    }
  }
  return twilioClient;
}

// Create Nodemailer transporter
function getTransporter() {
  const user = process.env.NODEMAILER_USER;
  const pass = process.env.NODEMAILER_PASS;
  if (
    !user || !pass ||
    user === 'placeholder@gmail.com' ||
    pass === 'placeholder_password'
  ) {
    return null;
  }
  return nodemailer.createTransporter({
    host: process.env.NODEMAILER_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.NODEMAILER_PORT || '587'),
    secure: false,
    auth: { user, pass },
  });
}

async function sendEmail({ to, subject, html, text }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log('[Email] Skipped - credentials not configured');
    return { success: false, reason: 'credentials_not_configured' };
  }
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@kraken2shape.app',
      to,
      subject,
      html,
      text,
    });
    console.log('[Email] Sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[Email] Send failed:', err.message);
    return { success: false, reason: err.message };
  }
}

async function sendSMS({ to, body }) {
  const client = getTwilioClient();
  if (!client) {
    console.log('[SMS] Skipped - credentials not configured');
    return { success: false, reason: 'credentials_not_configured' };
  }
  try {
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_FROM,
      to,
    });
    console.log('[SMS] Sent:', message.sid);
    return { success: true, sid: message.sid };
  } catch (err) {
    console.error('[SMS] Send failed:', err.message);
    return { success: false, reason: err.message };
  }
}

async function sendWorkoutReminder(user, workoutType, weekNumber) {
  const workoutNames = { A: 'Upper Body + Core', B: 'Lower Body + Rehab', C: 'Full Body Conditioning' };
  const workoutName = workoutNames[workoutType] || workoutType;

  const appUrl = process.env.APP_URL || 'http://squidslab.utopian.it:3004';
  const subject = `Kraken2Shape: Workout ${workoutType} reminder`;
  const bodyText = `Hey ${user.name},\n\nYou haven't completed your workout today!\n\nToday's workout: ${workoutName} (Workout ${workoutType}) - Week ${weekNumber}\n\nOpen the app to get started: ${appUrl}\n\nStay consistent!\nKraken2Shape`;
  const bodyHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Kraken2Shape</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 5px 0 0;">Daily Workout Reminder</p>
      </div>
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
        <p style="font-size: 18px; color: #333;">Hey <strong>${user.name}</strong>,</p>
        <p style="color: #555;">You haven't completed your workout yet today. Don't break your streak!</p>
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea;">
          <p style="margin: 0; font-size: 14px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Today's Workout</p>
          <p style="margin: 8px 0 0; font-size: 22px; font-weight: bold; color: #333;">${workoutName}</p>
          <p style="margin: 4px 0 0; color: #667eea; font-weight: 600;">Workout ${workoutType} &bull; Week ${weekNumber}</p>
        </div>
        <a href="${appUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Start Workout Now</a>
        <p style="margin-top: 30px; color: #888; font-size: 14px;">Stay consistent - Kraken2Shape</p>
      </div>
    </div>
  `;

  const emailResult = await sendEmail({
    to: user.email,
    subject,
    html: bodyHtml,
    text: bodyText,
  });

  const smsBody = `Kraken2Shape: Hey ${user.name}, don't forget your Workout ${workoutType} today (${workoutName}, Week ${weekNumber}). Keep the streak going! ${appUrl}`;
  const smsResult = await sendSMS({ to: user.phone, body: smsBody });

  return { email: emailResult, sms: smsResult };
}

module.exports = { sendEmail, sendSMS, sendWorkoutReminder };
