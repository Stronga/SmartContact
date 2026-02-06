import React, { useEffect, useState } from 'react';
import '../components/contacts.css';
import ToggleSwitch from './ToggleSwitch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faSquarePen } from '@fortawesome/free-solid-svg-icons';
const { ipcRenderer } = window.require('electron');

const Page1 = ({ setCurrentPage, setEditingContact, selectionEnabled = true }) => {
    const [contacts, setContacts] = useState([]);
    const [filter, setFilter] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('alpha');
    const [selectedIds, setSelectedIds] = useState(new Set());

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
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.delete(contactId);
            return next;
        });
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

    const filteredContacts = contacts
        .filter(contact => filter.length === 0 || filter.includes(contact.group))
        .filter(contact => {
            const q = searchTerm.trim().toLowerCase();
            if (!q) return true;
            return (
                contact.name.toLowerCase().includes(q) ||
                (contact.email && contact.email.toLowerCase().includes(q))
            );
        });

    const sortedContacts = [...filteredContacts].sort((a, b) => {
        if (sortBy === 'group') {
            return (a.group || '').localeCompare(b.group || '') || a.name.localeCompare(b.name);
        }
        if (sortBy === 'active') {
            if (a.active === b.active) return a.name.localeCompare(b.name);
            return a.active ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
    });

    const handleExport = async () => {
        try {
            const result = await ipcRenderer.invoke('exportContacts');
            if (result?.success) {
                console.log(`Exported ${result.count} contacts`);
            }
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    const handleImport = async () => {
        const confirm = window.confirm('Import will replace your current contacts. Continue?');
        if (!confirm) return;
        try {
            const result = await ipcRenderer.invoke('importContacts');
            if (result?.success) {
                fetchContacts();
                console.log(`Imported ${result.count} contacts`);
            }
        } catch (error) {
            console.error('Import failed:', error);
        }
    };

    const toggleSelect = (contactId) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(contactId)) next.delete(contactId);
            else next.add(contactId);
            return next;
        });
    };

    const selectAllVisible = () => setSelectedIds(new Set(sortedContacts.map(c => c.id)));
    const clearSelection = () => setSelectedIds(new Set());

    const handleBulk = async (action) => {
        if (selectedIds.size === 0) return;
        try {
            let current = await ipcRenderer.invoke('readContacts');
            if (action === 'delete') {
                current = current.filter(c => !selectedIds.has(c.id));
            } else if (action === 'activate' || action === 'deactivate') {
                const activeFlag = action === 'activate';
                current = current.map(c => selectedIds.has(c.id) ? { ...c, active: activeFlag } : c);
            }
            await ipcRenderer.invoke('writeContacts', current);
            fetchContacts();
            clearSelection();
        } catch (err) {
            console.error('Bulk action failed:', err);
        }
    };

    return (
        <div className='innerpage'>
           <div className="list-controls">
                <input
                    type="search"
                    placeholder="Search name or email"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="alpha">Name A–Z</option>
                    <option value="group">Group</option>
                    <option value="active">Active first</option>
                </select>
            </div>
            <div className="sync-controls">
                <button type="button" onClick={handleExport}>Export</button>
                <button type="button" onClick={handleImport}>Import</button>
            </div>
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

            {selectionEnabled && (
                <div className="bulk-controls">
                    <div className="bulk-left">
                        <button type="button" onClick={selectAllVisible}>Select visible</button>
                        <button type="button" onClick={clearSelection}>Clear</button>
                    </div>
                    <div className="bulk-right">
                        <button type="button" onClick={() => handleBulk('activate')} disabled={selectedIds.size === 0}>Activate</button>
                        <button type="button" onClick={() => handleBulk('deactivate')} disabled={selectedIds.size === 0}>Deactivate</button>
                        <button type="button" className="danger" onClick={() => handleBulk('delete')} disabled={selectedIds.size === 0}>Delete</button>
                    </div>
                </div>
            )}

            {sortedContacts.length > 0 ? (
                <ul className="contact-list">
                    {sortedContacts.map(contact => (
                        <li key={contact.id} className="contact-item">
                            {selectionEnabled && (
                                <div className="select-box">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(contact.id)}
                                        onChange={() => toggleSelect(contact.id)}
                                    />
                                </div>
                            )}
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
