import { useState, useEffect } from "react";
import { useSelectedGroup } from "../hooks/GroupContext";
import { useLocation, useNavigate } from "react-router-dom";
import useGroup from "../hooks/useGroup";
import { recordSettlements } from "../services/api";
import useSettlements from "../hooks/useSettlements";
import dayjs from "dayjs";

const SettleUp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedGroupId } = useSelectedGroup();
  const { suggestions, history } = useSettlements(selectedGroupId);
  const { members } = useGroup(selectedGroupId);
  const [currentUser] = useState(() => {
    try {
      return typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
    } catch (err) {
      return null;
    }
  });
  const [currentMemberId, setCurrentMemberId] = useState("");
  const suggestion = location.state?.suggestion;
  const [formData, setFormData] = useState({
    paidBy: suggestion?.from?.id || "",
    paidTo: suggestion?.to?.id || "",
    amount: suggestion?.amount || "",
    date: dayjs().format("YYYY-MM-DD")
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    // Client-side guard: only allow current user to be the payer
    if (String(formData.paidBy) !== String(currentMemberId)) {
      setError('You can only record payments made by your account.');
      return;
    }
    try {
      await recordSettlements(selectedGroupId, formData);
      navigate("/", { replace: true });
    } catch (e) {
      setError(e.response?.data?.error || "Failed to record settlement");
    }
  };

  useEffect(() => {
    if (!members || !currentUser) return;
    const member = members.find(m => m.user_id === currentUser.id) || members.find(m => m.id === currentUser.id);
    if (member) {
      setCurrentMemberId(member.id);
      // if suggestion or existing formData doesn't conflict, set payer to current member
      setFormData(fd => ({ ...fd, paidBy: fd.paidBy || member.id }));
    }
  }, [members, currentUser]);

  return (
    <div>
      <div>
        <div className="p-2">
          <h1 className="text-2xl font-bold">Settle Up</h1>
          <p className="text-sm text-gray-500">Record payments between members to clear debts</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-3 p-2">
          <div className="flex flex-col gap-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">Pending Settlements</h2>
              {suggestions.length === 0 ? (
                <p className="text-md text-gray-500 py-4 text-center">All done. No settlements needed.</p>
              ) : (
                <div>
                  {suggestions.map((s, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg mb-2 border border-blue-50 bg-blue-50">
                      <span className="text-md">
                        <span className="font-semibold">{s.from.name}</span> pays <span className="font-semibold">{s.to.name}</span>
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="text-md font-bold text-blue-700">₹{s.amount.toLocaleString()}</span>
                        {String(currentMemberId) === String(s.from.id) ? (
                          <button
                            className="text-sm bg-blue-600 text-white px-3 py-1 rounded"
                            onClick={() => {
                              setFormData({ paidBy: s.from.id, paidTo: s.to.id, amount: s.amount, date: dayjs().format('YYYY-MM-DD') });
                              // focus the form submit (scroll into view)
                              document.getElementById('record-settlement-form')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                          >
                            Record
                          </button>
                        ) : (
                          <button className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded cursor-not-allowed" disabled>Record</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">Recent Settlement History</h2>
              {history.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">No records yet.</p>
              ) : (
                <div>
                  {history.map((h, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg mb-2 border border-gray-50 bg-gray-100">
                      <div className="flex flex-col">
                        <span className="text-md">
                          <span className="font-semibold">{h.payer?.name}</span> paid{" "}
                          <span className="font-semibold">{h.receiver?.name}</span>
                        </span>
                        <span className="text-sm text-gray-500">
                          {dayjs(h.date).format("DD MMM YYYY")}
                        </span>
                      </div>
                      <span className="text-md font-bold text-gray-600">₹{Number(h.amount).toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">Record Settlement</h2>
            <form id="record-settlement-form" onSubmit={handleSubmit} className="p-6 space-y-6 bg-white rounded shadow-sm">
            {error && <div className="text-sm text-red-500">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-md font-semibold text-gray-700 mb-2">Payer</label>
                {currentMemberId ? (
                  <select
                    value={formData.paidBy}
                    onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                    required
                    disabled
                    className="w-full rounded border border-gray-300 bg-gray-100 cursor-not-allowed"
                  >
                    <option value="">Select Payer</option>
                    {members.filter(m => String(m.id) === String(currentMemberId)).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={formData.paidBy}
                    onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                    required
                    className="w-full rounded border border-gray-500 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Payer</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-md font-semibold text-gray-700 mb-2">Receiver</label>
                <select
                  value={formData.paidTo}
                  onChange={(e) =>
                    setFormData({ ...formData, paidTo: e.target.value })
                  }
                  required
                  className="w-full rounded border border-gray-500 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Receiver</option>
                  {(members || [])
                    .filter(m => String(m.id) !== String(currentMemberId))
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <label className="block text-md font-semibold text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="0.00"
                  required
                  className="w-full rounded border border-gray-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-md font-semibold text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                  className="w-full rounded border border-gray-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <button type="button" onClick={() => navigate("/")} className="flex-1 bg-gray-100 text-gray-700 p-2 rounded font-semibold hover:bg-gray-200 transition-all">
                Cancel
              </button>
              <button type="submit" className="flex-1 bg-blue-600 text-white p-2 rounded font-semibold hover:bg-blue-700 transition-all">Record Payment</button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettleUp;
