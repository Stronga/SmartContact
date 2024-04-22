import React, { useState } from 'react'; // Make sure to import useState here

const Page3 = ({ editingContact, setContacts, contacts }) => {
  const [name, setName] = useState(editingContact.name);
  const [email, setEmail] = useState(editingContact.email);
  // Add more states for other fields
  const handleSubmit = (event) => {
      event.preventDefault();
      const updatedContacts = contacts.map(contact =>
          contact.id === editingContact.id ? { ...contact, name, email } : contact
      );
      setContacts(updatedContacts);
      // Save changes to backend or state management as necessary
  };

  return (
      <form onSubmit={handleSubmit}>
          <label>
              Name:
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
              Email:
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <button type="submit">Save Changes</button>
      </form>
  );
};

export default Page3;
