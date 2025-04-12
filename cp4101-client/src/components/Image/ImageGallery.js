import React, { useState, useRef, useEffect } from 'react';
import { FiTrash } from 'react-icons/fi';

const ImageGallery = ({
  imageGallery,
  setImageGallery,
  imageUrl,
  setImageUrl,
  selectImage,
  loading,
  loading3D,
  noWrap = false,
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
              flexWrap: noWrap ? 'no-wrap' : 'wrap',
              gap: '10px',
              justifyContent: 'left',
            }}
          >
            {imageGallery.map((img, index) => (
              <div
                key={index}
                style={{ position: 'relative', display: 'inline-block' }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <img
                  ref={(el) => (imageRefs.current[index] = el)}
                  src={img}
                  alt={`Gallery ${index}`}
                  style={{
                    display: 'block',
                    width: '100px',
                    height: '100px',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    border: img === imageUrl ? '2px solid var(--color-primary)' : '2px solid var(--color-border)',
                    borderRadius: '4px',
                    pointerEvents: loading || loading3D ? 'none' : 'auto',
                  }}
                  onClick={() => selectImage(img)}
                />
                {!loading && !loading3D && hoveredIndex === index && (
                  <button
                    onClick={() => handleDeleteImage(index)}
                    style={{
                      position: 'absolute',
                      top: '0.25rem',
                      right: '0.25rem',
                      background: 'red',
											color: 'white',
											borderRadius: '50%',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      aspectRatio: 1,
                    }}
                    disabled={loading || loading3D}
                  >
                    <FiTrash size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default ImageGallery;
