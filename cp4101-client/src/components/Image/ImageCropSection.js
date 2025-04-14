import React, { useState, useEffect, useRef } from 'react';
import ReactCrop from 'react-image-crop';
import { FiPlus, FiRotateCcw, FiRotateCw, FiX } from 'react-icons/fi';
import { Button, Slider } from '../common';
import 'react-image-crop/dist/ReactCrop.css';

function drawRotatedImage(image, rotation = 0) {
  const radians = rotation * (Math.PI / 180);
  const width = image.naturalWidth;
  const height = image.naturalHeight;

  const cos = Math.abs(Math.cos(radians));
  const sin = Math.abs(Math.sin(radians));
  const rotatedWidth = Math.floor(width * cos + height * sin);
  const rotatedHeight = Math.floor(width * sin + height * cos);

  const canvas = document.createElement('canvas');
  canvas.width = rotatedWidth;
  canvas.height = rotatedHeight;
  const ctx = canvas.getContext('2d');

  ctx.translate(rotatedWidth / 2, rotatedHeight / 2);
  ctx.rotate(radians);
  ctx.drawImage(image, -width / 2, -height / 2);

  return canvas;
}

function getRotatedImgUrl(image, rotation = 0) {
  const canvas = drawRotatedImage(image, rotation);
  return canvas.toDataURL('image/png');
}

function getCroppedImg(sourceImage, crop) {
  if (!crop || !crop.width || !crop.height) {
    const fullCanvas = document.createElement('canvas');
    fullCanvas.width = sourceImage.naturalWidth;
    fullCanvas.height = sourceImage.naturalHeight;
    const ctxFull = fullCanvas.getContext('2d');
    ctxFull.drawImage(sourceImage, 0, 0);
    return fullCanvas.toDataURL('image/png');
  }

  const scaleX = sourceImage.naturalWidth / sourceImage.width;
  const scaleY = sourceImage.naturalHeight / sourceImage.height;

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;
  const cropWidth = crop.width * scaleX;
  const cropHeight = crop.height * scaleY;

  const canvas = document.createElement('canvas');
  canvas.width = cropWidth;
  canvas.height = cropHeight;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(
    sourceImage,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight
  );

  return canvas.toDataURL('image/png');
}

const ImageCropSection = ({ imageUrl, addToImageGallery, setError, loading }) => {
  const [crop, setCrop] = useState(null);
  const [completedCrop, setCompletedCrop] = useState(null);
  const [rotate, setRotate] = useState(0);
  const [rotatedSrc, setRotatedSrc] = useState(null);

  const originalImgRef = useRef(null);
  const rotatedImgRef = useRef(null);

  const onOriginalImageLoad = (e) => {
    if (!e.currentTarget) return;
    const rotatedDataUrl = getRotatedImgUrl(e.currentTarget, rotate);
    setRotatedSrc(rotatedDataUrl);
  };

  useEffect(() => {
    const imgEl = originalImgRef.current;
    if (imgEl && imgEl.complete) {
      const rotatedDataUrl = getRotatedImgUrl(imgEl, rotate);
      setRotatedSrc(rotatedDataUrl);
    }
  }, [rotate]);

  const handleCropImage = () => {
    if (!rotatedImgRef.current) {
      setError('Rotated image not loaded. Please try again.');
      return;
    }

    const croppedDataUrl = getCroppedImg(
      rotatedImgRef.current,
      completedCrop && completedCrop.width && completedCrop.height
        ? completedCrop
        : null
    );
    addToImageGallery(croppedDataUrl);

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
    <div style={{ padding: '0 1.5rem', boxSizing: 'border-box' }}>
      <div style={{ margin: '0 auto', maxWidth: '512px' }}>
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
        />
      </div>

      {imageUrl && (
        <img
          src={imageUrl}
          alt="Original hidden"
          ref={originalImgRef}
          onLoad={onOriginalImageLoad}
          style={{ display: 'none' }}
        />
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: '1rem',
          marginTop: '1rem',
          minWidth: '600px'
        }}
      >
        {rotatedSrc && (
          <>
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

            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              style={{
                display: 'block',
                objectFit: 'cover',
                border: '2px solid var(--color-border)'
              }}
            >
              <img
                ref={rotatedImgRef}
                alt="Rotated Preview"
                src={rotatedSrc}
                style={{
                  display: 'block',
                  maxWidth: '512px',
                  maxHeight: '512px',
                  objectFit: 'cover'
                }}
              />
            </ReactCrop>
          </>
        )}

        <div>
          <Button onClick={handleCropImage} disabled={loading}>
            Add to Gallery <FiPlus />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropSection;
