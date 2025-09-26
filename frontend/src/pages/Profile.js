import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, BASE_URL } from '../api/api';
import { ThemeContext } from '../index';
import AvatarUpload from '../components/AvatarUpload';

const Profile = () => {
  const navigate = useNavigate();
  const { theme, toggle } = useContext(ThemeContext);
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

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

  const onPasswordSave = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Yeni şifreler eşleşmiyor');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      alert('Yeni şifre en az 6 karakter olmalı');
      return;
    }
    
    try {
      setSaving(true);
      const res = await updateProfile({
        username,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setProfile(res.data);
      setShowPasswordForm(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Şifre başarıyla güncellendi');
    } catch (err) {
      alert(err.response?.data?.message || 'Şifre güncelleme hatası');
    } finally {
      setSaving(false);
    }
  };

  const onAvatarUpdate = (newProfile) => {
    setProfile(newProfile);
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

      <AvatarUpload 
        currentAvatar={profile.avatar_url} 
        onAvatarUpdate={onAvatarUpdate}
        theme={theme}
      />

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

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex justify-between items-center mb-3">
          <button
            type="button"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="text-sm text-rose-600 hover:text-rose-700"
          >
            {showPasswordForm ? 'İptal' : 'Şifre Değiştir'}
          </button>
        </div>

        {showPasswordForm && (
          <form onSubmit={onPasswordSave} className="flex flex-col gap-3">
            <input
              type="password"
              placeholder="Mevcut şifre"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
              className={`border p-2 rounded w-full
                          ${theme==='light' ? 'bg-white text-gray-900' : 'bg-gray-700 text-gray-100'}`}
            />
            <input
              type="password"
              placeholder="Yeni şifre"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
              className={`border p-2 rounded w-full
                          ${theme==='light' ? 'bg-white text-gray-900' : 'bg-gray-700 text-gray-100'}`}
            />
            <input
              type="password"
              placeholder="Yeni şifre tekrar"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
              className={`border p-2 rounded w-full
                          ${theme==='light' ? 'bg-white text-gray-900' : 'bg-gray-700 text-gray-100'}`}
            />
            <button
              type="submit"
              disabled={saving}
              className={`p-2 rounded text-white w-full
                          ${theme==='light' ? 'bg-green-400 hover:bg-green-500' : 'bg-green-700 hover:bg-green-600'} 
                          disabled:opacity-60`}
            >
              {saving ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;


