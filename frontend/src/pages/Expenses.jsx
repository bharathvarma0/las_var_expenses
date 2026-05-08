import React, { useState, useEffect } from 'react';
import { format, getDaysInMonth, startOfMonth, getDay } from 'date-fns';

const fmt = (n) => (Math.round(Number(n) * 100) / 100).toLocaleString();

// Returns 'YYYY-MM-DD' string for a given year/month/day (no timezone shift)
const toDateStr = (y, m, d) =>
  `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

export default function Expenses({ users, activeUser, month, year }) {
  const [expenses, setExpenses]   = useState([]);
  const [viewUser, setViewUser]   = useState(activeUser.id);
  const [loading, setLoading]     = useState(true);
  const [selectedDay, setSelectedDay] = useState(null); // null = show all

  useEffect(() => {
    setLoading(true);
    fetch(`/api/expenses/${viewUser}/${year}/${month}`)
      .then(r => r.json())
      .then(data => { setExpenses(data); setLoading(false); });
  }, [viewUser, month, year]);

  // Reset day filter when month/user changes
  useEffect(() => { setSelectedDay(null); }, [viewUser, month, year]);

  const selectedUser = users.find(u => u.id === viewUser);

  // Set of date strings that have expenses  e.g. { '2026-05-03': true }
  const daysWithExpense = new Set(expenses.map(e => e.date.slice(0, 10)));

  // Filter expenses by selected day (null = all)
  const filtered = selectedDay
    ? expenses.filter(e => e.date.slice(0, 10) === toDateStr(year, month, selectedDay))
    : expenses;

  // Group filtered expenses by display date
  const byDate = filtered.reduce((acc, e) => {
    const d = format(new Date(e.date + 'T00:00:00'), 'EEEE, MMMM d');
    if (!acc[d]) acc[d] = [];
    acc[d].push(e);
    return acc;
  }, {});

  const total        = filtered.reduce((s, e) => s + e.amount, 0);
  const totalAll     = expenses.reduce((s, e) => s + e.amount, 0);

  // Calendar grid helpers
  const daysInMonth  = getDaysInMonth(new Date(year, month - 1, 1));
  const firstDayOfWeek = getDay(startOfMonth(new Date(year, month - 1, 1))); // 0=Sun
  const DAY_LABELS   = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const handleDayClick = (d) => {
    setSelectedDay(prev => (prev === d ? null : d)); // tap again to clear
  };

  return (
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Expenses</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            {format(new Date(year, month - 1, 1), 'MMMM yyyy')}
          </p>
        </div>
        <div className="flex gap-2">
          {users.map(u => (
            <button
              key={u.id}
              onClick={() => setViewUser(u.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                viewUser === u.id
                  ? 'border-indigo-500 bg-indigo-500/10 text-white'
                  : 'border-gray-700 text-gray-400'
              }`}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ backgroundColor: u.avatar_color }}
              >
                {u.name[0]}
              </div>
              <span className="text-sm font-medium">{u.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Summary card */}
      <div className="card mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white"
            style={{ backgroundColor: selectedUser?.avatar_color }}
          >
            {selectedUser?.name[0]}
          </div>
          <div>
            <p className="text-sm text-gray-400">
              {selectedDay
                ? `${format(new Date(year, month - 1, selectedDay), 'MMMM d')} · ${selectedUser?.name}`
                : `${selectedUser?.name}'s total`}
            </p>
            <p className="text-xl font-bold text-white">₹{fmt(total)}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-gray-500 text-sm">{filtered.length} transactions</span>
          {selectedDay && (
            <p className="text-xs text-gray-600 mt-0.5">
              Month total: ₹{fmt(totalAll)}
            </p>
          )}
        </div>
      </div>

      {/* ── Calendar ── */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Filter by day
          </p>
          {selectedDay && (
            <button
              onClick={() => setSelectedDay(null)}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Show all
            </button>
          )}
        </div>

        {/* Day-of-week labels */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_LABELS.map(d => (
            <div key={d} className="text-center text-[10px] font-semibold text-gray-600 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-0.5">
          {/* Empty cells before first day */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
            const dateStr    = toDateStr(year, month, d);
            const hasExpense = daysWithExpense.has(dateStr);
            const isSelected = selectedDay === d;
            const isToday    =
              new Date().getDate()     === d &&
              new Date().getMonth() + 1 === month &&
              new Date().getFullYear()  === year;

            return (
              <button
                key={d}
                onClick={() => handleDayClick(d)}
                disabled={!hasExpense}
                className={`
                  relative flex flex-col items-center justify-center rounded-xl
                  aspect-square text-xs font-semibold transition-all
                  ${isSelected
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                    : hasExpense
                      ? 'bg-gray-800 text-white hover:bg-gray-700 cursor-pointer'
                      : 'text-gray-700 cursor-default'}
                  ${isToday && !isSelected ? 'ring-1 ring-indigo-500/60' : ''}
                `}
              >
                {d}
                {/* Dot indicator for days with expenses */}
                {hasExpense && !isSelected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Transaction list ── */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🧾</div>
          <p className="text-gray-400">
            {selectedDay
              ? `No expenses on ${format(new Date(year, month - 1, selectedDay), 'MMMM d')}`
              : 'No expenses this month'}
          </p>
          {selectedDay && (
            <button
              onClick={() => setSelectedDay(null)}
              className="mt-3 text-sm text-indigo-400 hover:text-indigo-300"
            >
              View all transactions
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(byDate).map(([date, items]) => (
            <div key={date}>
              <div className="flex items-center justify-between mb-2 ml-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {date}
                </p>
                <p className="text-xs text-gray-600">
                  ₹{fmt(items.reduce((s, e) => s + e.amount, 0))}
                </p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl">
                {items.map((e, i) => (
                  <div
                    key={e.id}
                    className={`flex items-center gap-3 px-4 py-3 ${
                      i !== items.length - 1 ? 'border-b border-gray-800' : ''
                    }`}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: e.category_color + '30' }}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: e.category_color }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate text-sm sm:text-base">
                        {e.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{e.category_name}</p>
                    </div>
                    <p className="font-bold text-white flex-shrink-0 whitespace-nowrap text-sm sm:text-base">
                      ₹{fmt(e.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
