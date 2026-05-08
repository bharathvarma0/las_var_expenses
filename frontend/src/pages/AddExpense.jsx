import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

const fmt = (n) => (Math.round(Number(n) * 100) / 100).toLocaleString();

export default function AddExpense({ activeUser, month, year, onDone }) {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [summary, setSummary] = useState([]);
  const [budget, setBudget] = useState(null);

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch(`/api/expenses/summary/${activeUser.id}/${year}/${month}`).then(r => r.json()),
      fetch(`/api/budgets/${activeUser.id}/${year}/${month}`).then(r => r.json()),
    ]).then(([cats, s, b]) => {
      setCategories(cats);
      setSummary(s);
      setBudget(b);
      if (cats.length) setCategoryId(cats[0].id.toString());
    });
  }, [activeUser, month, year]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryId || !amount || !name.trim()) return;
    setSaving(true);
    await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: activeUser.id,
        category_id: parseInt(categoryId),
        amount: parseFloat(amount),
        name: name.trim(),
        date: today,
      }),
    });
    setSaving(false);
    onDone();
  };

  const selectedCat = categories.find(c => c.id.toString() === categoryId);
  const catSummary = summary.find(s => s.id.toString() === categoryId);
  const catBudget = budget?.category_budgets?.find(cb => cb.category_id.toString() === categoryId);
  const catSpent = catSummary?.spent || 0;
  const catAlloc = catBudget?.allocated_amount || 0;
  const catRemaining = catAlloc - catSpent;

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Add Expense</h2>
        <p className="text-gray-400 mt-1">{activeUser.name} · {format(new Date(), 'EEEE, MMMM d')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="card">
          <label className="label">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryId(cat.id.toString())}
                className={`flex flex-col items-center gap-1 p-2.5 sm:p-3 rounded-xl border transition-all min-h-[64px] justify-center ${
                  categoryId === cat.id.toString()
                    ? 'border-indigo-500 bg-indigo-500/10 text-white'
                    : 'border-gray-700 bg-gray-800/50 text-gray-400 active:bg-gray-700'
                }`}
              >
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-[10px] sm:text-xs text-center leading-tight font-medium">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {selectedCat && catAlloc > 0 && (
          <div className="card">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">{selectedCat.name} budget</span>
              <span className={`whitespace-nowrap ${catRemaining < 0 ? 'text-red-400 font-semibold' : 'text-green-400 font-semibold'}`}>
                {catRemaining < 0 ? `₹${fmt(Math.abs(catRemaining))} over` : `₹${fmt(catRemaining)} left`}
              </span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min((catSpent / catAlloc) * 100, 100)}%`,
                  backgroundColor: catSpent > catAlloc ? '#ef4444' : selectedCat.color,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Spent ₹{fmt(catSpent)}</span>
              <span>Budget ₹{fmt(catAlloc)}</span>
            </div>
          </div>
        )}

        <div className="card space-y-4">
          <div>
            <label className="label">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">₹</span>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input pl-8 text-xl font-bold"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Grocery shopping, Netflix..."
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Date</label>
            <input
              type="text"
              className="input bg-gray-700/50 cursor-not-allowed text-gray-400"
              value={format(new Date(), 'EEEE, MMMM d, yyyy')}
              readOnly
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onDone} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={saving || !amount || !name} className="btn-primary flex-1">
            {saving ? 'Saving...' : 'Add Expense'}
          </button>
        </div>
      </form>
    </div>
  );
}
