import React, { useState, useEffect, useRef } from 'react';

function TimerDisplay({ seconds, isActive, onComplete }) {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef(null);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (isActive && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            onComplete && onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive]);

  const pct = ((seconds - remaining) / seconds) * 100;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e7eb" strokeWidth="4"/>
          <circle
            cx="32" cy="32" r="28"
            fill="none"
            stroke={remaining === 0 ? '#10b981' : '#6170f3'}
            strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 28}`}
            strokeDashoffset={`${2 * Math.PI * 28 * (1 - pct / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${remaining === 0 ? 'text-green-600' : isActive ? 'text-brand-600 timer-active' : 'text-gray-700 dark:text-gray-100'}`}>
          {remaining === 0 ? '✓' : `${remaining}s`}
        </span>
      </div>
    </div>
  );
}

export default function ExerciseCard({ exercise, completed, onToggle, index, isCircuit = false }) {
  const [timerActive, setTimerActive] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const [showCues, setShowCues] = useState(false);

  const isTimeBased = exercise.type === 'time';

  const handleTimerComplete = () => {
    setTimerDone(true);
    setTimerActive(false);
  };

  const handleMainAction = () => {
    if (isTimeBased) {
      if (!timerActive && !timerDone) {
        setTimerActive(true);
      } else if (timerDone || timerActive) {
        onToggle(exercise.id, !completed);
        setTimerActive(false);
        setTimerDone(false);
      }
    } else {
      onToggle(exercise.id, !completed);
    }
  };

  return (
    <div className={`card transition-all duration-200 ${completed ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30' : 'border-gray-100'}`}>
      <div className="flex items-start gap-3">
        {/* Checkbox / number */}
        <button
          onClick={handleMainAction}
          className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-150 font-semibold text-sm mt-0.5 ${
            completed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 dark:border-gray-500 text-gray-400 dark:text-gray-500 hover:border-brand-400 hover:text-brand-400'
          }`}
        >
          {completed ? '✓' : index + 1}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className={`font-semibold text-sm leading-tight ${completed ? 'text-green-800 dark:text-green-300 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
                {exercise.name}
              </h3>
              <div className="flex flex-wrap gap-1.5 mt-1">
                <span className="badge badge-blue">{exercise.sets} {exercise.sets === 1 && isCircuit ? 'round' : 'sets'}</span>
                <span className="badge badge-purple">{exercise.reps}</span>
                {exercise.restSeconds && (
                  <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{exercise.restSeconds}s rest</span>
                )}
              </div>
            </div>

            {/* Timer for time-based exercises */}
            {isTimeBased && !completed && (
              <TimerDisplay
                key={exercise.durationSeconds}
                seconds={exercise.durationSeconds}
                isActive={timerActive}
                onComplete={handleTimerComplete}
              />
            )}
          </div>

          {/* Description */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">{exercise.description}</p>

          {/* Cues toggle */}
          {exercise.cues && exercise.cues.length > 0 && (
            <div className="mt-2">
              <button
                onClick={() => setShowCues(v => !v)}
                className="text-xs text-brand-600 dark:text-brand-400 font-medium flex items-center gap-1 hover:text-brand-700"
              >
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 13A6 6 0 118 2a6 6 0 010 12zm-.75-4.5v-3h1.5v3h-1.5zm0-4.5v-1.5h1.5V5h-1.5z"/>
                </svg>
                {showCues ? 'Hide cues' : 'Show form cues'}
              </button>
              {showCues && (
                <ul className="mt-1.5 space-y-1">
                  {exercise.cues.map((cue, i) => (
                    <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                      <span className="text-brand-400 mt-0.5">▸</span>
                      {cue}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Timer controls */}
          {isTimeBased && !completed && (
            <div className="mt-2 flex gap-2">
              {!timerActive && !timerDone && (
                <button
                  onClick={() => setTimerActive(true)}
                  className="text-xs bg-brand-600 text-white px-3 py-1 rounded-full font-medium hover:bg-brand-700 transition-colors"
                >
                  Start Timer
                </button>
              )}
              {timerActive && (
                <button
                  onClick={() => setTimerActive(false)}
                  className="text-xs bg-gray-600 text-white px-3 py-1 rounded-full font-medium hover:bg-gray-700 transition-colors"
                >
                  Pause
                </button>
              )}
              {timerDone && (
                <button
                  onClick={() => onToggle(exercise.id, true)}
                  className="text-xs bg-green-600 text-white px-3 py-1 rounded-full font-medium hover:bg-green-700 transition-colors"
                >
                  Mark Complete ✓
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
