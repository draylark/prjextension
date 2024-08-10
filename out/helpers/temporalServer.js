"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = exports.server = void 0;
const vscode = require("vscode");
// import EventEmitter from 'events';
// import express from 'express';
// import cors from 'cors';
const EventEmitter = require("events");
const express = require("express");
const cors = require("cors");
const http_1 = require("http");
const app = express();
const eventEmitter = new EventEmitter();
let port = 3002;
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json());
// Rutas, middleware, etc.
app.post('/receive-code', (req, res) => {
    eventEmitter.emit('codeReceived', { code: req.body.code, FRONTENDTID: req.body.FRONTENDTID });
    res.status(200).json({ message: 'Code received successfully' });
});
// Starts the server and returns the server object and the event emitter
const tryStartServer = (retryCount = 0, maxRetries = 10) => {
    exports.server = (0, http_1.createServer)(app); // Crear el servidor
    exports.server.listen(port, () => {
        console.log(`Temporary server listening on port ${port}`);
    }).on('error', (err) => {
        const Error = err;
        if (Error.code === 'EADDRINUSE' && retryCount < maxRetries) {
            console.log(`Port ${port} is busy, trying port ${port + 1}`);
            port++;
            tryStartServer(retryCount + 1, maxRetries);
        }
        else {
            console.error(`Error starting server: ${err.message}`);
            if (retryCount >= maxRetries) {
                console.error(`No free ports found after ${maxRetries} attempts.`);
                vscode.window.showErrorMessage('Error starting server: No free ports found, please try again later.');
                return { server: null, eventEmitter: null, port: null };
            }
        }
    });
    return { server: exports.server, eventEmitter, port };
};
const startServer = () => {
    return tryStartServer();
};
exports.startServer = startServer;
//# sourceMappingURL=temporalServer.js.map