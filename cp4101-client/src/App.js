// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import { FiBox, FiImage, FiMail, FiUpload } from 'react-icons/fi';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

import './App.css';
import './styles/theme.css';
import './styles/global.css';

import { DEFAULT_CFG_STRENGTH, DEFAULT_GUIDANCE_SCALE, DEFAULT_IMAGE_HEIGHT, DEFAULT_IMAGE_WIDTH, DEFAULT_INFERENCE_STEPS, DEFAULT_MESH_SIMPLIFY_RATIO, DEFAULT_SLAT_STEPS, DEFAULT_SPARSE_CFG_STRENGTH, DEFAULT_SPARSE_STEPS, DEFAULT_TEXTURE_SIZE } from './constants.js';

import { Button, Panel } from './components/common';
import ImageGallery from './components/Image/ImageGallery.js';
import ImageGenerationPopUp from './components/Image/ImageGenerationPopUp.js';
import ImageMainSection from './components/Image/ImageMainSection.js';
import ModelGallery from './components/Model/ModelGallery.js';
import ModelGenerationPopUp from './components/Model/ModelGenerationPopUp.js';
import ModelMainSection from './components/Model/ModelMainSection.js';
import ErrorPopup from './components/ErrorPopup';
import EmailUploadPopUp from './components/Image/EmailUploadPopUp.js';
import SendFilePopUp from './components/Model/SendFilePopUp.js';
import SuccessPopup from './components/SuccessPopup.js';

