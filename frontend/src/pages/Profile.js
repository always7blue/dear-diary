import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, uploadAvatar, BASE_URL } from '../api/api';
import { ThemeContext } from '../index';

const Profile = () => {
  const navigate = useNavigate();
  const { theme, toggle } = useContext(ThemeContext);
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    (async () => {
      try {
        const res = await getProfile();
        setProfile(res.data);
        setUsername(res.data.username || '');
      } catch (err) {
        if (err?.response?.status === 401) { localStorage.removeItem('token'); navigate('/login'); }
      }
    })();
  }, [navigate]);

  const onSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await updateProfile({ username });
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const onAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadAvatar(file);
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const onLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!profile) return null;

  const avatarSrc = profile.avatar_url ? `${BASE_URL}${profile.avatar_url}` : undefined;

  return (
    <div className={`max-w-xl mx-auto mt-10 rounded-3xl p-6 shadow-md hover:shadow-lg transition-shadow duration-200
                ${theme === 'light' ? 'bg-yellow-100 text-gray-900' : 'dark:bg-night-50 dark:text-black'}`}>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Profil</h1>
        <div className="flex items-center gap-2">
          <button onClick={toggle} className="text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 dark:hover:bg-night-200">
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button onClick={onLogout} className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">Çıkış Yap</button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-night-200 overflow-hidden flex items-center justify-center">
          {avatarSrc ? (
            <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl">😊</span>
          )}
        </div>
        <label className="cursor-pointer bg-rose-200 px-3 py-2 rounded hover:bg-rose-300">
          Fotoğraf Yükle
          <input type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
        </label>
      </div>

      <form onSubmit={onSave} className="flex flex-col gap-3">
        <input
          className={`border p-2 rounded w-full
                      ${theme==='light' ? 'bg-white text-gray-900' : 'bg-gray-700 text-gray-100'}`}
          placeholder="Kullanıcı adı"
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
        />

        <button disabled={saving} 
                className={`p-2 rounded text-white w-full
                            ${theme==='light' ? 'bg-rose-400 hover:bg-rose-500' : 'bg-rose-700 hover:bg-rose-600'} 
                            disabled:opacity-60`}>
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>

      </form>
    </div>
  );
};

export default Profile;


