import { useState, useRef } from 'react';
import { BASE_URL } from '../api/api';

const AvatarUpload = ({ currentAvatar, onAvatarUpdate, theme }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await fetch(`${BASE_URL}/profile/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        onAvatarUpdate(data);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Avatar yükleme hatası');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-night-200 overflow-hidden flex items-center justify-center">
        {currentAvatar ? (
          <img src={`${BASE_URL}${currentAvatar}`} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl">😊</span>
        )}
      </div>
      
      <div className="flex flex-col gap-2">
        <label className="cursor-pointer bg-rose-200 px-3 py-2 rounded hover:bg-rose-300 text-sm">
          {uploading ? 'Yükleniyor...' : 'Fotoğraf Yükle'}
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={onFileChange}
            disabled={uploading}
          />
        </label>
      </div>
    </div>
  );
};

export default AvatarUpload;