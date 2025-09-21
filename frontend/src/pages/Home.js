import React, { useEffect, useState } from 'react';
import { addMood, getMoods, getTasks, getJournals, addTask, addJournal } from '../api/api';
import MoodCard from '../components/MoodCard';
import TaskItem from '../components/TaskItem';
import JournalEntry from '../components/JournalEntry';

const moodsEmoji = ['😊','😔','😡','😴','😎','🤩'];

const Home = () => {
  const [selectedMood, setSelectedMood] = useState('');
  const [note, setNote] = useState('');
  const [tasks, setTasks] = useState([]);
  const [taskText, setTaskText] = useState('');
  const [journals, setJournals] = useState([]);
  const [journalText, setJournalText] = useState('');

  useEffect(() => {
    getMoods();
    fetchTasks();
    fetchJournals();
  }, []);

  const fetchTasks = async () => {
    const res = await getTasks();
    setTasks(res.data);
  };

  const fetchJournals = async () => {
    const res = await getJournals();
    setJournals(res.data);
  };

  const handleAddMood = async (e) => {
    e.preventDefault();
    if(!selectedMood) return alert('Lütfen bir ruh hali seçin!');
    await addMood({ mood: selectedMood, note });
    setSelectedMood('');
    setNote('');
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if(!taskText) return;
    await addTask({ text: taskText });
    setTaskText('');
    fetchTasks();
  };

  const handleAddJournal = async (e) => {
    e.preventDefault();
    if(!journalText) return;
    await addJournal({ content: journalText });
    setJournalText('');
    fetchJournals();
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Mood */}
      <div className="bg-white rounded-2xl shadow-md p-4">
        <h2 className="text-xl font-semibold mb-3">Bugünkü Mood</h2>
        <div className="flex gap-2 mb-3">
          {moodsEmoji.map(m => (
            <button key={m} onClick={()=>setSelectedMood(m)} className={`text-2xl p-2 rounded-lg border ${selectedMood===m?'bg-pink-200':''}`}>
              {m}
            </button>
          ))}
        </div>
        <input placeholder="Not ekle (opsiyonel)" value={note} onChange={e=>setNote(e.target.value)} className="p-2 rounded-lg border w-full mb-2"/>
        <button onClick={handleAddMood} className="bg-pink-300 rounded-lg p-2 w-full hover:bg-pink-400 transition">Ekle</button>

        <div className="mt-4">
          {moodsEmoji.map(m=>(
            <MoodCard key={m} mood={m} note={`Bugün böyle hissettim: ${m}`}/>
          ))}
        </div>
      </div>

      {/* Tasks */}
      <div className="bg-white rounded-2xl shadow-md p-4">
        <h2 className="text-xl font-semibold mb-3">Görevler</h2>
        <form onSubmit={handleAddTask} className="flex gap-2 mb-3">
          <input placeholder="Yeni görev" value={taskText} onChange={e=>setTaskText(e.target.value)} className="p-2 rounded-lg border w-full"/>
          <button type="submit" className="bg-green-300 rounded-lg p-2 hover:bg-green-400 transition">Ekle</button>
        </form>
        <div>
          {tasks.map(t => <TaskItem key={t.id} task={t} fetchTasks={fetchTasks}/>)}
        </div>
      </div>

      {/* Journal */}
      <div className="bg-white rounded-2xl shadow-md p-4">
        <h2 className="text-xl font-semibold mb-3">Günlük Notlar</h2>
        <form onSubmit={handleAddJournal} className="flex flex-col gap-2 mb-3">
          <textarea placeholder="Yeni günlük not" value={journalText} onChange={e=>setJournalText(e.target.value)} className="p-2 rounded-lg border w-full"/>
          <button type="submit" className="bg-blue-300 rounded-lg p-2 hover:bg-blue-400 transition">Ekle</button>
        </form>
        <div>
          {journals.map(j=> <JournalEntry key={j.id} journal={j}/>)}
        </div>
      </div>

    </div>
  );
};

export default Home;
