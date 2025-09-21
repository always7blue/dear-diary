import React, { useState } from 'react';
import { loginUser } from '../api/api';
import { useNavigate } from 'react-router-dom';

const Login = ({ setToken }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser({ email, password });
      const token = res.data.token;
      localStorage.setItem('token', token);
      setToken(token);
      navigate('/history');
    } catch (err) {
      alert('Giriş başarısız!');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Login</h2>
      <form onSubmit={handleLogin} className="flex flex-col gap-3">
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="p-2 rounded-lg border"/>
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="p-2 rounded-lg border"/>
        <button type="submit" className="bg-pink-300 rounded-lg p-2 mt-2 hover:bg-pink-400 transition">Login</button>
      </form>
    </div>
  );
};

export default Login;
