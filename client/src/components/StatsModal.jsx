import React, { useState, useEffect } from 'react';

export default function StatsModal({ isOpen, onClose, onSubmit, loading, initialFeeling = null }) {
  const [form, setForm] = useState({
    heart_rate_peak: '',
    heart_rate_avg: '',
    rpe: null,
    duration_minutes: '',
    feeling: initialFeeling,
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      setForm(prev => ({ ...prev, feeling: initialFeeling }));
    }
  }, [isOpen, initialFeeling]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      heart_rate_peak: form.heart_rate_peak ? Number(form.heart_rate_peak) : undefined,
      heart_rate_avg: form.heart_rate_avg ? Number(form.heart_rate_avg) : undefined,
      rpe: form.rpe || undefined,
      duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : undefined,
      feeling: form.feeling || undefined,
      notes: form.notes || undefined,
    });
  };

  const handleSkip = () => {
    onSubmit({});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 dark:bg-black/70"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-5 pt-6 pb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Log Workout Stats</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Great work completing your workout!</p>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-6 space-y-4">
          {/* Heart Rate Peak */}
          <div>
            <label className="label">Peak HR (bpm)</label>
            <input
              type="number"
              className="input"
              placeholder="e.g. 165"
              min="40"
              max="250"
              value={form.heart_rate_peak}
              onChange={e => setForm(prev => ({ ...prev, heart_rate_peak: e.target.value }))}
            />
          </div>

          {/* Heart Rate Average */}
          <div>
            <label className="label">Avg HR (bpm)</label>
            <input
              type="number"
              className="input"
              placeholder="e.g. 140"
              min="40"
              max="250"
              value={form.heart_rate_avg}
              onChange={e => setForm(prev => ({ ...prev, heart_rate_avg: e.target.value }))}
            />
          </div>

          {/* RPE */}
          <div>
            <label className="label">Effort (RPE 1-10)</label>
            <div className="flex gap-1.5 flex-wrap">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, rpe: prev.rpe === val ? null : val }))}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold border-2 transition-all duration-150 ${
                    form.rpe === val
                      ? 'bg-brand-600 border-brand-600 text-white'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-brand-400'
                  }`}
                  title={val === 1 ? 'Very easy' : val === 10 ? 'Max effort' : ''}
                >
                  {val}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">1 = very easy, 10 = max effort</p>
          </div>

          {/* Duration */}
          <div>
            <label className="label">Duration (minutes)</label>
            <input
              type="number"
              className="input"
              placeholder="e.g. 35"
              min="1"
              max="300"
              value={form.duration_minutes}
              onChange={e => setForm(prev => ({ ...prev, duration_minutes: e.target.value }))}
            />
          </div>

          {/* Feeling */}
          <div>
            <label className="label">How did it feel?</label>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'strong',  label: '💪 Strong' },
                { value: 'tough',   label: '😤 Tough' },
                { value: 'hard',    label: '😅 Hard' },
                { value: 'crushed', label: '🔥 Crushed it' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, feeling: prev.feeling === value ? null : value }))}
                  className={`text-sm px-3 py-1.5 rounded-full border-2 transition-all duration-150 font-medium ${
                    form.feeling === value
                      ? 'bg-brand-600 border-brand-600 text-white'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-brand-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="label">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="How did it go? Any pain, wins, or notes..."
              value={form.notes}
              onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-1">
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save & Complete Workout'}
            </button>
            <button
              type="button"
              onClick={handleSkip}
              disabled={loading}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 py-2 transition-colors"
            >
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
