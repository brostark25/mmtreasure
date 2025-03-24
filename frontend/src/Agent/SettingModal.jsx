const SettingsModal = ({
  isOpen,
  onClose,
  user,
  selectedProvider,
  providerFields,
  formData,
  onProviderChange,
  onInputChange,
  onSave,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4"
      style={{ zIndex: 1000 }}
    >
      <div className="bg-white rounded-md p-6 w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal content */}
        <h2 className="text-lg font-bold text-center mb-4">Settings</h2>
        <div className="mb-4">
          <p className="mb-4">For User ID: {user?.uid}</p>
          <label className="block mb-2">Select Provider:</label>
          <select
            className="border p-2 w-full rounded"
            value={selectedProvider}
            onChange={(e) => onProviderChange(e.target.value)}
          >
            <option value="">Select a provider</option>
            <option value="providerA">Pragmatic Play</option>
            <option value="providerB">iBet 789</option>
            <option value="providerC">Shan</option>
          </select>
        </div>
        <div className="flex-1 overflow-y-auto pr-2">
          {providerFields.map((field, index) => (
            <div key={index} className="mb-4">
              <label className="block mb-2">{field}:</label>
              {field === "IsSuspended" ? (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={!!formData[field]}
                    onChange={(e) => onInputChange(field, e.target.checked)}
                  />
                  <span>{formData[field] ? "Suspended" : "Active"}</span>
                </div>
              ) : (
                <input
                  type="text"
                  className="border p-2 w-full rounded"
                  placeholder={`Enter ${field}`}
                  value={formData[field] || ""}
                  onChange={(e) => onInputChange(field, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4">
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-md w-full sm:w-auto"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md w-full sm:w-auto ml-2 sm:ml-4"
            onClick={onSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
