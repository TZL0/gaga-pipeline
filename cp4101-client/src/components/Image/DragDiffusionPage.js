// src/components/DragDiffusionPage.js
import React, { useState, useRef, useEffect } from 'react';

const DragDiffusionPage = ({
  taskStatusPoller,
  imageUrl,
  setImageUrl,
  imageGallery,
  setImageGallery,
  setError
}) => {
  const [loraParams, setLoraParams] = useState({
    lora_step: 80,
    lora_lr: 0.0005,
    lora_batch_size: 4,
    lora_rank: 16,
    prompt: '',
    model: 'stable-diffusion-v1-5/stable-diffusion-v1-5'
  });
  const [loraTrainingStatus, setLoraTrainingStatus] = useState('');
  const [isLoraTraining, setIsLoraTraining] = useState(false);
  const [trainedLoraMapping, setTrainedLoraMapping] = useState({});

  const get_diff_train_lora_api = () => {
    return process.env.REACT_APP_DRAG_DIFF_TRAIN_LORA || 'http://127.0.0.1:8010/drag_diff_train_lora';
  };

  const get_diff_train_lora_status_api = () => {
    return process.env.REACT_APP_DRAG_DIFF_TRAIN_LORA_STATUS || 'http://127.0.0.1:8010/drag_diff_train_lora_status';
  };

  const get_diff_drag_image_api = () => {
    return process.env.REACT_APP_DRAG_DIFF_IMAGE || 'http://127.0.0.1:8010/drag_diff_image';
  };

  const get_diff_drag_image_status_api = () => {
    return process.env.REACT_APP_DRAG_DIFF_IMAGE_STATUS || 'http://127.0.0.1:8010/drag_diff_image_status';
  };

  const trainLora = async () => {
    if (!imageUrl) {
      setError('No image selected.');
      return;
    }
    if (trainedLoraMapping[imageUrl]) {
      return;
    }
    setLoraTrainingStatus('Training LoRA...');
    setIsLoraTraining(true);
    try {
      const imageResponse = await fetch(imageUrl);
      const imageBlob = await imageResponse.blob();
      const imageFile = new File([imageBlob], 'image.png', { type: imageBlob.type });
      
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('lora_step', loraParams.lora_step);
      formData.append('lora_lr', loraParams.lora_lr);
      formData.append('lora_batch_size', loraParams.lora_batch_size);
      formData.append('lora_rank', loraParams.lora_rank);
      formData.append('path_model', loraParams.model);
      formData.append('prompt', loraParams.prompt);
      
      const response = await fetch(get_diff_train_lora_api(), {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        setError('Error during LoRA training');
        setLoraTrainingStatus('');
        return;
      }
      const data = await response.json();
      const taskId = data.task_id;
      const startTime = Date.now();
      
      const resultBase64 = await taskStatusPoller(taskId, get_diff_train_lora_status_api(), startTime);
      
      const byteCharacters = atob(resultBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const safetensorsBlob = new Blob([byteArray]);
      
      setTrainedLoraMapping((prev) => ({
        ...prev,
        [imageUrl]: safetensorsBlob
      }));
      setLoraTrainingStatus('LoRA training complete');
    } catch (err) {
      setError(err.message);
      setLoraTrainingStatus('');
    } finally {
      setIsLoraTraining(false);
    }
  };
  
  const runDragEditing = async () => {
    if (!trainedLoraMapping[imageUrl]) {
      setError('LoRA training is not completed (or not uploaded).');
      return;
    }
    setIsDragEditing(true);
    try {
      const maskData = maskDataRef.current;
      const originalWidth = baseImageRef.current.width;
      const originalHeight = baseImageRef.current.height;
      const maskWidthRatio = originalWidth / maskCanvasRef.current.width;
      const maskHeightRatio = originalHeight / maskCanvasRef.current.height;
  
      const originalSizedMask = Array.from({ length: originalHeight }, () =>
        new Array(originalWidth).fill(0)
      );
      for (let j = 0; j < originalHeight; j++) {
        for (let i = 0; i < originalWidth; i++) {
          const maskX = Math.floor(i / maskWidthRatio);
          const maskY = Math.floor(j / maskHeightRatio);
          originalSizedMask[j][i] = maskData[maskY][maskX];
        }
      }
      const maskValue = maskData ? JSON.stringify(compress2DArray(originalSizedMask)) : null;
      
      const imageResponse = await fetch(imageUrl);
      const imageBlob = await imageResponse.blob();
      const imageFile = new File([imageBlob], 'image.png', { type: imageBlob.type });
      
      const formData = new FormData();
      formData.append('mask', maskValue);
      formData.append('original_image', imageFile);
  
      const vectorWidthRatio = originalWidth / vectorCanvasRef.current.width;
      const vectorHeightRatio = originalHeight / vectorCanvasRef.current.height;
      const originalSizedVectors = dragVectors.map(vector => ({
        start: [
          Math.floor(vector.start[0] * vectorWidthRatio),
          Math.floor(vector.start[1] * vectorHeightRatio)
        ],
        end: [
          Math.floor(vector.end[0] * vectorWidthRatio),
          Math.floor(vector.end[1] * vectorHeightRatio)
        ]
      }));
      formData.append('selected_points', JSON.stringify(originalSizedVectors));
  
      formData.append('prompt', dragParams.prompt);
      formData.append('inversion_strength', dragParams.inversion_strength);
      formData.append('lam', dragParams.lam);
      formData.append('latent_lr', dragParams.latent_lr);
      formData.append('n_pix_step', dragParams.n_pix_step);
      formData.append('start_step', dragParams.start_step);
      formData.append('start_layer', dragParams.start_layer);
      formData.append('path_model', dragParams.model);
      
      const loraBlob = trainedLoraMapping[imageUrl];
      const loraFile = new File([loraBlob], 'lora.safetensors');
      formData.append('lora_file', loraFile);
    
      const response = await fetch(get_diff_drag_image_api(), {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        throw new Error('Error during drag editing');
      }
      const data = await response.json();
      const taskId = data.task_id;
      const startTime = Date.now();
      
      const editedImageBase64 = await taskStatusPoller(taskId, get_diff_drag_image_status_api(), startTime);
      const editedImageUrl = `data:image/png;base64,${editedImageBase64}`;
      setDragResult(editedImageUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDragEditing(false);
    }
  };
  

  const [dragParams, setDragParams] = useState({
    inversion_strength: 0.7,
    lam: 0.1,
    latent_lr: 0.01,
    n_pix_step: 80,
    start_step: 0,
    start_layer: 10,
    prompt: '',
    model: loraParams.model
  });
  const [dragResult, setDragResult] = useState(null);
  const [dragVectors, setDragVectors] = useState([]);
  const [isDragEditing, setIsDragEditing] = useState(false);

  useEffect(() => {
    setDragParams(prev => ({ ...prev, model: loraParams.model }));
  }, [loraParams.model]);

  const maskCanvasRef = useRef(null);
  const vectorCanvasRef = useRef(null);
  const [isDrawingMask, setIsDrawingMask] = useState(false);
  const [isDrawingVector, setIsDrawingVector] = useState(false);
  const [vectorStart, setVectorStart] = useState(null);

  const baseImageRef = useRef(null);
  const maskDataRef = useRef(null);

  const [maskRadius, setMaskRadius] = useState(10);

  useEffect(() => {
    if (!imageUrl) return;
    const loadImageToCanvas = (canvas, updateBaseImage = false) => {
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        const maxSize = 512;
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          const scale = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        canvas.width = width;
        canvas.height = height;
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        if (updateBaseImage) {
          baseImageRef.current = img;
        } else {
          maskDataRef.current = Array.from({ length: height }, () =>
            new Array(width).fill(0)
          );
        }
      };
      img.src = imageUrl;
    };
    if (maskCanvasRef.current) {
      loadImageToCanvas(maskCanvasRef.current, false);
    }
    if (vectorCanvasRef.current) {
      loadImageToCanvas(vectorCanvasRef.current, true);
    }
  }, [imageUrl, trainedLoraMapping]);

  useEffect(() => {
    if (imageUrl && trainedLoraMapping[imageUrl]) {
      setLoraTrainingStatus('');
    } else {
      setLoraTrainingStatus('');
    }
  }, [imageUrl, trainedLoraMapping]);

  const handleLoraParamChange = (e) => {
    const { name, value } = e.target;
    setLoraParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleDragParamChange = (e) => {
    const { name, value } = e.target;
    setDragParams((prev) => ({ ...prev, [name]: value }));
  };

  const deleteCachedLora = () => {
    setTrainedLoraMapping((prev) => {
      const updated = { ...prev };
      delete updated[imageUrl];
      return updated;
    });
    setLoraTrainingStatus("");
  };

  const downloadCachedLora = () => {
    const loraBlob = trainedLoraMapping[imageUrl];
    if (!loraBlob) return;
    const blobUrl = URL.createObjectURL(loraBlob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = 'lora.safetensors';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadLora = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setTrainedLoraMapping((prev) => ({
      ...prev,
      [imageUrl]: file
    }));
  };

  const updateMaskAtPoint = (x, y) => {
    const canvas = maskCanvasRef.current;
    if (!canvas || !maskDataRef.current) return;
    const width = canvas.width;
    const height = canvas.height;
    const radius = maskRadius;
    const startX = Math.max(0, Math.floor(x - radius));
    const endX = Math.min(width - 1, Math.ceil(x + radius));
    const startY = Math.max(0, Math.floor(y - radius));
    const endY = Math.min(height - 1, Math.ceil(y + radius));
    for (let j = startY; j <= endY; j++) {
      for (let i = startX; i <= endX; i++) {
        const dx = i - x;
        const dy = j - y;
        if (dx * dx + dy * dy <= radius * radius) {
          maskDataRef.current[j][i] = 1;
        }
      }
    }
  };

  const updateMaskCanvas = () => {
    const canvas = maskCanvasRef.current;
    if (!canvas || !maskDataRef.current) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    // clear the canvas and redraw the background image.
    if (baseImageRef.current) {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(baseImageRef.current, 0, 0, width, height);
    } else {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, width, height);
    }
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = 'red';
    for (let j = 0; j < height; j++) {
      let start = -1;
      for (let i = 0; i < width; i++) {
        if (maskDataRef.current[j][i] === 1) {
          if (start === -1) {
            start = i;
          }
        } else {
          if (start !== -1) {
            ctx.fillRect(start, j, i - start, 1);
            start = -1;
          }
        }
      }
      if (start !== -1) {
        ctx.fillRect(start, j, width - start, 1);
      }
    }
    ctx.globalAlpha = 1.0;
  };

  const lastMaskPosRef = useRef(null);

  const handleMaskMouseDown = (e) => {
    if (isDragEditing) return;
    setIsDrawingMask(true);
    const canvas = maskCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    lastMaskPosRef.current = { x, y };
    updateMaskAtPoint(x, y);
    updateMaskCanvas();
  };

  const handleMaskMouseMove = (e) => {
    if (!isDrawingMask) return;
    const canvas = maskCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    // if we have a previous point, interpolate between it and the current point.
    if (lastMaskPosRef.current) {
      const { x: lastX, y: lastY } = lastMaskPosRef.current;
      const dx = currentX - lastX;
      const dy = currentY - lastY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      // determine number of interpolation steps
      const steps = Math.ceil(dist);
      
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const interX = lastX + dx * t;
        const interY = lastY + dy * t;
        updateMaskAtPoint(interX, interY);
      }
    } else {
      // fallback in case there is no last point.
      updateMaskAtPoint(currentX, currentY);
    }
    
    // update the last point and re-render the mask.
    lastMaskPosRef.current = { x: currentX, y: currentY };
    updateMaskCanvas();
  };

  const handleMaskMouseUp = () => {
    setIsDrawingMask(false);
    lastMaskPosRef.current = null;
  };

  // when clearing the mask, reset the 2D array to all zeros and re-render.
  const clearMask = () => {
    if (maskCanvasRef.current && maskDataRef.current) {
      const canvas = maskCanvasRef.current;
      const height = canvas.height;
      for (let j = 0; j < height; j++) {
        maskDataRef.current[j].fill(0);
      }
      updateMaskCanvas();
    }
  };

  const handleVectorMouseDown = (e) => {
    if (isDragEditing) return;
    setIsDrawingVector(true);
    const canvas = vectorCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    setVectorStart([e.clientX - rect.left, e.clientY - rect.top]);
  };

  // draws an arrowhead given a context and start/end coordinates.
  const drawArrow = (ctx, fromx, fromy, tox, toy) => {
    const headlen = 10; // arrowhead size
    const dx = tox - fromx;
    const dy = toy - fromy;
    const angle = Math.atan2(dy, dx);
    ctx.beginPath();
    ctx.moveTo(tox, toy);
    ctx.lineTo(
      tox - headlen * Math.cos(angle - Math.PI / 6),
      toy - headlen * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(tox, toy);
    ctx.lineTo(
      tox - headlen * Math.cos(angle + Math.PI / 6),
      toy - headlen * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  };

  // real-time preview of the drag vector while moving the mouse.
  const handleVectorMouseMove = (e) => {
    if (!isDrawingVector || !vectorStart) return;
    const canvas = vectorCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    if (baseImageRef.current) {
      ctx.drawImage(baseImageRef.current, 0, 0, width, height);
    }
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 3;
    dragVectors.forEach(vector => {
      ctx.beginPath();
      ctx.moveTo(vector.start[0], vector.start[1]);
      ctx.lineTo(vector.end[0], vector.end[1]);
      ctx.stroke();
      drawArrow(ctx, vector.start[0], vector.start[1], vector.end[0], vector.end[1]);
    });
    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(vectorStart[0], vectorStart[1]);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();
    drawArrow(ctx, vectorStart[0], vectorStart[1], currentX, currentY);
  };

  const handleVectorMouseUp = (e) => {
    if (!isDrawingVector || !vectorStart) return;
    const canvas = vectorCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const endPoint = [e.clientX - rect.left, e.clientY - rect.top];

    const newVector = { start: vectorStart, end: endPoint };
    setDragVectors((prev) => [...prev, newVector]);
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    if (baseImageRef.current) {
      ctx.drawImage(baseImageRef.current, 0, 0, width, height);
    }
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 3;
    dragVectors.forEach(vector => {
      ctx.beginPath();
      ctx.moveTo(vector.start[0], vector.start[1]);
      ctx.lineTo(vector.end[0], vector.end[1]);
      ctx.stroke();
      drawArrow(ctx, vector.start[0], vector.start[1], vector.end[0], vector.end[1]);
    });
    ctx.beginPath();
    ctx.moveTo(vectorStart[0], vectorStart[1]);
    ctx.lineTo(endPoint[0], endPoint[1]);
    ctx.stroke();
    drawArrow(ctx, vectorStart[0], vectorStart[1], endPoint[0], endPoint[1]);
    setIsDrawingVector(false);
    setVectorStart(null);
  };

  const clearVectors = () => {
    setDragVectors([]);
    if (vectorCanvasRef.current) {
      const canvas = vectorCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (imageUrl) {
        const img = new Image();
        img.onload = () => {
          const maxSize = 512;
          let { width, height } = img;
          if (width > maxSize || height > maxSize) {
            const scale = Math.min(maxSize / width, maxSize / height);
            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }
          canvas.width = width;
          canvas.height = height;
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
        };
        img.src = imageUrl;
      }
    }
  };

  function compress2DArray(arr) {
    function compressRow(arr) {
      let result = arr[0].toString();
      let count = 1;
      for (let i = 1; i < arr.length; i++) {
        if (arr[i] === arr[i - 1]) {
          count++;
        } else {
          result += `-${count}`;
          count = 1;
        }
      }
      result += `-${count}`;
      return result;
    }
    return arr.map(row => compressRow(row));
  }

  const continueEditing = () => {
    addToImageGallery();
    setImageUrl(dragResult);
    setDragResult(null);
    clearMask();
    clearVectors();
  };

  const addToImageGallery = () => {
    setImageGallery((prev) => [...prev, dragResult]);
    setTrainedLoraMapping((prev) => ({
      ...prev,
      [dragResult]: trainedLoraMapping[imageUrl]
    }));
    setDragResult(null);
  };

  return (
    <>
      {/* Inline style for spinner keyframes */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem', position: 'relative' }}>
        <h3>DragDiffusion Approach</h3>

        {/* --- Step 1: Train/Upload LoRA --- */}
        <div style={{ marginBottom: '2rem' }}>
          <h4>Step 1: Train / Upload LoRA</h4>
          <div>
            <h5>Select Stable Diffusion Model</h5>
            <select
              name="model"
              value={loraParams.model}
              onChange={handleLoraParamChange}
              style={{ marginRight: '1rem', padding: '0.5rem' }}
              disabled={isLoraTraining || isDragEditing}
            >
              <option value="stable-diffusion-v1-5/stable-diffusion-v1-5">
                stable-diffusion-v1-5/stable-diffusion-v1-5
              </option>
              <option value="gsdf/Counterfeit-V3.0">
              gsdf/Counterfeit-V3.0 (to be supported)
              </option>
              <option value="SG161222/RealVisXL_V4.0">
              SG161222/RealVisXL_V4.0 (to be supported)
              </option>
            </select>
          </div>

          <table style={{ margin: '0 auto', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <tbody>
              <tr>
                <td style={{ padding: '0.5rem', border: '1px solid #ccc', textAlign: 'left' }}>
                  LoRA Steps
                </td>
                <td style={{ padding: '0.5rem', border: '1px solid #ccc', textAlign: 'right' }}>
                  <input
                    type="number"
                    name="lora_step"
                    value={loraParams.lora_step}
                    onChange={handleLoraParamChange}
                    style={{ textAlign: 'right' }}
                    disabled={isLoraTraining || isDragEditing}
                  />
                </td>
              </tr>
              <tr>
                <td style={{ padding: '0.5rem', border: '1px solid #ccc', textAlign: 'left' }}>
                  LoRA Learning Rate
                </td>
                <td style={{ padding: '0.5rem', border: '1px solid #ccc', textAlign: 'right' }}>
                  <input
                    type="number"
                    step="0.0001"
                    name="lora_lr"
                    value={loraParams.lora_lr}
                    onChange={handleLoraParamChange}
                    style={{ textAlign: 'right' }}
                    disabled={isLoraTraining || isDragEditing}
                  />
                </td>
              </tr>
              <tr>
                <td style={{ padding: '0.5rem', border: '1px solid #ccc', textAlign: 'left' }}>
                  LoRA Batch Size
                </td>
                <td style={{ padding: '0.5rem', border: '1px solid #ccc', textAlign: 'right' }}>
                  <input
                    type="number"
                    name="lora_batch_size"
                    value={loraParams.lora_batch_size}
                    onChange={handleLoraParamChange}
                    style={{ textAlign: 'right' }}
                    disabled={isLoraTraining || isDragEditing}
                  />
                </td>
              </tr>
              <tr>
                <td style={{ padding: '0.5rem', border: '1px solid #ccc', textAlign: 'left' }}>
                  LoRA Rank
                </td>
                <td style={{ padding: '0.5rem', border: '1px solid #ccc', textAlign: 'right' }}>
                  <input
                    type="number"
                    name="lora_rank"
                    value={loraParams.lora_rank}
                    onChange={handleLoraParamChange}
                    style={{ textAlign: 'right' }}
                    disabled={isLoraTraining || isDragEditing}
                  />
                </td>
              </tr>
              <tr>
                <td style={{ padding: '0.5rem', border: '1px solid #ccc', textAlign: 'left' }}>
                  Prompt
                </td>
                <td style={{ padding: '0.5rem', border: '1px solid #ccc', textAlign: 'right', resize: 'vertical' }}>
                  <input
                    type="text"
                    name="prompt"
                    value={loraParams.prompt}
                    onChange={handleLoraParamChange}
                    style={{ textAlign: 'left' }}
                    disabled={isLoraTraining || isDragEditing}
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <div style={{ marginTop: '1rem' }}>
            <button onClick={trainLora} disabled={isLoraTraining || isDragEditing}>
              Train LoRA
            </button>
            {imageUrl && trainedLoraMapping[imageUrl] && (
              <>
                <button
                  onClick={downloadCachedLora}
                  style={{ marginLeft: '1rem' }}
                  disabled={isLoraTraining || isDragEditing}
                >
                  Download Cached LoRA
                </button>
                <button
                  onClick={deleteCachedLora}
                  style={{ marginLeft: '1rem' }}
                  disabled={isLoraTraining || isDragEditing}
                >
                  Delete Cached LoRA
                </button>
              </>
            )}
          </div>
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <h5>Or Upload LoRA File</h5>
            <input
              type="file"
              accept=".safetensors"
              onChange={handleUploadLora}
              disabled={isLoraTraining || isDragEditing}
            />
          </div>
          {isLoraTraining ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: '1rem'
              }}
            >
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
              <span style={{ marginLeft: '0.5rem' }}>Training LoRA...</span>
            </div>
          ) : (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              {loraTrainingStatus}
            </div>
          )}
        </div>

        {/* --- Step 2: Drag Editing --- */}
        {imageUrl && trainedLoraMapping[imageUrl] && (
          <div>
            <h4>Step 2: Drag Editing</h4>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <div>
                <h5>Draw Mask</h5>
                <canvas
                  ref={maskCanvasRef}
                  style={{
                    border: '1px solid #000',
                    cursor: 'crosshair',
                    maxWidth: '512px',
                    maxHeight: '512px',
                    pointerEvents: isDragEditing ? 'none' : 'auto'
                  }}
                  onMouseDown={handleMaskMouseDown}
                  onMouseMove={handleMaskMouseMove}
                  onMouseUp={handleMaskMouseUp}
                />
                <div style={{ marginTop: '0.5rem' }}>
                  <label htmlFor="maskRadius">Brush Radius:</label>
                  <input
                    id="maskRadius"
                    type="range"
                    min="1"
                    max="50"
                    value={maskRadius}
                    onChange={(e) => setMaskRadius(Number(e.target.value))}
                    style={{ marginLeft: '5px' }}
                    disabled={isDragEditing}
                  />
                  <span style={{ marginLeft: '5px' }}>{maskRadius}px</span>
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <button onClick={clearMask} disabled={isDragEditing}>Clear Mask</button>
                </div>
              </div>
              <div>
                <h5>Draw Drag Vectors</h5>
                <canvas
                  ref={vectorCanvasRef}
                  style={{
                    border: '1px solid #000',
                    cursor: 'crosshair',
                    maxWidth: '512px',
                    maxHeight: '512px',
                    pointerEvents: isDragEditing ? 'none' : 'auto'
                  }}
                  onMouseDown={handleVectorMouseDown}
                  onMouseMove={handleVectorMouseMove}
                  onMouseUp={handleVectorMouseUp}
                />
                <div>
                  <button onClick={clearVectors} disabled={isDragEditing}>Clear Vectors</button>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <h5>Drag Editing Parameters</h5>
              <table style={{ margin: '0 auto', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.5rem', border: '1px solid #ccc', textAlign: 'left' }}>
                      Inversion Strength
                    </td>
                    <td style={{ padding: '0.5rem', border: '1px solid #ccc', textAlign: 'right' }}>
                      <input
                        type="number"
                        step="0.01"
                        name="inversion_strength"
                        value={dragParams.inversion_strength}
                        onChange={handleDragParamChange}
                        style={{ textAlign: 'right' }}
                        disabled={isDragEditing}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.5rem', border: '1px solid #ccc', textAlign: 'left' }}>
                      Lam
                    </td>
                    <td style={{ padding: '0.5rem', border: '1px solid #ccc', textAlign: 'right' }}>
                      <input
                        type="number"
                        step="0.01"
                        name="lam"
                        value={dragParams.lam}
                        onChange={handleDragParamChange}
                        style={{ textAlign: 'right' }}
                        disabled={isDragEditing}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.5rem', border: '1px solid #ccc', textAlign: 'left' }}>
                      Latent LR
                    </td>
                    <td style={{ padding: '0.5rem', border: '1px solid #ccc', textAlign: 'right' }}>
                      <input
                        type="number"
                        step="0.01"
                        name="latent_lr"
                        value={dragParams.latent_lr}
                        onChange={handleDragParamChange}
                        style={{ textAlign: 'right' }}
                        disabled={isDragEditing}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.5rem', border: '1px solid #ccc', textAlign: 'left' }}>
                      Number of Pixel Steps
                    </td>
                    <td style={{ padding: '0.5rem', border: '1px solid #ccc', textAlign: 'right' }}>
                      <input
                        type="number"
                        name="n_pix_step"
                        value={dragParams.n_pix_step}
                        onChange={handleDragParamChange}
                        style={{ textAlign: 'right' }}
                        disabled={isDragEditing}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.5rem', border: '1px solid #ccc', textAlign: 'left' }}>
                      Start Step
                    </td>
                    <td style={{ padding: '0.5rem', border: '1px solid #ccc', textAlign: 'right' }}>
                      <input
                        type="number"
                        name="start_step"
                        value={dragParams.start_step}
                        onChange={handleDragParamChange}
                        style={{ textAlign: 'right' }}
                        disabled={isDragEditing}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.5rem', border: '1px solid #ccc', textAlign: 'left' }}>
                      Start Layer
                    </td>
                    <td style={{ padding: '0.5rem', border: '1px solid #ccc', textAlign: 'right' }}>
                      <input
                        type="number"
                        name="start_layer"
                        value={dragParams.start_layer}
                        onChange={handleDragParamChange}
                        style={{ textAlign: 'right' }}
                        disabled={isDragEditing}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.5rem', border: '1px solid #ccc', textAlign: 'left' }}>
                      Prompt
                    </td>
                    <td style={{ padding: '0.5rem', border: '1px solid #ccc', textAlign: 'right', resize: 'vertical' }}>
                      <input
                        type="text"
                        name="prompt"
                        value={dragParams.prompt}
                        onChange={handleDragParamChange}
                        style={{ textAlign: 'left' }}
                        disabled={isDragEditing}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button onClick={runDragEditing} style={{ marginTop: '1rem' }} disabled={isDragEditing}>
              Run Drag Editing
            </button>
            {isDragEditing && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: '1rem'
                }}
              >
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
                <span style={{ marginLeft: '0.5rem' }}>Dragging image...</span>
              </div>
            )}

            {dragResult && (
              <div style={{ marginTop: '1rem' }}>
                <h5>Drag Editing Result</h5>
                <img
                  src={dragResult}
                  alt="Drag Editing Result"
                  style={{ maxWidth: '100%' }}
                />
                <div>
                  <button onClick={continueEditing} disabled={isDragEditing}>Continue Editing</button>
                  <button onClick={addToImageGallery} disabled={isDragEditing} style={{ marginLeft: '1rem' }}>
                    Add to Image Gallery
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {isDragEditing && (
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            zIndex: 10
          }}
        />
      )}
    </>
  );
};

export default DragDiffusionPage;
