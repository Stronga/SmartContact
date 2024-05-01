const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

// Path to the JSON file
const filePath = path.join(app.getPath('userData'), 'contacts.json');

// Ensure that the JSON file exists
function ensureDataFileExists() {
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify([]));
            console.log('Contacts file created successfully.');
        }
    } catch (error) {
        console.error('Error ensuring data file exists:', error);
    }
}

let mainWindow; // Keep a global reference of the window object

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 430,
        height: 650,
        frame: false,
        transparent: true,
        resizable: true,
        icon: '/src/components/assets/icon/smartcontact.ico',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false // Important for preloading scripts and security
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'));

    // Uncomment the following line to open the DevTools:
    mainWindow.webContents.openDevTools();

    ensureDataFileExists();
}

ipcMain.on('close-app', () => {
    mainWindow.close();  
});

ipcMain.on('minimize-app', () => {
    mainWindow.minimize();  
});

ipcMain.on('updateContact', async (event, updatedContact) => {
    try {
        let contacts = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        contacts = contacts.map(contact => contact.id === updatedContact.id ? updatedContact : contact);
        await fs.promises.writeFile(filePath, JSON.stringify(contacts, null, 2), 'utf8');
    } catch (error) {
        console.error('Failed to update contact:', error);
    }
});

ipcMain.on('addContact', (event, newContact) => {
    try {
        let contacts = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        contacts.push(newContact);
        fs.writeFileSync(filePath, JSON.stringify(contacts, null, 2), 'utf8');
    } catch (error) {
        console.error('Failed to add contact:', error);
    }
});

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

ipcMain.on('deleteContact', (event, contactId) => {
    let contacts = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    contacts = contacts.filter(contact => contact.id !== contactId);
    fs.writeFileSync(filePath, JSON.stringify(contacts, null, 2), 'utf8');
});


app.on('ready', () => {
    createWindow();
  
    // Register a shortcut listener for 'Control+Shift+I'
    globalShortcut.register('Control+Shift+I', () => {
    });
  });

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
app.on('will-quit', () => {
    // Unregister all shortcuts
    globalShortcut.unregisterAll();
  });