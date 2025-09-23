const JournalEntry = ({ journal, onDelete }) => {
  return (
    <div className="bg-blue-50 p-2 rounded-lg shadow mb-2 flex justify-between items-start gap-3">
      <p className="text-gray-700 flex-1">{journal.content}</p>
      <button onClick={() => onDelete(journal.id)} className="text-red-500 hover:text-red-700">Sil</button>
    </div>
  );
};

export default JournalEntry;
