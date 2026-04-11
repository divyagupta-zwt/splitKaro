import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BalanceCards from '../components/BalanceCards';
import ExpensesTable from '../components/ExpensesTable';
import  useExpenses  from '../hooks/useExpenses';
import  useBalances from '../hooks/useBalances';
import useGroup  from '../hooks/useGroup';
import { useSelectedGroup } from '../hooks/GroupContext';
import { getGroups } from '../services/api';
import SettlementSection from '../components/SettlementSection';
import useSettlements from '../hooks/useSettlements';

const current_user = 1;

function Dashboard() {
  const navigate = useNavigate();
  const { selectedGroupId, setSelectedGroupId } = useSelectedGroup();
  const [groups, setGroups] = useState([]);
  
  const { group, members } = useGroup(selectedGroupId);
  const { expenses } = useExpenses(selectedGroupId);
  const { balances } = useBalances(selectedGroupId);
  const {suggestions}= useSettlements(selectedGroupId);

  useEffect(() => {
    getGroups().then(res => setGroups(res.data)).catch(console.error);
  }, []);

  const handleSettleUp= (suggestion)=>{
    navigate('/settle', {state: {suggestion}});
  };

  return (
    <div className='p-2'>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold">{group?.name || 'Dashboard'}</h1>
            <select 
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="bg-white border text-sm rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
            >
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <p className="text-sm text-gray-500">{group?.description || 'Track expenses and split fairly'}</p>
        </div>
        <button
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 whitespace-nowrap"
          onClick={() => navigate('/add-expense')}
        >
          + Add Expense
        </button>
      </div>

      <div className="mb-6">
        <BalanceCards balances={balances} />
      </div>

      <SettlementSection suggestions={suggestions} onSettleUp={handleSettleUp} />

      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Expenses</h2>
        <ExpensesTable
          expenses={expenses}
          members={members}
          currentUserId={current_user}
        />
      </div>
    </div>
  );
}

export default Dashboard;
