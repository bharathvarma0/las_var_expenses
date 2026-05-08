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

  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(data => {
        setUsers(data);
        const saved = localStorage.getItem('activeUserId');
        if (saved) {
          const u = data.find(x => x.id === parseInt(saved));
          if (u) { setActiveUser(u); setPage('dashboard'); }
        }
      });
  }, []);

  const handleLogin = (user) => {
    setActiveUser(user);
    localStorage.setItem('activeUserId', user.id);
    setPage('dashboard');
  };

  const handleSwitch = (user) => {
    setActiveUser(user);
    localStorage.setItem('activeUserId', user.id);
    setPage('dashboard');
  };

  const handleLogout = () => {
    setActiveUser(null);
    localStorage.removeItem('activeUserId');
    setPage('login');
  };

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
