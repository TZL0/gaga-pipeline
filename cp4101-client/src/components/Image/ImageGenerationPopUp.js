import { DEFAULT_GUIDANCE_SCALE, DEFAULT_IMAGE_HEIGHT, DEFAULT_IMAGE_WIDTH, DEFAULT_INFERENCE_STEPS } from '../../constants.js';
import { Button, PopUp } from '../common/index.js';

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

  return (
    <PopUp
      onClose={() => setIsImageGenerationPopUpActive(false)}
      isCloseDisabled={loading}
    >
      <h2>Image Generation</h2>

      <form onSubmit={generateImage}>
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
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
          <Button
            type="submit"
            disabled={loading || loading3D}
            isLoading={loading}
          >
            Generate
          </Button>
        </div>
      </form>
    </PopUp>
  );
};

export default ImageGenerationPopUp;
