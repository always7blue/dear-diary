import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const TaskStats = ({ tasks, theme }) => {
  const completedTasks = tasks.filter(task => task.done).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const data = {
    labels: ['Tamamlanan', 'Bekleyen'],
    datasets: [
      {
        data: [completedTasks, totalTasks - completedTasks],
        backgroundColor: [
          '#22c55e', // Green for completed
          '#e5e7eb'  // Gray for pending
        ],
        borderColor: [
          '#16a34a',
          '#d1d5db'
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: theme === 'light' ? '#374151' : '#f3f4f6',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const percentage = totalTasks > 0 ? Math.round((value / totalTasks) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div className={`p-4 rounded-lg ${theme === 'light' ? 'bg-yellow-100' : 'bg-yellow-100'} shadow-sm border`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold dark:text-black">📊 Görev İstatistikleri</h3>
        <div className="text-2xl font-bold text-green-500 dark:text-black">
          {completionRate}%
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="w-32 h-32">
          <Pie data={data} options={options} />
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Tamamlanan:</span>
            <span className="font-semibold text-green-600 dark:text-black">{completedTasks}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Bekleyen:</span>
            <span className="font-semibold text-gray-600 dark:text-black">{totalTasks - completedTasks}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Toplam:</span>
            <span className="font-semibold dark:text-black">{totalTasks}</span>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {completionRate === 100 && totalTasks > 0 && (
        <div className="mt-4 text-center">
          <span className="text-green-600 font-semibold text-sm">🎉 Tüm görevler tamamlandı!</span>
        </div>
      )}
    </div>
  );
};

export default TaskStats;
