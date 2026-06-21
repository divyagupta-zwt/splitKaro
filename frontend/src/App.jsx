import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import Expenses from './pages/Expenses';
import NotFound from './pages/NotFound';
import SettleUp from './pages/SettleUp';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CreateGroup from './pages/CreateGroup';
import { GroupProvider } from './hooks/GroupContext';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const location = useLocation();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!token) return;
    let mounted = true;
    const controller = new AbortController();
    // fallback timeout: don't keep user on a blank screen indefinitely
    const fallback = setTimeout(() => {
      if (mounted) setChecked(true);
    }, 2500);
    // lazy import to avoid circular issues
    import('./services/api').then(({ getGroups }) => {
      getGroups(controller.signal)
        .then((res) => {
          if (!mounted) return;
          const groups = res?.data || [];
          if (groups.length === 0 && location.pathname !== '/create-group') {
            navigate('/create-group', { replace: true });
          } else {
            setChecked(true);
          }
        })
        .catch(() => {
          if (!mounted) return;
          setChecked(true);
        });
    });

    return () => {
      mounted = false;
      clearTimeout(fallback);
      controller.abort();
    };
  }, [token, location.pathname, navigate]);

  if (!token) return <Navigate to="/login" replace />;
  if (!checked) return (
    <div className="flex items-center justify-center h-48">
      <div className="text-center text-gray-500">Loading…</div>
    </div>
  );
  return children;
}

function App() {
  return (
    <GroupProvider>
      <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="main-content max-w-5xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/create-group" element={<ProtectedRoute><CreateGroup /></ProtectedRoute>} />
            <Route path="/add-expense" element={<ProtectedRoute><AddExpense /></ProtectedRoute>} />
            <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
            <Route path='/settle' element={<ProtectedRoute><SettleUp /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
    </GroupProvider>
  );
}

export default App;
