import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workoutsApi } from '../api.js';
import ExerciseCard from '../components/ExerciseCard.jsx';
import StatsModal from '../components/StatsModal.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const WORKOUT_GRADIENTS = {
  A: 'from-blue-500 to-indigo-600',
  B: 'from-purple-500 to-pink-600',
  C: 'from-orange-500 to-red-600',
};

export default function Workout() {
  const { date } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [savingFeeling, setSavingFeeling] = useState(false);
  const autoTriggered = React.useRef(false);

  // Use server-supplied date (timezone-aware) once loaded; fall back to URL param or UTC
  const targetDate = data?.today || date || new Date().toISOString().split('T')[0];

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      let result;
      if (date) {
        result = await workoutsApi.getByDate(date);
        // Normalize structure to match today's format
        setData({
          today: result.date,
          weekNumber: result.weekNumber,
          workoutType: result.workoutType,
          workout: result.workout,
          log: result.log || { status: 'not_started', completed_exercises: [] },
          programDay: result.programDay,
        });
      } else {
        result = await workoutsApi.getToday();
        setData(result);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    autoTriggered.current = false;
  }, [date]);

  // Auto-show stats modal when every exercise is checked
  useEffect(() => {
    if (!data || showStatsModal || autoTriggered.current) return;
    if (data.log?.status === 'completed') return;
    const done = data.log?.completed_exercises?.length || 0;
    const total = data.workout?.exercises?.length || 0;
    if (total > 0 && done >= total && data.log?.status === 'in_progress') {
      autoTriggered.current = true;
      setShowStatsModal(true);
    }
  }, [data?.log?.completed_exercises]);

  const handleToggleExercise = async (exerciseId, completed) => {
    if (!data) return;
    setSaving(true);
    try {
      // Create log if it doesn't exist
      if (!data.log?.id && !date) {
        await workoutsApi.logWorkout({
          date: targetDate,
          workout_type: data.workoutType,
          status: 'in_progress',
          completed_exercises: [],
        });
      }
      const updated = await workoutsApi.toggleExercise(targetDate, exerciseId, completed);
      setData(prev => ({
        ...prev,
        log: {
          ...updated,
          completed_exercises: updated.completed_exercises,
        },
      }));
      // No auto-completion - only the complete button triggers completion
    } catch (err) {
      console.error('Toggle exercise error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleStartWorkout = async () => {
    if (!data) return;
    try {
      await workoutsApi.logWorkout({
        date: targetDate,
        workout_type: data.workoutType,
        status: 'in_progress',
        completed_exercises: [],
      });
      await load();
    } catch (err) {
      console.error('Start workout error:', err);
    }
  };

  const handleCompleteWorkout = async () => {
    if (!data) return;
    const allIds = data.workout?.exercises?.map(e => e.id) || [];
    const alreadyDone = data.log?.completed_exercises || [];
    const missing = allIds.filter(id => !alreadyDone.includes(id));

    if (missing.length > 0) {
      // Optimistically tick all exercises in UI
      setData(prev => ({
        ...prev,
        log: { ...prev.log, completed_exercises: allIds, status: 'in_progress' },
      }));
      // Persist the full list in one request
      try {
        await workoutsApi.logWorkout({
          date: targetDate,
          workout_type: data.workoutType,
          status: 'in_progress',
          completed_exercises: allIds,
        });
      } catch (err) {
        console.error('Error marking all exercises done:', err);
      }
    }

    autoTriggered.current = true;
    setShowStatsModal(true);
  };

  const handleFeelingSelect = async (value) => {
    if (!data || savingFeeling) return;
    const current = data.log?.stats?.feeling;
    const next = current === value ? null : value;
    setData(prev => ({ ...prev, log: { ...prev.log, stats: { ...(prev.log?.stats || {}), feeling: next } } }));
    setSavingFeeling(true);
    try {
      await workoutsApi.updateStats(targetDate, { feeling: next });
    } catch (err) {
      console.error('Error saving feeling:', err);
    } finally {
      setSavingFeeling(false);
    }
  };

  const handleStatsSubmit = async (stats) => {
    setCompleting(true);
    try {
      const updated = await workoutsApi.completeWorkout(targetDate, stats);
      setData(prev => ({
        ...prev,
        log: {
          ...updated,
          completed_exercises: updated.completed_exercises,
        },
      }));
      setShowStatsModal(false);
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error('Complete workout error:', err);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading workout..." />;
  if (error) return <ErrorMessage error={error} onRetry={load} />;
  if (!data) return null;

  const { workout, log } = data;
  if (!workout) {
    return (
      <div className="px-4 pt-6">
        <div className="card text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No workout scheduled for this date</p>
          <button onClick={() => navigate('/')} className="btn-primary mt-4">Back to Home</button>
        </div>
      </div>
    );
  }

  const completedExercises = log?.completed_exercises || [];
  const totalExercises = workout.exercises?.length || 0;
  const completedCount = completedExercises.length;
  const progress = totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0;
  const isCompleted = log?.status === 'completed';
  const gradient = WORKOUT_GRADIENTS[workout.type] || 'from-gray-500 to-gray-700';
  // Use server-supplied today (timezone-aware) for date comparisons, not client UTC
  const serverToday = data.today;
  const isToday = targetDate === serverToday;
  const isPast = targetDate < serverToday;

  return (
    <div className="pb-4">
      {/* Stats Modal */}
      <StatsModal
        isOpen={showStatsModal}
        onClose={() => { setShowStatsModal(false); autoTriggered.current = false; }}
        onSubmit={handleStatsSubmit}
        loading={completing}
        initialFeeling={data?.log?.stats?.feeling ?? null}
      />

      {/* Header */}
      <div className={`bg-gradient-to-br ${gradient} px-4 pt-6 pb-6 relative overflow-hidden`}>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-white/70 dark:text-white/70 hover:text-white text-sm mb-4 transition-colors"
        >
          ← Back
        </button>

        {/* Confetti */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  backgroundColor: ['#fff', '#ffd700', '#ff6b6b', '#4ecdc4'][Math.floor(Math.random() * 4)],
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${0.5 + Math.random() * 0.5}s`,
                }}
              />
            ))}
          </div>
        )}

        <div className="flex items-start justify-between">
          <div className="text-white">
            <p className="text-sm opacity-75">
              Week {data.weekNumber} • Day {data.programDay}
              {!isToday && ` • ${new Date(targetDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
            </p>
            <h1 className="text-xl font-bold mt-0.5">Workout {workout.type}</h1>
            <p className="text-base font-semibold mt-0.5">{workout.name}</p>
            {workout.injuryMode && (
              <span className="inline-block mt-1.5 text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-semibold">
                ⚠ Flare-up Mode
              </span>
            )}
          </div>
          {isCompleted && (
            <div className="bg-green-400 text-green-900 text-xs font-bold px-3 py-1.5 rounded-full">
              ✓ Done!
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-white/70 mb-1.5">
            <span>{completedCount} / {totalExercises} exercises</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Phase + circuit info */}
        <div className="flex gap-2 mt-3">
          <span className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full">
            {workout.phaseLabel}
          </span>
          {workout.circuit && (
            <span className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full">
              {workout.rounds} Rounds
            </span>
          )}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {/* Circuit instruction */}
        {workout.circuit && (
          <div className="bg-orange-50 dark:bg-gray-700 border border-orange-200 dark:border-gray-600 rounded-xl p-3">
            <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">Circuit Training</p>
            <p className="text-xs text-orange-600 dark:text-orange-300 mt-0.5">
              Complete all exercises in sequence for 1 round, rest {workout.restBetweenRounds}s between rounds. Do {workout.rounds} rounds total.
            </p>
          </div>
        )}

        {/* Start button if not started */}
        {log?.status === 'not_started' && isToday && (
          <button onClick={handleStartWorkout} className="btn-primary w-full">
            Start Workout →
          </button>
        )}

        {/* Daily Workout Complete button - shows when in_progress */}
        {log?.status === 'in_progress' && (isToday || isPast) && (
          <button
            onClick={handleCompleteWorkout}
            className="btn-primary w-full bg-green-600 hover:bg-green-700 active:bg-green-800 flex items-center justify-center gap-2"
          >
            <span>
              {completedCount < totalExercises
                ? `Tick All & Complete (${completedCount}/${totalExercises} done) 🎉`
                : 'Daily Workout Complete! 🎉'}
            </span>
          </button>
        )}

        {/* Saving indicator */}
        {saving && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 py-1">
            <div className="w-4 h-4 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin"/>
            Saving...
          </div>
        )}

        {/* Completion message */}
        {isCompleted && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-2xl mb-1">🎉</p>
            <p className="text-sm font-bold text-green-800">Workout Complete!</p>
            <p className="text-xs text-green-600 mt-0.5">Great work! Keep the momentum going.</p>
            <button onClick={() => navigate('/')} className="mt-3 text-sm text-green-700 font-semibold underline">
              Back to Dashboard
            </button>
          </div>
        )}

        {/* Exercise list */}
        <div className="space-y-3">
          {workout.exercises?.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              completed={completedExercises.includes(exercise.id)}
              onToggle={handleToggleExercise}
              index={index}
              isCircuit={workout.circuit}
              disabled={(!isToday && !isPast) || log?.status === 'not_started'}
            />
          ))}
        </div>

        {/* Feeling rating */}
        {(isToday || isPast) && log?.status !== 'not_started' && (
          <div className="card">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              How did it feel?
            </p>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'strong',  label: '💪 Strong' },
                { value: 'tough',   label: '😤 Tough' },
                { value: 'hard',    label: '😅 Hard' },
                { value: 'crushed', label: '🔥 Crushed it' },
              ].map(({ value, label }) => {
                const selected = log?.stats?.feeling === value;
                return (
                  <button
                    key={value}
                    onClick={() => handleFeelingSelect(value)}
                    disabled={savingFeeling}
                    className={`text-sm px-3 py-1.5 rounded-full border-2 font-medium transition-all duration-150 disabled:opacity-60 ${
                      selected
                        ? 'bg-brand-600 border-brand-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-brand-400'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {log?.stats?.feeling && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Saved ✓  — tap again to clear</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
