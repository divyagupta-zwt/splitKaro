function BalanceCards( {balances} ) {
  console.log('bal:',balances);
  
  const totalOwed = balances.filter(b => b.balance > 0).reduce((s, b) => s + b.balance, 0);
  const totalOwes = balances.filter(b => b.balance < 0).reduce((s, b) => s + Math.abs(b.balance), 0);

  return (
    <div id="balance-cards-section">
      <h2 className="text-lg font-semibold mb-3">Member Balances</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {balances.map(b => (
          <div
            key={b.member_id}
            className={`rounded border p-3 ${b.balance >= 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium">{b.name}</span>
            </div>
            <div className={`text-sm font-semibold ${b.balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {b.balance >= 0 ? '+' : ''}₹{b.balance.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              {b.balance > 0 ? 'is owed' : b.balance < 0 ? 'owes' : 'settled'}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 text-sm bg-white border rounded p-3">
        <div>
          <span className="text-gray-500">Total Owed </span>
          <span className="text-green-600 font-medium">+₹{totalOwed.toFixed(2)}</span>
        </div>
        <div className="border-l border-gray-200" />
        <div>
          <span className="text-gray-500">Total Owes </span>
          <span className="text-red-600 font-medium">-₹{totalOwes.toFixed(2)}</span>
        </div>
        <div className="border-l border-gray-200" />
        <div>
          <span className="text-gray-500">Net </span>
          <span className="font-medium">₹{(totalOwed - totalOwes).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

export default BalanceCards;
