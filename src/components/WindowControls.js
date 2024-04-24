import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faMinus } from '@fortawesome/free-solid-svg-icons';
const { ipcRenderer } = window.require('electron');

const WindowControls = () => {
    const handleClose = () => ipcRenderer.send('close-app');
    const handleMinimize = () => ipcRenderer.send('minimize-app');

    return (
        <div className="window-controls">
            
           <button onClick={handleMinimize} className="minimize-btn wbtn"><FontAwesomeIcon icon={faMinus} /></button>
            <button onClick={handleClose} className="close-btn wbtn"><FontAwesomeIcon icon={faXmark}/></button>
            
        </div>
    );
};

export default WindowControls;
