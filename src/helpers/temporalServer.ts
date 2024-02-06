import * as vscode from 'vscode';
import EventEmitter from 'events';
import express from 'express';
import cors from 'cors';
import http from 'http'; // Importar el módulo HTTP
export let server;

const app = express();
const eventEmitter = new EventEmitter();
let port = 3002; // Asegúrate de que este puerto esté libre para usar

app.use(cors({ 
    origin: '*',
    credentials: true
 })); // Configuración de CORS

app.use(express.json()); // Middleware para parsear JSON

// Rutas, middleware, etc.

app.post('/receive-code', (req, res) => {
    console.log('received code:', req.body);
    eventEmitter.emit('codeReceived', { code: req.body.code, FRONTENDTID: req.body.FRONTENDTID  });
    res.status(200).json({ message: 'Code received successfully' });
});

const tryStartServer = (retryCount = 0, maxRetries = 10) => {
    server = http.createServer(app); // Crear el servidor

    server.listen(port, () => {
        console.log(`Temporary server listening on port ${port}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE' && retryCount < maxRetries) {
            console.log(`Port ${port} is busy, trying port ${port + 1}`);
            port++;
            tryStartServer(retryCount + 1, maxRetries);
        } else {
            console.error(`Error starting server: ${err.message}`);
            if (retryCount >= maxRetries) {
                console.error(`No free ports found after ${maxRetries} attempts.`);
                vscode.window.showErrorMessage('Error starting server: No free ports found, please try again later.');
                return { server: null, eventEmitter: null, port: null };

            }
        }
    });

    return { server, eventEmitter, port };
};

export const startServer = () => {
    return tryStartServer();
};