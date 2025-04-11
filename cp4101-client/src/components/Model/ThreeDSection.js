// src/components/ThreeDSection.js
import React, { useState, useRef, useEffect } from 'react';
import { DEFAULT_CFG_STRENGTH, DEFAULT_MESH_SIMPLIFY_RATIO, DEFAULT_SLAT_STEPS, DEFAULT_SPARSE_CFG_STRENGTH, DEFAULT_SPARSE_STEPS, DEFAULT_TEXTURE_SIZE } from '../../constants';

const ThreeDSection = ({
  seed,
  setSeed,
  sparseSteps,
  setSparseSteps,
  sparseCfgStrength,
  setSparseCfgStrength,
  slatSteps,
  setSlatSteps,
  cfgStrength,
  setCfgStrength,
  textureSize,
  setTextureSize,
  meshSimplifyRatio,
  setMeshSimplifyRatio,
  generate3DModel,
  loading,
  loading3D,
  imageUrl,
  glbUrl,
  setGlbUrl,
  fbxUrl,
  setFbxUrl,
  textureUrls,
  setTextureUrls,
  modelGallery,
  setModelGallery,
  handleSelectModel,
  handleDownloadModel,
}) => {
  const [hoveredModelIndex, setHoveredModelIndex] = useState(null);
  const modelViewRef = useRef(null);

  useEffect(() => {
    if (glbUrl && modelViewRef.current) {
      modelViewRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [glbUrl]);

  // const handleAddToGallery = () => {
  //   if (glbUrl && fbxUrl && textureUrls) {
  //     setModelGallery([...modelGallery, [glbUrl, fbxUrl, textureUrls]]);
  //   }
  // };

  const handleDeleteModel = (index) => {
    const modelToDelete = modelGallery[index];
    if (modelToDelete[0] === glbUrl) {
      setGlbUrl('');
      setFbxUrl('');
      setTextureUrls([]);
    }
    setModelGallery(modelGallery.filter((_, i) => i !== index));
  };

  // const handleClearModelGallery = () => {
  //   if (modelGallery.includes(glbUrl)) {
  //     setGlbUrl('');
  //     setFbxUrl('');
  //     setTextureUrls([]);
  //   }
  //   setModelGallery([]);
  // };

  return (
    <section style={{ marginBottom: '2rem', textAlign: 'center' }}>
      <h2>3D Model Generation</h2>
      <table style={{ margin: '0 auto', borderCollapse: 'collapse', minWidth: '500px' }}>
        <tbody>
          <tr>
            <td
              style={{
                padding: '0.5rem',
                border: '1px solid #ccc',
                textAlign: 'left',
              }}
            >
              <label htmlFor="seed">Seed</label>
            </td>
            <td
              style={{
                padding: '0.5rem',
                border: '1px solid #ccc',
              }}
            >
              <input
                type="number"
                id="seed"
                value={seed}
                onChange={(e) => setSeed(parseInt(e.target.value))}
                style={{ width: '100%', padding: '0.25rem 0.5rem', boxSizing: 'border-box' }}
                disabled={loading3D}
              />
            </td>
          </tr>
          <tr>
            <td
              style={{
                padding: '0.5rem',
                border: '1px solid #ccc',
                textAlign: 'left',
              }}
            >
              <label htmlFor="sparseSteps">
                Sparse Steps
              </label>
            </td>
            <td
              style={{
                padding: '0.5rem',
                border: '1px solid #ccc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '0.5rem', display: 'inline-block', width: '50px', textAlign: 'center' }}>
                  {sparseSteps}
                </span>
                <input
                  type="range"
                  id="sparseSteps"
                  value={sparseSteps}
                  onChange={(e) => setSparseSteps(parseInt(e.target.value))}
                  min="1"
                  max="50"
                  style={{ flex: 1 }}
                  disabled={loading3D}
                />
                <button
                  type="button"
                  onClick={() => setSparseSteps(DEFAULT_SPARSE_STEPS)}
                  style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem' }}
                  disabled={loading3D}
                >
                  Reset
                </button>
              </div>
            </td>
          </tr>
          <tr>
            <td
              style={{
                padding: '0.5rem',
                border: '1px solid #ccc',
                textAlign: 'left',
              }}
            >
              <label htmlFor="sparseCfgStrength">
                Sparse CFG Strength
              </label>
            </td>
            <td
              style={{
                padding: '0.5rem',
                border: '1px solid #ccc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '0.5rem', display: 'inline-block', width: '50px', textAlign: 'center' }}>
                  {sparseCfgStrength}
                </span>
                <input
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  id="sparseCfgStrength"
                  value={sparseCfgStrength}
                  onChange={(e) =>
                    setSparseCfgStrength(parseFloat(e.target.value))
                  }
                  style={{ flex: 1 }}
                  disabled={loading3D}
                />
                <button
                  type="button"
                  onClick={() => setSparseCfgStrength(DEFAULT_SPARSE_CFG_STRENGTH)}
                  style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem' }}
                  disabled={loading3D}
                >
                  Reset
                </button>
              </div>
            </td>
          </tr>
          <tr>
            <td
              style={{
                padding: '0.5rem',
                border: '1px solid #ccc',
                textAlign: 'left',
              }}
            >
              <label htmlFor="slatSteps">
                Slat Steps
              </label>
            </td>
            <td
              style={{
                padding: '0.5rem',
                border: '1px solid #ccc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '0.5rem', display: 'inline-block', width: '50px', textAlign: 'center' }}>
                  {slatSteps}
                </span>
                <input
                  type="range"
                  min="1"
                  max="50"
                  id="slatSteps"
                  value={slatSteps}
                  onChange={(e) => setSlatSteps(parseInt(e.target.value))}
                  style={{ flex: 1 }}
                  disabled={loading3D}
                />
                <button
                  type="button"
                  onClick={() => setSlatSteps(DEFAULT_SLAT_STEPS)}
                  style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem' }}
                  disabled={loading3D}
                >
                  Reset
                </button>
              </div>
            </td>
          </tr>
          <tr>
            <td
              style={{
                padding: '0.5rem',
                border: '1px solid #ccc',
                textAlign: 'left',
              }}
            >
              <label htmlFor="cfgStrength">
                CFG Strength
              </label>
            </td>
            <td
              style={{
                padding: '0.5rem',
                border: '1px solid #ccc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '0.5rem', display: 'inline-block', width: '50px', textAlign: 'center' }}>
                  {cfgStrength}
                </span>
                <input
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  id="cfgStrength"
                  value={cfgStrength}
                  onChange={(e) => setCfgStrength(parseFloat(e.target.value))}
                  style={{ flex: 1 }}
                  disabled={loading3D}
                />
                <button
                  type="button"
                  onClick={() => setCfgStrength(DEFAULT_CFG_STRENGTH)}
                  style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem' }}
                  disabled={loading3D}
                >
                  Reset
                </button>
              </div>
            </td>
          </tr>
          <tr>
            <td
              style={{
                padding: '0.5rem',
                border: '1px solid #ccc',
                textAlign: 'left',
              }}
            >
              <label htmlFor="textureSize">Texture Size</label>
            </td>
            <td
              style={{
                padding: '0.5rem',
                border: '1px solid #ccc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '0.5rem', display: 'inline-block', width: '50px', textAlign: 'center' }}>
                  {textureSize}px
                </span>
                <input
                  type="range"
                  min="512"
                  max="1024"
                  step="256"
                  id="textureSize"
                  value={textureSize}
                  onChange={(e) => setTextureSize(parseInt(e.target.value))}
                  style={{ flex: 1 }}
                  disabled={loading3D}
                />
                <button
                  type="button"
                  onClick={() => setTextureSize(DEFAULT_TEXTURE_SIZE)}
                  style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem' }}
                  disabled={loading3D}
                >
                  Reset
                </button>
              </div>
            </td>
          </tr>
          <tr>
            <td
              style={{
                padding: '0.5rem',
                border: '1px solid #ccc',
                textAlign: 'left',
              }}
            >
              <label htmlFor="meshSimplifyRatio">
                Mesh Simplify Ratio
              </label>
            </td>
            <td
              style={{
                padding: '0.5rem',
                border: '1px solid #ccc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '0.5rem', display: 'inline-block', width: '50px', textAlign: 'center' }}>
                  {meshSimplifyRatio}
                </span>
                <input
                  type="range"
                  min="0.01"
                  max="0.99"
                  step="0.01"
                  id="meshSimplifyRatio"
                  value={meshSimplifyRatio}
                  onChange={(e) =>
                    setMeshSimplifyRatio(parseFloat(e.target.value))
                  }
                  style={{ flex: 1 }}
                  disabled={loading3D}
                />
                <button
                  type="button"
                  onClick={() => setMeshSimplifyRatio(DEFAULT_MESH_SIMPLIFY_RATIO)}
                  style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem' }}
                  disabled={loading3D}
                >
                  Reset
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: '1rem', textAlign: 'center', height: '40px' }}>
        {loading3D ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem 1rem' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                border: '3px solid #f3f3f3',
                borderTop: '3px solid #3498db',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            <span style={{ marginLeft: '0.5rem' }}>Generating...</span>
          </div>
        ) : (
          <button
            onClick={generate3DModel}
            disabled={!imageUrl || loading || loading3D}
            style={{ padding: '0.5rem 1rem' }}
          >
            Generate
          </button>
        )}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Model Gallery</h3>
        {!modelGallery || modelGallery.length <= 0 ? (
          <p>No models in the gallery.</p>
        ) : (
          <>
            <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              justifyContent: 'center',
              }}
            >
              {modelGallery.map((model, index) => (
                <div
                  key={index}
                  style={{ position: 'relative', display: 'inline-block' }}
                  onMouseEnter={() => setHoveredModelIndex(index)}
                  onMouseLeave={() => setHoveredModelIndex(null)}
                >
                  <model-viewer
                    src={model.glb}
                    alt={`Gallery ${index}`}
                    auto-rotate
                    auto-rotate-delay="1000"
                    // camera-controls
                    style={{ width: '150px', height: '150px', cursor: 'pointer', border: '2px solid #ccc', borderRadius: '4px' }}
                    onClick={() => handleSelectModel(index)}
                  ></model-viewer>
                  {hoveredModelIndex === index && (
                    <button
                      onClick={() => handleDeleteModel(index)}
                      style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        backgroundColor: 'rgba(255, 0, 0, 0.7)',
                        color: '#fff',
                        borderRadius: '50%',
                        border: 'none',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        padding: 0,
                      }}
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
            </div>
            {/* <button
              onClick={handleClearModelGallery}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
              }}
            >
              Clear Model Gallery
            </button> */}
          </>
        )}
      </div>

      {glbUrl && (
        <div style={{ marginTop: '2rem' }} ref={modelViewRef}>
          <h3>Selected 3D Model:</h3>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: '2px solid #ddd',
              padding: '1rem',
              margin: '0 auto',
              width: 'fit-content',
            }}
          >
            <model-viewer
              src={glbUrl}
              alt="3D model"
              auto-rotate
              camera-controls
              style={{ width: '500px', height: '500px' }}
            ></model-viewer>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <button
              style={{
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                marginRight: '0.5rem',
              }}
              onClick={handleDownloadModel}
            >
              Download model
            </button>
            {/* <a href={glbUrl} download="model.glb">
              <button
                style={{
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  marginRight: '0.5rem',
                }}
              >
                Download .glb
              </button>
            </a> */}
            {/* <a href={fbxUrl} download="model.fbx">
              <button
                style={{
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  marginRight: '0.5rem',
                }}
              >
                Download .fbx
              </button>
            </a> */}
            {/* <button
              onClick={handleAddToGallery}
              style={{
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                marginRight: '0.5rem',
              }}
            >
              Add to Model Gallery
            </button> */}
          </div>
          {/* <div style={{ marginTop: '1rem' }}>
            {textureUrls.map((textureUrl, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginRight: '0.5rem',
                }}
              >
                <img
                  src={textureUrl}
                  alt={`Texture ${index}`}
                  style={{
                    height: '100px',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    border: '2px solid #ccc',
                    borderRadius: '4px',
                  }}
                />
                <a href={textureUrl} download={`${index}.png`}>
                  <button
                    style={{
                      padding: '0.5rem 1rem',
                      cursor: 'pointer',
                      marginRight: '0.5rem',
                    }}
                  >
                    Download texture {index}
                  </button>
                </a>
              </div>
            ))}
          </div> */}
        </div>
      )}
    </section>
  );
};

export default ThreeDSection;
