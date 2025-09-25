import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getMoods } from '../api/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const moodEmojiMap = {
  '😊': 5, '😎': 4, '🤩': 5,
  '😔': 2, '😡': 1, '😴': 3
};

export default function MoodChart({ theme }) {
  const [moods, setMoods] = useState([]);
  const [view, setView] = useState('weekly'); // 'weekly' or 'monthly'
  const chartRef = useRef(null);

  useEffect(() => {
    fetchMoods();
  }, [view]);

  // Cleanup chart on unmount
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  const fetchMoods = async () => {
    try {
      const res = await getMoods();
      setMoods(res.data);
    } catch (err) {
      console.error('Failed to fetch moods:', err);
    }
  };

  const chartData = useMemo(() => {
    const now = new Date();
    let startDate, endDate, labels = [];
    
    if (view === 'weekly') {
      const dayOfWeek = now.getDay(); // 0 = Pazar, 1 = Pazartesi ...
      const diffToMonday = (dayOfWeek + 6) % 7; // Pazartesi için kaydırma
      startDate = new Date(now);
      startDate.setDate(now.getDate() - diffToMonday);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        labels.push(d.toLocaleDateString('tr-TR', { weekday: 'short' }));
      }
    }
    else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        labels.push(d.getDate().toString());
      }
    }

    const moodValues = labels.map((_, index) => {
      const targetDate = new Date(startDate);
      targetDate.setDate(startDate.getDate() + index);
      const dateStr = targetDate.toISOString().split('T')[0];
      
      const dayMoods = moods.filter(m => 
        m.created_at && m.created_at.startsWith(dateStr)
      );
      
      if (dayMoods.length === 0) return null;
      
      const avgMood = dayMoods.reduce((sum, m) => 
        sum + (moodEmojiMap[m.mood] || 3), 0) / dayMoods.length;
      return Math.round(avgMood * 10) / 10;
    });

    return {
      labels,
      datasets: [{
        label: 'Mood',
        data: moodValues,
        borderColor: theme === 'dark' ? '#b3aae2' : '#ec4899',
        backgroundColor: theme === 'dark' ? 'rgba(179, 170, 226, 0.1)' : 'rgba(236, 72, 153, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: theme === 'dark' ? '#7cafd1' : '#f43f5e',
        pointBorderColor: theme === 'dark' ? '#bfd1e2' : '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
      }]
    };
  }, [moods, view, theme]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        ticks: {
          stepSize: 1,
          callback: function(value) {
            const emojiMap = { 1: '😡', 2: '😔', 3: '😴', 4: '😎', 5: '😊' };
            return emojiMap[value] || '';
          }
        },
        grid: {
          color: theme === 'dark' ? 'rgba(191, 209, 226, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          color: theme === 'dark' ? 'rgba(191, 209, 226, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };

  return (
    <div className="bg-yellow-100 rounded-3xl shadow-md p-6 hover:shadow-lg dark:hover:shadow-xl transition-shadow duration-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold dark:text-black">Mood Grafiği</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setView('weekly')}
            className={`px-3 py-1 rounded text-sm ${
              view === 'weekly' 
                ? 'bg-rose-400 text-white' 
                : 'bg-gray-200 dark:bg-night-200 dark:text-black'
            }`}
          >
            Haftalık
          </button>
          <button
            onClick={() => setView('monthly')}
            className={`px-3 py-1 rounded text-sm ${
              view === 'monthly' 
                ? 'bg-rose-400 text-white' 
                : 'bg-gray-200 dark:bg-night-200 dark:text-black'
            }`}
          >
            Aylık
          </button>
        </div>
      </div>
      <div className="h-64">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
}
