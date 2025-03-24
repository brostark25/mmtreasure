const BalanceModal = ({
  isOpen,
  onClose,
  title,
  fromLabel,
  valuefromLable, // Fix: Ensure this matches exactly with how it's passed
  fromValue,
  valuefrom,
  toLabel,
  valuetoLable, // Fix: Ensure this matches exactly with how it's passed
  toValue,
  valueto,
  amount,
  onAmountChange,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 sm:p-6"
      style={{ zIndex: 1000 }}
    >
      <div className="bg-white rounded-lg p-5 sm:p-6 w-full max-w-md shadow-lg">
        <h2 className="text-lg sm:text-xl font-bold text-center mb-4 text-gray-800">
          {title}
        </h2>
        <div className="text-gray-700 text-sm sm:text-base space-y-4">
          <p className="text-justify">
            {fromLabel}: <strong>{fromValue}</strong>
            <br />
            {valuefromLable}: <span>{valuefrom}</span> {/* Fix: Use correct prop */}
            <br />
            {toLabel}: <strong>{toValue}</strong>
            <br />
            {valuetoLable}: <span>{valueto}</span> {/* Fix: Use correct prop */}
          </p>
          <input
            type="number"
            className="border rounded-md p-2 w-full mb-4 focus:ring-2 focus:ring-blue-400"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
          />
          <div className="flex justify-between gap-4">
            <button
              className="w-1/2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="w-1/2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
              onClick={onSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceModal;
