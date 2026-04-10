import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import Expenses from './pages/Expenses';
import NotFound from './pages/NotFound';
import SettleUp from './pages/SettleUp';
import { GroupProvider } from './hooks/GroupContext';

function App() {
  return (
    <GroupProvider>
      <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add-expense" element={<AddExpense />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path='/settle' element={<SettleUp />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
    </GroupProvider>
  );
}

export default App;
