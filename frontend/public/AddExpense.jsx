import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGroup } from '../hooks/useGroup';
import { addExpense } from '../services/api';

import { useSelectedGroup } from '../hooks/GroupContext';

function AddExpense() {
  
  const navigate = useNavigate();
  const { selectedGroupId } = useSelectedGroup();
  const { members, loading: membersLoading } = useGroup(selectedGroupId);

  const [formData, setFormData] = useState({
    paid_by: '',
    amount: '',
    description: '',
    split_type: 'equal',
    date: new Date().toISOString().split('T')[0]
  });

  const [splits, setSplits] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useMemo(() => {
    if (members.length > 0) {
      const initial = {};
      members.forEach(m => {
        initial[m.id] = formData.split_type === 'percentage'
          ? (100 / members.length).toFixed(2)
          : '';
      });
      setSplits(initial);
    }
  }, [members, formData.split_type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSplitChange = (memberId, value) => {
    setSplits(prev => ({ ...prev, [memberId]: value }));
    setError('');
  };

  const equalAmount = useMemo(() => {
    if (formData.split_type !== 'equal' || !formData.amount || members.length === 0) return 0;
    return (parseFloat(formData.amount) / members.length).toFixed(2);
  }, [formData.amount, formData.split_type, members]);

  const exactValidation = useMemo(() => {
    if (formData.split_type !== 'exact') return { sum: 0, valid: false };
    const sum = Object.values(splits).reduce((s, v) => s + (parseFloat(v) || 0), 0);
    const total = parseFloat(formData.amount) || 0;
    return {
      sum: Math.round(sum * 100) / 100,
      valid: Math.round(sum * 100) === Math.round(total * 100) && total > 0
    };
  }, [splits, formData.amount, formData.split_type]);

  const percentageValidation = useMemo(() => {
    if (formData.split_type !== 'percentage') return { sum: 0, valid: false };
    const sum = Object.values(splits).reduce((s, v) => s + (parseFloat(v) || 0), 0);
    return {
      sum: Math.round(sum * 100) / 100,
      valid: Math.round(sum * 100) === 10000
    };
  }, [splits, formData.split_type]);

  const isFormValid = useMemo(() => {
    if (!formData.paid_by || !formData.amount || !formData.description || !formData.date) return false;
    if (parseFloat(formData.amount) <= 0) return false;
    if (formData.split_type === 'exact') return exactValidation.valid;
    if (formData.split_type === 'percentage') return percentageValidation.valid;
    return true;
  }, [formData, exactValidation, percentageValidation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        paid_by: parseInt(formData.paid_by),
        amount: parseFloat(formData.amount),
        description: formData.description,
        split_type: formData.split_type,
        date: formData.date
      };

      if (formData.split_type !== 'equal') {
        payload.splits = {};
        for (const [memberId, value] of Object.entries(splits)) {
          payload.splits[memberId] = parseFloat(value) || 0;
        }
      }

      await addExpense(selectedGroupId, payload);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.details?.join(', ') || 'Failed to add expense');
    } finally {
      setSubmitting(false);
    }
  };

  if (membersLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div id="add-expense-page">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add Expense</h1>
        <p className="text-sm text-gray-500">Record a new group expense and split it</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-4 py-2 mb-4" id="error-banner">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} id="expense-form">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Left — expense details */}
          <div className="bg-white border rounded p-4">
            <h3 className="font-semibold mb-3">Expense Details</h3>

            <div className="mb-3">
              <label htmlFor="description" className="block text-sm text-gray-600 mb-1">Description</label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="e.g., Dinner at Beach Shack"
                className="w-full border rounded px-3 py-1.5 text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label htmlFor="amount" className="block text-sm text-gray-600 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  className="w-full border rounded px-3 py-1.5 text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="date" className="block text-sm text-gray-600 mb-1">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-1.5 text-sm"
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="paid_by" className="block text-sm text-gray-600 mb-1">Paid By</label>
              <select
                id="paid_by"
                name="paid_by"
                value={formData.paid_by}
                onChange={handleChange}
                className="w-full border rounded px-3 py-1.5 text-sm"
                required
              >
                <option value="">Select who paid</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Split Type</label>
              <div className="flex gap-2" id="split-type-selector">
                {['equal', 'exact', 'percentage'].map(type => (
                  <button
                    key={type}
                    type="button"
                    className={`flex-1 text-sm py-1.5 rounded border ${
                      formData.split_type === type
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, split_type: type }))}
                    id={`split-type-${type}`}
                  >
                    {type === 'equal' && '⚖️ '}
                    {type === 'exact' && '🎯 '}
                    {type === 'percentage' && '📊 '}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right — split details */}
          <div className="bg-white border rounded p-4">
            <h3 className="font-semibold mb-3">Split Details</h3>

            {/* Equal Split */}
            {formData.split_type === 'equal' && (
              <div id="equal-split-info">
                <p className="text-sm text-gray-500 mb-2">
                  Splitting equally among <strong>{members.length} members</strong>
                </p>
                {formData.amount && (
                  <p className="text-xl font-bold mb-3">₹{equalAmount} <span className="text-sm font-normal text-gray-400">per person</span></p>
                )}
                <div className="space-y-2">
                  {members.map(m => (
                    <div key={m.id} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px]">{m.name.charAt(0)}</span>
                        {m.name}
                      </span>
                      <span className="text-gray-500">₹{formData.amount ? equalAmount : '0.00'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exact Split */}
            {formData.split_type === 'exact' && (
              <div id="exact-split-section">
                <p className="text-sm text-gray-500 mb-2">Enter exact amounts for each member</p>
                <div className="space-y-2 mb-3">
                  {members.map(m => (
                    <div key={m.id} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-sm">
                        <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px]">{m.name.charAt(0)}</span>
                        {m.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400 text-sm">₹</span>
                        <input
                          type="number"
                          value={splits[m.id] || ''}
                          onChange={(e) => handleSplitChange(m.id, e.target.value)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className="w-24 border rounded px-2 py-1 text-sm"
                          id={`exact-split-${m.id}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className={`text-sm flex justify-between ${exactValidation.valid ? 'text-green-600' : 'text-red-500'}`}>
                  <span>Total: ₹{exactValidation.sum.toFixed(2)}</span>
                  <span>
                    {formData.amount
                      ? exactValidation.valid
                        ? '✅ Matches'
                        : `❌ Must equal ₹${parseFloat(formData.amount).toFixed(2)}`
                      : 'Enter total amount first'
                    }
                  </span>
                </div>
              </div>
            )}

            {/* Percentage Split */}
            {formData.split_type === 'percentage' && (
              <div id="percentage-split-section">
                <p className="text-sm text-gray-500 mb-2">Enter percentage for each member</p>
                <div className="space-y-2 mb-3">
                  {members.map(m => {
                    const pct = parseFloat(splits[m.id]) || 0;
                    const calcAmount = formData.amount ? ((pct / 100) * parseFloat(formData.amount)).toFixed(2) : '0.00';
                    return (
                      <div key={m.id} className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 text-sm">
                          <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px]">{m.name.charAt(0)}</span>
                          {m.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={splits[m.id] || ''}
                              onChange={(e) => handleSplitChange(m.id, e.target.value)}
                              placeholder="0"
                              min="0"
                              max="100"
                              step="0.01"
                              className="w-20 border rounded px-2 py-1 text-sm"
                              id={`pct-split-${m.id}`}
                            />
                            <span className="text-gray-400 text-sm">%</span>
                          </div>
                          <span className="text-xs text-gray-400">= ₹{calcAmount}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className={`text-sm flex justify-between ${percentageValidation.valid ? 'text-green-600' : 'text-red-500'}`}>
                  <span>Total: {percentageValidation.sum}%</span>
                  <span>{percentageValidation.valid ? '✅ Equals 100%' : '❌ Must equal 100%'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            className="border rounded px-4 py-2 text-sm hover:bg-gray-50"
            onClick={() => navigate('/')}
            id="btn-cancel"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white rounded px-4 py-2 text-sm hover:bg-blue-700 disabled:opacity-50"
            disabled={!isFormValid || submitting}
            id="btn-submit-expense"
          >
            {submitting ? 'Adding...' : '💰 Add Expense'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddExpense;
