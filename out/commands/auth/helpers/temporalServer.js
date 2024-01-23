"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = void 0;
// server.js
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const events_1 = __importDefault(require("events"));
const app = (0, express_1.default)();
const port = 3002; // Asegúrate de que este puerto esté libre para usar
const eventEmitter = new events_1.default();
app.use((0, cors_1.default)({
    origin: '*',
    credentials: true
})); // Configuración de CORS
app.use(express_1.default.json()); // Middleware para parsear JSON
// Rutas, middleware, etc.
app.post('/receive-code', (req, res) => {
    // console.log('Código de Acceso Recibido:', req.body);
    // Emite un evento
    // console.log(req.body);
    eventEmitter.emit('codeReceived', { code: req.body.code, FRONTENDTID: req.body.FRONTENDTID });
    // Envía una respuesta
    res.status(200).json({ message: 'Código recibido con éxito' });
});
const startServer = () => {
    const server = app.listen(port, () => {
        console.log(`Servidor escuchando en el puerto ${port}`);
    });
    return { server, eventEmitter };
};
exports.startServer = startServer;
//# sourceMappingURL=temporalServer.js.map