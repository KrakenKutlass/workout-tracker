import React from 'react';
import { useNavigate } from 'react-router-dom';

const STATUS_STYLES = {
  completed: 'bg-green-500 text-white',
  in_progress: 'bg-yellow-400 text-white',
  not_started: 'bg-gray-200 text-gray-500 ring-2 ring-brand-400 ring-offset-1',
  missed: 'bg-red-200 text-red-600',
  future: 'bg-gray-100 dark:bg-gray-700 text-gray-300 dark:text-gray-600',
};

const STATUS_LABELS = {
  completed: 'Completed',
  in_progress: 'In progress',
  not_started: 'Today',
  missed: 'Missed',
  future: 'Upcoming',
};

const WORKOUT_COLORS = {
  A: 'bg-blue-500',
  B: 'bg-purple-500',
  C: 'bg-orange-500',
};

export default function ProgressGrid({ grid = [], currentWeek = 1 }) {
  const navigate = useNavigate();

  // Group by weeks
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
    <div className="space-y-2">
      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs mb-3">
        {Object.entries(STATUS_LABELS).map(([status, label]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${STATUS_STYLES[status].split(' ')[0]}`}/>
            <span className="text-gray-600 dark:text-gray-400">{label}</span>
          </div>
        ))}
      </div>

      {/* Workout type legend */}
      <div className="flex gap-3 text-xs mb-4">
        {Object.entries(WORKOUT_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className={`w-1.5 h-3 rounded-full ${color}`}/>
            <span className="text-gray-600 dark:text-gray-400">Workout {type}</span>
          </div>
        ))}
      </div>

      {/* Week headers */}
      <div className="grid grid-cols-8 gap-1 text-xs text-gray-400 mb-1">
        <div className="text-center font-medium">Wk</div>
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
          <div key={d} className="text-center">{d}</div>
        ))}
      </div>

      {/* Grid rows */}
      {weeks.map((week, wi) => {
        const weekNum = wi + 1;
        const isCurrentWeek = weekNum === currentWeek;
        return (
          <div key={wi} className={`grid grid-cols-8 gap-1 items-center ${isCurrentWeek ? 'rounded-lg bg-brand-50 dark:bg-gray-800 py-1 px-0.5' : ''}`}>
            {/* Week number */}
            <div className={`text-center text-xs font-semibold ${isCurrentWeek ? 'text-brand-600' : 'text-gray-400 dark:text-gray-500'}`}>
              {weekNum}
            </div>
            {/* Days */}
            {week.map((day, di) => (
              <button
                key={di}
                onClick={() => handleDayClick(day)}
                disabled={day.isFuture}
                title={`${day.date} - Workout ${day.workoutType} - ${STATUS_LABELS[day.status]}`}
                className={`
                  relative aspect-square rounded-md flex items-center justify-center text-xs font-bold
                  transition-transform hover:scale-110 disabled:cursor-default
                  ${STATUS_STYLES[day.status] || 'bg-gray-100'}
                  ${day.isToday ? 'shadow-md' : ''}
                `}
              >
                {/* Workout type indicator dot */}
                <span className={`absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full ${WORKOUT_COLORS[day.workoutType]} opacity-70`}/>
                <span className="text-xs">{day.workoutType}</span>
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );
}
