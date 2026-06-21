import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  const checkAuth = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener('auth-change', checkAuth);
    return () => {
      window.removeEventListener('auth-change', checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedGroupId');
    setUser(null);
    window.dispatchEvent(new Event('auth-change'));
    navigate('/login');
  };

  return (
    <div className="bg-blue-600 text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-2xl tracking-tight cursor-pointer" onClick={() => navigate('/')}>
            splitKaro
          </span>
        </div>

        <div className="flex items-center gap-3">
        {user ? (
          <>
            {/* Desktop nav */}
            <nav className="hidden md:flex items-center flex-wrap gap-2 md:gap-4">
              <NavLink 
                to="/" 
                className={({isActive}) => `px-2 py-1 rounded-lg text-sm font-semibold transition-all hover:bg-blue-700 ${isActive ? 'bg-blue-800 text-white shadow-inner' : 'text-blue-100'}`}
              >
                Dashboard
              </NavLink>
              <NavLink 
                to="/create-group" 
                className={({isActive}) => `px-2 py-1 rounded-lg text-sm font-semibold transition-all hover:bg-blue-700 ${isActive ? 'bg-blue-800 text-white shadow-inner' : 'text-blue-100'}`}
              >
                Create Group
              </NavLink>
              <NavLink 
                to="/add-expense" 
                className={({isActive}) => `px-2 py-1 rounded-lg text-sm font-semibold transition-all hover:bg-blue-700 ${isActive ? 'bg-blue-800 text-white shadow-inner' : 'text-blue-100'}`}
              >
                Add Expense
              </NavLink>
              <NavLink 
                to="/expenses" 
                className={({isActive}) => `px-2 py-1 rounded-lg text-sm font-semibold transition-all hover:bg-blue-700 ${isActive ? 'bg-blue-800 text-white shadow-inner' : 'text-blue-100'}`}
              >
                Expenses
              </NavLink>
              <NavLink 
                to="/settle" 
                className={({isActive}) => `px-2 py-1 rounded-lg text-sm font-semibold transition-all hover:bg-blue-700 ${isActive ? 'bg-blue-800 text-white shadow-inner' : 'text-blue-100'}`}
              >
                Settle Up
              </NavLink>
            </nav>

            {/* Mobile toggle */}
            <button onClick={() => setOpen(o => !o)} className="md:hidden ml-2 text-white bg-blue-700 p-2 rounded-lg shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                {open ? (
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm1 4a1 1 0 000 2h12a1 1 0 100-2H4z" clipRule="evenodd" />
                )}
              </svg>
            </button>

            {/* Mobile menu (absolute dropdown) */}
            {open && (
              <div className="md:hidden absolute right-4 top-16 z-50 w-56">
                <nav className="flex flex-col gap-2 bg-blue-600 p-3 rounded shadow-lg">
                  <NavLink to="/" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg text-sm font-semibold text-white bg-blue-700">Dashboard</NavLink>
                  <NavLink to="/create-group" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg text-sm font-semibold text-white">Create Group</NavLink>
                  <NavLink to="/add-expense" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg text-sm font-semibold text-white">Add Expense</NavLink>
                  <NavLink to="/expenses" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg text-sm font-semibold text-white">Expenses</NavLink>
                  <NavLink to="/settle" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg text-sm font-semibold text-white">Settle Up</NavLink>
                </nav>
              </div>
            )}
          </>
        ) : null}

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs bg-blue-700 text-blue-100 px-2.5 py-1 rounded-full font-semibold max-w-[120px] truncate">
                👤 {user.name}
              </span>
              <button 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-sm hover:shadow"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink to="/login" className="text-xs font-semibold text-blue-100 hover:text-white px-3 py-1.5">
                Sign In
              </NavLink>
              <NavLink to="/signup" className="bg-white text-blue-600 hover:bg-blue-50 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all">
                Sign Up
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default Navbar;
