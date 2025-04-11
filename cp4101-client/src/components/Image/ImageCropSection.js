import React, { useState, useRef } from 'react';
import ReactCrop from 'react-image-crop';
import { FiPlus, FiRotateCcw, FiRotateCw, FiX } from 'react-icons/fi';
import { Button, Slider } from '../common';
import 'react-image-crop/dist/ReactCrop.css';

function getCroppedImg(image, crop, rotation = 0) {
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;
  const cropWidth = crop.width * scaleX;
  const cropHeight = crop.height * scaleY;

  const canvas = document.createElement('canvas');
  canvas.width = cropWidth;
  canvas.height = cropHeight;
  const ctx = canvas.getContext('2d');

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  const radians = rotation * (Math.PI / 180);
  ctx.rotate(radians);
  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    -cropWidth / 2,
    -cropHeight / 2,
    cropWidth,
    cropHeight
  );
  ctx.restore();

  return canvas.toDataURL('image/png');
}

const ImageCropSection = ({ imageUrl, addToImageGallery, setError, loading }) => {
  const [crop, setCrop] = useState(null);
  const [completedCrop, setCompletedCrop] = useState(null);
  const [rotate, setRotate] = useState(0);
  const imgRef = useRef(null);

  const onImageLoad = (e) => {
    return false;
  };

  const handleCropImage = () => {
    if (
      !completedCrop ||
      !completedCrop.width ||
      !completedCrop.height ||
      !imgRef.current
    ) {
      setError('Crop not complete. Please adjust your crop selection and try again.');
      return;
    }
    const croppedImageUrl = getCroppedImg(imgRef.current, completedCrop, rotate);
    addToImageGallery(croppedImageUrl);

    setCrop(null);
    setCompletedCrop(null);
    setRotate(0);
  };

  const rotateClockwise = () => setRotate((prev) => prev + 90);
  const rotateAnticlockwise = () => setRotate((prev) => prev - 90);
  const clearEdit = () => {
    setCrop(null);
    setCompletedCrop(null);
    setRotate(0);
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
        {imageUrl && (
          <>

            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              style={{
                display: 'block',
                objectFit: 'cover',
                border: '2px solid var(--color-border)',
              }}
            >
              <img
                ref={imgRef}
                alt="To be cropped"
                src={imageUrl}
                onLoad={onImageLoad}
                style={{
                  display: 'block',
                  maxWidth: '512px',
                  maxHeight: '512px',
                  objectFit: 'cover',
                  transform: `rotate(${rotate}deg)`,
                }}
              />
            </ReactCrop>
            
            <div style={{ width: '100%' }}>
              <Slider
                label="Rotate"
                displayedValue={`${rotate}°`}
                id="rotate-slider"
                type="range"
                min="-180"
                max="180"
                value={rotate}
                onChange={(e) => setRotate(Number(e.target.value))}
                disabled={loading}
                style={{ verticalAlign: 'middle', width: '100%' }}
              />
            </div>


            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button onClick={clearEdit} disabled={loading}>
                <FiX /> Clear Edit
              </Button>
              <Button onClick={rotateAnticlockwise} disabled={loading}>
                <FiRotateCcw /> -90°
              </Button>
              <Button onClick={rotateClockwise} disabled={loading}>
                <FiRotateCw /> +90°
              </Button>
            </div>
          </>
        )}
        <div>
          <Button disabled={loading} onClick={handleCropImage}>
            Crop &amp; Add to Gallery <FiPlus />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropSection;
