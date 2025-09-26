import { useState, useRef } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { BASE_URL } from '../api/api';

const AvatarUpload = ({ currentAvatar, onAvatarUpdate, theme }) => {
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({ unit: '%', width: 90, aspect: 1 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showCrop, setShowCrop] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const imgRef = useRef(null);

  const onImageLoad = (img) => {
    imgRef.current = img;
    const { width, height } = img;
    const size = Math.min(width, height);
    setCrop({
      unit: 'px',
      width: size,
      height: size,
      x: (width - size) / 2,
      y: (height - size) / 2,
    });
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImage(reader.result);
        setShowCrop(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (crop) => {
    setCompletedCrop(crop);
  };

  const getCroppedImg = (image, crop) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    return new Promise((resolve) => {
      img.onload = () => {
        const scaleX = img.naturalWidth / img.width;
        const scaleY = img.naturalHeight / img.height;
        
        canvas.width = crop.width;
        canvas.height = crop.height;
        
        ctx.drawImage(
          img,
          crop.x * scaleX,
          crop.y * scaleY,
          crop.width * scaleX,
          crop.height * scaleY,
          0,
          0,
          crop.width,
          crop.height
        );
        
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', 0.9);
      };
      img.src = image;
    });
  };

  const handleCropAndUpload = async () => {
    if (!completedCrop || !image) return;
    
    setUploading(true);
    try {
      const croppedImageBlob = await getCroppedImg(image, completedCrop);
      
      const formData = new FormData();
      formData.append('avatar', croppedImageBlob, 'avatar.jpg');
      
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
        setShowCrop(false);
        setImage(null);
        setPreviewUrl(null);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Avatar yükleme hatası');
    } finally {
      setUploading(false);
    }
  };

  const cancelCrop = () => {
    setShowCrop(false);
    setImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-night-200 overflow-hidden flex items-center justify-center">
        {previewUrl ? (
          <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
        ) : currentAvatar ? (
          <img src={`${BASE_URL}${currentAvatar}`} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl">😊</span>
        )}
      </div>
      
      <div className="flex flex-col gap-2">
        <label className="cursor-pointer bg-rose-200 px-3 py-2 rounded hover:bg-rose-300 text-sm">
          Fotoğraf Yükle
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={onFileChange}
          />
        </label>
      </div>

      {showCrop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-night-900 rounded-lg p-4 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 dark:text-black">Avatar Kırp</h3>
            
            <div className="mb-4">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={onCropComplete}
                aspect={1}
                circularCrop
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={image}
                  onLoad={onImageLoad}
                  className="max-h-64"
                />
              </ReactCrop>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleCropAndUpload}
                disabled={uploading}
                className="flex-1 bg-rose-400 text-white px-4 py-2 rounded hover:bg-rose-500 disabled:opacity-50"
              >
                {uploading ? 'Yükleniyor...' : 'Kırp ve Yükle'}
              </button>
              <button
                onClick={cancelCrop}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 dark:text-black"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;
