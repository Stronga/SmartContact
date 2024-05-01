import React, { useEffect, useState } from 'react';
import '../components/contacts.css';
import ToggleSwitch from './ToggleSwitch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faSquarePen } from '@fortawesome/free-solid-svg-icons';
const { ipcRenderer } = window.require('electron');

const Page1 = ({ setCurrentPage, setEditingContact }) => {
    const [contacts, setContacts] = useState([]);
    const [filter, setFilter] = useState([]);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = () => {
        ipcRenderer.invoke('readContacts').then((data) => {
            setContacts(data);
        }).catch(err => console.error('Error fetching contacts:', err));
    };

    const handleDelete = (contactId) => {
        ipcRenderer.send('deleteContact', contactId);
        setContacts(contacts.filter(contact => contact.id !== contactId));
    };

    const handleToggleActive = (contactId) => {
        const updatedContacts = contacts.map(contact => {
            if (contact.id === contactId) {
                return { ...contact, active: !contact.active };
            }
            return contact;
        });

        setContacts(updatedContacts);
        ipcRenderer.send('updateContact', updatedContacts.find(contact => contact.id === contactId));
    };

    const getInitials = (name) => {
        return name.split(' ').map((word) => word[0].toUpperCase()).join('');
    };

    const handleFilterChange = (group) => {
        if (filter.includes(group)) {
            setFilter(filter.filter(g => g !== group));
        } else {
            setFilter([...filter, group]);
        }
    };

    const groups = [...new Set(contacts.map(contact => contact.group))];

    return (
        <div className='innerpage'>
           <div className="group-filters">
    {groups.map(group => (
        <div key={group}>
            <input
                id={`checkbox-${group}`}
                type="checkbox"
                checked={filter.includes(group)}
                onChange={() => handleFilterChange(group)}
                style={{ display: 'none' }} // Ensure it's hidden
            />
            <label htmlFor={`checkbox-${group}`}>{group}</label>
        </div>
    ))}
</div>


            {contacts.length > 0 ? (
                <ul className="contact-list">
                    {contacts.filter(contact => filter.length === 0 || filter.includes(contact.group)).map(contact => (
                        <li key={contact.id} className="contact-item">
                            <div className="contact-info">
                                <div className="avatar">{getInitials(contact.name)}</div>
                                <div className="details">
                                    <div className="name">{contact.name}</div>
                                    <div className="group">{contact.group}</div>
                                </div>
                            </div>
                            <div className="status-toggle">
                                <button className="trash-btn" onClick={() => handleDelete(contact.id)}>
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                                <button className="edit-btn" onClick={() => {
                                    setEditingContact(contact);
                                    setCurrentPage(2);  
                                }}>
                                    <FontAwesomeIcon icon={faSquarePen} />
                                </button>
                                <ToggleSwitch
                                    isActive={contact.active}
                                    onChange={() => handleToggleActive(contact.id)}
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No contacts found.</p>
            )}
        </div>
    );
};

export default Page1;
