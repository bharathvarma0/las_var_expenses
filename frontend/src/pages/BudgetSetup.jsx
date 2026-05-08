import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

const fmt = (n) => (Math.round(Number(n) * 100) / 100).toLocaleString();

export default function BudgetSetup({ activeUser, month, year, onDone }) {
  const [categories, setCategories] = useState([]);
  const [income, setIncome] = useState('');
  const [allocations, setAllocations] = useState({});
  const [openingLeftovers, setOpeningLeftovers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch(`/api/budgets/${activeUser.id}/${year}/${month}`).then(r => r.json()),
    ]).then(([cats, budget]) => {
      setCategories(cats);
      if (budget) {
        setIncome(budget.total_income.toString());
        setOpeningLeftovers(budget.opening_leftovers || 0);
        const alloc = {};
        budget.category_budgets.forEach(cb => {
          alloc[cb.category_id] = cb.allocated_amount.toString();
        });
        setAllocations(alloc);
      } else {
        const alloc = {};
        cats.forEach(c => { alloc[c.id] = ''; });
        setAllocations(alloc);
      }
      setLoading(false);
    });
  }, [activeUser, month, year]);

  const totalAllocated = Object.values(allocations).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
  const remaining = (parseFloat(income) || 0) - totalAllocated;

  const handleSave = async () => {
    setSaving(true);
    const category_budgets = Object.entries(allocations)
      .filter(([, v]) => v !== '' && parseFloat(v) > 0)
      .map(([category_id, allocated_amount]) => ({
        category_id: parseInt(category_id),
        allocated_amount: parseFloat(allocated_amount),
      }));

    await fetch(`/api/budgets/${activeUser.id}/${year}/${month}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ total_income: parseFloat(income) || 0, category_budgets }),
    });
    setSaving(false);
    onDone();
  };

  const autoDistribute = () => {
    const inc = parseFloat(income) || 0;
    if (!inc) return;
    const defaults = {
      'Housing': 0.30,
      'Food & Dining': 0.15,
      'Transport': 0.10,
      'Shopping': 0.10,
      'Health': 0.05,
      'Entertainment': 0.05,
      'Utilities': 0.08,
      'Savings': 0.12,
      'Other': 0.05,
    };
    const alloc = {};
    categories.forEach(c => {
      const pct = defaults[c.name] || 0.05;
      alloc[c.id] = Math.round(inc * pct).toString();
    });
    setAllocations(alloc);
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  const monthName = format(new Date(year, month - 1, 1), 'MMMM yyyy');

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Budget Setup</h2>
        <p className="text-gray-400 mt-1">{monthName} · {activeUser.name}</p>
      </div>

      {openingLeftovers !== 0 && (
        <div className={`mb-4 flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm ${
          openingLeftovers > 0
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-red-500/10 border-red-500/30 text-red-300'
        }`}>
          <span className="text-lg">{openingLeftovers > 0 ? '🏦' : '⚠️'}</span>
          <div>
            <p className="font-semibold">
              Leftovers from last month: ₹{fmt(Math.abs(openingLeftovers))}
            </p>
            <p className="text-xs opacity-75 mt-0.5">
              {openingLeftovers > 0
                ? 'Plan your income below — leftovers act as a separate safety buffer'
                : 'You have a deficit from last month — it will reduce from your current leftovers'}
            </p>
          </div>
        </div>
      )}

      <div className="card mb-4">
        <label className="label">Monthly Income</label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
            <input
              type="number"
              className="input pl-8"
              placeholder="0"
              value={income}
              onChange={e => setIncome(e.target.value)}
            />
          </div>
          <button onClick={autoDistribute} className="btn-secondary sm:whitespace-nowrap">
            Auto Distribute
          </button>
        </div>
      </div>

      {/* Balance indicator */}
      <div className={`card mb-4 grid grid-cols-3 gap-2 ${remaining < 0 ? 'border-red-500/50' : 'border-green-500/30'}`}>
        <div className="min-w-0">
          <p className="text-xs text-gray-400 mb-0.5">Allocated</p>
          <p className="text-sm sm:text-base font-bold text-white">₹{fmt(totalAllocated)}</p>
        </div>
        <div className="min-w-0 text-center">
          <p className="text-xs text-gray-400 mb-0.5">Income</p>
          <p className="text-sm sm:text-base font-bold text-white">₹{fmt(parseFloat(income) || 0)}</p>
        </div>
        <div className="min-w-0 text-right">
          <p className="text-xs text-gray-400 mb-0.5">Remaining</p>
          <p className={`text-sm sm:text-base font-bold ${remaining < 0 ? 'text-red-400' : 'text-green-400'}`}>
            ₹{fmt(remaining)}
          </p>
        </div>
      </div>

      <div className="card">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Category Budgets</h3>
        <div className="space-y-3">
          {categories.map(cat => {
            const val = parseFloat(allocations[cat.id]) || 0;
            const pct = income ? Math.min((val / parseFloat(income)) * 100, 100) : 0;
            return (
              <div key={cat.id}>
                <div className="flex items-center gap-2 sm:gap-3 mb-1">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="flex-1 text-sm font-medium text-gray-200 truncate">{cat.name}</span>
                  <div className="relative w-28 sm:w-36 flex-shrink-0">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                    <input
                      type="number"
                      className="input pl-7 py-1.5 text-sm"
                      placeholder="0"
                      value={allocations[cat.id] || ''}
                      onChange={e => setAllocations(prev => ({ ...prev, [cat.id]: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="h-1 bg-gray-800 rounded-full ml-5">
                  <div
                    className="h-1 rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button onClick={onDone} className="btn-secondary flex-1">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
          {saving ? 'Saving...' : 'Save Budget'}
        </button>
      </div>
    </div>
  );
}
