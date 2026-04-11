import { useState } from 'react';
import ExpensesTable from '../components/ExpensesTable';
import  useExpenses  from '../hooks/useExpenses';
import  useBalances  from '../hooks/useBalances';
import  useGroup  from '../hooks/useGroup';
import { deleteExpense } from '../services/api';

import { useSelectedGroup } from '../hooks/GroupContext';

const CURRENT_USER_ID = 1;

function Expenses() {
  const { selectedGroupId } = useSelectedGroup();
  const { members } = useGroup(selectedGroupId);
  const { expenses, refetch: refetchExpenses } = useExpenses(selectedGroupId);
  const { refetch: refetchBalances } = useBalances(selectedGroupId);
  const [deleting, setDeleting] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null);

  const handleDelete = (expenseId) => {
    setShowConfirm(expenseId);
  };

  const confirmDelete = async () => {
    const expenseId = showConfirm;
    setShowConfirm(null);
    setDeleting(expenseId);

    try {
      await deleteExpense(expenseId);
      await refetchExpenses();
      await refetchBalances();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete expense');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div id="expenses-page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">All Expenses</h1>
          <p className="text-sm text-gray-500">View and manage all group expenses</p>
        </div>
        <span className="text-sm text-gray-400">{expenses.length} expense{expenses.length !== 1 ? 's' : ''}</span>
      </div>

      <ExpensesTable
        expenses={expenses}
        members={members}
        currentUserId={CURRENT_USER_ID}
        onDelete={handleDelete}
        showDelete={true}
      />

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" id="delete-confirm-modal">
          <div className="bg-white rounded p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-center mb-2">Delete Expense?</h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                className="border rounded px-4 py-2 text-sm hover:bg-gray-50"
                onClick={() => setShowConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white rounded px-4 py-2 text-sm hover:bg-red-700"
                onClick={confirmDelete} disabled={deleting}
                id="btn-confirm-delete"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Expenses;
