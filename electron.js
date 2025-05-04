const { app, BrowserWindow, ipcMain, dialog, Notification } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const fs = require('fs').promises;

// Carregar variáveis de ambiente
const dotenv = require('dotenv');
dotenv.config();

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'frontend/public/sogrinha_logo.png')
    });

    // Carrega a aplicação React
    mainWindow.loadURL(
        isDev
            ? 'http://localhost:3000'
            : `file://${path.join(__dirname, 'frontend/build/index.html')}`
    );

    // Abre DevTools em desenvolvimento
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }
}

// Handlers para IPC
ipcMain.handle('save-file', async (event, data) => {
    try {
        const { filePath } = await dialog.showSaveDialog(mainWindow, {
            defaultPath: data.fileName
        });

        if (filePath) {
            await fs.writeFile(filePath, data.content);
            return { success: true, filePath };
        }
        return { success: false, error: 'Operação cancelada' };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('open-file', async () => {
    try {
        const { filePaths } = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile']
        });

        if (filePaths && filePaths[0]) {
            const content = await fs.readFile(filePaths[0], 'utf-8');
            return { success: true, content, filePath: filePaths[0] };
        }
        return { success: false, error: 'Nenhum arquivo selecionado' };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('show-notification', async (event, { title, body }) => {
    new Notification({ title, body }).show();
});

ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});

// Handler para salvar PDF localmente
ipcMain.handle('download-pdf', async (event, { content, fileName }) => {
    try {
        const { filePath } = await dialog.showSaveDialog(mainWindow, { defaultPath: fileName });
        if (filePath) {
            await fs.writeFile(filePath, content);
            return { success: true, filePath };
        }
        return { success: false, error: 'Operação cancelada' };
    } catch (error) {
        console.error('download-pdf error:', error);
        return { success: false, error: error.message };
    }
});

// Local attachments handlers
ipcMain.handle('attachments-list', async (event, { entityType, identifier, entityId }) => {
    try {
        const baseDir = path.join(app.getPath('userData'), 'attachments', entityType, identifier, entityId);
        await fs.mkdir(baseDir, { recursive: true });
        const files = await fs.readdir(baseDir);
        return { success: true, files };
    } catch (error) {
        console.error('attachments-list error:', error);
        return { success: false, files: [], error: error.message };
    }
});

ipcMain.handle('attachments-upload', async (event, { entityType, identifier, entityId, name, content }) => {
    try {
        const baseDir = path.join(app.getPath('userData'), 'attachments', entityType, identifier, entityId);
        await fs.mkdir(baseDir, { recursive: true });
        const filePath = path.join(baseDir, name);
        await fs.writeFile(filePath, content);
        return { success: true };
    } catch (error) {
        console.error('attachments-upload error:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('attachments-delete', async (event, { entityType, identifier, entityId, name }) => {
    try {
        const filePath = path.join(app.getPath('userData'), 'attachments', entityType, identifier, entityId, name);
        await fs.unlink(filePath);
        return { success: true };
    } catch (error) {
        console.error('attachments-delete error:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('attachments-download', async (event, { entityType, identifier, entityId, name }) => {
    try {
        const filePath = path.join(app.getPath('userData'), 'attachments', entityType, identifier, entityId, name);
        const { filePath: targetPath } = await dialog.showSaveDialog(mainWindow, { defaultPath: name });
        if (!targetPath) return { success: false, error: 'Operação cancelada' };
        await fs.copyFile(filePath, targetPath);
        return { success: true, filePath: targetPath };
    } catch (error) {
        console.error('attachments-download error:', error);
        return { success: false, error: error.message };
    }
});

// Eventos do aplicativo
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
