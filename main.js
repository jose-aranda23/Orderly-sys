const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const db = require('./config/db');
const env = require('./config/env');

let mainWindow;
let server;

const startServer = async () => {
    const express = require('express');
    server = require('./src/app');
    
    try {
        const conn = await db.getConnection();
        console.log('✅ Conexión a Base de Datos MariaDB establecida.');
        conn.release();
    } catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error);
    }

    return new Promise((resolve) => {
        server.listen(env.PORT, () => {
            console.log(`🚀 Servidor corriendo en puerto ${env.PORT}`);
            resolve();
        });
    });
};

const createWindow = async () => {
    await startServer();

    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 700,
        title: 'Orderly Sys - Sistema de Producción',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        show: false,
        backgroundColor: '#F1F5F9'
    });

    const url = `http://localhost:${env.PORT}`;
    console.log(`📱 Abriendo aplicación en: ${url}`);
    
    await mainWindow.loadURL(url);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        console.log('✅ Ventana principal mostrada');
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
};

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        if (server) {
            server.close();
        }
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

process.on('uncaughtException', (error) => {
    console.error('Error no capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Promesa rechazada:', reason);
});
