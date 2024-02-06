"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = exports.server = void 0;
const vscode = __importStar(require("vscode"));
const events_1 = __importDefault(require("events"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
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
    console.log('received code:', req.body);
    eventEmitter.emit('codeReceived', { code: req.body.code, FRONTENDTID: req.body.FRONTENDTID });
    res.status(200).json({ message: 'Code received successfully' });
});
const tryStartServer = (retryCount = 0, maxRetries = 10) => {
    exports.server = http_1.default.createServer(app); // Crear el servidor
    exports.server.listen(port, () => {
        console.log(`Temporary server listening on port ${port}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE' && retryCount < maxRetries) {
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