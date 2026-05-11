import React, { useState, useEffect, useContext } from 'react';
import { usersApi, notificationsApi } from '../api.js';
import { ThemeContext } from '../App.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 ${
        checked ? 'bg-brand-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function Settings() {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [notifLogs, setNotifLogs] = useState([]);
  const [notifConfig, setNotifConfig] = useState(null);
  const [testingNotif, setTestingNotif] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    reminder_time: '20:00',
    injury_mode: false,
    start_date: '',
  });

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const [userData, logs, configStatus] = await Promise.all([
        usersApi.getMe(),
        notificationsApi.getLogs(10),
        notificationsApi.getConfigStatus(),
      ]);
      setUser(userData);
      setForm({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        reminder_time: userData.reminder_time || '20:00',
        injury_mode: userData.injury_mode || false,
        start_date: userData.start_date || '',
      });
      setNotifLogs(logs);
      setNotifConfig(configStatus);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    try {
      const updated = await usersApi.updateMe(form);
      setUser(updated);
      setSaveMsg({ type: 'success', text: 'Settings saved successfully!' });
    } catch (err) {
      setSaveMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 3000);
    }
  };

  const handleInjuryModeToggle = async (value) => {
    setForm(prev => ({ ...prev, injury_mode: value }));
    try {
      await usersApi.updateMe({ injury_mode: value });
      setSaveMsg({ type: 'success', text: `Flare-up mode ${value ? 'enabled' : 'disabled'}` });
      setTimeout(() => setSaveMsg(null), 2000);
    } catch (err) {
      setForm(prev => ({ ...prev, injury_mode: !value }));
      setSaveMsg({ type: 'error', text: err.message });
    }
  };

  const handleTestNotification = async (type) => {
    setTestingNotif(true);
    try {
      const result = await notificationsApi.sendTest(type);
      const emailResult = result.results?.email;
      const smsResult = result.results?.sms;
      const msgs = [];
      if (type !== 'sms') {
        if (emailResult?.success) msgs.push('✓ Email sent');
        else if (emailResult?.reason === 'credentials_not_configured') msgs.push('✗ Email: NODEMAILER_USER / NODEMAILER_PASS not set in .env');
        else msgs.push(`✗ Email failed: ${emailResult?.reason || 'unknown error'}`);
      }
      if (type !== 'email') {
        if (smsResult?.success) msgs.push('✓ SMS sent');
        else if (smsResult?.reason === 'credentials_not_configured') msgs.push('✗ SMS: TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN not set in .env');
        else msgs.push(`✗ SMS failed: ${smsResult?.reason || 'unknown error'}`);
      }
      const anyOk = emailResult?.success || smsResult?.success;
      setSaveMsg({ type: anyOk ? 'success' : 'error', text: msgs.join(' · ') });
      await load();
    } catch (err) {
      setSaveMsg({ type: 'error', text: err.message });
    } finally {
      setTestingNotif(false);
      setTimeout(() => setSaveMsg(null), 8000);
    }
  };

  const handleReset = async () => {
    try {
      await usersApi.resetProgram();
      setShowResetConfirm(false);
      setSaveMsg({ type: 'success', text: 'Program reset! Starting fresh from today.' });
      await load();
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (err) {
      setSaveMsg({ type: 'error', text: err.message });
    }
  };

  if (loading) return <LoadingSpinner message="Loading settings..." />;
  if (error) return <ErrorMessage error={error} onRetry={load} />;

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your preferences</p>
      </div>

      {/* Save message */}
      {saveMsg && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
          saveMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {saveMsg.text}
        </div>
      )}

      {/* Appearance */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Default is dark. Toggle for light mode.</p>
          </div>
          <Toggle checked={isDark} onChange={toggleTheme} />
        </div>
      </div>

      {/* Injury Mode - prominent */}
      <div className="card border-2 border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/30">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">⚠️</span>
              <h2 className="font-bold text-gray-900 dark:text-gray-100">Flare-up Mode</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              When active, all lower body loading is removed from Workout B.
              Exercises are replaced with isometric rehab movements and upper body work
              to allow recovery while staying active.
            </p>
            {form.injury_mode && (
              <p className="text-xs text-yellow-700 font-semibold mt-2 bg-yellow-100 rounded-lg px-2 py-1 inline-block">
                Active - reduced workout load in effect
              </p>
            )}
          </div>
          <Toggle checked={form.injury_mode} onChange={handleInjuryModeToggle} />
        </div>
      </div>

      {/* Profile settings */}
      <form onSubmit={handleSave} className="space-y-4">
        <div className="card">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Profile</h2>
          <div className="space-y-3">
            <div>
              <label className="label">Name</label>
              <input
                type="text"
                className="input"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={form.email}
                onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="label">Phone (for SMS reminders)</label>
              <input
                type="tel"
                className="input"
                value={form.phone}
                onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+447932332111"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Program Settings</h2>
          <div className="space-y-3">
            <div>
              <label className="label">Program Start Date</label>
              <input
                type="date"
                className="input"
                value={form.start_date}
                onChange={e => setForm(prev => ({ ...prev, start_date: e.target.value }))}
              />
              <p className="text-xs text-gray-400 mt-1">All workout logs will be relative to this date</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Notifications</h2>
          <div className="space-y-3">
            <div>
              <label className="label">Daily Reminder Time</label>
              <input
                type="time"
                className="input"
                value={form.reminder_time}
                onChange={e => setForm(prev => ({ ...prev, reminder_time: e.target.value }))}
              />
              <p className="text-xs text-gray-400 mt-1">
                You'll receive an email + SMS if workout not completed by this time. Max 2 reminders per day.
              </p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>

      {/* Notification testing */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Test Notifications</h2>

        {/* Credential status */}
        {notifConfig && (
          <div className="mb-3 space-y-1.5">
            <div className="flex items-center gap-2 text-sm">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${notifConfig.email.configured ? 'bg-green-500' : 'bg-red-400'}`}/>
              <span className={notifConfig.email.configured ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                Email (SMTP): {notifConfig.email.configured ? 'Configured' : `Missing: ${notifConfig.email.missing.join(', ')}`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${notifConfig.sms.configured ? 'bg-green-500' : 'bg-red-400'}`}/>
              <span className={notifConfig.sms.configured ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                SMS (Twilio): {notifConfig.sms.configured ? 'Configured' : `Missing: ${notifConfig.sms.missing.join(', ')}`}
              </span>
            </div>
            {(!notifConfig.email.configured || !notifConfig.sms.configured) && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Add these to your <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">.env</code> file and redeploy.
              </p>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button onClick={() => handleTestNotification('email')} disabled={testingNotif} className="btn-secondary py-2 text-sm">
            Test Email
          </button>
          <button onClick={() => handleTestNotification('sms')} disabled={testingNotif} className="btn-secondary py-2 text-sm">
            Test SMS
          </button>
          <button onClick={() => handleTestNotification('both')} disabled={testingNotif} className="btn-primary py-2 text-sm">
            {testingNotif ? 'Sending...' : 'Test Both'}
          </button>
        </div>
      </div>

      {/* Notification logs */}
      {notifLogs.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Recent Notifications</h2>
          <div className="space-y-2">
            {notifLogs.map(log => (
              <div key={log.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`badge ${log.type === 'email' ? 'badge-blue' : 'badge-green'}`}>
                    {log.type}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">{log.date}</span>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {new Date(log.sent_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Danger zone */}
      <div className="card border border-red-200">
        <h2 className="font-semibold text-red-700 mb-1">Danger Zone</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Reset the entire program. This will delete all workout logs and start fresh from today.
        </p>
        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="btn-danger py-2 text-sm"
          >
            Reset Program
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-red-700">Are you sure? This cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={handleReset} className="btn-danger py-2 text-sm">
                Yes, Reset Everything
              </button>
              <button onClick={() => setShowResetConfirm(false)} className="btn-secondary py-2 text-sm">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
