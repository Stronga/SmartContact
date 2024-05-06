import React, { useEffect, useState } from 'react';
import '../components/contacts.css';
const { ipcRenderer } = window.require('electron');
const { shell } = window.require('electron');

const Page3 = () => {
    const [contacts, setContacts] = useState([]);
    const [selectedGroups, setSelectedGroups] = useState(new Set());
    const [message, setMessage] = useState(""); // Move message and setMessage into the component
    
    // Fetch contacts from the JSON file
    useEffect(() => {
        ipcRenderer.invoke('readContacts')
            .then(data => setContacts(data))
            .catch(err => console.error('Error fetching contacts:', err));
    }, []);

    // Handle group selection toggle
    const toggleGroupSelection = (group) => {
        setSelectedGroups(prevSelectedGroups => {
            const newSet = new Set(prevSelectedGroups);
            if (newSet.has(group)) {
                newSet.delete(group);
            } else {
                newSet.add(group);
            }
            return newSet;
        });
    };

    // Calculate active contacts in selected groups
    const activeContacts = contacts.filter(contact => selectedGroups.has(contact.group) && contact.active);

    // Generate mailto link
    const mailtoLink = `mailto:${activeContacts.map(contact => contact.email).join(',')}`;

    // useEffect to set message based on activeContacts
    useEffect(() => {
        if (activeContacts.length === 0) {
            setMessage("No active contacts selected. Please select one or more groups with active contacts.");
        } else {
            setMessage("Number of Active Contacts in Selected Groups"); // Clear the message when there are active contacts
        }
    }, [activeContacts]);

    // Function to open external link
    const openlink = (url) => {
        shell.openExternal(url);
    };
    
    // Extract unique groups from contacts
    const groups = [...new Set(contacts.map(contact => contact.group))];

    return (
        <div className='innerpage'>
            <h2>Select Groups To Send Mail</h2>
            <div className='sgroup'>
            
                {groups.map(group => (
                    <button className={`gbtn ${selectedGroups.has(group) ? 'gbtn-selected' : ''}`} key={group} onClick={() => toggleGroupSelection(group)}>
                        {group} {selectedGroups.has(group) ? '✓' : ''}
                    </button>
                ))}
            </div>
            <div>
            <p className="active-contacts-info">{message}</p>
                <div className="ctouter">
                    {activeContacts.length}
                </div>

                <a href={mailtoLink}  rel="noopener noreferrer">
                    <button className='sendbtnall' disabled={activeContacts.length === 0}>Send Email</button>
                </a>
                <p>Ensure you have your default email client setup <button className='infobtn' onClick={() => openlink('https://akosah.com/smartcard')}>Click for more info</button> </p>
                
            </div>
        </div>
    );
};

export default Page3;
