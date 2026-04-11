const SettlementSection = ({ suggestions, onSettleUp }) => {
  return (
    <div className="mb-6">
      <div>
        <h2 className="text-lg font-semibold mb-3">Suggested Settlements <span className="text-sm text-gray-500">(minimum transactions to clear all debts)</span></h2>
        {suggestions.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">All done. No payments needed.</p>
        ) : (
          <div className="space-y-3">
            {suggestions.data.map((s, index)=>(
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-100">
                    <span className="text-sm font-medium">
                        <span className="font-bold text-gray-800">{s.from.name}</span> pays <span className="font-bold text-gray-800">{s.to.name}</span>
                    </span>
                    <span className="text-sm font-bold text-blue-700">
                        ₹{s.amount.toLocaleString()}
                    </span>
                    <span>
                        <button onClick={()=>onSettleUp(s)} className="bg-blue-600 text-white text-sm p-1 rounded">Settle Up</button>
                    </span>
                </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettlementSection;
