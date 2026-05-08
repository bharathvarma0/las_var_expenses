import React, { useState, useEffect } from 'react';

const COLORS = [
  '#3b82f6','#f59e0b','#10b981','#8b5cf6','#ef4444',
  '#f97316','#06b6d4','#84cc16','#6b7280','#ec4899',
  '#14b8a6','#a855f7','#eab308','#64748b',
];

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => fetch('/api/categories').then(r => r.json()).then(setCategories);

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    setError('');
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    });
    if (res.ok) { setNewName(''); load(); }
    setSaving(false);
  };

  const handleEdit = async (id) => {
    if (!editName.trim()) return;
    await fetch(`/api/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim() }),
    });
    setEditId(null);
    load();
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This will fail if the category has expenses.`)) return;
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Cannot delete');
    } else {
      setError('');
      load();
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Categories</h2>
        <p className="text-gray-400 text-sm mt-1">Create and manage your spending categories</p>
      </div>

      {/* Add new */}
      <form onSubmit={handleAdd} className="card mb-4">
        <label className="label">New Category</label>
        <div className="flex gap-2">
          <input
            type="text"
            className="input flex-1"
            placeholder="e.g. Gym, Rent, Pet care..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            maxLength={40}
          />
          <button type="submit" disabled={saving || !newName.trim()} className="btn-primary flex-shrink-0">
            Add
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 mb-4">
          {error}
        </div>
      )}

      {/* List */}
      <div className="card p-0 overflow-hidden">
        {categories.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No categories yet</p>
        ) : (
          categories.map((cat, i) => (
            <div
              key={cat.id}
              className={`flex items-center gap-3 px-4 py-3 ${i !== categories.length - 1 ? 'border-b border-gray-800' : ''}`}
            >
              {/* Color dot */}
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />

              {editId === cat.id ? (
                <input
                  autoFocus
                  className="input flex-1 py-1.5 text-sm"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleEdit(cat.id);
                    if (e.key === 'Escape') setEditId(null);
                  }}
                  maxLength={40}
                />
              ) : (
                <span className="flex-1 text-sm font-medium text-white">{cat.name}</span>
              )}

              <div className="flex items-center gap-1 flex-shrink-0">
                {editId === cat.id ? (
                  <>
                    <button
                      onClick={() => handleEdit(cat.id)}
                      className="text-xs text-green-400 hover:text-green-300 px-2 py-1 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setEditId(cat.id); setEditName(cat.name); setError(''); }}
                      className="text-xs text-gray-500 hover:text-indigo-400 px-2 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="text-xs text-gray-600 hover:text-red-400 px-2 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Color preview */}
      <div className="mt-4 card">
        <p className="text-xs text-gray-500 mb-3">Colors are assigned automatically from this palette</p>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(c => (
            <div key={c} className="w-6 h-6 rounded-full" style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
    </div>
  );
}
