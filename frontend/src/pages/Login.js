import { useState, useEffect } from 'react';
import { loginUser } from '../api/api';
import { useNavigate } from 'react-router-dom';
import GoogleLogin from '../components/GoogleLogin';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  // Kullanıcı zaten giriş yaptıysa otomatik yönlendirme
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) navigate('/'); // ana sayfaya yönlendir
  }, [navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(form);
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleGoogleSuccess = (data) => {
    navigate('/');
  };

  const handleGoogleError = (error) => {
    setError(error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-rose-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            Login
          </button>
        </form>
        
        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">veya</span>
            </div>
          </div>
          
          <div className="mt-4">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Hesabınız yok mu?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-rose-500 hover:text-rose-600 font-medium"
              >
                Kayıt olun
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
