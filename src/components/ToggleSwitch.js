import React from 'react';
import './ToggleSwitch.css'; // Make sure you have this CSS file with the appropriate styles

const ToggleSwitch = ({ isActive, onChange }) => {
  return (
    <label className="switch">
      <input type="checkbox" checked={isActive} onChange={onChange} />
      <span className="slider round"></span>
    </label>
  );
};

export default ToggleSwitch;
