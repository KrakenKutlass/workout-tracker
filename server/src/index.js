require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize DB (creates tables + seeds default user)
const db = require('./db');

const workoutsRouter = require('./routes/workouts');
const usersRouter = require('./routes/users');
const notificationsRouter = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/workouts', workoutsRouter);
app.use('/api/users', usersRouter);
app.use('/api/notifications', notificationsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🏋️  Rehab Loop Server running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   API base: http://localhost:${PORT}/api\n`);

  // Start scheduler after server is up
  try {
    const { scheduleReminders } = require('./scheduler');
    scheduleReminders();
    console.log('⏰ Notification scheduler started\n');
  } catch (err) {
    console.error('Scheduler startup error:', err.message);
  }
});

module.exports = app;
