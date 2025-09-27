const JournalEntry = ({ journal, onDelete, onEdit }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 border border-green-100 overflow-hidden">
      <div className="p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-lg">📝</span>
            </div>
            <div className="text-sm text-gray-500 font-medium">
              {formatDate(journal.created_at)}
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => onEdit(journal)} 
              className="text-blue-400 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-full transition-all duration-200 group"
              title="Notu düzenle"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button 
              onClick={() => onDelete(journal.id)} 
              className="text-red-400 hover:text-red-600 hover:bg-red-50 p-3 rounded-full transition-all duration-200 group"
              title="Notu sil"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        <p className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">{journal.content}</p>
      </div>
    </div>
  );
};

export default JournalEntry;
