// src/components/DragDiffusionPage.js
import React, { useState, useRef, useEffect } from 'react';
import { FiDownload, FiPlus, FiTrash, FiUpload } from 'react-icons/fi';
import { Button, Select, Slider, TextField } from '../common';

const DragDiffusionPage = ({
  taskStatusPoller,
  imageUrl,
  setImageUrl,
  imageGallery,
  setImageGallery,
  trainedLoraMapping,
  setTrainedLoraMapping,
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
  const fileInputRef = useRef(null);
  const [currentStep, setCurrentStep] = useState('train');
  const [loraTrainingStatus, setLoraTrainingStatus] = useState('No LoRA trained');
  const [isLoraTraining, setIsLoraTraining] = useState(false);

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
        setLoraTrainingStatus('No trained LoRA');
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
      setLoraTrainingStatus('LoRA trained');
      setCurrentStep('dragDraw');
    } catch (err) {
      setError(err.message);
      setLoraTrainingStatus('No LoRA trained');
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
      setCurrentStep('dragResult');
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
  const [maskWidthRatio, setMaskWidthRatio] = useState(1);
  const [maskHeightRatio, setMaskHeightRatio] = useState(1);
  const [vectorWidthRatio, setVectorWidthRatio] = useState(1);
  const [vectorHeightRatio, setVectorHeightRatio] = useState(1);
  const maskDataRef = useRef(null);

  const [maskRadius, setMaskRadius] = useState(10);

  useEffect(() => {
    if (!trainedLoraMapping[imageUrl])
      setCurrentStep('train');
  }, [imageUrl, trainedLoraMapping]);

  useEffect(() => {
    if (!imageUrl)
      return;

    const requiredSteps = new Set([
      'dragDraw',
      'dragParam'
    ]);
    if (!requiredSteps.has(currentStep))
      return;

    const loadImageToCanvas = (canvas, updateBaseImage = false) => {
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        const maxSize = 256;
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
          setMaskWidthRatio(baseImageRef.current.width / maskCanvasRef.current.width);
          setMaskHeightRatio(baseImageRef.current.height / maskCanvasRef.current.height);
          setVectorWidthRatio(baseImageRef.current.width / vectorCanvasRef.current.width);
          setVectorHeightRatio(baseImageRef.current.height / vectorCanvasRef.current.height);
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
  }, [imageUrl, trainedLoraMapping, currentStep]);

  useEffect(() => {
    if (imageUrl && trainedLoraMapping[imageUrl]) {
      setLoraTrainingStatus('LoRA trained');
    } else {
      setLoraTrainingStatus('No LoRA trained');
    }
  }, [imageUrl, trainedLoraMapping]);

  const handleLoraParamChange = (e) => {
    const { name, value } = e.target;

    const unsupportedModels = new Set([
      'gsdf/Counterfeit-V3.0',
      'SG161222/RealVisXL_V4.0'
    ]);
    if (name === 'model' && unsupportedModels.has(value))
      return;

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
    setLoraTrainingStatus('No LoRA trained');
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
          const maxSize = 256;
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
    setCurrentStep('dragDraw');
  };

  const addToImageGallery = () => {
    setImageGallery((prev) => [...prev, dragResult]);
    setTrainedLoraMapping((prev) => ({
      ...prev,
      [dragResult]: trainedLoraMapping[imageUrl]
    }));
    setDragResult(null);
    setCurrentStep('train');
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {currentStep === 'train' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', margin: '0 auto' }}>
              <Select
                label="Model"
                name="model"
                id="model"
                value={loraParams.model}
                onChange={handleLoraParamChange}
                disabled={isLoraTraining || isDragEditing}
              >
                <option value="stable-diffusion-v1-5/stable-diffusion-v1-5">
                  stable-diffusion-v1-5/stable-diffusion-v1-5
                </option>
                <option value="gsdf/Counterfeit-V3.0" style={{ color: 'grey' }}>
                  gsdf/Counterfeit-V3.0 (to be supported)
                </option>
                <option value="SG161222/RealVisXL_V4.0" style={{ color: 'grey' }}>
                  SG161222/RealVisXL_V4.0 (to be supported)
                </option>
              </Select>
              <TextField
                label="LoRA Steps"
                isNumber
                type="number"
                name="lora_step"
                value={loraParams.lora_step}
                onChange={handleLoraParamChange}
                disabled={isLoraTraining || isDragEditing}
              />
              <TextField
                label="LoRA Learning Rate"
                isNumber
                type="number"
                step="0.0001"
                name="lora_lr"
                value={loraParams.lora_lr}
                onChange={handleLoraParamChange}
                style={{ textAlign: 'right' }}
                disabled={isLoraTraining || isDragEditing}
              />
              <TextField
                label="LoRA Batch Size"
                isNumber
                type="number"
                name="lora_batch_size"
                value={loraParams.lora_batch_size}
                onChange={handleLoraParamChange}
                style={{ textAlign: 'right' }}
                disabled={isLoraTraining || isDragEditing}
              />
              <TextField
                label="LoRA Rank"
                isNumber
                type="number"
                name="lora_rank"
                value={loraParams.lora_rank}
                onChange={handleLoraParamChange}
                style={{ textAlign: 'right' }}
                disabled={isLoraTraining || isDragEditing}
              />
              <TextField
                label="Prompt"
                type="text"
                name="prompt"
                value={loraParams.prompt}
                onChange={handleLoraParamChange}
                style={{ textAlign: 'left' }}
                disabled={isLoraTraining || isDragEditing}
                placeholder="Enter prompt here"
              />
            </div>
            <div style={{ margin: '1rem auto 0.25rem auto' }} >{loraTrainingStatus}</div>
            <div style={{ display: 'inline-flex', gap: '0.5rem', margin: '0 auto' }}>
              {trainedLoraMapping[imageUrl] ? (
                <>
                  <Button
                    onClick={downloadCachedLora}
                    disabled={isLoraTraining || isDragEditing}
                  >
                    Download LoRA <FiDownload/>
                  </Button>
                  <Button
                    onClick={deleteCachedLora}
                    disabled={isLoraTraining || isDragEditing}
                  >
                    Delete LoRA <FiTrash/>
                  </Button>
                </>
              ): (
                <>
                  <Button onClick={trainLora} isLoading={isLoraTraining} disabled={isLoraTraining || isDragEditing}>
                    Train LoRA
                  </Button>
                  <input
                    type="file"
                    accept=".safetensors"
                    ref={fileInputRef}
                    onChange={handleUploadLora}
                    style={{ display: 'none' }}
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoraTraining || isDragEditing}
                  >
                    Upload <FiUpload/>
                  </Button>
                </>
              )}
            </div>
            
            <Button
              style={{
                margin: '1rem auto 0 auto'
              }}
              disabled={isLoraTraining || !trainedLoraMapping[imageUrl]}
              onClick={() => setCurrentStep('dragDraw')}
            >
              Start Dragging
            </Button>
          </>
        )}

        {currentStep === 'dragDraw' && (
          <div>
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <h5 style={{ margin: '0 auto' }}>Draw Mask</h5>
                <canvas
                  ref={maskCanvasRef}
                  style={{
                    border: '2px solid var(--color-border)',
                    borderRadius: '4px',
                    cursor: 'crosshair',
                    maxWidth: 256,
                    maxHeight: 256,
                    aspectRatio: 1,
                    pointerEvents: isDragEditing ? 'none' : 'auto'
                  }}
                  onMouseDown={handleMaskMouseDown}
                  onMouseMove={handleMaskMouseMove}
                  onMouseUp={handleMaskMouseUp}
                />
                <Button onClick={clearMask} disabled={isDragEditing}>Clear Mask</Button>
                <Slider
                  label="Brush Radius"
                  displayedValue={`${maskRadius}px`}
                  id="maskRadius"
                  type="range"
                  min="1"
                  max="50"
                  value={maskRadius}
                  onChange={(e) => setMaskRadius(Number(e.target.value))}
                  disabled={isDragEditing}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <h5 style={{ margin: '0 auto' }}>Draw Drag Vectors</h5>
                <canvas
                  ref={vectorCanvasRef}
                  style={{
                    border: '2px solid var(--color-border)',
                    borderRadius: '4px',
                    cursor: 'crosshair',
                    maxWidth: 256,
                    maxHeight: 256,
                    aspectRatio: 1,
                    pointerEvents: isDragEditing ? 'none' : 'auto'
                  }}
                  onMouseDown={handleVectorMouseDown}
                  onMouseMove={handleVectorMouseMove}
                  onMouseUp={handleVectorMouseUp}
                />
                <div>
                  <Button onClick={clearVectors} disabled={isDragEditing}>Clear Vectors</Button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              <Button
                disabled={isDragEditing}
                onClick={() => setCurrentStep('train')}
              >
                Back
              </Button>
              <Button
                disabled={isDragEditing}
                onClick={() => setCurrentStep('dragParam')}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'dragParam' && (
          <div>
            <h5 style={{ margin: '0 auto 0.5rem auto' }}>Drag Editing Parameters</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <TextField
                label="Inversion Strength"
                isNumber
                step="0.01"
                name="inversion_strength"
                value={dragParams.inversion_strength}
                onChange={handleDragParamChange}
                disabled={isDragEditing}
              />
              <TextField
                label="Lam"
                isNumber
                step="0.01"
                name="lam"
                value={dragParams.lam}
                onChange={handleDragParamChange}
                disabled={isDragEditing}
              />
              <TextField
                label="Latent LR"
                isNumber
                step="0.01"
                name="latent_lr"
                value={dragParams.latent_lr}
                onChange={handleDragParamChange}
                disabled={isDragEditing}
              />
              <TextField
                label="Number of Pixel Steps"
                isNumber
                name="n_pix_step"
                value={dragParams.n_pix_step}
                onChange={handleDragParamChange}
                disabled={isDragEditing}
              />
              <TextField
                label="Start Step"
                isNumber
                name="start_step"
                value={dragParams.start_step}
                onChange={handleDragParamChange}
                disabled={isDragEditing}
              />
              <TextField
                label="Start Layer"
                isNumber
                name="start_layer"
                value={dragParams.start_layer}
                onChange={handleDragParamChange}
                disabled={isDragEditing}
              />
              <TextField
                label="Prompt"
                name="prompt"
                value={dragParams.prompt}
                onChange={handleDragParamChange}
                disabled={isDragEditing}
                placeholder="Enter prompt here"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <Button onClick={() => setCurrentStep('dragDraw')} disabled={isDragEditing}>
                Back
              </Button>
              <Button onClick={runDragEditing} disabled={isDragEditing} isLoading={isDragEditing}>
                Run Drag Editing
              </Button>
              <Button onClick={() => setCurrentStep('dragResult')} disabled={!dragResult || isDragEditing}>
                View Result
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'dragResult' && (
          <div>
            <div
              style={{
                marginBottom: '1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <h5 style={{ margin: '0 auto' }}>Drag Editing Result</h5>
              <img
                src={dragResult}
                alt="Drag Editing Result"
                style={{
                  width: '384px',
                  height: '384px',
                  border: '2px solid var(--color-border)',
                  borderRadius: '4px',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              <Button onClick={() => setCurrentStep('dragParam')}>
                Back
              </Button>
              <Button onClick={continueEditing}>
                Continue Editing
              </Button>
              <Button onClick={addToImageGallery}>
                Add to Gallery <FiPlus/>
              </Button>
            </div>
          </div>
        )}
      </div>
      {(isDragEditing || isLoraTraining) && (
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
