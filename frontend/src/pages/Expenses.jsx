import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

export default function Expenses({ users, activeUser, month, year }) {
  const [expenses, setExpenses] = useState([]);
  const [viewUser, setViewUser] = useState(activeUser.id);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch(`/api/expenses/${viewUser}/${year}/${month}`)
      .then(r => r.json())
      .then(data => { setExpenses(data); setLoading(false); });
  };

  useEffect(load, [viewUser, month, year]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    load();
  };

  const byDate = expenses.reduce((acc, e) => {
    const d = format(new Date(e.date + 'T00:00:00'), 'EEEE, MMMM d');
    if (!acc[d]) acc[d] = [];
    acc[d].push(e);
    return acc;
  }, {});

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const selectedUser = users.find(u => u.id === viewUser);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Expenses</h2>
          <p className="text-gray-400 text-sm mt-0.5">{format(new Date(year, month - 1, 1), 'MMMM yyyy')}</p>
        </div>
        <div className="flex gap-2">
          {users.map(u => (
            <button
              key={u.id}
              onClick={() => setViewUser(u.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                viewUser === u.id ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-gray-700 text-gray-400'
              }`}
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ backgroundColor: u.avatar_color }}>
                {u.name[0]}
              </div>
              <span className="text-sm font-medium">{u.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white"
            style={{ backgroundColor: selectedUser?.avatar_color }}>
            {selectedUser?.name[0]}
          </div>
          <div>
            <p className="text-sm text-gray-400">{selectedUser?.name}'s total spending</p>
            <p className="text-xl font-bold text-white">₹{total.toLocaleString()}</p>
          </div>
        </div>
        <span className="text-gray-500 text-sm">{expenses.length} transactions</span>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-3">🧾</div>
          <p className="text-gray-400">No expenses this month</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(byDate).map(([date, items]) => (
            <div key={date}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 ml-1">{date}</p>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl">
                {items.map((e, i) => (
                  <div key={e.id} className={`flex items-center gap-3 px-4 py-3 ${i !== items.length - 1 ? 'border-b border-gray-800' : ''}`}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: e.category_color + '30' }}>
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: e.category_color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate text-sm sm:text-base">{e.name}</p>
                      <p className="text-xs text-gray-500 truncate">{e.category_name}</p>
                    </div>
                    <p className="font-bold text-white flex-shrink-0 whitespace-nowrap text-sm sm:text-base ml-2">₹{e.amount.toLocaleString()}</p>
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="text-gray-600 hover:text-red-400 active:text-red-400 transition-colors ml-1 text-sm w-7 h-7 flex items-center justify-center flex-shrink-0"
                    >
                      ✕
                    </button>
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
