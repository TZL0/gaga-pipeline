import React, { useState, useRef, useEffect } from 'react';
import { FiTrash } from 'react-icons/fi';

const ModelGallery = ({
  modelGallery,
  setModelGallery,
  model,
  handleSelectModel,
  loading,
  loading3D,
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
              <div
                key={m.glbUrl}
                style={{ position: 'relative', display: 'inline-block' }}
                onMouseEnter={() => setHoveredModelIndex(index)}
                onMouseLeave={() => setHoveredModelIndex(null)}
              >
                <model-viewer
                  ref={(el) => (modelRefs.current[index] = el)}
                  src={m.glbUrl}
                  alt={`Gallery ${index}`}
                  auto-rotate
                  auto-rotate-delay="1000"
                  style={{
                    width: '100px',
                    height: '100px',
                    cursor: 'pointer',
                    border: m === model ? '2px solid var(--color-primary)' : '2px solid var(--color-border)',
                    borderRadius: '4px',
                    pointerEvents: loading || loading3D ? 'none' : 'auto',
                  }}
                  onClick={() => handleSelectModel(m)}
                />
                {!loading && !loading3D && hoveredModelIndex === index && (
                  <button
                    onClick={() => handleDeleteModel(m)}
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

export default ModelGallery;
