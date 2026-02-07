import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Page1 from './components/page1';
import Page2 from './components/page2';
import Page3 from './components/page3';
import WindowControls from './components/WindowControls';
import './components/Panel.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faCirclePlus, faLock, faLockOpen, faAnglesUp, faGear } from '@fortawesome/free-solid-svg-icons';

const panelVariants = {
    hidden: { y: "-100%", opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.5 }
    }
};

const taglines = [
    'Send a message today.',
    'Group contacts in one click.',
    'Email whole teams instantly.',
    'Keep work, friends, and family organized.',
    'Connect smarter, not harder.'
    
];



const Navigation = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [editingContact, setEditingContact] = useState(null);
    const [isPanelVisible, setIsPanelVisible] = useState(false);
    const [isStylingMode, setIsStylingMode] = useState(false);
    const [timeoutId, setTimeoutId] = useState(null);
    const panelRef = useRef(null);
    const [displayText, setDisplayText] = useState('');
    const [messageIndex, setMessageIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [theme, setTheme] = useState('glass');
    const [fontScale, setFontScale] = useState(1);
    const [showSettings, setShowSettings] = useState(false);
    const [selectionMode, setSelectionMode] = useState(false);

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
    // Check if the requested page is page 1
    if (page === 1) {
        if (isPanelVisible && currentPage === 1) {
            setCurrentPage(3);
        } else {
            setIsPanelVisible(true);
            setCurrentPage(1);
        }
    } else {
       setIsPanelVisible(true);
        setCurrentPage(page);
        if (page === 2) {
            // Reset editing contact if navigating to page 2
            setEditingContact(null);
        }
    }
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
            case 1: return <Page1 selectionEnabled={selectionMode} setCurrentPage={setCurrentPage} setEditingContact={setEditingContact} />;
            case 2: return <Page2 editingContact={editingContact} onNavigate={onNavigate} />;
            case 3: return <Page3/>;
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

    // simple type/delete loop for the rotating subtitle
    useEffect(() => {
        const current = taglines[messageIndex];
        const finished = displayText === current;
        const cleared = displayText === '';
        let timer;

        if (!isDeleting && finished) {
            timer = setTimeout(() => setIsDeleting(true), 1400);
        } else if (isDeleting && cleared) {
            timer = setTimeout(() => {
                setIsDeleting(false);
                setMessageIndex((messageIndex + 1) % taglines.length);
            }, 250);
        } else {
            timer = setTimeout(() => {
                const nextLength = displayText.length + (isDeleting ? -1 : 1);
                setDisplayText(current.slice(0, nextLength));
            }, isDeleting ? 40 : 80);
        }

        return () => clearTimeout(timer);
    }, [displayText, isDeleting, messageIndex]);



    useEffect(() => {
        const savedTheme = localStorage.getItem('sc-theme');
        if (savedTheme === 'glass' || savedTheme === 'solid') setTheme(savedTheme);
        const savedScale = parseFloat(localStorage.getItem('sc-font-scale'));
        if (!Number.isNaN(savedScale) && savedScale >= 0.9 && savedScale <= 1.3) setFontScale(savedScale);
    }, []);

    useEffect(() => {
        localStorage.setItem('sc-theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('sc-font-scale', fontScale.toString());
    }, [fontScale]);

    return (
        <div className={`appwrap ${theme === 'solid' ? 'theme-solid' : 'theme-glass'}`} style={{ '--panel-font-scale': fontScale }}>
            <WindowControls />
            <div className="mainApp draggable">
                <button className={`btn send-btn ${currentPage === 3 && isPanelVisible ? 'send-btn-animate' : ''}`}
    onClick={() => handleNavClick(1)}>
                    <FontAwesomeIcon icon={faPaperPlane} />
                </button>
                <div className='apptitle'>
                    <h1>SmartCard</h1>
                    <div className='typing-line' aria-live="polite">
                        <h2>{displayText}</h2>
                        <span className='typing-caret' aria-hidden="true" />
                    </div>
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
                        
                        <div className="panel-actions">
                            <button
                                className="btn panel-action hide-panel"
                                onClick={toggleClose}
                                aria-label="Hide panel"
                                title="Hide panel"
                            >
                                <FontAwesomeIcon icon={faAnglesUp} />
                            </button>
                            <button
                                className="btn panel-action lock-panel"
                                onClick={toggleStylingMode}
                                aria-label={isStylingMode ? 'Unlock auto-hide' : 'Lock panel open'}
                                title={isStylingMode ? 'Unlock auto-hide' : 'Lock panel open'}
                            >
                                <FontAwesomeIcon icon={isStylingMode ? faLock : faLockOpen} />
                            </button>
                            <button
                                className="btn panel-action settings-toggle"
                                onClick={() => setShowSettings(!showSettings)}
                                aria-label="Settings"
                                title="Settings"
                            >
                                <FontAwesomeIcon icon={faGear} />
                            </button>
                        </div>
                        {showSettings && (
                            <div className="settings-drawer">
                                <div className="settings-row">
                                    <span>Theme</span>
                                    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                                        <option value="glass">Glass</option>
                                        <option value="solid">Solid</option>
                                        <option value="dark">Dark</option>
                                    </select>
                                </div>
                                <div className="settings-row">
                                    <span>Font</span>
                                    <input
                                        type="range"
                                        min="0.9"
                                        max="1.2"
                                        step="0.05"
                                        value={fontScale}
                                        onChange={(e) => setFontScale(parseFloat(e.target.value))}
                                    />
                                </div>
                                <div className="settings-row">
                                    <label className="checkbox-row">
                                        <input
                                            type="checkbox"
                                            checked={selectionMode}
                                            onChange={(e) => setSelectionMode(e.target.checked)}
                                        />
                                        Enable bulk selection
                                    </label>
                                </div>
                            </div>
                        )}
                    </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Navigation;
