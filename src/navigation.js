import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Page1 from './components/page1';
import Page2 from './components/page2';
import Page3 from './components/page3';
import './components/Panel.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faCirclePlus, faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons';

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

    const resetTimeout = () => {
        if (timeoutId) clearTimeout(timeoutId);
        if (!isStylingMode) {
            const id = setTimeout(() => {
                setIsPanelVisible(false);
            }, 10000);
            setTimeoutId(id);
        }
    };

    useEffect(() => {
        const events = ['click', 'mousemove', 'keydown'];
        const resetTimer = () => resetTimeout();
        events.forEach(event => window.addEventListener(event, resetTimer));
        return () => {
            events.forEach(event => window.removeEventListener(event, resetTimer));
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [timeoutId, isStylingMode]);

    const handleNavClick = (page) => {
        setIsPanelVisible(true);
        if (currentPage !== page) setCurrentPage(page);
        resetTimeout();
    };

    const toggleStylingMode = () => {
        setIsStylingMode(!isStylingMode);
        setIsPanelVisible(true);
    };

    const renderPage = () => {
        switch (currentPage) {
            case 1: return <Page1 setCurrentPage={setCurrentPage} setEditingContact={setEditingContact} />;
            case 2: return <Page2 />;
            case 3: return <Page3 editingContact={editingContact} />;
            default: return <div>Select a page</div>;
        }
    };

    return (
        <div>
            <div className="mainApp">
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
                        >
                            {renderPage()}
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
