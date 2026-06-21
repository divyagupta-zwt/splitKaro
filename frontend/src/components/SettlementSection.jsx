const SettlementSection = ({ suggestions, onSettleUp, currentMemberId, navigating }) => {
  return (
    <div className="mb-6">
      <div>
        <h2 className="text-lg font-semibold mb-3">Suggested Settlements <span className="text-sm text-gray-500">(minimum transactions to clear all debts)</span></h2>
        {suggestions.length === 0 ? (
          <p className="text-md text-gray-500 py-4 text-center">All done. No settlements needed.</p>
        ) : (
          <div className="space-y-3">
            {suggestions.map((s, index)=>(
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-100">
                <span className="text-sm font-medium">
                  <span className="font-bold text-gray-800">{s.from.name}</span> pays <span className="font-bold text-gray-800">{s.to.name}</span>
                </span>
                <span className="text-sm font-bold text-blue-700">₹{s.amount.toLocaleString()}</span>
                <span>
                  {String(currentMemberId) === String(s.from.id) ? (
                    <button
                    onClick={()=>onSettleUp(s)}
                    disabled={navigating}
                    className={`bg-blue-600 text-white text-sm p-1 rounded ${navigating ? 'opacity-60 cursor-wait' : ''}`}>
                    {navigating ? 'Opening...' : 'Settle Up'}
                    </button>
                  ) : (
                    <button className="bg-gray-200 text-gray-600 text-sm p-1 rounded cursor-not-allowed" disabled>
                    Not You
                    </button>
                  )}
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
