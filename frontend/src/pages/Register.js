import { useState, useEffect } from 'react';
import { registerUser } from '../api/api';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
  if (process.env.NODE_ENV === 'production') {
    const token = localStorage.getItem('token');
    if (token) navigate('/');
  }
}, [navigate]);


  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await registerUser(form);

      // Yeni kullanıcı kaydı başarılıysa token varsa kaydet ve ana sayfaya yönlendir
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        navigate('/'); // ana sayfa
      }

    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong';

      if (msg.includes('Email already exists')) {
        // Kullanıcıyı login sayfasına yönlendir
        setError('Email already exists. Please login.');
        navigate('/login');
      } else {
        setError(msg);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-rose-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Register</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <button
            type="submit"
            className="bg-rose-400 text-white p-2 rounded hover:bg-rose-500 transition"
          >
            Register
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Zaten hesabınız var mı?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-rose-500 hover:text-rose-600 font-medium"
            >
              Giriş yapın
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

