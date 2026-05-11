import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workoutsApi, usersApi } from '../api.js';
import WorkoutCard from '../components/WorkoutCard.jsx';
import StreakBadge from '../components/StreakBadge.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const PHASE_LABELS = {
  foundation: { label: 'Foundation', color: 'text-blue-600 bg-blue-50', desc: 'Focus on form & technique' },
  strength: { label: 'Strength', color: 'text-purple-600 bg-purple-50', desc: 'Building strength & volume' },
  advanced: { label: 'Advanced', color: 'text-orange-600 bg-orange-50', desc: 'High intensity progression' },
};

export default function Home() {
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const [todayData, userData] = await Promise.all([
        workoutsApi.getToday(),
        usersApi.getMe(),
      ]);
      setData(todayData);
      setUser(userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <LoadingSpinner message="Loading your workout..." />;
  if (error) return <ErrorMessage error={error} onRetry={load} />;
  if (!data) return null;

  const phase = PHASE_LABELS[data.phase] || PHASE_LABELS.foundation;
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{today}</p>
          <h1 className="text-2xl font-bold text-gray-900">
            Hey, {user?.name || 'Champ'} 👋
          </h1>
        </div>
        <StreakBadge streak={data.streak || 0} size="md" />
      </div>

      {/* Program progress banner */}
      <div className="card bg-gradient-to-r from-brand-600 to-indigo-700 text-white border-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm opacity-75">12-Week Program</p>
            <h2 className="text-xl font-bold">Week {data.weekNumber} / 12</h2>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white`}>
            Day {data.programDay}
          </span>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs opacity-75 mb-1.5">
            <span>{phase.label} Phase</span>
            <span>{Math.round((data.programDay / 84) * 100)}% complete</span>
          </div>
          <div className="h-2 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${(data.programDay / 84) * 100}%` }}
            />
          </div>
          <p className="text-xs opacity-60 mt-1.5">{phase.desc}</p>
        </div>
      </div>

      {/* Injury mode banner */}
      {data.injuryMode && (
        <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
          <span className="text-xl">⚠️</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-800">Flare-up Mode Active</p>
            <p className="text-xs text-yellow-600">Lower body exercises replaced with safer alternatives</p>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="text-xs text-yellow-700 font-medium underline"
          >
            Change
          </button>
        </div>
      )}

      {/* Today's workout */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Today's Workout</h2>
        {data.workout ? (
          <WorkoutCard
            workout={data.workout}
            log={data.log}
            streak={data.streak}
            date={data.today}
          />
        ) : (
          <div className="card text-center py-8">
            <p className="text-gray-500">Program complete or not started</p>
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center p-3">
          <p className="text-2xl font-bold text-brand-600">{data.streak || 0}</p>
          <p className="text-xs text-gray-500 mt-0.5">Day Streak</p>
        </div>
        <div className="card text-center p-3">
          <p className="text-2xl font-bold text-green-600">{data.weekNumber}</p>
          <p className="text-xs text-gray-500 mt-0.5">Current Week</p>
        </div>
        <div className="card text-center p-3">
          <p className="text-2xl font-bold text-purple-600">{84 - (data.programDay - 1)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Days Left</p>
        </div>
      </div>

      {/* Phase info */}
      <div className={`card border-0 ${phase.color.split(' ')[1]}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className={`font-semibold text-sm ${phase.color.split(' ')[0]}`}>
            {phase.label} Phase
          </span>
          <span className="text-xs text-gray-500">Weeks {
            data.phase === 'foundation' ? '1-4' : data.phase === 'strength' ? '5-8' : '9-12'
          }</span>
        </div>
        <p className={`text-sm ${phase.color.split(' ')[0]} opacity-80`}>{phase.desc}</p>
      </div>

      {/* Navigation shortcuts */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/progress')}
          className="card-hover flex items-center gap-3 p-3"
        >
          <span className="text-2xl">📊</span>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-800">Progress</p>
            <p className="text-xs text-gray-500">12-week overview</p>
          </div>
        </button>
        <button
          onClick={() => navigate('/info')}
          className="card-hover flex items-center gap-3 p-3"
        >
          <span className="text-2xl">📖</span>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-800">Info Hub</p>
            <p className="text-xs text-gray-500">Rehab guidance</p>
          </div>
        </button>
      </div>
    </div>
  );
}
