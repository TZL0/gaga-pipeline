import { useState } from 'react';
import { Select } from '../common';
import BackgroundRemovalSection from './BackgroundRemovalSection';
import DragEditingSection from './DragEditingSection';
import ImageCropSection from './ImageCropSection'; // Import the crop subpage

const ImageMainSection = ({
  imageUrl,
  setImageUrl,
  imageGallery,
  setImageGallery,
  trainedLoraMapping,
  setTrainedLoraMapping,
  loading,
  setLoading,
  setError,
  handleDownloadImage,
  taskStatusPoller,
}) => {
  const [activeSubpage, setActiveSubpage] = useState('crop');

  const addToImageGallery = (imageUrl) => {
    setImageGallery((prev) => [...prev, imageUrl]);
    setImageUrl(imageUrl);
  };

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
      {imageUrl ? (
        <div style={{ padding: '1.5rem 0' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'start',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                flex: 1,
                height: '100%',
                gap: '1.5rem',
              }}
            >
              <img
                src={imageUrl}
                alt="Selected or Generated"
                style={{
                  display: 'block',
                  maxWidth: '512px',
                  maxHeight: '512px',
                  objectFit: 'cover',
                  border: '2px solid var(--color-border)',
                  borderRadius: '4px',
                }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                flex: 1,
                height: '100%',
              }}
            >
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="editAction" style={{ marginRight: '0.5rem' }}>
                  Select Action:
                </label>
                <Select
                  id="editAction"
                  onChange={(e) => {
                    const value = e.target.value;
                    setActiveSubpage(value);
                  }}
                  value={activeSubpage}
                  disabled={loading}
                >
                  <option value="backgroundRemoval">Background Removal</option>
                  <option value="dragEditing">Drag Editing</option>
                  <option value="crop">Crop & Rotate Image</option> {/* New option */}
                </Select>
              </div>

              {activeSubpage === 'backgroundRemoval' && (
                <BackgroundRemovalSection
                  loading={loading}
                  setLoading={setLoading}
                  imageUrl={imageUrl}
                  addToImageGallery={addToImageGallery}
                  setError={setError}
                  taskStatusPoller={taskStatusPoller}
                />
              )}
              {activeSubpage === 'dragEditing' && (
                <DragEditingSection
                  loading={loading}
                  taskStatusPoller={taskStatusPoller}
                  imageUrl={imageUrl}
                  setImageUrl={setImageUrl}
                  imageGallery={imageGallery}
                  setImageGallery={setImageGallery}
                  trainedLoraMapping={trainedLoraMapping}
                  setTrainedLoraMapping={setTrainedLoraMapping}
                  setError={setError}
                />
              )}
              {activeSubpage === 'crop' && (
                <ImageCropSection
                  loading={loading}
                  imageUrl={imageUrl}
                  addToImageGallery={addToImageGallery}
                  setError={setError}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <h1 style={{ display: 'block' }}>No image selected</h1>
        </div>
      )}
    </div>
  );
};

export default ImageMainSection;
