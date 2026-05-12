import React from 'react';
import { useNavigate } from 'react-router-dom';

// The fixed rotation for each position in a 7-workout block
const SLOT_TYPES = ['A', 'B', 'A', 'B', 'C', 'A', 'B'];

const STATUS_STYLES = {
  completed:   'bg-green-500 text-white',
  in_progress: 'bg-yellow-400 text-white',
  not_started: 'bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 ring-2 ring-brand-400 ring-offset-1 dark:ring-offset-gray-800 font-bold',
  future:      'bg-gray-100 dark:bg-gray-700 text-gray-300 dark:text-gray-600',
};

const WORKOUT_COLORS = {
  A: 'bg-blue-500',
  B: 'bg-purple-500',
  C: 'bg-orange-500',
};

export default function ProgressGrid({ grid = [], currentWeek = 1 }) {
  const navigate = useNavigate();

  const weeks = [];
  for (let w = 0; w < 12; w++) {
    weeks.push(grid.slice(w * 7, w * 7 + 7));
  }

  const handleDayClick = (day) => {
    if (!day.isFuture && day.date) {
      navigate(`/workout/${day.date}`);
    }
  };

  return (
    <div className="space-y-3">
      {/* Explainer */}
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
        Each <span className="font-semibold text-gray-700 dark:text-gray-300">week</span> is a block of 7 workouts — not 7 calendar days.
        Miss a session? The same workout repeats next time so you never skip ahead.
      </p>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md bg-green-500"/>
          <span className="text-gray-600 dark:text-gray-400">Done</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md bg-yellow-400"/>
          <span className="text-gray-600 dark:text-gray-400">In progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md ring-2 ring-brand-400 bg-white dark:bg-gray-800"/>
          <span className="text-gray-600 dark:text-gray-400">Next up</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md bg-gray-100 dark:bg-gray-700"/>
          <span className="text-gray-600 dark:text-gray-400">Not yet</span>
        </div>
      </div>

      {/* Workout type colour key */}
      <div className="flex gap-4 text-xs">
        {Object.entries(WORKOUT_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className={`w-2 h-4 rounded-full ${color} opacity-70`}/>
            <span className="text-gray-600 dark:text-gray-400">Workout {type}</span>
          </div>
        ))}
      </div>

      {/* Column headers — show fixed workout type for each slot position */}
      <div className="grid grid-cols-8 gap-1">
        <div className="text-xs text-gray-400 dark:text-gray-500 text-center font-medium self-center">Wk</div>
        {SLOT_TYPES.map((type, i) => (
          <div key={i} className="text-center">
            <span className={`inline-block text-[10px] font-bold px-1 py-0.5 rounded text-white opacity-70 ${WORKOUT_COLORS[type]}`}>
              {type}
            </span>
          </div>
        ))}
      </div>

      {/* Grid rows */}
      {weeks.map((week, wi) => {
        const weekNum = wi + 1;
        const isCurrentWeek = weekNum === currentWeek;
        return (
          <div
            key={wi}
            className={`grid grid-cols-8 gap-1 items-center ${isCurrentWeek ? 'rounded-xl bg-brand-50 dark:bg-gray-800/60 py-1 px-0.5' : ''}`}
          >
            {/* Week number */}
            <div className={`text-center text-xs font-semibold ${isCurrentWeek ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500'}`}>
              {weekNum}
            </div>

            {/* Workout slots */}
            {week.map((day, di) => (
              <button
                key={di}
                onClick={() => handleDayClick(day)}
                disabled={day.isFuture || (!day.date && day.status !== 'not_started')}
                title={
                  day.status === 'not_started'
                    ? `Workout ${day.workoutType} — Next up`
                    : day.date
                    ? `Workout ${day.workoutType} · ${day.date}`
                    : `Workout ${day.workoutType} — Not yet`
                }
                className={`
                  relative aspect-square rounded-md flex items-center justify-center text-xs font-bold
                  transition-transform hover:scale-110 disabled:cursor-default
                  ${STATUS_STYLES[day.status] || 'bg-gray-100'}
                `}
              >
                {/* Workout type colour dot */}
                <span className={`absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full ${WORKOUT_COLORS[day.workoutType]} opacity-60`}/>
                {day.status === 'completed' ? (
                  <span className="text-[10px]">✓</span>
                ) : day.status === 'in_progress' ? (
                  <span className="text-[10px]">…</span>
                ) : (
                  <span className="text-[10px] opacity-50">{day.day}</span>
                )}
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );
}
