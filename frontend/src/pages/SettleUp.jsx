import { useState } from "react";
import { useSelectedGroup } from "../hooks/GroupContext";
import { useLocation, useNavigate } from "react-router-dom";
import useGroup from "../hooks/useGroup";
import { recordSettlements } from "../services/api";
import useSettlements from "../hooks/useSettlements";

const SettleUp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedGroupId } = useSelectedGroup();
  const { suggestions, history } = useSettlements(selectedGroupId);
  const { members } = useGroup(selectedGroupId);
  const suggestion = location.state?.suggestion;
  const [formData, setFormData] = useState({
    paid_by: suggestion?.from?.id || "",
    paid_to: suggestion?.to?.id || "",
    amount: suggestion?.amount || "",
    date: new Date().toISOString().split("T")[0],
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await recordSettlements(selectedGroupId, formData);
      navigate("/");
    } catch (e) {
      setError(e.response?.data?.error || "Failed to record settlement");
    }
  };

  return (
    <div>
      <div>
        <div className="p-2">
          <h1 className="text-2xl font-bold">Settle Up</h1>
          <p className="text-sm text-gray-500">Record payments between members to clear debts</p>
        </div>

        <div className="grid grid-cols-2 gap-10 mb-3 p-2">
          <div className="flex flex-col gap-20">
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">Pending Settlements</h2>
              {suggestions.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">All done. No payments needed.</p>
              ) : (
                <div>
                  {suggestions.data.map((s, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg mb-2 border border-blue-50 bg-blue-50">
                      <span className="text-md">
                        <span className="font-semibold">{s.from.name}</span> pays <span className="font-semibold">{s.to.name}</span>
                      </span>
                      <span className="text-md font-bold text-blue-700">₹{s.amount.toLocaleString()}</span>
                      {/* <span>
                        <button>Record</button>
                    </span> */}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">Settlement History</h2>
              {history.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">No records yet.</p>
              ) : (
                <div>
                  {history.data.map((h, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg mb-2 border border-gray-50 bg-gray-100">
                      <div className="flex flex-col">
                        <span className="text-md">
                          <span className="font-semibold">{h.payer?.name}</span> paid{" "}
                          <span className="font-semibold">{h.receiver?.name}</span>
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(h.date).toLocaleDateString(undefined, {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                      <span className="text-md font-bold text-gray-600">₹{parseFloat(h.amount.toLocaleString())}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">Record Settlement</h2>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && <div className="text-sm text-red-500">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-md font-semibold text-gray-700 mb-2">Payer</label>
                <select
                  value={formData.paid_by}
                  onChange={(e) =>
                    setFormData({ ...formData, paid_by: e.target.value })
                  }
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
              </div>

              <div>
                <label className="block text-md font-semibold text-gray-700 mb-2">Receiver</label>
                <select
                  value={formData.paid_to}
                  onChange={(e) =>
                    setFormData({ ...formData, paid_to: e.target.value })
                  }
                  required
                  className="w-full rounded border border-gray-500 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Receiver</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="mb-6">
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
