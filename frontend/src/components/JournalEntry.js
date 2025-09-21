const JournalEntry = ({ journal }) => (
  <div className="bg-blue-100 rounded-xl p-2 mb-2 shadow-sm">
    <p className="text-sm">{journal.content}</p>
    <span className="text-xs text-gray-500">{new Date(journal.created_at).toLocaleString()}</span>
  </div>
);

export default JournalEntry;
