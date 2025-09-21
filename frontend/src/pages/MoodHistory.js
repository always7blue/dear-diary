import React, { useEffect, useState } from 'react';
import socket from '../socket';
import { getMoods } from '../api/api';

const MoodHistory = () => {
  const [moods, setMoods] = useState([]);

  useEffect(() => {
    getMoods().then(res => setMoods(res.data));

    socket.on('new-mood', (mood) => {
      setMoods(prev => [mood, ...prev]);
    });

    return () => socket.off('new-mood');
  }, []);

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-xl font-semibold mb-4">Ruh Hali Geçmişi</h2>
      {moods.map(m => (
        <div key={m.id} className="bg-pink-100 rounded-2xl p-4 shadow-md mb-4 transition transform hover:scale-105">
          <h3 className="text-lg font-semibold">{m.mood}</h3>
          <p className="text-sm text-gray-700">{m.note}</p>
          <span className="text-xs text-gray-500">{new Date(m.created_at).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export default MoodHistory;
