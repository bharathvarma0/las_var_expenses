import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BudgetSetup from './pages/BudgetSetup';
import AddExpense from './pages/AddExpense';
import Expenses from './pages/Expenses';
import Categories from './pages/Categories';
import Nav from './components/Nav';

export default function App() {
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [page, setPage] = useState('login');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [isVerifying, setIsVerifying] = useState(true);

  // Verify existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');

    if (!token) {
      setIsVerifying(false);
      return;
    }

    // Verify the token with the backend
    fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
      .then(r => r.json())
      .then(data => {
        if (data.valid) {
          setUsers(data.users);
          // Set first user as active, or restore from localStorage
          const savedUserId = localStorage.getItem('activeUserId');
          const user = savedUserId
            ? data.users.find(u => u.id === parseInt(savedUserId))
            : data.users[0];

          if (user) {
            setActiveUser(user);
            setPage('dashboard');
          }
        } else {
          // Token invalid, clear it
          localStorage.removeItem('authToken');
          localStorage.removeItem('activeUserId');
        }
      })
      .catch(err => {
        console.error('Token verification failed:', err);
        localStorage.removeItem('authToken');
        localStorage.removeItem('activeUserId');
      })
      .finally(() => {
        setIsVerifying(false);
      });
  }, []);

  const handleLogin = (token, users, groupName) => {
    // Store token and users
    localStorage.setItem('authToken', token);
    setUsers(users);

    // Set first user as active
    const firstUser = users[0];
    setActiveUser(firstUser);
    localStorage.setItem('activeUserId', firstUser.id);
    setPage('dashboard');
  };

  const handleSwitch = (user) => {
    setActiveUser(user);
    localStorage.setItem('activeUserId', user.id);
    setPage('dashboard');
  };

  const handleLogout = () => {
    setActiveUser(null);
    setUsers([]);
    localStorage.removeItem('authToken');
    localStorage.removeItem('activeUserId');
    setPage('login');
  };

  // Show loading while verifying token
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (page === 'login') {
    return <Login users={users} onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Nav
        users={users}
        activeUser={activeUser}
        page={page}
        onNavigate={setPage}
        onSwitch={handleSwitch}
        onLogout={handleLogout}
        month={month}
        year={year}
        onMonthChange={(m, y) => { setMonth(m); setYear(y); }}
      />
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24 md:pb-6">
        {page === 'dashboard' && (
          <Dashboard users={users} activeUser={activeUser} month={month} year={year} onNavigate={setPage} />
        )}
        {page === 'budget' && (
          <BudgetSetup activeUser={activeUser} month={month} year={year} onDone={() => setPage('dashboard')} />
        )}
        {page === 'add' && (
          <AddExpense activeUser={activeUser} month={month} year={year} onDone={() => setPage('dashboard')} />
        )}
        {page === 'expenses' && (
          <Expenses users={users} activeUser={activeUser} month={month} year={year} />
        )}
        {page === 'categories' && (
          <Categories />
        )}
      </main>
    </div>
  );
}
