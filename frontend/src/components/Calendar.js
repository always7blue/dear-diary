import { useMemo } from 'react';

const dayNames = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];

export default function Calendar({ value, onChange, month, setMonth, theme, onDayDoubleClick }) {
  const firstDay = useMemo(() => new Date(month.getFullYear(), month.getMonth(), 1), [month]);
  const lastDay = useMemo(() => new Date(month.getFullYear(), month.getMonth()+1, 0), [month]);
  const startOffset = (firstDay.getDay() + 6) % 7; // make Monday=0
  const totalDays = lastDay.getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  const isSelected = (d) => {
    if (!d) return false;
    const y = month.getFullYear();
    const m = String(month.getMonth()+1).padStart(2,'0');
    const day = String(d).padStart(2,'0');
    const iso = `${y}-${m}-${day}`;
    return value === iso;
  };

  const goPrev = () => {
    const newMonth = new Date(month.getFullYear(), month.getMonth()-1, 1);
    setMonth(newMonth);
  };
  const goNext = () => {
    const newMonth = new Date(month.getFullYear(), month.getMonth()+1, 1);
    setMonth(newMonth);
  };

  const selectDay = (d) => {
    const y = month.getFullYear();
    const m = String(month.getMonth()+1).padStart(2,'0');
    const day = String(d).padStart(2,'0');
    onChange(`${y}-${m}-${day}`);
  };

  return (
    <div className={`bg-green-100 rounded-3xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200 w-full`}> 
      <div className="flex items-center justify-between mb-3">
        <button onClick={goPrev} className="px-2 sm:px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-night-200 text-sm sm:text-base">‹</button>
        <div className="font-semibold text-sm sm:text-base">
          {month.toLocaleString('tr-TR', { month: 'long' })} {month.getFullYear()}
        </div>
        <button onClick={goNext} className="px-2 sm:px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-night-200 text-sm sm:text-base">›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500">
        {dayNames.map(n => (
          <div key={n} className="py-1">{n}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 mt-1">
        {cells.map((d, idx) => (
          <button
            key={idx}
            disabled={!d}
            onClick={() => d && selectDay(d)}
            onDoubleClick={() => d && onDayDoubleClick && onDayDoubleClick(new Date(month.getFullYear(), month.getMonth(), d))}
            className={`h-8 sm:h-9 rounded-full text-xs sm:text-sm transition
              ${!d ? 'opacity-0 cursor-default' : ''}
              ${isSelected(d) ? 'bg-rose-400 text-white shadow' : 'hover:bg-rose-100 dark:hover:bg-night-200'}`}
          >
            {d || ''}
          </button>
        ))}
      </div>
    </div>
  );
}


