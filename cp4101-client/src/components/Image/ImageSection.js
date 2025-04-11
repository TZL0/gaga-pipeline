// src/components/ImageSection.js
import React, { useState, useRef, useEffect } from 'react';
import DragImageSection from './DragImageSection';
import RemoveBackgroundPage from './RemoveBackgroundPage';
import { DEFAULT_GUIDANCE_SCALE, DEFAULT_IMAGE_HEIGHT, DEFAULT_IMAGE_WIDTH, DEFAULT_INFERENCE_STEPS } from '../../constants.js';

const ImageSection = ({
  generateModelName,
  setGenerateModelName,
  taskStatusPoller,
  prompt,
  setPrompt,
  negativePrompt,
  setNegativePrompt,
  generatedImageWidth,
  setGeneratedImageWidth,
  generatedImageHeight,
  setGeneratedImageHeight,
  generateNumImages,
  setGenerateNumImages,
  generateImageGuidanceScale,
  setGenerateImageGuidanceScale,
  generateImageInferenceSteps,
  setGenerateImageInferenceSteps,
  generateImage,
  loading,
  loading3D,
  handleImageUpload,
  imageUrl,
  setImageUrl,
  imageGallery,
  setImageGallery,
  selectImage,
  clearImageGallery,
  setError,
}) => {
  const [activeSubpage, setActiveSubpage] = useState(null);
  const fileInputRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedImageHovered, setSelectedImageHovered] = useState(false);
  const imageViewRef = useRef(null);

  useEffect(() => {
    if (imageUrl && imageViewRef.current) {
      imageViewRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [imageUrl]);

  // const handleClearImageGallery = () => {
  //   clearImageGallery();
  //   if (fileInputRef.current) {
  //     fileInputRef.current.value = '';
  //   }
  // };

  const handleDeleteImage = (index) => {
    const imageToDelete = imageGallery[index];
    if (imageToDelete === imageUrl) {
      setImageUrl('');
    }
    setImageGallery((prevImageGallery) =>
      prevImageGallery.filter((_, i) => i !== index)
    );
  };

  const handleDownloadImage = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const time_str = new Date().toISOString().replace(/[-:.]/g, '');
      a.href = url;
      a.download = `image_${time_str}.png`;
      a.click();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section style={{ marginBottom: '2rem' }}>
      <h2>Generate an Image</h2>
      <form onSubmit={generateImage}>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
        <table style={{ margin: '0 auto', borderCollapse: 'collapse', marginTop: '1rem', minWidth: '500px' }}>
          <tbody>
          <tr>
              <td style={{ padding: '0.5rem', border: '1px solid #ccc', textAlign: 'left' }}>
                Choice of Model
              </td>
              <td style={{ padding: '0.5rem', border: '1px solid #ccc' }}>
                <div style={{ display: 'flex', flexDirection:'column', textAlign: 'left', justifyContent: 'center', gap: '1rem' }}>
                  <label>
                    <input
                      type="radio"
                      value="ByteDance/SDXL-Lightning"
                      checked={generateModelName === "ByteDance/SDXL-Lightning"}
                      onChange={(e) => setGenerateModelName(e.target.value)}
                      disabled={loading}
                      style={{ marginRight: '0.5rem' }}
                    />
                    ByteDance/SDXL-Lightning
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="stabilityai/stable-diffusion-xl-base-1.0"
                      checked={generateModelName === "stabilityai/stable-diffusion-xl-base-1.0"}
                      onChange={(e) => setGenerateModelName(e.target.value)}
                      disabled={loading}
                      style={{ marginRight: '0.5rem' }}
                    />
                    stabilityai/stable-diffusion-xl-base-1.0 (to be supported)
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="gsdf/Counterfeit-V3.0"
                      checked={generateModelName === "gsdf/Counterfeit-V3.0"}
                      onChange={(e) => setGenerateModelName(e.target.value)}
                      disabled={loading}
                      style={{ marginRight: '0.5rem' }}
                    />
                    gsdf/Counterfeit-V3.0 (to be supported)
                  </label>
                  
                  <label>
                    <input
                      type="radio"
                      value="SG161222/RealVisXL_V4.0"
                      checked={generateModelName === "SG161222/RealVisXL_V4.0"}
                      onChange={(e) => setGenerateModelName(e.target.value)}
                      disabled={loading}
                      style={{ marginRight: '0.5rem' }}
                    />
                    SG161222/RealVisXL_V4.0 (to be supported)
                  </label>
                </div>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem', border: '1px solid #ccc', textAlign: 'left' }}>
                Prompt
              </td>
              <td style={{ padding: '0.5rem', border: '1px solid #ccc' }}>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter prompt here"
                  style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
                  disabled={loading}
                />
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem', border: '1px solid #ccc', textAlign: 'left' }}>
                Negative Prompt
              </td>
              <td style={{ padding: '0.5rem', border: '1px solid #ccc' }}>
                <input
                  type="text"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="Enter negative prompt here"
                  style={{ width: '100%', padding: '0.5rem', color: '#8B0000', boxSizing: 'border-box' }}
                  disabled={loading}
                />
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem', border: '1px solid #ccc', textAlign: 'left' }}>
                Image Width
              </td>
              <td style={{ padding: '0.5rem', border: '1px solid #ccc' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '0.5rem', display: 'inline-block', width: '50px', textAlign: 'center' }}>
                    {generatedImageWidth}px
                  </span>
                  <input
                    type="range"
                    min="512"
                    max="1024"
                    step="256"
                    value={generatedImageWidth}
                    onChange={(e) => setGeneratedImageWidth(e.target.value)}
                    disabled={loading}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => setGeneratedImageWidth(DEFAULT_IMAGE_WIDTH)}
                    style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem' }}
                    disabled={loading}
                  >
                    Reset
                  </button>
                </div>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem', border: '1px solid #ccc', textAlign: 'left' }}>
                Image Height
              </td>
              <td style={{ padding: '0.5rem', border: '1px solid #ccc' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '0.5rem', display: 'inline-block', width: '50px', textAlign: 'center' }}>
                    {generatedImageHeight}px
                  </span>
                  <input
                    type="range"
                    min="512"
                    max="1024"
                    step="256"
                    value={generatedImageHeight}
                    onChange={(e) => setGeneratedImageHeight(e.target.value)}
                    disabled={loading}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => setGeneratedImageHeight(DEFAULT_IMAGE_HEIGHT)}
                    style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem' }}
                    disabled={loading}
                  >
                    Reset
                  </button>
                </div>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem', border: '1px solid #ccc', textAlign: 'left' }}>
                Number of Images
              </td>
              <td style={{ padding: '0.5rem', border: '1px solid #ccc' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                  <label>
                    <input
                      type="radio"
                      value="1"
                      checked={generateNumImages === "1"}
                      onChange={(e) => setGenerateNumImages(e.target.value)}
                      disabled={loading}
                      style={{ margin: 0, marginRight: '0.25rem' }}
                    />
                    1
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="2"
                      checked={generateNumImages === "2"}
                      onChange={(e) => setGenerateNumImages(e.target.value)}
                      disabled={loading}
                      style={{ margin: 0, marginRight: '0.25rem' }}
                    />
                    2
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="4"
                      checked={generateNumImages === "4"}
                      onChange={(e) => setGenerateNumImages(e.target.value)}
                      disabled={loading}
                      style={{ margin: 0, marginRight: '0.25rem' }}
                    />
                    4
                  </label>
                </div>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem', border: '1px solid #ccc', textAlign: 'left' }}>
                Guidance Scale
              </td>
              <td style={{ padding: '0.5rem', border: '1px solid #ccc' }}>
                <div style={{ display: 'flex' }}>
                  <span style={{ marginRight: '0.5rem', display: 'inline-block', width: '50px', textAlign: 'center' }}>
                    {generateImageGuidanceScale}
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="0.1"
                    value={generateImageGuidanceScale}
                    onChange={(e) => setGenerateImageGuidanceScale(e.target.value)}
                    disabled={loading}
                    style={{ flex: 1, width: '100%' }}
                  />
                  <button
                    type="button"
                    onClick={() => setGenerateImageGuidanceScale(DEFAULT_GUIDANCE_SCALE)}
                    style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem' }}
                    disabled={loading}
                  >
                    Reset
                  </button>
                </div>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem', border: '1px solid #ccc', textAlign: 'left' }}>
                Inference Steps
              </td>
              <td style={{ padding: '0.5rem', border: '1px solid #ccc', textAlign: 'right' }}>
                <div style={{ display: 'flex' }}>
                  <span style={{ marginRight: '0.5rem', display: 'inline-block', width: '50px', textAlign: 'center' }}>
                    {generateImageInferenceSteps}
                  </span>
                  <input
                    type="range"
                    min="2"
                    max="50"
                    step="1"
                    value={generateImageInferenceSteps}
                    onChange={(e) => setGenerateImageInferenceSteps(e.target.value)}
                    disabled={loading}
                    style={{ flex: 1, width: '100%' }}
                  />
                  <button
                    type="button"
                    onClick={() => setGenerateImageInferenceSteps(DEFAULT_INFERENCE_STEPS)}
                    style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem' }}
                    disabled={loading}
                  >
                    Reset
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div style={{ marginTop: '1rem', textAlign: 'center', height: '40px' }}>
          {loading ? (
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
              type="submit"
              disabled={loading3D}
              style={{ padding: '0.5rem 1rem' }}
            >
              Generate
            </button>
          )}
        </div>
      </form>

      <div style={{ marginTop: '1rem' }}>
        <h2>Or Upload an Image</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload(fileInputRef)}
          ref={fileInputRef}
        />
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Image Gallery</h3>
        {imageGallery.length === 0 ? (
          <p>No images in the gallery.</p>
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
              {imageGallery.map((img, index) => (
                <div
                  key={index}
                  style={{ position: 'relative', display: 'inline-block' }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <img
                    src={img}
                    alt={`Gallery ${index}`}
                    style={{
                      height: '100px',
                      objectFit: 'cover',
                      cursor: 'pointer',
                      border: '2px solid #ccc',
                      borderRadius: '4px',
                    }}
                    onClick={() => selectImage(img)}
                  />
                  {hoveredIndex === index && (
                    <button
                      onClick={() => handleDeleteImage(index)}
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
              onClick={handleClearImageGallery}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
              }}
            >
              Clear Image Gallery
            </button> */}
          </>
        )}
      </div>

      {imageUrl && (
        <div style={{ marginTop: '1rem' }} ref={imageViewRef}>
          <h3>Selected Image:</h3>
          <div
            style={{ position: 'relative', display: 'inline-block' }}
            onMouseEnter={() => setSelectedImageHovered(true)}
            onMouseLeave={() => setSelectedImageHovered(false)}
          >
            <img
              src={imageUrl}
              alt="Selected or Generated"
              style={{
                height: '512px',
                objectFit: 'cover',
                cursor: 'pointer',
                border: '2px solid #ccc',
                borderRadius: '4px',
              }}
            />
            {selectedImageHovered && (
              <button
                onClick={handleDownloadImage}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                ↓
              </button>
            )}
          </div>
          <div style={{ marginTop: '1rem' }}>
            <button
              onClick={() =>
                setActiveSubpage(activeSubpage === 'drag' ? null : 'drag')
              }
              style={{ marginRight: '1rem' }}
            >
              {activeSubpage === 'drag' ? 'Done' : 'Drag It'}
            </button>
            <button
              onClick={() =>
                setActiveSubpage(
                  activeSubpage === 'removeBackground'
                    ? null
                    : 'removeBackground'
                )
              }
              style={{ marginRight: '1rem' }}
            >
              {activeSubpage === 'removeBackground'
                ? 'Done'
                : 'Remove Background'}
            </button>
            <button>
              More Refinements to be supported
            </button>
          </div>

          {activeSubpage === 'drag' && (
            <DragImageSection
              taskStatusPoller={taskStatusPoller}
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
              imageGallery={imageGallery}
              setImageGallery={setImageGallery}
              setError={setError}
            />
          )}
          {activeSubpage === 'removeBackground' && (
            <RemoveBackgroundPage
              taskStatusPoller={taskStatusPoller}
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
              imageGallery={imageGallery}
              setImageGallery={setImageGallery}
              setError={setError}
            />
          )}
        </div>
      )}
    </section>
  );
};

export default ImageSection;
