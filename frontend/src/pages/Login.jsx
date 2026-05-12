import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePinChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (pin.length !== 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid PIN');
        setPin('');
        return;
      }

      // Login successful
      onLogin(data.token, data.users, data.groupName);
    } catch (err) {
      setError('Connection error. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-10 text-center">
        <div className="text-5xl sm:text-6xl mb-4">💸</div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Expense Tracker</h1>
        <p className="text-gray-400 text-sm sm:text-base">Track spending. Stay on budget. Together.</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <div className="card p-8">
          <label className="block text-center mb-4">
            <span className="text-white text-lg font-medium">Enter PIN</span>
          </label>

          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            value={pin}
            onChange={handlePinChange}
            placeholder="••••"
            autoFocus
            className="w-full text-center text-3xl tracking-widest bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-4 focus:outline-none focus:border-indigo-500 transition-colors"
            disabled={loading}
          />

          {error && (
            <p className="text-red-400 text-sm text-center mt-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || pin.length !== 4}
            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
          >
            {loading ? 'Verifying...' : 'Continue'}
          </button>
        </div>
      </form>

      <p className="mt-8 text-xs text-gray-600">Enter your 4-digit PIN to access your account</p>
    </div>
  );
}
