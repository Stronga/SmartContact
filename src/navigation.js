import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Page1 from './components/page1';
import Page2 from './components/page2';
import Page3 from './components/page3';
import WindowControls from './components/WindowControls';
import './components/Panel.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faCirclePlus, faLock, faLockOpen, faAnglesUp } from '@fortawesome/free-solid-svg-icons';

const panelVariants = {
    hidden: { y: "-100%", opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.5 }
    }
};



const Navigation = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [editingContact, setEditingContact] = useState(null);
    const [isPanelVisible, setIsPanelVisible] = useState(false);
    const [isStylingMode, setIsStylingMode] = useState(false);
    const [timeoutId, setTimeoutId] = useState(null);
    const panelRef = useRef(null);

    useEffect(() => {
        const events = ['mousemove', 'keydown'];
        const resetTimer = () => {
            if (timeoutId) clearTimeout(timeoutId);
            if (!isStylingMode) {
                setTimeoutId(setTimeout(() => setIsPanelVisible(false), 10000));
            }
        };
        events.forEach(event => window.addEventListener(event, resetTimer));
        return () => {
            events.forEach(event => window.removeEventListener(event, resetTimer));
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [timeoutId, isStylingMode]);

    const handleNavClick = (page) => {
        setIsPanelVisible(true);
        setCurrentPage(page);
        if (page === 2) setEditingContact(null);
    };

    const toggleStylingMode = () => {
        setIsStylingMode(!isStylingMode);
        setIsPanelVisible(true);
    };
    const toggleClose = () => {
        setIsPanelVisible(false);
    };

    const onNavigate = (page) => {
        setCurrentPage(page);
        setIsPanelVisible(false);
    };

    const renderPage = () => {
        switch (currentPage) {
            case 1: return <Page1 setCurrentPage={setCurrentPage} setEditingContact={setEditingContact} />;
            case 2: return <Page2 editingContact={editingContact} onNavigate={onNavigate} />;
            case 3: return <Page3 editingContact={editingContact} />;
            default: return <div>If you see this I my self will be suprise</div>;
        }
    };

    useEffect(() => {
        if (isPanelVisible) {
            const panel = document.querySelector('.innerpage');
            if (panel) {
                const showScrollbar = () => panel.style.overflow = 'auto';
                const hideScrollbar = () => panel.style.overflow = 'hidden';
        
                panel.addEventListener('mouseover', showScrollbar);
                panel.addEventListener('mouseout', hideScrollbar);
                panel.addEventListener('scroll', showScrollbar);
        
                return () => {
                    panel.removeEventListener('mouseover', showScrollbar);
                    panel.removeEventListener('mouseout', hideScrollbar);
                    panel.removeEventListener('scroll', showScrollbar);
                };
            }
        }
    }, [isPanelVisible]);
    
    
    

    return (
        <div className='appwrap'>
            <WindowControls />
            <div className="mainApp draggable">
                <button className="btn send-btn" onClick={() => handleNavClick(1)}>
                    <FontAwesomeIcon icon={faPaperPlane} />
                </button>
                <div className='apptitle'>
                    <h1>SmartCard</h1>
                    <h2>Send A Message Today.</h2>
                </div>
                <button className="btn add-btn" onClick={() => handleNavClick(2)}>
                    <FontAwesomeIcon icon={faCirclePlus} />
                </button>
            </div>
            <div className="panel-container">
                <AnimatePresence>
                    {isPanelVisible && (
                        <motion.div
                            key="panel"
                            className="panel"
                            variants={panelVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            ref={panelRef}
                        >
                            {renderPage()}
                        
                        <button className="btn close-panelnw" onClick={toggleClose} aria-label="Lock the panel">
                        <FontAwesomeIcon icon={faAnglesUp} />
                    </button>
                    <button className="btn close-panel" onClick={toggleStylingMode} aria-label="Lock the panel">
                        <FontAwesomeIcon icon={isStylingMode ? faLock : faLockOpen} />
                    </button>
                    </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Navigation;
