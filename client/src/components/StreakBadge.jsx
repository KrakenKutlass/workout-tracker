import React from 'react';

export default function StreakBadge({ streak, size = 'md' }) {
  const sizes = {
    sm: { container: 'px-3 py-1.5', emoji: 'text-base', text: 'text-sm', label: 'text-xs' },
    md: { container: 'px-4 py-2', emoji: 'text-xl', text: 'text-xl', label: 'text-xs' },
    lg: { container: 'px-6 py-3', emoji: 'text-3xl', text: 'text-3xl', label: 'text-sm' },
  };
  const s = sizes[size] || sizes.md;

  const getStreakColor = () => {
    if (streak === 0) return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
    if (streak < 3) return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
    if (streak < 7) return 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300';
    if (streak < 14) return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300';
    return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300';
  };

  const getEmoji = () => {
    if (streak === 0) return '😴';
    if (streak < 3) return '🔥';
    if (streak < 7) return '🔥';
    if (streak < 14) return '⚡';
    return '🏆';
  };

  const getLabel = () => {
    if (streak === 0) return 'Start your streak!';
    if (streak === 1) return '1 day streak';
    return `${streak} day streak`;
  };

  return (
    <div className={`inline-flex flex-col items-center rounded-2xl ${getStreakColor()} ${s.container}`}>
      <span className={s.emoji}>{getEmoji()}</span>
      <span className={`font-bold ${s.text}`}>{streak}</span>
      <span className={`font-medium ${s.label} opacity-75`}>
        {streak === 1 ? 'day' : 'days'}
      </span>
    </div>
  );
}
