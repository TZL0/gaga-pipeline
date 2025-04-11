import { useState } from 'react';
import { Select } from '../common';
import DragDiffusionSection from './DragDiffusionSection';

const DragEditingSection = ({
  loading,
  taskStatusPoller,
  imageUrl,
  setImageUrl,
  imageGallery,
  setImageGallery,
  trainedLoraMapping,
  setTrainedLoraMapping,
  setError,
}) => {
  const [selectedApproach, setSelectedApproach] = useState('DragDiffusion');
  
  const handleApproachChange = (event) => {
    const value = event.target.value;
    const unsupported = new Set(['InstantDrag']);
    if (unsupported.has(value))
      return;
    setSelectedApproach(value);
  };

  const renderApproachComponent = () => {
    switch (selectedApproach) {
      case 'DragDiffusion':
        return <DragDiffusionSection 
          taskStatusPoller={taskStatusPoller}
          imageUrl={imageUrl}
          setImageUrl={setImageUrl} 
          imageGallery={imageGallery} 
          setImageGallery={setImageGallery}
          trainedLoraMapping={trainedLoraMapping}
          setTrainedLoraMapping={setTrainedLoraMapping}
          setError={setError}
        />;
      case 'InstantDrag':
        return <>
          To be implemented
        </>;
      default:
        return null;
    }
  };

  return (
    <>
      <Select
        style={{ width: 'auto', marginBottom: '1rem' }}
        label="Point-based Editing Approach"
        id="approach-select"
        value={selectedApproach}
        onChange={handleApproachChange}
        disabled={loading}
      >
        <option value="DragDiffusion">DragDiffusion</option>
        <option value="InstantDrag" style={{ color: 'grey' }}>InstantDrag (to be supported)</option>
      </Select>

      {renderApproachComponent()}
    </>
  );
};

export default DragEditingSection;
