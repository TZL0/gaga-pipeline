import React, { useState } from 'react';
import DragDiffusionPage from './DragDiffusionPage';
import InstantDragPage from './InstantDragPage';

const DragImageSection = ({ taskStatusPoller, imageUrl, setImageUrl, imageGallery, setImageGallery, setError }) => {
  const [selectedApproach, setSelectedApproach] = useState('');

  const handleApproachChange = (event) => {
    setSelectedApproach(event.target.value);
  };

  const renderApproachComponent = () => {
    switch (selectedApproach) {
      case 'DragDiffusion':
        return <DragDiffusionPage 
          taskStatusPoller={taskStatusPoller}
          imageUrl={imageUrl}
          setImageUrl={setImageUrl} 
          imageGallery={imageGallery} 
          setImageGallery={setImageGallery}
          setError={setError}
        />;
      case 'InstantDrag':
        return <InstantDragPage 
          taskStatusPoller={taskStatusPoller}
          imageUrl={imageUrl}
          setImageUrl={setImageUrl} 
          imageGallery={imageGallery} 
          setImageGallery={setImageGallery} />;
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        border: '2px dashed #007bff',
        padding: '1rem',
        marginTop: '1rem',
      }}
    >

      <div style={{ marginTop: '1rem' }}>
        <label htmlFor="approach-select" style={{ marginRight: '0.5rem' }}>
          Point-based Editing Approach:
        </label>
        <select
          id="approach-select"
          value={selectedApproach}
          onChange={handleApproachChange}
        >
          <option value="">-- Select an approach --</option>
          <option value="DragDiffusion">DragDiffusion</option>
          <option value="InstantDrag">InstantDrag</option>
        </select>
      </div>

      <div style={{ marginTop: '1rem' }}>
        {renderApproachComponent()}
      </div>
    </div>
  );
};

export default DragImageSection;
