import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, uploadAvatar, BASE_URL } from '../api/api';

const Profile = () => {
  const navigate = useNavigate();
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
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded-2xl shadow">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Profil</h1>
        <button onClick={onLogout} className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">Çıkış Yap</button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
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
          className="border p-2 rounded"
          placeholder="Kullanıcı adı"
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
        />
        <button disabled={saving} className="bg-rose-400 text-white p-2 rounded hover:bg-rose-500 disabled:opacity-60">
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </form>
    </div>
  );
};

export default Profile;


