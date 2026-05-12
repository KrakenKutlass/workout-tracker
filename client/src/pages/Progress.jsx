import React, { useState, useEffect } from 'react';
import { workoutsApi } from '../api.js';
import ProgressGrid from '../components/ProgressGrid.jsx';
import StreakBadge from '../components/StreakBadge.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function Progress() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await workoutsApi.getProgress();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <LoadingSpinner message="Loading progress..." />;
  if (error) return <ErrorMessage error={error} onRetry={load} />;
  if (!data) return null;

  const overallPct = Math.round((data.completedCount / 84) * 100);

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Progress</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your 12-week journey</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <p className="text-3xl font-bold text-green-600">{data.completedCount}<span className="text-base font-normal text-gray-400 dark:text-gray-500">/84</span></p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Workouts Done</p>
          <div className="mt-2 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{overallPct}% of programme</p>
        </div>
        <div className="card">
          <p className="text-3xl font-bold text-red-500">{data.missedCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Skipped Days</p>
          <div className="mt-2">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {data.missedCount === 0 ? 'No missed sessions 🎉' : 'Days the streak broke'}
            </p>
          </div>
        </div>
      </div>

      {/* Streak */}
      <div className="card flex items-center gap-4">
        <StreakBadge streak={data.streak} size="lg" />
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-100">
            {data.streak === 0
              ? 'No active streak'
              : `${data.streak} day${data.streak !== 1 ? 's' : ''} in a row!`}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {data.streak === 0
              ? 'Complete today\'s workout to start your streak'
              : data.streak >= 7
              ? '🔥 Incredible consistency!'
              : 'Keep going - you\'re building momentum!'}
          </p>
        </div>
      </div>

      {/* Week indicator */}
      <div className="card bg-gradient-to-r from-brand-600 to-indigo-600 text-white border-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-75">Currently on</p>
            <p className="text-2xl font-bold">Week {data.currentWeek}</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-75">Progress</p>
            <p className="text-2xl font-bold">{Math.round((data.currentDayIndex / 84) * 100)}%</p>
          </div>
        </div>
        <div className="mt-3 h-2 bg-white/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full"
            style={{ width: `${Math.min((data.currentDayIndex / 84) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs opacity-60 mt-1.5">Day {Math.min(data.currentDayIndex + 1, 84)} of 84</p>
      </div>

      {/* 84-workout grid */}
      <div className="card">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            84-Workout Programme
          </h2>
          <span className="text-xs text-gray-400 dark:text-gray-500">12 blocks · 7 each</span>
        </div>
        <ProgressGrid grid={data.grid} currentWeek={data.currentWeek} />
      </div>

      {/* Phase breakdown */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Phase Breakdown
        </h2>
        <div className="space-y-3">
          {[
            { label: 'Foundation', weeks: '1-4', color: 'bg-blue-500', phase: 'foundation' },
            { label: 'Strength', weeks: '5-8', color: 'bg-purple-500', phase: 'strength' },
            { label: 'Advanced', weeks: '9-12', color: 'bg-orange-500', phase: 'advanced' },
          ].map(({ label, weeks, color, phase }) => {
            const phaseStart = phase === 'foundation' ? 0 : phase === 'strength' ? 28 : 56;
            const phaseDays = data.grid.slice(phaseStart, phaseStart + 28);
            const phaseCompleted = phaseDays.filter(d => d.status === 'completed').length;
            const phasePct = Math.round((phaseCompleted / 28) * 100);

            return (
              <div key={phase}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${color}`}/>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">Weeks {weeks}</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{phaseCompleted}/28 days</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full transition-all duration-500`}
                    style={{ width: `${phasePct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
