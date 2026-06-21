import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGroup } from '../services/api';

function CreateGroup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState([{ name: '', email: '', phone: '' }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMemberChange = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  const addMemberField = () => {
    setMembers([...members, { name: '', email: '', phone: '' }]);
  };

  const removeMemberField = (index) => {
    if (members.length === 1) return;
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      return setError('Group name is required');
    }

    // Filter out completely empty rows and validate active ones
    const filteredMembers = members.filter(m => m.name.trim() || m.email.trim());
    if (filteredMembers.length === 0) {
      return setError('At least one group member is required');
    }

    // Validate email patterns for filled rows
    for (const m of filteredMembers) {
      if (!m.name.trim()) return setError('All active members must have a name');
      if (!m.email.trim()) return setError('All active members must have an email');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(m.email.trim())) {
        return setError(`Invalid email address: ${m.email}`);
      }
    }

    setLoading(true);
    try {
      const res = await createGroup({
        name: name.trim(),
        description: description.trim(),
        members: filteredMembers
      });
      // Store the newly created group ID as the selected one
      localStorage.setItem('selectedGroupId', res.data.id);
      window.dispatchEvent(new Event('group-change'));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Group</h1>
        <p className="text-sm text-gray-500 mb-6">Start a new group to split household, travel, or event bills</p>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4 border-b border-gray-100 pb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Group Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm"
                placeholder="e.g. Goa Trip 2026, Flatmates"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm resize-none"
                placeholder="What is this group for?"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Group Members</h3>
              <button
                type="button"
                onClick={addMemberField}
                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold px-3 py-1.5 rounded-lg transition-all"
              >
                + Add Member
              </button>
            </div>
            
            <p className="text-xs text-gray-400 mb-4">You will be automatically added as a member of this group.</p>

            <div className="space-y-3">
              {members.map((m, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-gray-50 p-4 rounded-xl relative border border-gray-100">
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      placeholder="Name"
                      value={m.name}
                      onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <input
                      type="email"
                      placeholder="Email"
                      value={m.email}
                      onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      placeholder="Phone (Optional)"
                      value={m.phone}
                      onChange={(e) => handleMemberChange(index, 'phone', e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  {members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMemberField(index)}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold md:self-center absolute top-2 right-2 md:relative md:top-auto md:right-auto"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              className="border border-gray-300 rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-gray-50 transition-all text-gray-700"
              onClick={() => navigate('/')}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-6 py-2.5 text-sm transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
            >
              {loading ? 'Creating Group...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateGroup;
