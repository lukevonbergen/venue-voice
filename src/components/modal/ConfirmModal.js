const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full text-center space-y-4">
      <p className="text-lg font-medium">{message}</p>
      <div className="flex justify-center gap-4">
        <button
          className="bg-red-600 text-white px-4 py-2 rounded-xl"
          onClick={onConfirm}
        >
          Yes
        </button>
        <button
          className="bg-gray-300 px-4 py-2 rounded-xl"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmModal;
