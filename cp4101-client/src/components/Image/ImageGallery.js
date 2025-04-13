import React, { useState, useRef, useEffect } from 'react';
import { FiDownload, FiMoreVertical, FiTrash } from 'react-icons/fi';
import { Button, IconButton } from '../common';

const ImageGallery = ({
  imageGallery,
  setImageGallery,
  imageUrl,
  setImageUrl,
  selectImage,
  loading,
  loading3D,
  handleDownloadImage,
  hideMenu,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const imageRefs = useRef([]);

  useEffect(() => {
    if (imageUrl && imageRefs.current.length) {
      const imageIndex = imageGallery.indexOf(imageUrl);
      if (imageIndex !== -1 && imageRefs.current[imageIndex]) {
        imageRefs.current[imageIndex].scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'center',
        });
      }
    }
  }, [imageUrl, imageGallery]);

  const handleDeleteImage = (index) => {
    const imageToDelete = imageGallery[index];
    if (imageToDelete === imageUrl) {
      setImageUrl('');
    }
    setImageGallery((prevImageGallery) =>
      prevImageGallery.filter((_, i) => i !== index)
    );
  };

  return (
    <>
      {!imageGallery || imageGallery.length === 0 ? (
        <p>No images saved</p>
      ) : (
        <>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              justifyContent: 'left',
            }}
          >
            {imageGallery.map((img, index) => (
              <ImageSlot
                displayedImage={img}
                index={index}
                selectedImage={imageUrl}
                selectImage={selectImage}
                loading={loading}
                loading3D={loading3D}
                hoveredIndex={hoveredIndex}
                setHoveredIndex={setHoveredIndex}
                imageRefs={imageRefs}
                handleDownloadImage={handleDownloadImage}
                handleDeleteImage={handleDeleteImage}
                hideMenu={hideMenu}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default ImageGallery;

const ImageSlot = ({
  displayedImage,
  index,
  selectedImage,
  selectImage,
  loading,
  loading3D,
  hoveredIndex,
  setHoveredIndex,
  imageRefs,
  handleDownloadImage,
  handleDeleteImage,
  hideMenu,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const slotRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [displayedImage]);

  useEffect(() => {
    if (loading || loading3D)
      setIsMenuOpen(false);
  }, [loading, loading3D]);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  }

  useEffect(() => {
    if (slotRef.current && isMenuOpen) {
      slotRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'nearest',
        block: 'nearest',
      });
    }
  }, [isMenuOpen]);

  useEffect(() => {
      const handleClickOutside = (e) => {
          if (menuRef.current && !menuRef.current.contains(e.target)) {
              setIsMenuOpen(false);
          }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      key={index}
      style={{
        position: 'relative',
        display: 'inline-block',
        border: displayedImage === selectedImage ? '2px solid var(--color-primary)' : '2px solid var(--color-border)',
        borderRadius: '4px',
      }}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
      ref={slotRef}
    >
      <img
        ref={(el) => (imageRefs.current[index] = el)}
        src={displayedImage}
        alt={`Gallery ${index}`}
        style={{
          display: 'block',
          width: '100px',
          height: '100px',
          objectFit: 'cover',
          cursor: 'pointer',
          pointerEvents: loading || loading3D ? 'none' : 'auto',
        }}
        onClick={() => selectImage(displayedImage)}
      />
      {!hideMenu && hoveredIndex === index && (
        <Button
          onClick={toggleMenu}
          style={{
            position: 'absolute',
            top: '0.25rem',
            right: '0.25rem',
            padding: '0.25rem',
          }}
          disabled={loading || loading3D}
        >
          <FiMoreVertical/>
        </Button>
      )}
      {!hideMenu && isMenuOpen && (
        <div
          ref={menuRef}
          style={{
            position: 'absolute',
            backgroundColor: 'white',
            top: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem',
            boxSizing: 'border-box',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
          }}
        >
          <IconButton
            onClick={() => handleDownloadImage(displayedImage)}
            disabled={loading || loading3D}
            style={{
              color: 'var(--color-primary)',
            }}
          >
            <FiDownload/>
          </IconButton>
          <IconButton
            onClick={() => handleDeleteImage(index)}
            disabled={loading || loading3D}
            style={{
              color: 'red',
            }}
          >
            <FiTrash/>
          </IconButton>
        </div>
      )}
    </div>
  );
};
