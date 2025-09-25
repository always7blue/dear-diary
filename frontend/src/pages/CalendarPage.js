import { useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getJournals, addJournal, deleteJournal } from '../api/api';

const dayNames = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];

export default function CalendarPage() {
  const location = useLocation();
  const initMonth = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const m = params.get('month'); // YYYY-MM
    if (m && /^\d{4}-\d{2}$/.test(m)) {
      const [yy, mm] = m.split('-');
      return new Date(Number(yy), Number(mm)-1, 1);
    }
    return new Date();
  }, [location.search]);
  const [month, setMonth] = useState(initMonth);
  const [notesByDay, setNotesByDay] = useState({}); // { 'YYYY-MM-DD': [journals] }
  const [draft, setDraft] = useState('');
  const [activeDay, setActiveDay] = useState(null); // 'YYYY-MM-DD'

  const firstDay = useMemo(() => new Date(month.getFullYear(), month.getMonth(), 1), [month]);
  const lastDay = useMemo(() => new Date(month.getFullYear(), month.getMonth()+1, 0), [month]);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();

  const y = month.getFullYear();
  const m = String(month.getMonth()+1).padStart(2,'0');

  useEffect(() => {
    // fetch for each day of month
    (async () => {
      const newMap = {};
      for (let d = 1; d <= totalDays; d++) {
        const day = `${y}-${m}-${String(d).padStart(2,'0')}`;
        const res = await getJournals({ date: day });
        newMap[day] = res.data;
      }
      setNotesByDay(newMap);
    })();
  }, [y, m, totalDays]);

  const addNote = async () => {
    if (!activeDay || !draft) return;
    await addJournal({ content: draft, date: activeDay });
    const res = await getJournals({ date: activeDay });
    setNotesByDay(prev => ({ ...prev, [activeDay]: res.data }));
    setDraft('');
  };

  const removeNote = async (id) => {
    await deleteJournal(id);
    if (activeDay) {
      const res = await getJournals({ date: activeDay });
      setNotesByDay(prev => ({ ...prev, [activeDay]: res.data }));
    }
  };

  const goPrev = () => setMonth(new Date(month.getFullYear(), month.getMonth()-1, 1));
  const goNext = () => setMonth(new Date(month.getFullYear(), month.getMonth()+1, 1));

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={goPrev} className="px-3 py-1 rounded border hover:bg-gray-100">‹</button>
        <div className="text-lg font-semibold">{month.toLocaleString('tr-TR', { month: 'long' })} {y}</div>
        <button onClick={goNext} className="px-3 py-1 rounded border hover:bg-gray-100">›</button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-500 mb-1">
        {dayNames.map(n => <div key={n} className="py-1">{n}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-3">
        {cells.map((d, idx) => {
          const day = d ? `${y}-${m}-${String(d).padStart(2,'0')}` : '';
          const notes = d ? (notesByDay[day] || []) : [];
          return (
            <div key={idx} className={`min-h-32 rounded-2xl p-3 border bg-white dark:bg-night-50 dark:text-black ${!d && 'opacity-0'}`}> 
              <div className="text-sm font-semibold mb-2">{d || ''}</div>
              <div className="flex flex-col gap-2">
                {notes.map(n => (
                  <div key={n.id} className="flex items-center justify-between bg-blue-50 rounded px-2 py-1">
                    <span className="text-xs truncate">{n.content}</span>
                    <button onClick={() => removeNote(n.id)} className="text-[10px] text-red-500">Sil</button>
                  </div>
                ))}
              </div>
              {d && (
                <button onClick={() => { setActiveDay(day); }} className="mt-2 text-xs text-rose-600 underline">Not ekle</button>
              )}
            </div>
          );
        })}
      </div>

      {activeDay && (
        <div className="mt-4 rounded-2xl p-3 border bg-white dark:bg-night-50 dark:text-black">
          <div className="text-sm mb-2 font-medium">{activeDay} için not ekle</div>
          <div className="flex gap-2">
            <input value={draft} onChange={(e)=>setDraft(e.target.value)} className="flex-1 border rounded p-2" placeholder="Not" />
            <button onClick={addNote} className="px-4 py-2 rounded bg-rose-400 text-white hover:bg-rose-500">Ekle</button>
            <button onClick={()=>setActiveDay(null)} className="px-3 py-2 rounded border">Kapat</button>
          </div>
        </div>
      )}
    </div>
  );
}


