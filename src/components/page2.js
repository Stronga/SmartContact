import React, { useState } from 'react';
import '../components/contacts.css';
import ToggleSwitch from './ToggleSwitch';  
import { v4 as uuidv4 } from 'uuid'; 
const { ipcRenderer } = window.require('electron');

const Page2 = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [group, setGroup] = useState('');
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent the default form submit action

    const newContact = {
      id: uuidv4(), // Generate a unique ID for the contact
      name,
      email,
      group,
      active: isActive,
    };

    ipcRenderer.send('addContact', newContact); // Send the new contact to be added to the main process

    // Optionally reset the form fields
    setName('');
    setEmail('');
    setGroup('');
    setIsActive(true);
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
      <button type="submit">Add Contact</button>
    </form>
  );
};

export default Page2;