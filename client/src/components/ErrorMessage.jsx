import React from 'react';

export default function ErrorMessage({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 px-6">
      <div className="text-4xl">⚠️</div>
      <div className="text-center">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Something went wrong</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {error || 'Unable to connect to the server. Make sure the server is running.'}
        </p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary">
          Try Again
        </button>
      )}
      <p className="text-xs text-gray-400 text-center">
        Make sure the server is running:<br/>
        <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">cd server && npm run dev</code>
      </p>
    </div>
  );
}
