import React, { useEffect, useState } from 'react';
import '../components/contacts.css';
const { ipcRenderer, shell, clipboard } = window.require('electron');

const Page3 = () => {
    const [contacts, setContacts] = useState([]);
    const [selectedGroups, setSelectedGroups] = useState(new Set());
    const [message, setMessage] = useState('');
    
    useEffect(() => {
        ipcRenderer.invoke('readContacts')
            .then(data => setContacts(data))
            .catch(err => console.error('Error fetching contacts:', err));
    }, []);

    const toggleGroupSelection = (group) => {
        setSelectedGroups(prev => {
            const next = new Set(prev);
            if (next.has(group)) next.delete(group);
            else next.add(group);
            return next;
        });
    };

    const activeContacts = contacts.filter(contact => selectedGroups.has(contact.group) && contact.active && contact.email);

    const mailtoLink = `mailto:${activeContacts.map(contact => contact.email).join(',')}`;

    useEffect(() => {
        if (activeContacts.length === 0) {
            setMessage('No active contacts selected. Please select one or more groups with active contacts.');
        } else {
            setMessage('Recipients ready to send');
        }
    }, [activeContacts]);

    const openlink = (url) => shell.openExternal(url);
    const copyRecipients = () => {
        if (!clipboard) return;
        clipboard.writeText(activeContacts.map(c => c.email).join(', '));
    };
    const sendMail = () => {
        if (activeContacts.length === 0) return;
        shell.openExternal(mailtoLink);
    };
    
    const groups = [...new Set(contacts.map(contact => contact.group))];

    return (
        <div className='innerpage page3'>
            <div className="mail-card">
                <div className="mail-card__header">
                    <div>
                        <h2>Select groups to send mail</h2>
                        <p className="sub">Pick groups, preview recipients, tweak subject/body.</p>
                    </div>
                    {/* <div className="badge-count">{activeContacts.length}</div> */}
                </div>

                <div className="count-hero">
                    <div className="count-circle">{activeContacts.length}</div>
                    <div className="count-label">Active recipients</div>
                </div>

                <div className='sgroup sgroup-grid'>
                    {groups.map(group => (
                        <button className={`gbtn ${selectedGroups.has(group) ? 'gbtn-selected' : ''}`} key={group} onClick={() => toggleGroupSelection(group)}>
                            {group} {selectedGroups.has(group) ? '?' : ''}
                        </button>
                    ))}
                </div>

                {activeContacts.length === 0 ? (
                    <p className="active-contacts-info">{message}</p>
                ) : (
                    <div className="recipient-preview">
                        <div className="recipient-tags">
                            {activeContacts.slice(0,5).map(contact => (
                                <span key={contact.id} className="recipient-tag">{contact.email}</span>
                            ))}
                            {activeContacts.length > 5 && (
                                <span className="recipient-tag more">+{activeContacts.length - 5} more</span>
                            )}
                        </div>
                        <button className="infobtn small" type="button" onClick={copyRecipients}>Copy recipients</button>
                    </div>
                )}

                <button className='sendbtnall full' disabled={activeContacts.length === 0} onClick={sendMail}>Send Email</button>
                <p className="hint">Ensure you have your default email client setup <br></br><button className='infobtn linky' onClick={() => openlink('https://akosah.com/smartcard')}>Click for more info</button> </p>
            </div>
        </div>
    );
};

export default Page3;
