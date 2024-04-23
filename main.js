const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

ipcMain.on('close-app', () => {
    app.quit();  // Closes it
});

ipcMain.on('minimize-app', () => {
    BrowserWindow.minimize();  // Minimizes it
});



// path to the JSON file
const filePath = path.join(app.getPath('userData'), 'contacts.json');

// Exiting the JSON file exists :)
function ensureDataFileExists() {
    try {
        // Check 
        if (!fs.existsSync(filePath)) {
            // If not let there be JSON file
            fs.writeFileSync(filePath, JSON.stringify([]));
            console.log('Contacts file created successfully.');
        }
    } catch (error) {
        console.error('Error ensuring data file exists:', error);
    }
}

ipcMain.on('updateContact', async (event, updatedContact) => {
    try {
      let contacts = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
      contacts = contacts.map(contact => {
        if (contact.id === updatedContact.id) {
          return updatedContact;
        }
        return contact;
      });
  
      await fs.promises.writeFile(filePath, JSON.stringify(contacts, null, 2), 'utf8');
    } catch (error) {
      console.error('Failed to update contact:', error);
    }
  });

  // creating contact
ipcMain.on('addContact', (event, newContact) => {
    try {
      let contacts = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      contacts.push(newContact); 
      fs.writeFileSync(filePath, JSON.stringify(contacts, null, 2), 'utf8');
    } catch (error) {
      console.error('Failed to add contact:', error);
    }
  });
  


function createWindow() {
    const win = new BrowserWindow({
        width: 540,
        height: 700,
        frame: false,
        transparent: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false //to remind me after development
        }
    });

   
    win.loadFile(path.join(__dirname, 'public', 'index.html'));
    // win.webContents.openDevTools(); // Remove or comment out this line in production for a cleaner user interface

    
    ensureDataFileExists();

    
    ipcMain.handle('readContacts', async () => {
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Failed to read contacts:', error);
            return [];
        }
    });

    ipcMain.handle('writeContacts', async (event, contacts) => {
        try {
            fs.writeFileSync(filePath, JSON.stringify(contacts, null, 2), 'utf8');
            return true;
        } catch (error) {
            console.error('Failed to write contacts:', error);
            return false;
        }
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
