import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { addMood, getMoods, getTasks, getJournals, addTask, addJournal, getProfile, BASE_URL, deleteJournal, deleteMood } from '../api/api';
import { Link, useNavigate as useNav } from 'react-router-dom';
import Calendar from '../components/Calendar';
import TaskItem from '../components/TaskItem';
import JournalEntry from '../components/JournalEntry';
import MoodChart from '../components/MoodChart';
import TaskStats from '../components/TaskStats';
import PomodoroTimer from '../components/PomodoroTimer';
import { ThemeContext } from '../index';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';


const moodsEmoji = ['😢','😔','😐','😊','🤩'];

const Home = () => {
  const [selectedMood, setSelectedMood] = useState('');
  const [note, setNote] = useState('');
  const [moods, setMoods] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [taskText, setTaskText] = useState('');
  const [journals, setJournals] = useState([]);
  const [journalText, setJournalText] = useState('');
  const [editingJournal, setEditingJournal] = useState(null);
  const [profile, setProfile] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0,10)); // YYYY-MM-DD
  const [currentMonth, setCurrentMonth] = useState(() => new Date()); // Takvim için ayrı ay state'i
  const [showAddTask, setShowAddTask] = useState(false);

  const navigate = useNavigate();
  const { theme } = React.useContext(ThemeContext);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAuthError = useCallback((err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('token');
      navigate('/login');
    } else {
      console.error(err);
    }
  }, [navigate]);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await getProfile();
      setProfile(res.data);
    } catch (err) {
      handleAuthError(err);
    }
  }, [handleAuthError]);


  const fetchMoods = useCallback(async () => {
    try {
      const res = await getMoods({ date: selectedDate });
      setMoods(res.data);
    } catch (err) {
      handleAuthError(err);
    }
  }, [handleAuthError, selectedDate]);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await getTasks({ date: selectedDate });
      setTasks(res.data);
    } catch (err) {
      handleAuthError(err);
    }
  }, [handleAuthError, selectedDate]);

  const fetchJournals = useCallback(async () => {
    try {
      const res = await getJournals({ date: selectedDate });
      setJournals(res.data);
    } catch (err) {
      handleAuthError(err);
    }
  }, [handleAuthError, selectedDate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProfile();
    fetchMoods();
    fetchTasks();
    fetchJournals();
  }, [navigate, fetchProfile, fetchMoods, fetchTasks, fetchJournals]);

  // Refetch data when selectedDate changes
  useEffect(() => {
    fetchMoods();
    fetchTasks();
    fetchJournals();
  }, [selectedDate, fetchMoods, fetchTasks, fetchJournals]);

  const handleAddMood = async (e) => {
    e.preventDefault();
    if (!selectedMood) return alert('Lütfen bir ruh hali seçin!');

    try {
      await addMood({
        mood: selectedMood,
        note,
        date: selectedDate, // burada seçili tarihi gönderiyoruz
      });

      setSelectedMood('');
      setNote('');

      // Moodları tekrar çek, seçili tarihe göre
      await fetchMoods();
      
      // MoodChart'ı yenilemek için window event dispatch
      window.dispatchEvent(new CustomEvent('moodUpdated'));
    } catch (err) {
      handleAuthError(err);
    }
  };


  const handleDeleteMood = async () => {
    if (!selectedDayMood) return;
    
    if (window.confirm('Bu mood\'u silmek istediğinizden emin misiniz?')) {
      try {
        await deleteMood(selectedDayMood.id);
        await fetchMoods();
        window.dispatchEvent(new CustomEvent('moodUpdated'));
      } catch (err) {
        handleAuthError(err);
      }
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskText) return alert("Lütfen görev girin!");

    try {
      await addTask({
        text: taskText,
        done: false,
        day: selectedDate, // Direkt selectedDate kullanıyoruz
      });

      setTaskText("");
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTaskAreaDoubleClick = () => {
    setShowAddTask(true);
  };

    const handleAddJournal = async (e) => {
    e.preventDefault();
    if (!journalText) return alert("Lütfen içerik girin!");

    try {
      await addJournal({
        content: journalText,
        day: selectedDate, // Direkt selectedDate kullanıyoruz
      });

      setJournalText("");
      fetchJournals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteJournal = async (id) => {
    try {
      await deleteJournal(id);
      fetchJournals();
    } catch (err) {
      if (err?.response?.status === 404) {
        // entry already gone on server (e.g., after backend restart). Remove locally and refetch.
        setJournals(prev => prev.filter(j => j.id !== id));
        fetchJournals();
        return;
      }
      handleAuthError(err);
    }
  };

  const handleEditJournal = (journal) => {
    setEditingJournal(journal);
    setJournalText(journal.content);
  };

  const handleUpdateJournal = async (e) => {
    e.preventDefault();
    if (!journalText.trim()) return;

    try {
      // Önce eski journal'ı sil
      await deleteJournal(editingJournal.id);
      // Sonra yeni içerikle ekle
      await addJournal({
        content: journalText,
        date: selectedDate
      });
      setJournalText("");
      setEditingJournal(null);
      fetchJournals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelEdit = () => {
    setEditingJournal(null);
    setJournalText("");
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  

  // Seçilen günün mood'unu bul
  const selectedDayMood = moods.find(m => {
    const moodDate = new Date(m.created_at).toISOString().split('T')[0];
    return moodDate === selectedDate;
  });

  return (
    <div className="relative">
      {/* Profil simgesi - görevler ile aynı hizada */}
      <div className="absolute top-4 right-80 z-10">
        <div className="bg-yellow-100 backdrop-blur-sm rounded-2xl p-3 shadow-lg hover:shadow-xl transition-shadow duration-200">
        <Link 
        to="/profile" 
        className="block w-12 h-12 rounded-full overflow-hidden bg-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-200">
          
          {profile?.avatar_url ? (
            <img 
            src={`${BASE_URL}${profile.avatar_url}`} 
            alt="avatar" 
            className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-lg">😊</div>
          )}
        </Link>
        <p className="text-xs text-center mt-2 text-gray-600 font-medium">Profil</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 p-4 space-y-6">
        {/* Üst kısım - Takvim ve Timer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="max-w-md">
            <Calendar
              value={selectedDate}
              onChange={setSelectedDate}
              month={currentMonth}
              setMonth={setCurrentMonth}
              onDayDoubleClick={(d)=>navigate(`/calendar?month=${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`)}
            />
          </div>
          <div className="max-w-sm">
            <PomodoroTimer theme={theme} />
          </div>
        </div>
      
        {/* Orta kısım - Mood Chart ve Mood */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="max-w-lg bg-green-100 rounded-3xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
            <MoodChart theme={theme} />
          </div>
          
          <div className="max-w-sm bg-green-100 rounded-3xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
        <h2 className="text-xl font-semibold mb-3 ">Mood</h2>       
        {selectedDayMood ? (
          <div className="p-3 bg-green-200 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-3xl">{selectedDayMood.mood}</p>
                {selectedDayMood.note && <p className="text-sm mt-2 italic">{selectedDayMood.note}</p>}
              </div>
              <button
                onClick={handleDeleteMood}
                className="text-sm bg-red-300 px-3 py-1 rounded-full hover:bg-red-400 transition"
              >
                🗑️ Sil
              </button>
            </div>
            <div className="mt-3 text-xs text-gray-600">
              Yeni mood seçin
            </div>
          </div>
        ) : null}
        
        {/* Mood seçimi - her zaman görünür */}
        {(
          <>
            <div className="flex flex-wrap gap-3 mb-3"> 
              {moodsEmoji.map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedMood(m)}
                  className={`text-3xl p-2.5 rounded-lg border ${selectedMood === m ? 'bg-pink-200' : ''}`}
                >
                  {m}
                </button>
              ))}
            </div>
            <input
              id="mood-note"
              name="moodNote"
              placeholder="Not ekle (opsiyonel)"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="p-2 rounded-lg border w-full mb-2"
            />

            <button
              type="button"
              onClick={handleAddMood}
              className="mt-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2 rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {selectedDayMood ? 'Güncelle' : 'Kaydet'}
            </button>
          </>
        )}
          </div>
        </div>

        {/* Alt kısım - Tasks ve Journal */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-green-100 rounded-3xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Görevler</h2>
          <button
            onClick={() => setShowAddTask(!showAddTask)}
            className="text-sm bg-green-200 px-3 py-1 rounded-full hover:bg-green-300 transition"
          >
            📊 İstatistik
          </button>
        </div>
        
        {showAddTask && (
          <form onSubmit={handleAddTask} className="flex gap-2 mb-3">
            <input
              placeholder="Yeni görev"
              value={taskText}
              onChange={e => setTaskText(e.target.value)}
              className="p-2 rounded-lg border w-full"
            />
            <button
              type="submit"
              className="bg-green-300 rounded-lg p-2 hover:bg-green-400 transition"
            >
              Ekle
            </button>
          </form>
        )}
        
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div 
              onDoubleClick={handleTaskAreaDoubleClick}
              className="min-h-[100px] p-2 border-2 border-dashed border-transparent hover:border-gray-300 rounded-lg transition-colors cursor-pointer"
            >
              {tasks.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>Görev yok. Boş alana çift tıklayarak görev ekleyin!</p>
                </div>
              ) : (
                tasks.map(t => (
                  <TaskItem key={t.id} task={t} fetchTasks={fetchTasks} />
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Task Statistics - ayrı bölüm */}
          {showAddTask && (
            <div className="bg-yellow-100 rounded-3xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
              <TaskStats tasks={tasks} theme={theme} />
            </div>
          )}
          </div>

          {/* Journal */}
          <div className="bg-green-100 rounded-3xl shadow-md p-10 hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-pink-300 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">📓</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Günlük Notlarım</h2>
        </div>
        
        <form onSubmit={editingJournal ? handleUpdateJournal : handleAddJournal} className="mb-6">
          <div className="relative">
            <textarea
              placeholder="Bugün nasıl geçti? Düşüncelerini, duygularını, yaşadıklarını buraya yazabilirsin..."
              value={journalText}
              onChange={e => {
                if (e.target.value.length <= 500) {
                  setJournalText(e.target.value);
                }
              }}
              maxLength={500}
              className="w-full p-4 rounded-2xl border-2 border-green-200 focus:border-green-400 focus:outline-none resize-none transition-all duration-200 min-h-[200px] text-gray-700 placeholder-gray-400 shadow-sm text-lg"
              rows="8"
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              {journalText.length}/500
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={!journalText.trim()}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {editingJournal ? '✨ Güncelle' : '✨ Notumu Kaydet'}
            </button>
            {editingJournal && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-semibold text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                İptal
              </button>
            )}
          </div>
        </form>
        
        <div className="space-y-4">
          {journals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📖</div>
              <p className="text-lg">Henüz günlük notun yok</p>
              <p className="text-sm">İlk notunu yazmaya başla!</p>
            </div>
          ) : (
            journals.map(j => (
              <div key={j.id} className="transform hover:scale-[1.02] transition-all duration-200">
                <JournalEntry journal={j} onDelete={handleDeleteJournal} onEdit={handleEditJournal} />
              </div>
            ))
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
