import { useRef } from "react";
import { FiDownload, FiRefreshCw, FiSend } from "react-icons/fi";
import { Button } from '../common';

const ModelMainSection = ({
  model,
  handleDownloadModel,
  setSendFilePopUpActive,
}) => {
  const modelViewRef = useRef(null);

  const resetCamera = () => {
    if (modelViewRef.current) {
      modelViewRef.current.cameraOrbit = '0deg 75deg 105%';
      modelViewRef.current.cameraTarget = '0m 0m 0m';
    }
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {model && model.glbUrl ? (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <model-viewer
            ref={modelViewRef}
            src={model.glbUrl}
            alt="3D model"
            auto-rotate
            camera-controls
            shadow-intensity="1"
            shadow-softness="1"
            exposure="1"
            style={{
              width: '100%',
              height: '100%',
              cursor: 'pointer',
              border: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '1.5rem',
              left: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <Button
              onClick={handleDownloadModel}
            >
              Download
              <FiDownload/>
            </Button>
            <Button
              onClick={resetCamera}
            >
              Reset View
              <FiRefreshCw/>
            </Button>
            <Button
              onClick={() => setSendFilePopUpActive(true)}
            >
              Share Model <FiSend/>
            </Button>
          </div>
        </div>
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <h1 style={{ display: 'block' }}>
            No model selected
          </h1>
        </div>
      )}
    </div>
  );
};

export default ModelMainSection;
