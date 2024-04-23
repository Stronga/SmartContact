import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareXmark, faSquareMinus } from '@fortawesome/free-solid-svg-icons';
const { ipcRenderer } = window.require('electron');

const WindowControls = () => {
    const handleClose = () => ipcRenderer.send('close-app');
    const handleMinimize = () => ipcRenderer.send('minimize-app');

    return (
        <div className="window-controls">
            
           <button onClick={handleMinimize} className="minimize-btn wbtn"><FontAwesomeIcon icon={faSquareMinus} /></button>
            <button onClick={handleClose} className="close-btn wbtn"><FontAwesomeIcon icon={faSquareXmark} /></button>
            
        </div>
    );
};

export default WindowControls;
