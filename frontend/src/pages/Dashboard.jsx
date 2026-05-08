import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';
import { format } from 'date-fns';

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="card py-4 px-4 min-w-0">
      <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-base sm:text-xl font-bold mt-1 whitespace-nowrap overflow-visible ${accent || 'text-white'}`}>
        ₹{Number(value).toLocaleString()}
      </p>
      {sub && <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

function CategoryBar({ cat, allocated, spent }) {
  const pct = allocated > 0 ? Math.min((spent / allocated) * 100, 100) : 0;
  const over = spent > allocated && allocated > 0;
  const overAmount = spent - allocated;

  return (
    <div className="py-2.5">
      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
        <span className="text-sm font-medium text-gray-200 flex-1 min-w-0 truncate">{cat.name}</span>
        <div className="flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap">
          <span className="text-sm font-semibold text-white">₹{spent.toLocaleString()}</span>
          {allocated > 0 && (
            <span className="text-xs text-gray-500 hidden sm:inline">/ ₹{allocated.toLocaleString()}</span>
          )}
          {over && (
            <span className="text-[10px] sm:text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full font-semibold whitespace-nowrap">
              +₹{overAmount.toLocaleString()}
            </span>
          )}
        </div>
      </div>
      {allocated > 0 && (
        <p className="text-[10px] text-gray-600 mb-1 sm:hidden ml-4">
          of ₹{allocated.toLocaleString()} budget
        </p>
      )}
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: over ? '#ef4444' : pct > 80 ? '#f59e0b' : cat.color,
          }}
        />
      </div>
    </div>
  );
}

export default function Dashboard({ users, activeUser, month, year, onNavigate }) {
  const [data, setData] = useState(null);
  const [otherData, setOtherData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const otherUser = users.find(u => u.id !== activeUser.id);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/budgets/${activeUser.id}/${year}/${month}`).then(r => r.json()),
      fetch(`/api/expenses/summary/${activeUser.id}/${year}/${month}`).then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
      otherUser ? fetch(`/api/budgets/${otherUser.id}/${year}/${month}`).then(r => r.json()) : Promise.resolve(null),
      otherUser ? fetch(`/api/expenses/summary/${otherUser.id}/${year}/${month}`).then(r => r.json()) : Promise.resolve([]),
    ]).then(([budget, summary, cats, otherBudget, otherSummary]) => {
      setData({ budget, summary });
      setOtherData({ budget: otherBudget, summary: otherSummary });
      setCategories(cats);
      setLoading(false);
    });
  }, [activeUser, month, year, users]);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading dashboard...</div>;

  const { budget, summary } = data;
  const totalIncome = budget?.total_income || 0;
  const totalSpent = (summary || []).reduce((s, c) => s + c.spent, 0);
  const remaining = totalIncome - totalSpent;
  const savingsRate = totalIncome > 0 ? Math.max(0, ((totalIncome - totalSpent) / totalIncome * 100)).toFixed(1) : 0;
  const otherTotalSpent = (otherData?.summary || []).reduce((s, c) => s + c.spent, 0);

  const pieData = (summary || [])
    .filter(c => c.spent > 0)
    .map(c => ({ name: c.name, value: c.spent, color: c.color }));

  const overBudgetCats = categories.filter(cat => {
    const s = (summary || []).find(x => x.id === cat.id);
    const b = (budget?.category_budgets || []).find(x => x.category_id === cat.id);
    return s && b && s.spent > b.allocated_amount;
  });

  const comparisonData = categories
    .filter(cat => {
      const s1 = (summary || []).find(x => x.id === cat.id);
      const s2 = (otherData?.summary || []).find(x => x.id === cat.id);
      return (s1?.spent || 0) > 0 || (s2?.spent || 0) > 0;
    })
    .map(cat => ({
      name: cat.name.split(' ')[0].substring(0, 5),
      [activeUser.name]: (summary || []).find(x => x.id === cat.id)?.spent || 0,
      [otherUser?.name || 'Other']: (otherData?.summary || []).find(x => x.id === cat.id)?.spent || 0,
    }));

  const monthName = format(new Date(year, month - 1, 1), 'MMMM yyyy');

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Hey, {activeUser.name} 👋</h2>
          <p className="text-gray-400 text-sm mt-0.5">{monthName} overview</p>
        </div>
        {!budget && (
          <button onClick={() => onNavigate('budget')} className="btn-primary text-sm">
            Set Up Budget
          </button>
        )}
      </div>

      {/* Over-budget alerts */}
      {overBudgetCats.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3 sm:p-4">
          <p className="text-red-400 font-semibold text-sm mb-2">
            ⚠️ Over budget in {overBudgetCats.length} {overBudgetCats.length === 1 ? 'category' : 'categories'}
          </p>
          <div className="flex flex-wrap gap-2">
            {overBudgetCats.map(cat => {
              const s = (summary || []).find(x => x.id === cat.id);
              const b = (budget?.category_budgets || []).find(x => x.category_id === cat.id);
              return (
                <span key={cat.id} className="bg-red-500/20 text-red-300 text-xs px-2 py-1 rounded-full">
                  {cat.name}: +₹{(s.spent - b.allocated_amount).toLocaleString()}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats – 2×2 on mobile, 4×1 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        <StatCard label="Income" value={totalIncome} sub="This month" />
        <StatCard
          label="Spent"
          value={totalSpent}
          accent="text-orange-400"
          sub={`${totalSpent > 0 && totalIncome > 0 ? ((totalSpent / totalIncome) * 100).toFixed(1) : 0}% of income`}
        />
        <StatCard
          label="Remaining"
          value={Math.abs(remaining)}
          accent={remaining < 0 ? 'text-red-400' : 'text-green-400'}
          sub={remaining < 0 ? 'Over income' : 'Available'}
        />
        <StatCard label="Savings %" value={savingsRate} sub="% saved" accent="text-indigo-400" />
      </div>

      {/* Category breakdown + Pie */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="card">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Category Breakdown</h3>
          {totalSpent === 0 && (budget?.category_budgets || []).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No data yet</p>
              <button onClick={() => onNavigate('add')} className="btn-primary mt-3 text-sm">
                Add First Expense
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-800/60">
              {categories.map(cat => {
                const s = (summary || []).find(x => x.id === cat.id);
                const b = (budget?.category_budgets || []).find(x => x.category_id === cat.id);
                const spent = s?.spent || 0;
                const allocated = b?.allocated_amount || 0;
                if (spent === 0 && allocated === 0) return null;
                return <CategoryBar key={cat.id} cat={cat} allocated={allocated} spent={spent} />;
              })}
            </div>
          )}
        </div>

        {/* Donut chart */}
        <div className="card flex flex-col">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Spending Mix</h3>
          {pieData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-10">
              <p className="text-gray-500 text-sm">No spending data</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={2} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip
                    formatter={(v) => [`₹${v.toLocaleString()}`, '']}
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-3">
                {pieData.map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 min-w-0">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-gray-400 truncate">{item.name}</span>
                    <span className="text-xs text-gray-300 ml-auto font-medium flex-shrink-0">₹{item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Both users section */}
      {otherUser && (
        <div className="card">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Both Users — {format(new Date(year, month - 1, 1), 'MMMM')}</h3>

          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { user: activeUser, spent: totalSpent, budget },
              { user: otherUser, spent: otherTotalSpent, budget: otherData?.budget },
            ].map(({ user, spent, budget: b }) => {
              const inc = b?.total_income || 0;
              const pct = inc > 0 ? Math.min((spent / inc) * 100, 100) : 0;
              const over = inc > 0 && spent > inc;
              return (
                <div key={user.id} className="bg-gray-800/50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: user.avatar_color }}>
                      {user.name[0]}
                    </div>
                    <span className="font-semibold text-white text-sm truncate">{user.name}</span>
                  </div>
                  <p className="text-base sm:text-xl font-bold text-white">₹{spent.toLocaleString()}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-2">of ₹{inc.toLocaleString()}</p>
                  <div className="h-2 bg-gray-700 rounded-full">
                    <div className="h-2 rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: over ? '#ef4444' : user.avatar_color }} />
                  </div>
                  {over && <p className="text-xs text-red-400 mt-1">+₹{(spent - inc).toLocaleString()} over</p>}
                </div>
              );
            })}
          </div>

          {comparisonData.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-3">Spending by category</p>
              <ResponsiveContainer width="99%" height={180}>
                <BarChart data={comparisonData} barSize={isMobile ? 8 : 12} margin={{ left: isMobile ? -20 : 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  {!isMobile && (
                    <YAxis tick={{ fontSize: 9, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} width={50} />
                  )}
                  <Tooltip
                    formatter={(v) => [`₹${v.toLocaleString()}`, '']}
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey={activeUser.name} fill={activeUser.avatar_color} radius={[3, 3, 0, 0]} />
                  <Bar dataKey={otherUser.name} fill={otherUser.avatar_color} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
