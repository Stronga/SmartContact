import React, { useState, useEffect } from 'react';
import '../components/contacts.css';
import ToggleSwitch from './ToggleSwitch';
import { v4 as uuidv4 } from 'uuid';
const { ipcRenderer } = window.require('electron');

const Page2 = ({ editingContact, onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [group, setGroup] = useState('');
  const [isActive, setIsActive] = useState(true);

  // contact gets loaded
  useEffect(() => {
    if (editingContact) {
      setName(editingContact.name);
      setEmail(editingContact.email);
      setGroup(editingContact.group || '');
      setIsActive(editingContact.active !== undefined ? editingContact.active : true);
    }else {
      // A small Reset 
      setName('');
      setEmail('');
      setGroup('');
      setIsActive(true);
  }
  }, [editingContact]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    const contactData = {
      id: editingContact ? editingContact.id : uuidv4(),
      name: name.trim(),
      email: trimmedEmail,
      group: group.trim(),
      active: isActive,
    };

    try {
      const existing = await ipcRenderer.invoke('readContacts');
      const duplicate = existing.find(c =>
        c.email &&
        c.email.toLowerCase() === trimmedEmail.toLowerCase() &&
        c.id !== contactData.id
      );
      if (duplicate) {
        const proceed = window.confirm(`A contact with this email already exists (${duplicate.name}). Add anyway?`);
        if (!proceed) return;
      }
    } catch (err) {
      console.error('Duplicate check failed:', err);
    }

    // add or update logic
    const ipcAction = editingContact ? 'updateContact' : 'addContact';
    ipcRenderer.send(ipcAction, contactData); 

    // and the reset with that big error
    if (!editingContact) {
      setName('');
      setEmail('');
      setGroup('');
      setIsActive(true);
    } onNavigate(1);
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <label>
        Name:
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label>
        Email:
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label>
        Group:
        <input type="text" value={group} onChange={(e) => setGroup(e.target.value)} />
      </label>
      <label>
        Active:
        <ToggleSwitch isActive={isActive} onChange={() => setIsActive(!isActive)} />     
      </label>
      <button type="submit">{editingContact ? 'Update Contact' : 'Add Contact'}</button>
    </form>
  );
};

export default Page2;
