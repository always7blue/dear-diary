import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { addMood, getMoods, getTasks, getJournals, addTask, addJournal, getProfile, BASE_URL, deleteJournal } from '../api/api';
import { Link } from 'react-router-dom';
import TaskItem from '../components/TaskItem';
import JournalEntry from '../components/JournalEntry';

const moodsEmoji = ['😊','😔','😡','😴','😎','🤩'];

const Home = () => {
  const [selectedMood, setSelectedMood] = useState('');
  const [note, setNote] = useState('');
  const [moods, setMoods] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [taskText, setTaskText] = useState('');
  const [journals, setJournals] = useState([]);
  const [journalText, setJournalText] = useState('');
  const [profile, setProfile] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0,10)); // YYYY-MM-DD

  const navigate = useNavigate();

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
    if(!selectedMood) return alert('Lütfen bir ruh hali seçin!');
    try {
      await addMood({ mood: selectedMood, note, date: selectedDate });
      setSelectedMood('');
      setNote('');
      fetchMoods();
    } catch (err) {
      handleAuthError(err);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskText) return;
    try {
      await addTask({ text: taskText, date: selectedDate });
      setTaskText('');
      fetchTasks();
    } catch (err) {
      handleAuthError(err);
    }
  };

  const handleAddJournal = async (e) => {
    e.preventDefault();
    if (!journalText) return;
    try {
      await addJournal({ content: journalText, date: selectedDate });
      setJournalText('');
      fetchJournals();
    } catch (err) {
      handleAuthError(err);
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

  

  // Seçilen günün mood'unu bul
  const selectedDayMood = moods.find(m => m.date?.startsWith(selectedDate));

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-3 flex justify-between items-center gap-3">
        <input type="date" value={selectedDate} onChange={(e)=>setSelectedDate(e.target.value)} className="border p-2 rounded" />
        <Link to="/profile" className="text-rose-600 underline">Profil</Link>
        <Link to="/profile" className="block w-9 h-9 rounded-full overflow-hidden bg-gray-200">
          {profile?.avatar_url ? (
            <img src={`${BASE_URL}${profile.avatar_url}`} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">😊</div>
          )}
        </Link>
      </div>
      
      {/* Mood */}
      <div className="bg-white rounded-2xl shadow-md p-4">
        <h2 className="text-xl font-semibold mb-3">Seçilen Günün Mood'u</h2>
        
        {selectedDayMood ? (
          <div className="p-3 bg-pink-100 rounded-lg">
            <p className="text-3xl">{selectedDayMood.mood}</p>
            {selectedDayMood.note && <p className="text-sm mt-2 italic">{selectedDayMood.note}</p>}
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-3">
              {moodsEmoji.map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedMood(m)}
                  className={`text-2xl p-2 rounded-lg border ${selectedMood === m ? 'bg-pink-200' : ''}`}
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
              type="button" // bu eğer form submit değilse
              onClick={handleAddMood}
              className="bg-pink-300 rounded-lg p-2 w-full hover:bg-pink-400 transition"
            >
              Kaydet
            </button>

          </>
        )}
      </div>

      {/* Tasks */}
      <div className="bg-white rounded-2xl shadow-md p-4">
        <h2 className="text-xl font-semibold mb-3">Görevler</h2>
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
        <div>
          {tasks.map(t => (
            <TaskItem key={t.id} task={t} fetchTasks={fetchTasks} />
          ))}
        </div>
      </div>

      {/* Journal */}
      <div className="bg-white rounded-2xl shadow-md p-4">
        <h2 className="text-xl font-semibold mb-3">Günlük Notlar</h2>
        <form onSubmit={handleAddJournal} className="flex flex-col gap-2 mb-3">
          <textarea
            placeholder="Yeni günlük not"
            value={journalText}
            onChange={e => setJournalText(e.target.value)}
            className="p-2 rounded-lg border w-full"
          />
          <button
            type="submit"
            className="bg-blue-300 rounded-lg p-2 hover:bg-blue-400 transition"
          >
            Ekle
          </button>
        </form>
        <div>
          {journals.map(j => (
            <JournalEntry key={j.id} journal={j} onDelete={handleDeleteJournal} />
          ))}
        </div>
      </div>

    </div>
  );
};

export default Home;
