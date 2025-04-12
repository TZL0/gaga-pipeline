import React, { useState, useRef, useEffect } from 'react';
import { FiDownload, FiMoreVertical, FiTrash } from 'react-icons/fi';
import { IconButton } from '../common';

const ModelGallery = ({
  modelGallery,
  setModelGallery,
  model,
  handleSelectModel,
  loading,
  loading3D,
  handleDownloadModel,
  hideMenu,
}) => {
  const [hoveredModelIndex, setHoveredModelIndex] = useState(null);
  const modelRefs = useRef([]);

  useEffect(() => {
    if (model && modelRefs.current.length) {
      let modelIndex = -1;
      for (const [index, m] of modelGallery.entries()) {
        if (m.glbUrl === model.glbUrl) {
          modelIndex = index;
          break;
        }
      }

      if (modelIndex !== -1 && modelRefs.current[modelIndex]) {
        modelRefs.current[modelIndex].scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'center',
        });
      }
    }
  }, [model, modelGallery]);

  const handleDeleteModel = (modelToDelete) => {
    if (modelToDelete === model) {
      handleSelectModel(null);
    }
    setModelGallery((prevModelGallery) =>
      prevModelGallery.filter((m, _) => m !== modelToDelete)
    );
  };

  return (
    <>
      {!modelGallery || modelGallery.length === 0 ? (
        <p>No models saved</p>
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
            {modelGallery.map((m, index) => (
              <ModelSlot
                displayedModel={m}
                index={index}
                selectedModel={model}
                handleSelectModel={handleSelectModel}
                modelRefs={modelRefs}
                loading={loading}
                loading3D={loading3D}
                handleDeleteModel={handleDeleteModel}
                handleDownloadModel={handleDownloadModel}
                hoveredModelIndex={hoveredModelIndex}
                setHoveredModelIndex={setHoveredModelIndex}
                hideMenu={hideMenu}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default ModelGallery;

const ModelSlot = ({
  displayedModel,
  index,
  selectedModel,
  handleSelectModel,
  modelRefs,
  loading,
  loading3D,
  handleDeleteModel,
  handleDownloadModel,
  hoveredModelIndex,
  setHoveredModelIndex,
  hideMenu,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [displayedModel]);

  useEffect(() => {
    if (loading || loading3D)
      setIsMenuOpen(false);
  }, [loading, loading3D]);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  }

  const menuRef = useRef(null);
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
      key={displayedModel.glbUrl}
      style={{
        position: 'relative',
        display: 'inline-block',
        border: displayedModel === selectedModel ? '2px solid var(--color-primary)' : '2px solid var(--color-border)',
        borderRadius: '4px',
      }}
      onMouseEnter={() => setHoveredModelIndex(index)}
      onMouseLeave={() => setHoveredModelIndex(null)}
    >
      <model-viewer
        ref={(el) => (modelRefs.current[index] = el)}
        src={displayedModel.glbUrl}
        alt={`Gallery ${index}`}
        auto-rotate
        auto-rotate-delay="1000"
        style={{
          width: '100px',
          height: '100px',
          cursor: 'pointer',
          pointerEvents: loading || loading3D ? 'none' : 'auto',
        }}
        onClick={() => handleSelectModel(displayedModel)}
      />
      {!hideMenu && hoveredModelIndex === index && (
        <IconButton
          onClick={toggleMenu}
          style={{
            position: 'absolute',
            top: '0.25rem',
            right: '0.25rem',
          }}
          disabled={loading || loading3D}
        >
          <FiMoreVertical size={12}/>
        </IconButton>
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
            onClick={() => handleDownloadModel(displayedModel)}
            disabled={loading || loading3D}
            style={{
              color: 'var(--color-primary)',
            }}
          >
            <FiDownload/>
          </IconButton>
          <IconButton
            onClick={() => handleDeleteModel(displayedModel)}
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
