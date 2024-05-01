// NotificationContext.js
import React, { createContext, useState, useContext } from 'react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState('');

    const triggerNotification = (message, duration = 3000) => {
        setNotification(message);
        setTimeout(() => setNotification(''), duration);
    };

    return (
        <NotificationContext.Provider value={{ notification, triggerNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};
