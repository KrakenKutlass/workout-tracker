const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_URL || './data/rehab.db';
const dbDir = path.dirname(path.resolve(dbPath));

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(path.resolve(dbPath));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL DEFAULT 'User',
    email TEXT NOT NULL DEFAULT 'jamie@utopianit.co.uk',
    phone TEXT NOT NULL DEFAULT '+447932332111',
    start_date TEXT NOT NULL DEFAULT (date('now')),
    injury_mode INTEGER NOT NULL DEFAULT 0,
    reminder_time TEXT NOT NULL DEFAULT '20:00',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS workout_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 1,
    date TEXT NOT NULL,
    workout_type TEXT NOT NULL CHECK(workout_type IN ('A', 'B', 'C')),
    status TEXT NOT NULL DEFAULT 'not_started' CHECK(status IN ('not_started', 'in_progress', 'completed')),
    completed_exercises TEXT NOT NULL DEFAULT '[]',
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, date),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS notification_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 1,
    date TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('email', 'sms')),
    sent_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Add stats column to workout_logs if it doesn't exist (migration)
try {
  db.exec(`ALTER TABLE workout_logs ADD COLUMN stats TEXT DEFAULT '{}'`);
} catch(e) { /* column already exists */ }

// Seed default user if none exists
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (userCount.count === 0) {
  db.prepare(`
    INSERT INTO users (name, email, phone, start_date, injury_mode, reminder_time)
    VALUES (?, ?, ?, date('now', '-7 days'), 0, '20:00')
  `).run('Jamie', 'jamie@utopianit.co.uk', '+447932332111');
}

module.exports = db;
