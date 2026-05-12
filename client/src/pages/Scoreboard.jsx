import React, { useState, useEffect } from 'react';
import { usersApi } from '../api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const MEDALS = ['🥇', '🥈', '🥉'];

function TieIndicator() {
  return (
    <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/40 px-1.5 py-0.5 rounded-full">
      TIED
    </span>
  );
}

export default function Scoreboard() {
  const [entries, setEntries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersApi.getLeaderboard();
      setEntries(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingSpinner message="Loading scoreboard..." />;
  if (error) return <ErrorMessage error={error} onRetry={load} />;

  // Assign display ranks (tied users share same rank)
  const ranked = (entries || []).map((e, i, arr) => {
    const rank = arr.findIndex(x => x.streak === e.streak) + 1;
    const isTied = arr.filter(x => x.streak === e.streak).length > 1;
    return { ...e, rank, isTied };
  });

  const meEntry = ranked.find(e => e.isMe);

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Scoreboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Active streaks only</p>
      </div>

      {/* Your position callout */}
      {meEntry && (
        <div className="card bg-gradient-to-r from-brand-600 to-indigo-700 text-white border-0">
          <p className="text-xs font-semibold opacity-75 uppercase tracking-wide mb-1">Your Position</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">
                {meEntry.rank === 1 ? '🥇' : meEntry.rank === 2 ? '🥈' : meEntry.rank === 3 ? '🥉' : `#${meEntry.rank}`}
                {' '}#{meEntry.rank}
              </p>
              <p className="text-sm opacity-80">{meEntry.name}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{meEntry.streak}</p>
              <p className="text-xs opacity-75">day streak 🔥</p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard list */}
      {ranked.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-4xl mb-3">🏆</p>
          <p className="font-semibold text-gray-700 dark:text-gray-200">No active streaks yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Complete a workout to appear here!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {ranked.map((entry, i) => {
            const prevStreak = i > 0 ? ranked[i - 1].streak : null;
            const showDivider = i > 0 && entry.streak !== prevStreak && ranked[i - 1].streak !== entry.streak;

            return (
              <React.Fragment key={i}>
                {showDivider && (
                  <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-1" />
                )}
                <div
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-colors ${
                    entry.isMe
                      ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800'
                      : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                  }`}
                >
                  {/* Rank */}
                  <div className="w-8 text-center flex-shrink-0">
                    {entry.rank <= 3 ? (
                      <span className="text-xl">{MEDALS[entry.rank - 1]}</span>
                    ) : (
                      <span className="text-sm font-bold text-gray-400 dark:text-gray-500">#{entry.rank}</span>
                    )}
                  </div>

                  {/* Name + tied badge */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold text-sm truncate ${
                        entry.isMe
                          ? 'text-brand-700 dark:text-brand-300'
                          : 'text-gray-800 dark:text-gray-100'
                      }`}>
                        {entry.name}{entry.isMe ? ' (you)' : ''}
                      </p>
                      {entry.isTied && <TieIndicator />}
                    </div>
                  </div>

                  {/* Streak */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className={`text-lg font-bold ${
                      entry.isMe ? 'text-brand-600 dark:text-brand-400' : 'text-gray-700 dark:text-gray-200'
                    }`}>
                      {entry.streak}
                    </span>
                    <span className="text-sm">🔥</span>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}

      <button
        onClick={load}
        className="w-full text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 py-2 transition-colors"
      >
        ↻ Refresh
      </button>
    </div>
  );
}
