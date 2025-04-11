import { DEFAULT_CFG_STRENGTH, DEFAULT_MESH_SIMPLIFY_RATIO, DEFAULT_SLAT_STEPS, DEFAULT_SPARSE_CFG_STRENGTH, DEFAULT_SPARSE_STEPS, DEFAULT_TEXTURE_SIZE } from '../../constants';
import ImageGallery from '../Image/ImageGallery';
import { Button, PopUp } from '../common';

const ModelGenerationPopUp = ({
    isModelGenerationPopUpActive,
    setIsModelGenerationPopUpActive,
    seed,
    setSeed,
    sparseSteps,
    setSparseSteps,
    sparseCfgStrength,
    setSparseCfgStrength,
    slatSteps,
    setSlatSteps,
    cfgStrength,
    setCfgStrength,
    textureSize,
    setTextureSize,
    meshSimplifyRatio,
    setMeshSimplifyRatio,
    loading3D,
    loading,
    imageUrl,
    setImageUrl,
    generate3DModel,
    imageGallery,
    setImageGallery,
    selectImage,
}) => {
    if (!isModelGenerationPopUpActive)
        return null;

    return (
        <PopUp
            onClose={() => setIsModelGenerationPopUpActive(false)}
            isCloseDisabled={loading3D}
        >
            <h2>3D Model Generation</h2>

            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.25rem 1.5rem',
                marginBottom: '1rem',
              }}
            >
                <ImageGallery
                    imageGallery={imageGallery}
                    setImageGallery={setImageGallery}
                    imageUrl={imageUrl}
                    setImageUrl={setImageUrl}
                    selectImage={selectImage}
                    loading={loading}
                    loading3D={loading3D}
                />
            </div>


            <img
                src={imageUrl}
                alt={`Selected for 3D model generation`}
                style={{
                display: 'block',
                maxheight: "512px",
                maxwidth: "512px",
                objectFit: 'cover',
                cursor: 'pointer',
                border: '2px solid var(--color-primary)',
                borderRadius: '4px',
                pointerEvents: loading || loading3D ? 'none' : 'auto',
                marginBottom: '1rem',
                }}
            />

            <table style={{ margin: '0 auto', borderCollapse: 'collapse', minWidth: '500px' }}>
            <tbody>
                <tr>
                <td
                    style={{
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    textAlign: 'left',
                    }}
                >
                    <label htmlFor="seed">Seed</label>
                </td>
                <td
                    style={{
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    }}
                >
                    <input
                    type="number"
                    id="seed"
                    value={seed}
                    onChange={(e) => setSeed(parseInt(e.target.value))}
                    style={{ width: '100%', padding: '0.25rem 0.5rem', boxSizing: 'border-box' }}
                    disabled={loading3D}
                    />
                </td>
                </tr>
                <tr>
                <td
                    style={{
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    textAlign: 'left',
                    }}
                >
                    <label htmlFor="sparseSteps">
                    Sparse Steps
                    </label>
                </td>
                <td
                    style={{
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '0.5rem', display: 'inline-block', width: '50px', textAlign: 'center' }}>
                        {sparseSteps}
                    </span>
                    <input
                        type="range"
                        id="sparseSteps"
                        value={sparseSteps}
                        onChange={(e) => setSparseSteps(parseInt(e.target.value))}
                        min="1"
                        max="50"
                        style={{ flex: 1 }}
                        disabled={loading3D}
                    />
                    <button
                        type="button"
                        onClick={() => setSparseSteps(DEFAULT_SPARSE_STEPS)}
                        style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem' }}
                        disabled={loading3D}
                    >
                        Reset
                    </button>
                    </div>
                </td>
                </tr>
                <tr>
                <td
                    style={{
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    textAlign: 'left',
                    }}
                >
                    <label htmlFor="sparseCfgStrength">
                    Sparse CFG Strength
                    </label>
                </td>
                <td
                    style={{
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '0.5rem', display: 'inline-block', width: '50px', textAlign: 'center' }}>
                        {sparseCfgStrength}
                    </span>
                    <input
                        type="range"
                        min="0.1"
                        max="10"
                        step="0.1"
                        id="sparseCfgStrength"
                        value={sparseCfgStrength}
                        onChange={(e) =>
                        setSparseCfgStrength(parseFloat(e.target.value))
                        }
                        style={{ flex: 1 }}
                        disabled={loading3D}
                    />
                    <button
                        type="button"
                        onClick={() => setSparseCfgStrength(DEFAULT_SPARSE_CFG_STRENGTH)}
                        style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem' }}
                        disabled={loading3D}
                    >
                        Reset
                    </button>
                    </div>
                </td>
                </tr>
                <tr>
                <td
                    style={{
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    textAlign: 'left',
                    }}
                >
                    <label htmlFor="slatSteps">
                    Slat Steps
                    </label>
                </td>
                <td
                    style={{
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '0.5rem', display: 'inline-block', width: '50px', textAlign: 'center' }}>
                        {slatSteps}
                    </span>
                    <input
                        type="range"
                        min="1"
                        max="50"
                        id="slatSteps"
                        value={slatSteps}
                        onChange={(e) => setSlatSteps(parseInt(e.target.value))}
                        style={{ flex: 1 }}
                        disabled={loading3D}
                    />
                    <button
                        type="button"
                        onClick={() => setSlatSteps(DEFAULT_SLAT_STEPS)}
                        style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem' }}
                        disabled={loading3D}
                    >
                        Reset
                    </button>
                    </div>
                </td>
                </tr>
                <tr>
                <td
                    style={{
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    textAlign: 'left',
                    }}
                >
                    <label htmlFor="cfgStrength">
                    CFG Strength
                    </label>
                </td>
                <td
                    style={{
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '0.5rem', display: 'inline-block', width: '50px', textAlign: 'center' }}>
                        {cfgStrength}
                    </span>
                    <input
                        type="range"
                        min="0.1"
                        max="10"
                        step="0.1"
                        id="cfgStrength"
                        value={cfgStrength}
                        onChange={(e) => setCfgStrength(parseFloat(e.target.value))}
                        style={{ flex: 1 }}
                        disabled={loading3D}
                    />
                    <button
                        type="button"
                        onClick={() => setCfgStrength(DEFAULT_CFG_STRENGTH)}
                        style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem' }}
                        disabled={loading3D}
                    >
                        Reset
                    </button>
                    </div>
                </td>
                </tr>
                <tr>
                <td
                    style={{
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    textAlign: 'left',
                    }}
                >
                    <label htmlFor="textureSize">Texture Size</label>
                </td>
                <td
                    style={{
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '0.5rem', display: 'inline-block', width: '50px', textAlign: 'center' }}>
                        {textureSize}px
                    </span>
                    <input
                        type="range"
                        min="512"
                        max="1024"
                        step="256"
                        id="textureSize"
                        value={textureSize}
                        onChange={(e) => setTextureSize(parseInt(e.target.value))}
                        style={{ flex: 1 }}
                        disabled={loading3D}
                    />
                    <button
                        type="button"
                        onClick={() => setTextureSize(DEFAULT_TEXTURE_SIZE)}
                        style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem' }}
                        disabled={loading3D}
                    >
                        Reset
                    </button>
                    </div>
                </td>
                </tr>
                <tr>
                <td
                    style={{
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    textAlign: 'left',
                    }}
                >
                    <label htmlFor="meshSimplifyRatio">
                    Mesh Simplify Ratio
                    </label>
                </td>
                <td
                    style={{
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '0.5rem', display: 'inline-block', width: '50px', textAlign: 'center' }}>
                        {meshSimplifyRatio}
                    </span>
                    <input
                        type="range"
                        min="0.01"
                        max="0.99"
                        step="0.01"
                        id="meshSimplifyRatio"
                        value={meshSimplifyRatio}
                        onChange={(e) =>
                        setMeshSimplifyRatio(parseFloat(e.target.value))
                        }
                        style={{ flex: 1 }}
                        disabled={loading3D}
                    />
                    <button
                        type="button"
                        onClick={() => setMeshSimplifyRatio(DEFAULT_MESH_SIMPLIFY_RATIO)}
                        style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem' }}
                        disabled={loading3D}
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
                    onClick={generate3DModel}
                    disabled={!imageUrl || loading || loading3D}
                    isLoading={loading3D}
                >
                    Generate
                </Button>
            </div>
        </PopUp>
    );
};

export default ModelGenerationPopUp;