function App() {
  const fileInputRef = useRef(null);
  const [isImageGenerationPopUpActive, setIsImageGenerationPopUpActive] = useState(false);
  const [isModelGenerationPopUpActive, setIsModelGenerationPopUpActive] = useState(false);
  const [isEmailUploadPopUpActive, setIsEmailUploadPopUpActive] = useState(false);
  const [isSendFilePopUpActive, setIsSendFilePopUpActive] = useState(false);
  const [currentTab, setCurrentTab] = useState('image');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [generatedImageWidth, setGeneratedImageWidth] = useState(DEFAULT_IMAGE_WIDTH);
  const [generatedImageHeight, setGeneratedImageHeight] = useState(DEFAULT_IMAGE_HEIGHT);
  const [generateNumImages, setGenerateNumImages] = useState('1');
  const [generateModelName, setGenerateModelName] = useState('ByteDance/SDXL-Lightning');
  const [generateImageGuidanceScale, setGenerateImageGuidanceScale] = useState(DEFAULT_GUIDANCE_SCALE);
  const [generateImageInferenceSteps, setGenerateImageInferenceSteps] = useState(DEFAULT_INFERENCE_STEPS);

  const [seed, setSeed] = useState(Math.floor(Math.random() * 1000000));
  const [sparseSteps, setSparseSteps] = useState(DEFAULT_SPARSE_STEPS);
  const [sparseCfgStrength, setSparseCfgStrength] = useState(DEFAULT_SPARSE_CFG_STRENGTH);
  const [slatSteps, setSlatSteps] = useState(DEFAULT_SLAT_STEPS);
  const [cfgStrength, setCfgStrength] = useState(DEFAULT_CFG_STRENGTH);
  const [textureSize, setTextureSize] = useState(DEFAULT_TEXTURE_SIZE);
  const [meshSimplifyRatio, setMeshSimplifyRatio] = useState(DEFAULT_MESH_SIMPLIFY_RATIO);

  const [loading, setLoading] = useState(false);
  const [imageGallery, setImageGallery] = useState([]);
  const [imageUrl, setImageUrl] = useState(null);
  const [trainedLoraMapping, setTrainedLoraMapping] = useState({});

  const [loading3D, setLoading3D] = useState(false);
  const [modelGallery, setModelGallery] = useState([]);
  const [model, setModel] = useState({ 'imageUrl': null, 'glbUrl': null, 'fbxUrl': null, 'textureUrls': [] });

  useEffect(() => {
    const loadAssets = () => {
      const context = require.context('./assets', true, /\.(png|jpe?g|gif|glb|fbx)$/);
      const folderMap = {};

      context.keys().forEach((filePath) => {
        const fullUrl = context(filePath);
        const cleanedPath = filePath.replace('./', '');
        const parts = cleanedPath.split('/');
        if (parts.length < 2) {
          return;
        }
        const folderName = parts[0];
        const fileName = parts.slice(1).join('/');

        if (!folderMap[folderName]) {
          folderMap[folderName] = {
            name: folderName,
            image: null,
            glb: null,
            fbx: null,
            textures: []
          };
        }

        if (fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.gif')) {
          if (fileName.toLowerCase().includes('texture')) {
            folderMap[folderName].textures.push(fullUrl);
          } else if (fileName.toLowerCase().includes('model')) {
            folderMap[folderName].image = fullUrl;
          } else {
            if (!folderMap[folderName].image) {
              folderMap[folderName].image = fullUrl;
            }
          }
        } else if (fileName.endsWith('.glb')) {
          folderMap[folderName].glb = fullUrl;
        } else if (fileName.endsWith('.fbx')) {
          folderMap[folderName].fbx = fullUrl;
        }
      });

      // Create new arrays for the galleries.
      const loadedImageGallery = [];
      const loadedModelGallery = [];

      Object.values(folderMap).forEach((folder) => {
        if (folder.image) {
          loadedImageGallery.push(folder.image);
        }
        loadedModelGallery.push({
          imageUrl: folder.image,
          glbUrl: folder.glb,
          fbxUrl: folder.fbx,
          textureUrls: folder.textures
        });
      });

      setImageGallery(loadedImageGallery);
      setModelGallery(loadedModelGallery);
    };

    loadAssets();
  }, []);

  const addToImageGallery = (imageUrl) => {
    setImageGallery((prev) => [...prev, imageUrl]);
    setImageUrl(imageUrl);
  };

  const get_gen_image_api = () => {
    return process.env.REACT_APP_GEN_IMAGE || 'http://127.0.0.1:8000/generate_image';
  };
  
  const get_gen_image_status_api = () => {
    return process.env.REACT_APP_GEN_IMAGE_STATUS || 'http://127.0.0.1:8000/generate_image_status';
  };

  const get_gen3d_no_preview_api = () => {
    return process.env.REACT_APP_GEN3D_NO_PREVIEW || 'http://127.0.0.1:7960/generate_no_preview';
  };

  const get_gen3d_status_api = () => {
    return process.env.REACT_APP_GEN3D_STATUS || 'http://127.0.0.1:8001/status';
  };

  const get_gen3d_download_model_api = () => {
    return process.env.REACT_APP_GEN3D_DOWNLOAD_MODEL || 'http://127.0.0.1:7960/download/model';
  };

  const get_post_processing_api = () => {
    return process.env.REACT_APP_POST_PROCESSING || 'http://127.0.0.1:8002/process_file';
  };

  const get_pull_images_api = () => {
    return process.env.REACT_APP_PULL_IMAGES || 'http://127.0.0.1:8099/pull_images';
  };

  const get_send_file_api = () => {
    return process.env.REACT_SEND_FILE || 'http://127.0.0.1:8099/send_file';
  };

  const pollTaskStatus = (taskId, task_status_api, startTime) => {
    const pollInterval = 2000; // Poll every 2 seconds
    const maxWaitTime = 1800 * 1000; // 30 minutes in milliseconds
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`${task_status_api}/${taskId}`);
          if (!response.ok) {
            clearInterval(interval);
            reject(new Error("Error checking task status"));
            return;
          }
          const statusData = await response.json();
          if (statusData.status === "COMPLETE") {
            clearInterval(interval);
            resolve(statusData.result);
            return;
          }
          if (statusData.status === "FAILED") {
            clearInterval(interval);
            reject(new Error(statusData.error || "Task failed"));
            return;
          }
          if (Date.now() - startTime > maxWaitTime) {
            clearInterval(interval);
            reject(new Error("Task timed out"));
            return;
          }
        } catch (err) {
          clearInterval(interval);
          reject(err);
        }
      }, pollInterval);
    });
  };

  const generateImage = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!prompt) {
      setError('Please enter a prompt');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(get_gen_image_api(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          negative_prompt: negativePrompt,
          width: generatedImageWidth,
          height: generatedImageHeight,
          num_images: parseInt(generateNumImages),
          guidance_scale: generateImageGuidanceScale,
          inference_steps: generateImageInferenceSteps,
          model_name: generateModelName,
        }),
      });

      if (!response.ok) {
        throw new Error('Error starting image generation');
      }

      const data = await response.json();
      const taskId = data.task_id;
      const startTime = Date.now();

      const imagesBase64 = await pollTaskStatus(taskId, get_gen_image_status_api(), startTime);
      const images = imagesBase64.map(
        (imgBase64) => `data:image/png;base64,${imgBase64}`
      );
      setImageGallery((prev) => [...prev, ...images]);
      setImageUrl(images[0]);
      setIsImageGenerationPopUpActive(false);
      setCurrentTab('image');

    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleImageUpload = (fileInputRef) => (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setImageGallery((prev) => [...prev, url]);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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

  const generate3DModel = async () => {
    if (!imageUrl) {
      setError('No image available to convert to 3D.');
      return;
    }
  
    setLoading3D(true);
    setError('');
  
    try {
      // Fetch the image blob from the current image URL.
      const imageBlob = await fetch(imageUrl).then((r) => r.blob());
  
      // Convert the blob to a base64 string.
      const toBase64 = (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
        });
      const base64data = await toBase64(imageBlob);
      // Remove the data URL prefix
      const base64WithoutPrefix = base64data.split(',')[1];
  
      // Map UI parameters to the API's expected keys.
      const params = {
        image_base64: base64WithoutPrefix,
        seed: seed,
        ss_guidance_strength: sparseCfgStrength,
        ss_sampling_steps: sparseSteps,
        slat_guidance_strength: cfgStrength,
        slat_sampling_steps: slatSteps,
        mesh_simplify_ratio: meshSimplifyRatio,
        texture_size: textureSize,
        output_format: 'glb'
      };
  
      // Prepare the request body as URL-encoded form data.
      const formBody = new URLSearchParams();
      for (const key in params) {
        formBody.append(key, params[key]);
      }
  
      // Start the 3D model generation process.
      const startResponse = await fetch(get_gen3d_no_preview_api(), {
        method: 'POST',
        body: formBody
      });
  
      if (!startResponse.ok) {
        let errorMsg = 'Error starting 3D model generation';
        try {
          const errorData = await startResponse.json();
          errorMsg = errorData.detail || errorMsg;
        } catch (e) {}
        throw new Error(errorMsg);
      }
  
      // Poll the /status endpoint until the generation completes.
      while (true) {
        const statusResponse = await fetch(get_gen3d_status_api());
        if (!statusResponse.ok) {
          throw new Error('Error checking generation status');
        }
        const statusData = await statusResponse.json();
        console.log(`Progress: ${statusData.progress}%`);
  
        if (statusData.status === 'COMPLETE') {
          break;
        } else if (statusData.status === 'FAILED') {
          throw new Error(`Generation failed: ${statusData.message}`);
        }
        // Wait for 1 second before polling again.
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
  
      // Download the completed 3D model.
      const downloadResponse = await fetch(get_gen3d_download_model_api());
      if (!downloadResponse.ok) {
        throw new Error('Error downloading 3D model');
      }
      const glbBlob = await downloadResponse.blob();
      const glbUrl = URL.createObjectURL(glbBlob);
  
      const { fbxUrl, textureUrls } = await generateFbx(glbBlob);
      const model = { imageUrl, glbUrl, fbxUrl, textureUrls };
      setModel(model);
      setModelGallery([...modelGallery, model]);
      setIsModelGenerationPopUpActive(false);
      setCurrentTab('model');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading3D(false);
    }
  };
  
  const generateFbx = async (glbBlob) => {
    const formData = new FormData();
    formData.append('file', glbBlob);
  
    try {
      const response = await fetch(get_post_processing_api(), {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      const fbxBlob = await fetch(`data:application/octet-stream;base64,${data.fbx}`)
        .then(res => res.blob());
      const fbxUrl = URL.createObjectURL(fbxBlob);
  
      const textureUrls = await Promise.all(
        data.textures.map(async (texture) => {
          const response = await fetch(`data:application/octet-stream;base64,${texture}`);
          const textureBlob = await response.blob();
          return URL.createObjectURL(textureBlob);
        })
      );

      return { fbxUrl, textureUrls };
      
    } catch (err) {
      setError(err.message);
    }
  };
  
  const selectGalleryImage = (url) => {
    setImageUrl(url);
    if (url)
      setCurrentTab('image');
  };
  
  const handleSelectModel = (model) => {
    setModel(model);
    if (model)
      setCurrentTab('model');
  };

  const packModelFiles = async (model) => {
    const files = [];
    if (model.imageUrl) {
      files.push({ name: "image.png", url: model.imageUrl });
    }
    if (model.glbUrl) {
      files.push({ name: "model.glb", url: model.glbUrl });
    }
    if (model.fbxUrl) {
      files.push({ name: "model.fbx", url: model.fbxUrl });
    }
    if (model.textureUrls) {
      model.textureUrls.forEach((textureUrl, index) => {
        files.push({ name: `texture${index}.png`, url: textureUrl });
      });
    }

    if (files.length <= 0) return;
    const zip = new JSZip();
    for (const file of files) {
      try {
        const response = await fetch(file.url);
        const blob = await response.blob();
        zip.file(file.name, blob);
      } catch (error) {
        console.error(`Error fetching ${file.name}:`, error);
      }
    }
    const zipBlob = await zip.generateAsync({ type: "blob" });
    return zipBlob;
  };
  
  const handleDownloadModel = async () => { 
    if (!model || !model.glbUrl) {
      setError('No model available to download.');
      return;
    }
    const zipBlob = await packModelFiles(model);
    if (!zipBlob) {
      setError('No files to download.');
      return;
    }
    saveAs(zipBlob, "model.zip");
  };
  
  return (
    <div className="App">
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '16px',
          padding: '0 3rem',
          width: '100vw',
          height: '10vh',
          boxSizing: 'border-box',
          backgroundColor: 'var(--color-secondary)',
          color: 'white',
        }}
      >
        <h1>Game Asset Generative AI Pipeline</h1>
      </div>
      
      <ErrorPopup error={error} clearError={() => setError('')} />
      <SuccessPopup success={success} clearSuccess={() => setSuccess('')} />
      <EmailUploadPopUp
        isEmailUploadPopUpActive={isEmailUploadPopUpActive}
        setIsEmailUploadPopUpActive={setIsEmailUploadPopUpActive}
        addToImageGallery={addToImageGallery}
        setImageUrl={setImageUrl}
        setImageGallery={setImageGallery}
        setLoading={setLoading}
        setError={setError}
        getPullImageApi={get_pull_images_api}
      />
      <ImageGenerationPopUp
        isImageGenerationPopUpActive={isImageGenerationPopUpActive}
        setIsImageGenerationPopUpActive={setIsImageGenerationPopUpActive}
        isEmailUploadPopUpActive={isEmailUploadPopUpActive}
        setIsEmailUploadPopUpActive={setIsEmailUploadPopUpActive}
        generateModelName={generateModelName}
        setGenerateModelName={setGenerateModelName}
        prompt={prompt}
        setPrompt={setPrompt}
        negativePrompt={negativePrompt}
        setNegativePrompt={setNegativePrompt}
        generatedImageWidth={generatedImageWidth}
        setGeneratedImageWidth={setGeneratedImageWidth}
        generatedImageHeight={generatedImageHeight}
        setGeneratedImageHeight={setGeneratedImageHeight}
        generateNumImages={generateNumImages}
        setGenerateNumImages={setGenerateNumImages}
        generateImageGuidanceScale={generateImageGuidanceScale}
        setGenerateImageGuidanceScale={setGenerateImageGuidanceScale}
        generateImageInferenceSteps={generateImageInferenceSteps}
        setGenerateImageInferenceSteps={setGenerateImageInferenceSteps}
        loading={loading}
        loading3D={loading3D}
        generateImage={generateImage}
      />
      <ModelGenerationPopUp
        isModelGenerationPopUpActive={isModelGenerationPopUpActive}
        setIsModelGenerationPopUpActive={setIsModelGenerationPopUpActive}
        seed={seed}
        setSeed={setSeed}
        sparseSteps={sparseSteps}
        setSparseSteps={setSparseSteps}
        sparseCfgStrength={sparseCfgStrength}
        setSparseCfgStrength={setSparseCfgStrength}
        slatSteps={slatSteps}
        setSlatSteps={setSlatSteps}
        cfgStrength={cfgStrength}
        setCfgStrength={setCfgStrength}
        textureSize={textureSize}
        setTextureSize={setTextureSize}
        meshSimplifyRatio={meshSimplifyRatio}
        setMeshSimplifyRatio={setMeshSimplifyRatio}
        loading3D={loading3D}
        loading={loading}
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
        generate3DModel={generate3DModel}
        imageGallery={imageGallery}
        setImageGallery={setImageGallery}
        selectImage={selectGalleryImage}
      />

      <SendFilePopUp
        isSendFilePopUpActive={isSendFilePopUpActive}
        setIsSendFilePopUpActive={setIsSendFilePopUpActive}
        model={model}
        packModelFiles={packModelFiles}
        getSendFileApi={get_send_file_api}
        setError={setError}
        setSuccess={setSuccess}
      />
  
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          height: '90vh',
          gap: '1.5rem',
          backgroundColor: 'var(--color-background)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '30vw',
            padding: '1.5rem',
            paddingRight: 0,
            gap: '1.5rem'
          }}
        >
          <Panel>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.25rem 1.5rem',
              }}
            >
              <h3 style={{ textAlign: 'left', flex: 1 }}>Image Gallery</h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload(fileInputRef)}
                  style={{ display: 'none' }}
                />
                <Button
                  onClick={() => setIsEmailUploadPopUpActive(true)}
                  disabled={loading || loading3D}
                >
                  <FiMail/>
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading || loading3D}
                >
                  <FiUpload/>
                </Button>
                <Button
                  onClick={() => setIsImageGenerationPopUpActive(true)}
                  disabled={loading || loading3D}
                >
                  Generate <FiImage/>
                </Button>
              </div>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid #ccc', margin: '1px 0 0 0' }}/>
            <div
              style={{
                flex: 1,
                overflow: 'auto',
                minHeight: 0,
              }}
            >
              <div style={{ padding: '1.5rem' }}>
                <ImageGallery
                  imageGallery={imageGallery}
                  setImageGallery={setImageGallery}
                  imageUrl={imageUrl}
                  setImageUrl={setImageUrl}
                  selectImage={selectGalleryImage}
                  loading={loading}
                  loading3D={loading3D}
                />
              </div>
            </div>
          </Panel>
          <Panel>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.25rem 1.5rem',
              }}
            >
              <h3 style={{ textAlign: 'left', flex: 1 }}>Model Gallery</h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <Button
                  onClick={() => setIsModelGenerationPopUpActive(true)}
                  disabled={loading || loading3D}
                >
                  Generate <FiBox/>
                </Button>
              </div>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid #ccc', margin: '1px 0 0 0' }}/>
            <div style={{
              flex: 1,
              overflow: 'auto',
              minHeight: 0,
            }}>
              <div style={{ padding: '1.5rem' }}>
                <ModelGallery
                  modelGallery={modelGallery}
                  setModelGallery={setModelGallery}
                  model={model}
                  handleSelectModel={handleSelectModel}
                  loading={loading}
                  loading3D={loading3D}
                />
              </div>
            </div>
          </Panel>
        </div>

        <div style={{ flex: 1, padding: '1.5rem', paddingLeft: 0, display: 'flex' }}>
          <Panel>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-around',
                borderRadius: '12px 12px 0 0',
              }}
            >
              <div
                style={{
                  flex: 1,
                  cursor: loading || loading3D ? 'not-allowed' : 'pointer',
                  padding: '1.5rem 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  color: currentTab === 'image' ? '#007bff' : 'black',
                  borderBottom: currentTab === 'image' ? '1px solid #007bff': '1px solid #ccc',
                  opacity: loading || loading3D ? 0.5 : 1,
                }}
                onClick={loading || loading3D ? undefined : () => setCurrentTab('image')}
              >
                Image <FiImage/>
              </div>
              <div
                style={{
                  flex: 1,
                  cursor: loading || loading3D ? 'not-allowed' : 'pointer',
                  padding: '1rem 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  color: currentTab === 'model' ? '#007bff' : 'black',
                  borderBottom: currentTab === 'model' ? '1px solid #007bff': '1px solid #ccc',
                  opacity: loading || loading3D ? 0.5 : 1,
                }}
                onClick={loading || loading3D ? undefined : () => setCurrentTab('model')}
              >
                Model <FiBox/>
              </div>
            </div>

            <div
              style={{
                flex: 1,
                overflow: 'auto',
              }}
            >
              {currentTab === 'image' && (
                <ImageMainSection
                  imageUrl={imageUrl}
                  setImageUrl={setImageUrl}
                  imageGallery={imageGallery}
                  setImageGallery={setImageGallery}
                  trainedLoraMapping={trainedLoraMapping}
                  setTrainedLoraMapping={setTrainedLoraMapping}
                  loading={loading}
                  setLoading={setLoading}
                  setError={setError}
                  handleDownloadImage={handleDownloadImage}
                  addToImageGallery={addToImageGallery}
                  taskStatusPoller={pollTaskStatus}
                />
              )}
              {currentTab === 'model' && (
                <ModelMainSection
                  model={model}
                  handleDownloadModel={handleDownloadModel}
                  setSendFilePopUpActive={setIsSendFilePopUpActive}
                />
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

export default App;
