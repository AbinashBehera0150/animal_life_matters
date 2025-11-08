// Components/PhotoModal.js - Extra Safe Version
import React, { useState, useEffect } from 'react';
import './PhotoModal.css';

const PhotoModal = ({ isOpen, onClose, photos = [], initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  // Ensure photos is always an array and has valid items
  const safePhotos = Array.isArray(photos) ? photos.filter(photo => photo && photo.url) : [];
  const hasValidPhotos = safePhotos.length > 0;

  // Reset current index when modal opens or initialIndex changes
  useEffect(() => {
    if (isOpen && hasValidPhotos) {
      const safeIndex = Math.min(Math.max(0, initialIndex), safePhotos.length - 1);
      setCurrentIndex(safeIndex);
    }
  }, [initialIndex, isOpen, hasValidPhotos, safePhotos.length]);

  // Keyboard event handling
  useEffect(() => {
    if (!isOpen || !hasValidPhotos) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + safePhotos.length) % safePhotos.length);
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % safePhotos.length);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasValidPhotos, safePhotos.length, onClose]);

  const goToNext = () => {
    if (!hasValidPhotos) return;
    setCurrentIndex((prev) => (prev + 1) % safePhotos.length);
  };

  const goToPrevious = () => {
    if (!hasValidPhotos) return;
    setCurrentIndex((prev) => (prev - 1 + safePhotos.length) % safePhotos.length);
  };

  // Early return must be after all hooks
  if (!isOpen || !hasValidPhotos) return null;

  const currentPhoto = safePhotos[currentIndex];

  return (
    <div className="photo-modal-overlay" onClick={onClose}>
      <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="photo-modal-header">
          <span className="photo-counter">
            {currentIndex + 1} / {safePhotos.length}
          </span>
          <button className="photo-close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="photo-main-container">
          {safePhotos.length > 1 && (
            <button className="photo-nav-button photo-prev-button" onClick={goToPrevious}>
              ‹
            </button>
          )}
          
          <div className="photo-main-image">
            <img
              src={currentPhoto.url}
              alt={`Animal photo ${currentIndex + 1}`}
              className="enlarged-photo"
            />
          </div>
          
          {safePhotos.length > 1 && (
            <button className="photo-nav-button photo-next-button" onClick={goToNext}>
              ›
            </button>
          )}
        </div>
        
        {safePhotos.length > 1 && (
          <div className="photo-thumbnails-container">
            {safePhotos.map((photo, index) => (
              <button
                key={index}
                className={`photo-thumbnail ${index === currentIndex ? 'photo-thumbnail-active' : ''}`}
                onClick={() => setCurrentIndex(index)}
              >
                <img
                  src={photo.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="thumbnail-image"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoModal;