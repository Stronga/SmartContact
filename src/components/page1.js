import React, { useEffect, useState } from 'react';
import '../components/contacts.css';
import ToggleSwitch from './ToggleSwitch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare} from '@fortawesome/free-solid-svg-icons';
const { ipcRenderer } = window.require('electron');

const Page1 = ({ setCurrentPage, setEditingContact }) => {
    const [contacts, setContacts] = useState([]);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = () => {
        ipcRenderer.invoke('readContacts').then((data) => {
            setContacts(data);
        }).catch(err => console.error('Error fetching contacts:', err));
    };

    const handleEdit = (contact) => {
      setEditingContact(contact);  // Set the contact to be edited
      setCurrentPage(3);  // Navigate to the edit page
  };

    const handleToggleActive = (index) => {
      // Create a new array with the toggled active state for the selected contact
      const updatedContacts = contacts.map((contact, idx) => {
          if (idx === index) {
              return { ...contact, active: !contact.active };
          }
          return contact;
      });

      // Update the contacts state with the new array
      setContacts(updatedContacts);

      // You can also send the updated contact back to the main process for persistence
       ipcRenderer.send('updateContact', updatedContacts[index]);
  };


    return (
        <div>
            
            {contacts.length > 0 ? (
                <ul className="contact-list">
                    {contacts.map((contact, index) => (
                       <li key={index} className="contact-item">
                        <div className="contact-info">
                          <div className="avatar">CN</div>
                          <div className="details">
                          <div className="name">{contact.name}</div>
                          <div className="group">{contact.group}</div>
                          </div>
                        </div>
                          <div className="status-toggle">
                          <button className="edit-btn" onClick={() => {
                                setEditingContact(contact);
                                setCurrentPage(2);  
                            }}>
                          <FontAwesomeIcon icon={faPenToSquare} />
                          </button>
                             <ToggleSwitch
                                isActive={contact.active}
                                onChange={() => handleToggleActive(index)}
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
