import React from 'react';
import { useNavigate } from 'react-router-dom';

const WORKOUT_GRADIENTS = {
  A: 'from-blue-500 to-indigo-600',
  B: 'from-purple-500 to-pink-600',
  C: 'from-orange-500 to-red-600',
};

const WORKOUT_ICONS = {
  A: '💪',
  B: '🦵',
  C: '⚡',
};

const STATUS_STYLES = {
  not_started: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Not Started' },
  in_progress: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'In Progress' },
  completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed ✓' },
};

export default function WorkoutCard({ workout, log, streak, date }) {
  const navigate = useNavigate();
  if (!workout) return null;

  const gradient = WORKOUT_GRADIENTS[workout.type] || 'from-gray-500 to-gray-700';
  const icon = WORKOUT_ICONS[workout.type] || '🏋️';
  const statusInfo = STATUS_STYLES[log?.status || 'not_started'];
  const completedCount = log?.completed_exercises?.length || 0;
  const totalCount = workout.exercises?.length || 0;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleClick = () => {
    if (date) {
      navigate(`/workout/${date}`);
    } else {
      navigate('/workout');
    }
  };

  return (
    <div
      className={`rounded-2xl bg-gradient-to-br ${gradient} p-5 text-white cursor-pointer hover:shadow-lg transition-all duration-200 active:scale-[0.99]`}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{icon}</span>
            <span className="text-sm font-semibold opacity-80">Workout {workout.type}</span>
          </div>
          <h2 className="text-lg font-bold leading-tight">{workout.name}</h2>
          {workout.injuryMode && (
            <span className="inline-block mt-1 text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-semibold">
              ⚠ Flare-up Mode
            </span>
          )}
        </div>
        <div className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
          {statusInfo.label}
        </div>
      </div>

      <p className="text-sm opacity-75 mb-3 leading-relaxed">{workout.description}</p>

      {/* Phase badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-medium">
          {workout.phaseLabel}
        </span>
        {workout.circuit && (
          <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-medium">
            {workout.rounds} Rounds Circuit
          </span>
        )}
      </div>

      {/* Progress bar */}
      {log?.status !== 'not_started' && totalCount > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs opacity-75 mb-1">
            <span>{completedCount}/{totalCount} exercises</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Exercises preview */}
      <div className="text-xs opacity-60 mb-3">
        {workout.exercises?.slice(0, 3).map(e => e.name).join(' • ')}
        {workout.exercises?.length > 3 && ` +${workout.exercises.length - 3} more`}
      </div>

      {/* CTA */}
      <button className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors duration-150">
        {log?.status === 'completed' ? 'View Workout' : log?.status === 'in_progress' ? 'Continue Workout →' : 'Start Workout →'}
      </button>
    </div>
  );
}
