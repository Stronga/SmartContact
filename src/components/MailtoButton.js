import React from 'react';
import { shell } from 'electron'; // Import shell from electron

const handleMailtoLink = (e, mailtoLink) => {
    e.preventDefault(); // Prevent default link behavior
    shell.openExternal(mailtoLink); // Use Electron's shell to open link externally
};

// Example usage in a React component
const MailtoButton = ({ mailtoLink }) => (
    <a href={mailtoLink} onClick={(e) => handleMailtoLink(e, mailtoLink)}>
        <button>Send Email</button>
    </a>
);

export default MailtoButton;
