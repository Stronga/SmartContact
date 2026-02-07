const { app, BrowserWindow, globalShortcut, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

const filePath = path.join(app.getPath('userData'), 'contacts.json');
const WRITE_DEBOUNCE_MS = 200;
let writeTimer = null;
let pendingContacts = null;

// Seed data written the first time the app runs so the UI isn't empty
const defaultContacts = [
    { id: 'c-alex', name: 'Alex Johnson', email: 'alex.johnson@example.com', group: 'Work', active: true },
    { id: 'c-beth', name: 'Beth Carter', email: 'beth.carter@example.com', group: 'Work', active: false },
    { id: 'c-carlos', name: 'Carlos Diaz', email: 'carlos.diaz@example.com', group: 'Friends', active: true },
    { id: 'c-dina', name: 'Dina Patel', email: 'dina.patel@example.com', group: 'Friends', active: true },
    { id: 'c-eli', name: 'Eli Nguyen', email: 'eli.nguyen@example.com', group: 'Family', active: true },
    { id: 'c-fay', name: 'Fay Morgan', email: 'fay.morgan@example.com', group: 'Family', active: false },
    { id: 'c-giovanni', name: 'Giovanni Rossi', email: 'giovanni.rossi@example.com', group: 'Clients', active: true },
    { id: 'c-hana', name: 'Hana Kim', email: 'hana.kim@example.com', group: 'Volunteers', active: true }
];

// Ensure that the JSON file exists; if missing or invalid, seed with defaults
function ensureDataFileExists() {
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify(defaultContacts, null, 2));
            console.log('Contacts file created with dummy data.');
            return;
        }

        // If the file exists but is empty or invalid JSON, reset it
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            const parsed = data.trim() === '' ? [] : JSON.parse(data);

            // If it's an empty array, seed it to help demos
            if (Array.isArray(parsed) && parsed.length === 0) {
                fs.writeFileSync(filePath, JSON.stringify(defaultContacts, null, 2));
                console.log('Contacts file was empty; dummy data written.');
            }
        } catch (parseError) {
            fs.writeFileSync(filePath, JSON.stringify(defaultContacts, null, 2));
            console.log('Contacts file was corrupted; reset with dummy data.');
        }
    } catch (error) {
        console.error('Error ensuring data file exists:', error);
    }
}

let mainWindow; // Keep a global reference of the window object
const scheduleWrite = (contacts) => {
    pendingContacts = contacts;
    if (writeTimer) clearTimeout(writeTimer);
    writeTimer = setTimeout(() => {
        try {
            fs.writeFileSync(filePath, JSON.stringify(pendingContacts, null, 2), 'utf8');
        } catch (err) {
            console.error('Failed to write contacts:', err);
        } finally {
            writeTimer = null;
            pendingContacts = null;
        }
    }, WRITE_DEBOUNCE_MS);
};

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 430,
        height: 650,
        frame: false,
        transparent: true,
        resizable: false,
        icon: path.join(__dirname, 'src', 'sc.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: false,
            nodeIntegration: true
            
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'));

    // Uncomment the following line to open the DevTools:
   

mainWindow.once('ready-to-show', () => {
    mainWindow.show();
});
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
        scheduleWrite(contacts);
    } catch (error) {
        console.error('Failed to update contact:', error);
    }
});

ipcMain.on('addContact', (event, newContact) => {
    try {
        let contacts = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        contacts.push(newContact);
        scheduleWrite(contacts);
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
        scheduleWrite(contacts);
        return true;
    } catch (error) {
        console.error('Failed to write contacts:', error);
        return false;
    }
});

ipcMain.on('deleteContact', (event, contactId) => {
    let contacts = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    contacts = contacts.filter(contact => contact.id !== contactId);
    scheduleWrite(contacts);
});

ipcMain.handle('exportContacts', async () => {
    try {
        const contacts = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const { canceled, filePath: targetPath } = await dialog.showSaveDialog({
            defaultPath: 'contacts.json',
            filters: [{ name: 'JSON', extensions: ['json'] }]
        });
        if (canceled || !targetPath) return { success: false, message: 'Export canceled' };
        fs.writeFileSync(targetPath, JSON.stringify(contacts, null, 2), 'utf8');
        return { success: true, count: contacts.length };
    } catch (error) {
        console.error('Failed to export contacts:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('importContacts', async () => {
    try {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            filters: [{ name: 'JSON', extensions: ['json'] }],
            properties: ['openFile']
        });
        if (canceled || !filePaths || filePaths.length === 0) return { success: false, message: 'Import canceled' };
        const data = fs.readFileSync(filePaths[0], 'utf8');
        const parsed = JSON.parse(data);
        if (!Array.isArray(parsed)) throw new Error('Invalid contacts file');
        scheduleWrite(parsed);
        return { success: true, count: parsed.length };
    } catch (error) {
        console.error('Failed to import contacts:', error);
        return { success: false, message: error.message };
    }
});


app.on('ready', () => {
    createWindow();
  
    // Register a shortcut listener for 'Control+Shift+I'
    globalShortcut.register('Control+Shift+I', () => {
        if (mainWindow && mainWindow.webContents) {
            mainWindow.webContents.openDevTools({ mode: 'detach' });
        }
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
