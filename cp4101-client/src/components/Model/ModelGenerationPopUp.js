import { useEffect, useState } from 'react';
import { DEFAULT_CFG_STRENGTH, DEFAULT_MESH_SIMPLIFY_RATIO, DEFAULT_SLAT_STEPS, DEFAULT_SPARSE_CFG_STRENGTH, DEFAULT_SPARSE_STEPS, DEFAULT_TEXTURE_SIZE } from '../../constants';
import ImageGallery from '../Image/ImageGallery';
import { Button, Panel, PopUp, Slider, TextField } from '../common';
import { FiImage } from 'react-icons/fi';

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
    generate3DModel,
    imageGallery,
    setImageGallery,
    selectedImageUrl,
}) => {
    const [imageUrl, setImageUrl] = useState(null);
    
    useEffect(() => {
        if (!isModelGenerationPopUpActive || imageUrl)
            return;

        if (selectedImageUrl) {
            setImageUrl(selectedImageUrl);
        } else if (imageGallery && imageGallery.length > 0) {
            setImageUrl(imageGallery[0]);
        }
    }, [isModelGenerationPopUpActive, imageUrl, selectedImageUrl, imageGallery]);

    if (!isModelGenerationPopUpActive)
        return null;

    return (
        <PopUp
            id="ModelGeneration"
            style={{ height: '80%', width: '100%' }}
            onClose={() => setIsModelGenerationPopUpActive(false)}
            isCloseDisabled={loading3D}
        >
            <div style={{ display: 'flex', height: '100%', width: '100%', justifyContent: 'center' }}>
                <div style={{ width: '50%', height: '100%' }}>
                    <div
                        style={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            margin: '0 3rem'
                        }}
                    >
                        <div
                            style={{
                                maxWidth: '60%',
                                maxHeight: '60%',
                                border: '2px solid var(--color-border)',
                                borderRadius: '4px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            {imageUrl ? (<img
                                src={imageUrl}
                                alt={`Selected for 3D model generation`}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    display: 'block',
                                    objectFit: 'cover',
                                }}
                            />) : (
                                <div style={{ width: '384px', height: '384px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                    <FiImage/>
                                    <div>No Image Selected</div>
                                </div>
                            )}
                        </div>
                        <Panel style={{ width: '100%' }}>
                            <div
                                style={{
                                    flex: 1,
                                    overflow: 'auto',
                                }}
                            >
                                <div
                                    style={{
                                        padding: '1.5rem',
                                    }}
                                >
                                    <ImageGallery
                                        imageGallery={imageGallery}
                                        setImageGallery={setImageGallery}
                                        imageUrl={imageUrl}
                                        setImageUrl={setImageUrl}
                                        selectImage={setImageUrl}
                                        loading={loading}
                                        loading3D={loading3D}
                                    />
                                </div>
                            </div>
                        </Panel>
                    </div>
                </div>

                <div style={{ width: '50%', height: '100%', borderLeft: '1px solid var(--color-border)', overflow: 'auto' }}>
                    <h2 style={{ margin: '0 auto 0.5rem auto' }}>3D Model Generation</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center', margin: '0 3rem' }}>
                        <TextField
                            label="seed"
                            isNumber
                            id="seed"
                            value={seed}
                            onChange={(e) => setSeed(parseInt(e.target.value))}
                            disabled={loading3D}
                        />
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
                            <Slider
                                label="Sparse Steps"
                                displayedValue={sparseSteps}
                                id="sparseSteps"
                                value={sparseSteps}
                                onChange={(e) => setSparseSteps(parseInt(e.target.value))}
                                min="1"
                                max="50"
                                disabled={loading3D}
                            />
                            <Button
                                type="button"
                                onClick={() => setSparseSteps(DEFAULT_SPARSE_STEPS)}
                                style={{ margin: '0.5rem 0' }}
                                disabled={loading3D}
                            >
                                Reset
                            </Button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
                            <Slider
                                label="Sparse CFG Strength"
                                displayedValue={sparseCfgStrength}
                                min="0.1"
                                max="10"
                                step="0.1"
                                id="sparseCfgStrength"
                                value={sparseCfgStrength}
                                onChange={(e) =>
                                setSparseCfgStrength(parseFloat(e.target.value))
                                }
                                disabled={loading3D}
                            />
                            <Button
                                type="button"
                                onClick={() => setSparseCfgStrength(DEFAULT_SPARSE_CFG_STRENGTH)}
                                style={{ margin: '0.5rem 0' }}
                                disabled={loading3D}
                            >
                                Reset
                            </Button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
                            <Slider
                                label="Slat Steps"
                                displayedValue={slatSteps}
                                min="1"
                                max="50"
                                id="slatSteps"
                                value={slatSteps}
                                onChange={(e) => setSlatSteps(parseInt(e.target.value))}
                                disabled={loading3D}
                            />
                            <Button
                                type="button"
                                onClick={() => setSlatSteps(DEFAULT_SLAT_STEPS)}
                                style={{ margin: '0.5rem 0' }}
                                disabled={loading3D}
                            >
                                Reset
                            </Button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
                            <Slider
                                label="CFG Strength"
                                displayedValue={cfgStrength}
                                min="0.1"
                                max="10"
                                step="0.1"
                                id="cfgStrength"
                                value={cfgStrength}
                                onChange={(e) => setCfgStrength(parseFloat(e.target.value))}
                                disabled={loading3D}
                            />
                            <Button
                                type="button"
                                onClick={() => setCfgStrength(DEFAULT_CFG_STRENGTH)}
                                style={{ margin: '0.5rem 0' }}
                                disabled={loading3D}
                            >
                                Reset
                            </Button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
                            <Slider
                                label="Texture Size"
                                displayedValue={`${textureSize}px`}
                                min="512"
                                max="1024"
                                step="256"
                                id="textureSize"
                                value={textureSize}
                                onChange={(e) => setTextureSize(parseInt(e.target.value))}
                                disabled={loading3D}
                            />
                            <Button
                                type="button"
                                onClick={() => setTextureSize(DEFAULT_TEXTURE_SIZE)}
                                style={{ margin: '0.5rem 0' }}
                                disabled={loading3D}
                            >
                                Reset
                            </Button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
                            <Slider
                                label="Mesh Simplify Ratio"
                                displayedValue={meshSimplifyRatio}
                                min="0.01"
                                max="0.99"
                                step="0.01"
                                id="meshSimplifyRatio"
                                value={meshSimplifyRatio}
                                onChange={(e) =>
                                setMeshSimplifyRatio(parseFloat(e.target.value))
                                }
                                disabled={loading3D}
                            />
                            <Button
                                type="button"
                                onClick={() => setMeshSimplifyRatio(DEFAULT_MESH_SIMPLIFY_RATIO)}
                                style={{ margin: '0.5rem 0' }}
                                disabled={loading3D}
                            >
                                Reset
                            </Button>
                        </div>
                        <Button
                            onClick={(imageUrl) => generate3DModel(imageUrl)}
                            disabled={!imageUrl || loading || loading3D}
                            isLoading={loading3D}
                            style={{ marginTop: '1rem', width: '100%' }}
                        >
                            Generate
                        </Button>
                    </div>
                </div>
            </div>
        </PopUp>
    );
};

export default ModelGenerationPopUp;
