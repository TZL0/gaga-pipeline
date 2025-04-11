// src/components/RemoveBackgroundPage.js
import React, { useState } from 'react';

const RemoveBackgroundPage = ({
  taskStatusPoller,
  imageUrl,
  setImageUrl,
  imageGallery,
  setImageGallery,
  setError
}) => {
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);

  const get_background_removal_api = () => {
    return process.env.REACT_APP_BACKGROUND_REMOVAL || 'http://127.0.0.1:8011/remove_background';
  };

  const get_background_removal_status_api = () => {
    return process.env.REACT_APP_BACKGROUND_REMOVAL_STATUS || 'http://127.0.0.1:8011/remove_background_status';
  };

  const handleRemoveBackground = async () => {
    setProcessing(true);
    setError('');

    try {
      const imageResponse = await fetch(imageUrl);
      const imageBlob = await imageResponse.blob();

      const response = await fetch(get_background_removal_api(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream'
        },
        body: imageBlob
      });

      if (!response.ok) {
        throw new Error('Error starting background removal process');
      }

      const data = await response.json();
      const taskId = data.task_id;
      const startTime = Date.now();

      const imageBase64 = await taskStatusPoller(taskId, get_background_removal_status_api(), startTime);
      const image = `data:image/png;base64,${imageBase64}`;

      setResultUrl(image);
    } catch (err) {
      setError(err.message);
    }
    setProcessing(false);
  };

  const addToImageGallery = () => {
    setImageGallery((prev) => [...prev, resultUrl]);
    setImageUrl(resultUrl);
    setResultUrl(null);
  };

  return (
    <div
      style={{
        border: '2px dashed #28a745',
        padding: '1rem',
        marginTop: '1rem',
      }}
    >
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      <h3>Remove Background</h3>
      {resultUrl ? (
        <div>
          <div style={{ marginTop: '1rem' }}>
            <img
              src={resultUrl}
              alt="Background Removed"
              style={{
                maxHeight: '300px',
                border: '2px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <button onClick={addToImageGallery}>Add to Image Gallery</button>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: '1rem' }}>
          {processing ? (
            <div style={{ display: 'flex', alignItems: 'center', textAlign: 'center', justifyContent: 'center' }}>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  border: '3px solid #f3f3f3',
                  borderTop: '3px solid #3498db',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}
              />
              <span style={{ marginLeft: '0.5rem' }}>Removing</span>
            </div>
          ) : (
            <button onClick={handleRemoveBackground} disabled={processing}>
              Remove Background
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RemoveBackgroundPage;
