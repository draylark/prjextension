"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = exports.server = void 0;
// server.js
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const events_1 = __importDefault(require("events"));
const http_1 = __importDefault(require("http")); // Importar el módulo HTTP
const app = (0, express_1.default)();
const eventEmitter = new events_1.default();
let port = 3002; // Asegúrate de que este puerto esté libre para usar
app.use((0, cors_1.default)({
    origin: '*',
    credentials: true
})); // Configuración de CORS
app.use(express_1.default.json()); // Middleware para parsear JSON
// Rutas, middleware, etc.
app.post('/receive-code', (req, res) => {
    // console.log('Código de Acceso Recibido:', req.body);
    eventEmitter.emit('codeReceived', { code: req.body.code, FRONTENDTID: req.body.FRONTENDTID });
    res.status(200).json({ message: 'Código recibido con éxito' });
});
const tryStartServer = (retryCount = 0) => {
    exports.server = http_1.default.createServer(app); // Crear el servidor
    exports.server.listen(port, () => {
        console.log(`Servidor escuchando en el puerto ${port}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') { // Verificar si el error es porque el puerto está en uso
            console.log(`El puerto ${port} está ocupado, intentando con el puerto ${port + 1}`);
            port++; // Incrementar el puerto
            if (retryCount < 10) { // Poner un límite en la cantidad de reintentos
                tryStartServer(retryCount + 1);
            }
            else {
                console.error('No se encontraron puertos libres después de 10 intentos.');
            }
        }
        else {
            console.error(err);
        }
    });
    return { server: exports.server, eventEmitter, port };
};
const startServer = () => {
    return tryStartServer();
};
exports.startServer = startServer;
//# sourceMappingURL=temporalServer.js.map