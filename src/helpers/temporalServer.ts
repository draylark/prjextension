// server.js
import express from 'express';
import cors from 'cors';
import EventEmitter from 'events';
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
    // console.log('Código de Acceso Recibido:', req.body);
    eventEmitter.emit('codeReceived', { code: req.body.code, FRONTENDTID: req.body.FRONTENDTID  });
    res.status(200).json({ message: 'Código recibido con éxito' });
});

const tryStartServer = (retryCount = 0) => {
    server = http.createServer(app); // Crear el servidor

    server.listen(port, () => {
        console.log(`Servidor escuchando en el puerto ${port}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') { // Verificar si el error es porque el puerto está en uso
            console.log(`El puerto ${port} está ocupado, intentando con el puerto ${port + 1}`);
            port++; // Incrementar el puerto
            if (retryCount < 10) { // Poner un límite en la cantidad de reintentos
                tryStartServer(retryCount + 1);
            } else {
                console.error('No se encontraron puertos libres después de 10 intentos.');
            }
        } else {
            console.error(err);
        }
    });

    return { server, eventEmitter, port };
};

export const startServer = () => {
    return tryStartServer();
};