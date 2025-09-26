import { useState, useEffect, useRef } from 'react';

const PomodoroTimer = ({ theme }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 dakika
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('work'); // work, break, longBreak
  const [customTime, setCustomTime] = useState(25);
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef(null);

  const modes = {
    work: { name: 'Çalışma', color: 'bg-red-500', defaultTime: 25 },
    break: { name: 'Mola', color: 'bg-green-500', defaultTime: 5 },
    longBreak: { name: 'Uzun Mola', color: 'bg-blue-500', defaultTime: 15 }
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0) {
      setIsRunning(false);
      // Ses çal (opsiyonel)
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU5k9n1unEiBC13yO/eizEIHWq+8+OWT');
      audio.play().catch(() => {});
      
      // Otomatik mode değişimi
      if (mode === 'work') {
        setMode('break');
        setTimeLeft(5 * 60);
      } else if (mode === 'break') {
        setMode('work');
        setTimeLeft(25 * 60);
      }
    }
  }, [timeLeft, mode]);

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(modes[mode].defaultTime * 60);
  };

  const setCustomTimer = () => {
    setTimeLeft(customTime * 60);
    setShowSettings(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((modes[mode].defaultTime * 60 - timeLeft) / (modes[mode].defaultTime * 60)) * 100;

  return (
    <div className={`bg-green-100 rounded-3xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200 ${theme === 'light' ? 'bg-white' : 'bg-night-900'} border-2 border-dashed border-gray-300 dark:border-gray-600`}>
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <h3 className="text-lg font-semibold dark:text-black">🍅 Pomodoro Timer</h3>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            ⚙️
          </button>
        </div>

        {showSettings && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-night-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="number"
                min="1"
                max="60"
                value={customTime}
                onChange={(e) => setCustomTime(parseInt(e.target.value) || 1)}
                className="w-16 px-2 py-1 border rounded text-center dark:bg-night-700 dark:text-black"
              />
              <span className="text-sm dark:text-black">dakika</span>
              <button
                onClick={setCustomTimer}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                Ayarla
              </button>
            </div>
          </div>
        )}

        <div className="relative w-48 h-48 mx-auto mb-6">
          {/* Progress Circle */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke={theme === 'light' ? '#e5b6dbff' : '#374151'}
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke={modes[mode].color.replace('bg-', '').replace('-500', '') === 'red' ? '#ef4444' : modes[mode].color.replace('bg-', '').replace('-500', '') === 'green' ? '#22c55e' : '#3b82f6'}
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          
          {/* Time Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`text-3xl font-bold ${modes[mode].color.replace('bg-', 'text-')} dark:text-black`}>
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {modes[mode].name}
            </div>
          </div>
        </div>

        {/* Mode Buttons */}
        <div className="flex gap-2 mb-4">
          {Object.entries(modes).map(([key, config]) => (
            <button
              key={key}
              onClick={() => {
                setMode(key);
                setTimeLeft(config.defaultTime * 60);
                setIsRunning(false);
              }}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                mode === key
                  ? `${config.color} text-white`
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-night-700 dark:text-black'
              }`}
            >
              {config.name}
            </button>
          ))}
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3 justify-center">
          {!isRunning ? (
            <button
              onClick={startTimer}
              className={`px-6 py-2 rounded-full text-white font-semibold ${modes[mode].color} hover:opacity-90 transition-opacity`}
            >
              ► Başlat
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="px-6 py-2 rounded-full bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition-colors"
            >
              ❚❚ Duraklat
            </button>
          )}
          
          <button
            onClick={resetTimer}
            className="px-6 py-2 rounded-full bg-gray-500 text-white font-semibold hover:bg-gray-600 transition-colors"
          >
            🗘 Sıfırla
          </button>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
