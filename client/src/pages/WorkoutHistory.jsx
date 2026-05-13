import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { workoutsApi } from '../api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const FEELING_LABELS = {
  strong:  '💪 Strong',
  tough:   '😤 Tough',
  hard:    '😅 Hard',
  crushed: '🔥 Crushed it',
};

const WORKOUT_COLORS = { A: '#6170f3', B: '#a855f7', C: '#f97316' };

function StatCard({ label, value, sub, color = 'text-brand-600' }) {
  return (
    <div className="card text-center p-3">
      <p className={`text-2xl font-bold ${color}`}>{value ?? '—'}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function EmptyChart({ message }) {
  return (
    <div className="flex items-center justify-center h-32 text-sm text-gray-400 dark:text-gray-500">
      {message}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">Workout #{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value}{unit}</span>
        </p>
      ))}
    </div>
  );
};

export default function WorkoutHistory() {
  const [logs, setLogs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    workoutsApi.getHistory()
      .then(setLogs)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading history..." />;
  if (error) return <ErrorMessage error={error} />;
  if (!logs) return null;

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <p className="text-4xl mb-3">📊</p>
        <p className="font-semibold text-gray-700 dark:text-gray-200">No completed workouts yet</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Complete your first workout and your stats will appear here.
        </p>
      </div>
    );
  }

  // Summary stats
  const withRpe = logs.filter(l => l.rpe != null);
  const withDuration = logs.filter(l => l.duration != null);
  const withHr = logs.filter(l => l.hrPeak != null);
  const avgRpe = withRpe.length ? (withRpe.reduce((s, l) => s + l.rpe, 0) / withRpe.length).toFixed(1) : null;
  const avgDuration = withDuration.length ? Math.round(withDuration.reduce((s, l) => s + l.duration, 0) / withDuration.length) : null;
  const avgHrPeak = withHr.length ? Math.round(withHr.reduce((s, l) => s + l.hrPeak, 0) / withHr.length) : null;

  // Feeling counts
  const feelingCounts = Object.fromEntries(Object.keys(FEELING_LABELS).map(k => [k, 0]));
  logs.forEach(l => { if (l.feeling) feelingCounts[l.feeling] = (feelingCounts[l.feeling] || 0) + 1; });
  const feelingData = Object.entries(feelingCounts)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: FEELING_LABELS[k], count: v }));

  const mostCommonFeeling = feelingData.reduce((best, cur) => (!best || cur.count > best.count) ? cur : best, null);

  // Use last 20 for chart readability; keep all for summary
  const chartLogs = logs.slice(-20);
  const rpeData = chartLogs.filter(l => l.rpe != null);
  const hrData = chartLogs.filter(l => l.hrPeak != null || l.hrAvg != null);
  const durationData = chartLogs.filter(l => l.duration != null);

  const axisStyle = { fontSize: 10, fill: '#9ca3af' };

  return (
    <div className="space-y-5 pb-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Workouts done" value={logs.length} sub={`of 84`} color="text-green-600" />
        <StatCard label="Avg effort (RPE)" value={avgRpe} sub={withRpe.length ? `from ${withRpe.length} sessions` : 'no data yet'} color="text-brand-600" />
        <StatCard label="Avg duration" value={avgDuration ? `${avgDuration}m` : null} sub={withDuration.length ? `from ${withDuration.length} sessions` : 'no data yet'} color="text-purple-600" />
        <StatCard label="Most felt" value={mostCommonFeeling?.name ?? '—'} color="text-orange-500" />
      </div>

      {/* RPE trend */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Effort (RPE) over time</h3>
        {rpeData.length < 2 ? (
          <EmptyChart message="Need at least 2 RPE entries to show trend" />
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={rpeData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
              <XAxis dataKey="workoutNumber" tick={axisStyle} label={{ value: 'Workout #', position: 'insideBottom', offset: -2, fontSize: 9, fill: '#9ca3af' }} />
              <YAxis domain={[1, 10]} ticks={[1, 3, 5, 7, 10]} tick={axisStyle} />
              <Tooltip content={<CustomTooltip unit="/10" />} />
              <Line type="monotone" dataKey="rpe" name="RPE" stroke="#6170f3" strokeWidth={2} dot={{ r: 3, fill: '#6170f3' }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Heart rate */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Heart rate over time</h3>
        {hrData.length < 2 ? (
          <EmptyChart message="Need at least 2 HR entries to show trend" />
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={hrData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
              <XAxis dataKey="workoutNumber" tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip content={<CustomTooltip unit=" bpm" />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="hrPeak" name="Peak HR" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="hrAvg" name="Avg HR" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Duration */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Duration per workout (mins)</h3>
        {durationData.length < 2 ? (
          <EmptyChart message="Need at least 2 duration entries to show chart" />
        ) : (
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={durationData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
              <XAxis dataKey="workoutNumber" tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip content={<CustomTooltip unit=" min" />} />
              <Bar dataKey="duration" name="Duration" fill="#a855f7" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Feeling breakdown */}
      {feelingData.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">How workouts felt</h3>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={feelingData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#9ca3af' }} />
              <YAxis allowDecimals={false} tick={axisStyle} />
              <Tooltip content={<CustomTooltip unit="" />} />
              <Bar dataKey="count" name="Times" fill="#6170f3" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Per-workout log */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Recent sessions</h3>
        <div className="space-y-2">
          {[...logs].reverse().slice(0, 10).map((l) => (
            <div key={l.date} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: WORKOUT_COLORS[l.workoutType] || '#6b7280' }}
              >
                {l.workoutType}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">#{l.workoutNumber} · {l.date}</p>
                <div className="flex gap-2 mt-0.5 flex-wrap">
                  {l.rpe != null && <span className="text-[10px] text-gray-400">RPE {l.rpe}/10</span>}
                  {l.duration != null && <span className="text-[10px] text-gray-400">{l.duration}m</span>}
                  {l.hrPeak != null && <span className="text-[10px] text-gray-400">♥ {l.hrPeak}bpm</span>}
                </div>
              </div>
              {l.feeling && (
                <span className="text-sm flex-shrink-0">{FEELING_LABELS[l.feeling]?.split(' ')[0]}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
