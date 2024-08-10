import * as vscode from 'vscode';
// import EventEmitter from 'events';
// import express from 'express';

// import cors from 'cors';
import EventEmitter = require('events');
import express = require('express');
import cors = require('cors');
import {Server, createServer} from 'http'; 
export let server: Server;

const app = express();
const eventEmitter = new EventEmitter();

interface Error extends globalThis.Error {
    code: string;
}

let port = 3002; 

app.use(cors({ 
    origin: '*',
    credentials: true
 })); 

app.use(express.json()); 

// Rutas, middleware, etc.

app.post('/receive-code', (req, res) => {
    eventEmitter.emit('codeReceived', { code: req.body.code, FRONTENDTID: req.body.FRONTENDTID  });
    res.status(200).json({ message: 'Code received successfully' });
});


// Starts the server and returns the server object and the event emitter
const tryStartServer = (retryCount = 0, maxRetries = 10) => {
    server = createServer(app); // Crear el servidor

    server.listen(port, () => {
        console.log(`Temporary server listening on port ${port}`);
    }).on('error', (err) => {
        const Error = err as Error;
        if (Error.code === 'EADDRINUSE' && retryCount < maxRetries) {
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