import { useState, useMemo } from 'react';
import { useDebounce } from '../hooks/useDebounce';

function ExpensesTable({ expenses, members, loading, currentUserId, onDelete, showDelete = false }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPaidBy, setFilterPaidBy] = useState('');
  const [filterSplitType, setFilterSplitType] = useState('');

  const debouncedSearch = useDebounce(searchTerm, 300);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch = !debouncedSearch ||
        expense.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        expense.payer?.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesPaidBy = !filterPaidBy || expense.paid_by === parseInt(filterPaidBy);
      const matchesSplitType = !filterSplitType || expense.split_type === filterSplitType;
      return matchesSearch && matchesPaidBy && matchesSplitType;
    });
  }, [expenses, debouncedSearch, filterPaidBy, filterSplitType]);

  const getUserShare = (expense) => {
    if (!currentUserId) return '—';
    const split = expense.splits?.find(s => s.member_id === currentUserId);
    return split ? `₹${parseFloat(split.amount_owed).toFixed(2)}` : '₹0.00';
  };

  const badgeColors = {
    equal: 'bg-blue-100 text-blue-700',
    exact: 'bg-amber-100 text-amber-700',
    percentage: 'bg-purple-100 text-purple-700'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500">
        Loading expenses...
      </div>
    );
  }

  return (
    <div id="expenses-table-section">
      <div className="flex flex-wrap gap-2 mb-3" id="table-filters">
        <input
          type="text"
          placeholder="Search expenses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm flex-1 min-w-[180px]"
          id="expense-search-input"
        />
        <select
          value={filterPaidBy}
          onChange={(e) => setFilterPaidBy(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm"
          id="filter-paid-by"
        >
          <option value="">All Members</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
        <select
          value={filterSplitType}
          onChange={(e) => setFilterSplitType(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm"
          id="filter-split-type"
        >
          <option value="">All Split Types</option>
          <option value="equal">Equal</option>
          <option value="exact">Exact</option>
          <option value="percentage">Percentage</option>
        </select>
      </div>

      {filteredExpenses.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          📭 No expenses found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm" id="expenses-table">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="py-2 pr-3 font-medium">Date</th>
                <th className="py-2 pr-3 font-medium">Description</th>
                <th className="py-2 pr-3 font-medium">Paid By</th>
                <th className="py-2 pr-3 font-medium">Amount</th>
                <th className="py-2 pr-3 font-medium">Split</th>
                <th className="py-2 pr-3 font-medium">Your Share</th>
                {showDelete && <th className="py-2 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map(expense => (
                <tr key={expense.id} className="border-b border-gray-100" id={`expense-row-${expense.id}`}>
                  <td className="py-2 pr-3 text-gray-500">
                    {new Date(expense.date).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td className="py-2 pr-3">{expense.description}</td>
                  <td className="py-2 pr-3">
                    <span className="inline-flex items-center gap-1">
                      {expense.payer?.name}
                    </span>
                  </td>
                  <td className="py-2 pr-3 font-medium">₹{parseFloat(expense.amount).toFixed(2)}</td>
                  <td className="py-2 pr-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${badgeColors[expense.split_type] || ''}`}>
                      {expense.split_type}
                    </span>
                  </td>
                  <td className="py-2 pr-3">{getUserShare(expense)}</td>
                  {showDelete && (
                    <td className="py-2">
                      <button
                        className="text-red-500 hover:text-red-700 text-xs"
                        onClick={() => onDelete(expense.id)}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ExpensesTable;
