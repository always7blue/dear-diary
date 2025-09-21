import React, { useState } from 'react';
import { registerUser } from '../api/api';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await registerUser({ username, email, password });
      alert('Kayıt başarılı!');
      navigate('/login');
    } catch (err) {
      alert('Kayıt başarısız!');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Register</h2>
      <form onSubmit={handleRegister} className="flex flex-col gap-3">
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="p-2 rounded-lg border"/>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="p-2 rounded-lg border"/>
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="p-2 rounded-lg border"/>
        <button type="submit" className="bg-pink-300 rounded-lg p-2 mt-2 hover:bg-pink-400 transition">Register</button>
      </form>
    </div>
  );
};

export default Register;
