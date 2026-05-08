import React, { useState } from 'react';
import { format, addMonths, subMonths } from 'date-fns';

// Bottom tab bar (mobile) — 4 primary actions
const MOBILE_TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
  { key: 'add',       label: 'Add',        icon: '＋' },
  { key: 'expenses',  label: 'Expenses',   icon: '🧾' },
  { key: 'budget',    label: 'Budget',     icon: '⚙️' },
];

// Desktop nav — all pages
const DESKTOP_NAV = [
  { key: 'dashboard',  label: 'Dashboard' },
  { key: 'add',        label: '+ Add Expense' },
  { key: 'expenses',   label: 'Expenses' },
  { key: 'budget',     label: 'Budget Setup' },
  { key: 'categories', label: 'Categories' },
];

export default function Nav({ users, activeUser, page, onNavigate, onSwitch, onLogout, month, year, onMonthChange }) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const currentDate = new Date(year, month - 1, 1);
  const prev = () => { const d = subMonths(currentDate, 1); onMonthChange(d.getMonth() + 1, d.getFullYear()); };
  const next = () => { const d = addMonths(currentDate, 1); onMonthChange(d.getMonth() + 1, d.getFullYear()); };

  const otherUsers = users.filter(u => u.id !== activeUser?.id);

  return (
    <>
      {/* Top bar */}
      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2">

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xl">💸</span>
            <span className="font-bold text-base text-white hidden sm:block">Expense Tracker</span>
          </div>

          {/* Month picker */}
          <div className="flex items-center gap-0.5 bg-gray-800 rounded-xl px-1 py-1 mx-auto sm:mx-0">
            <button onClick={prev} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors text-lg leading-none">‹</button>
            <span className="text-sm font-semibold text-white px-2 text-center" style={{ minWidth: '88px' }}>
              {format(currentDate, 'MMM yyyy')}
            </span>
            <button onClick={next} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors text-lg leading-none">›</button>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1 flex-shrink-0">
            {DESKTOP_NAV.map(item => (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  page === item.key ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* User avatar menu */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 rounded-xl px-2.5 py-1.5 transition-colors"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{ backgroundColor: activeUser?.avatar_color }}
              >
                {activeUser?.name?.[0]}
              </div>
              <span className="text-sm font-medium text-white hidden sm:block max-w-[80px] truncate">{activeUser?.name}</span>
              <span className="text-gray-400 text-[10px]">▾</span>
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="px-3 py-2 border-b border-gray-700">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Switch User</p>
                  </div>
                  {otherUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => { onSwitch(u); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-700 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: u.avatar_color }}>
                        {u.name[0]}
                      </div>
                      <span className="text-sm text-white">{u.name}</span>
                    </button>
                  ))}
                  {/* Categories shortcut on mobile */}
                  <div className="border-t border-gray-700 md:hidden">
                    <button
                      onClick={() => { onNavigate('categories'); setShowUserMenu(false); }}
                      className="w-full text-left px-3 py-3 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                    >
                      Manage Categories
                    </button>
                  </div>
                  <div className="border-t border-gray-700">
                    <button
                      onClick={() => { onLogout(); setShowUserMenu(false); }}
                      className="w-full text-left px-3 py-3 text-sm text-red-400 hover:bg-gray-700 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-gray-900 border-t border-gray-800 safe-area-bottom">
        <div className="flex">
          {MOBILE_TABS.map(item => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors ${
                page === item.key ? 'text-indigo-400' : 'text-gray-500'
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
