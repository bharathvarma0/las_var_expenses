import React from 'react';

export default function Login({ users, onLogin }) {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-10 text-center">
        <div className="text-5xl sm:text-6xl mb-4">💸</div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Expense Tracker</h1>
        <p className="text-gray-400 text-sm sm:text-base">Track spending. Stay on budget. Together.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm sm:max-w-md">
        {users.map(user => (
          <button
            key={user.id}
            onClick={() => onLogin(user)}
            className="flex-1 card hover:border-indigo-500/60 active:scale-95 transition-all duration-150 flex flex-col items-center gap-4 py-8 sm:py-10 cursor-pointer"
          >
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold text-white shadow-lg"
              style={{ backgroundColor: user.avatar_color }}
            >
              {user.name[0]}
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">{user.name}</p>
              <p className="text-sm text-gray-400 mt-1">Tap to continue</p>
            </div>
          </button>
        ))}
      </div>

      <p className="mt-8 text-xs text-gray-600">Select a profile to get started</p>
    </div>
  );
}
