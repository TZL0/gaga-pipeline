import { useState, useEffect } from 'react';
import { FiPlus } from "react-icons/fi";
import { Button } from "../common";

const BackgroundRemovalSection = ({
  loading,
  setLoading,
  imageUrl,
  addToImageGallery,
  setError,
  taskStatusPoller,
}) => {
  const [editedImageUrl, setEditedImageUrl] = useState(null);

  useEffect(() => {
    setEditedImageUrl(null);
  }, [imageUrl]);

  const get_background_removal_api = () => {
    return process.env.REACT_APP_BACKGROUND_REMOVAL || 'http://127.0.0.1:8011/remove_background';
  };

  const get_background_removal_status_api = () => {
    return process.env.REACT_APP_BACKGROUND_REMOVAL_STATUS || 'http://127.0.0.1:8011/remove_background_status';
  };

  const handleRemoveBackground = async () => {
    setLoading(true);
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

      setEditedImageUrl(image);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          flex: 1,
          height: '100%',
          gap: '1rem',
        }}
      >
        <img
          src={editedImageUrl ? editedImageUrl : imageUrl}
          alt="Edited"
          style={{
            display: 'block',
            maxWidth: '512px',
            maxHeight: '512px',
            objectFit: 'cover',
            border: '2px solid var(--color-border)',
          }}
        />
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
          }}
        >
          <Button
            onClick={handleRemoveBackground}
            isLoading={loading}
            disabled={loading}
          >
            Remove Background
          </Button>
          <Button
            onClick={() => addToImageGallery(editedImageUrl)}
            disabled={loading || !editedImageUrl}
          >
            Add to Gallery <FiPlus/>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BackgroundRemovalSection;
