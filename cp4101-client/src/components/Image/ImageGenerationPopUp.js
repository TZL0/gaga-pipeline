import { DEFAULT_GUIDANCE_SCALE, DEFAULT_IMAGE_HEIGHT, DEFAULT_IMAGE_WIDTH, DEFAULT_INFERENCE_STEPS } from '../../constants.js';
import { Button, PopUp, RadioButtonGroup, Select, Slider, TextField } from '../common';

const ImageGenerationPopUp = ({
  isImageGenerationPopUpActive,
  setIsImageGenerationPopUpActive,
  generateModelName,
  setGenerateModelName,
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
  loading,
  loading3D,
  generateImage,
}) => {
  if (!isImageGenerationPopUpActive)
    return null;

  const handleSetGenerateModelName = (modelName) => {
    const unsupported = new Set([
      "stabilityai/stable-diffusion-xl-base-1.0",
      "gsdf/Counterfeit-V3.0",
      "SG161222/RealVisXL_V4.0",
    ]);
    if (unsupported.has(modelName))
      return;
    setGenerateModelName(modelName);
  }

  return (
    <PopUp
      onClose={() => setIsImageGenerationPopUpActive(false)}
      isCloseDisabled={loading}
    >
      <h2 style={{ margin: '0 auto 0.5rem auto' }}>Image Generation</h2>

      <form onSubmit={generateImage}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center', margin: '0 3rem' }}>
          <Select
            label="Model"
            value={generateModelName}
            onChange={(e) => handleSetGenerateModelName(e.target.value)}
            disabled={loading}
          >
            <option value="ByteDance/SDXL-Lightning">
              ByteDance/SDXL-Lightning
            </option>
            <option
              value="stabilityai/stable-diffusion-xl-base-1.0"
              style={{ color: 'grey' }}
            >
              stabilityai/stable-diffusion-xl-base-1.0 (to be supported)
            </option>
            <option
              value="gsdf/Counterfeit-V3.0"
              style={{ color: 'grey' }}
            >
              gsdf/Counterfeit-V3.0 (to be supported)
            </option>
            <option
              value="SG161222/RealVisXL_V4.0"
              style={{ color: 'grey' }}
            >
              SG161222/RealVisXL_V4.0 (to be supported)
            </option>
          </Select>
          <TextField
            label="Prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter prompt here"
            disabled={loading}
          />
          <TextField
            label="Negative Prompt"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="Enter negative prompt here"
            style={{ color: '#8B0000' }}
            disabled={loading}
          />
          <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
            <Slider
              label="Image Width"
              min="512"
              max="1024"
              step="256"
              displayedValue={`${generatedImageWidth}px`}
              value={generatedImageWidth}
              onChange={(e) => setGeneratedImageWidth(e.target.value)}
              disabled={loading}
              style={{ flex: 1 }}
            />
            <Button
              type="button"
              onClick={() => setGeneratedImageWidth(DEFAULT_IMAGE_WIDTH)}
              disabled={loading}
              style={{ margin: '0.5rem 0' }}
            >
              Reset
            </Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
            <Slider
              label="Image Height"
              displayedValue={`${generatedImageHeight}px`}
              min="512"
              max="1024"
              step="256"
              value={generatedImageHeight}
              onChange={(e) => setGeneratedImageHeight(e.target.value)}
              disabled={loading}
            />
            <Button
              type="button"
              onClick={() => setGeneratedImageHeight(DEFAULT_IMAGE_HEIGHT)}
              disabled={loading}
              style={{ margin: '0.5rem 0' }}
            >
              Reset
            </Button>
          </div>
          <RadioButtonGroup
            label="Number of Images"
            value={generateNumImages}
            setValue={setGenerateNumImages}
            options={[
              { 'label': '1', 'value': '1' },
              { 'label': '2', 'value': '2' },
              { 'label': '4', 'value': '4' },
            ]}
            disabled={loading}
          />
          <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
            <Slider
              label="Guidance Scale"
              displayedValue={generateImageGuidanceScale}
              min="0"
              max="20"
              step="0.1"
              value={generateImageGuidanceScale}
              onChange={(e) => setGenerateImageGuidanceScale(e.target.value)}
              disabled={loading}
            />
            <Button
              type="button"
              onClick={() => setGenerateImageGuidanceScale(DEFAULT_GUIDANCE_SCALE)}
              disabled={loading}
              style={{ margin: '0.5rem 0' }}
            >
              Reset
            </Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
            <Slider
              label="Inference Steps"
              displayedValue={generateImageInferenceSteps}
              min="2"
              max="50"
              step="1"
              value={generateImageInferenceSteps}
              onChange={(e) => setGenerateImageInferenceSteps(e.target.value)}
              disabled={loading}
            />
            <Button
              type="button"
              onClick={() => setGenerateImageInferenceSteps(DEFAULT_INFERENCE_STEPS)}
              disabled={loading}
              style={{ margin: '0.5rem 0' }}
            >
              Reset
            </Button>
          </div>
          <Button
            type="submit"
            disabled={loading || loading3D}
            isLoading={loading}
            style={{ marginTop: '1rem', width: '100%' }}
          >
            Generate
          </Button>
        </div>
      </form>
    </PopUp>
  );
};

export default ImageGenerationPopUp;
