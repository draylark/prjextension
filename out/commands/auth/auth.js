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
exports.login = exports.authenticate = void 0;
const vscode = __importStar(require("vscode"));
const axios_1 = __importDefault(require("axios"));
const temporalServer_1 = require("../../helpers/temporalServer");
const handleAuthResponse_1 = require("../../helpers/handleAuthResponse");
const AUTH_TIMEOUT = 30000; // 1 minuto por ejemplo
const views_1 = require("../../views/views");
// export const joinRoom = ( context, socket ) => {
//     const panel = vscode.window.createWebviewPanel(
//         'joinRoom', // Identificador del tipo de Webview
//         'Unirse a Sala', // Título del panel
//         vscode.ViewColumn.One, // Editor column en el que mostrar el nuevo panel
//         {
//             enableScripts: true // Habilitar scripts en el webview
//         } // Opciones adicionales
//     );
//     panel.webview.html = getRoomIdWebviewContent();
//     panel.webview.onDidReceiveMessage(
//         message => {
//             switch (message.command) {
//                 case 'joinRoom':
//                     const roomId = message.roomId;                      
//                         socket.emit('joinRoom', roomId);
//                     break;
//             }
//         },
//         undefined,
//         context.subscriptions
//     );
// };
const waitForUserDecision = async (uri) => {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            vscode.window.showErrorMessage('Timeout - The user did not respond to the authentication request');
            reject({
                message: 'Timeout - The user did not respond to the authentication request',
                success: false
            });
        }, AUTH_TIMEOUT);
        vscode.env.openExternal(vscode.Uri.parse(uri)).then((opened) => {
            clearTimeout(timeoutId);
            resolve(opened);
        });
    });
};
const authenticate = async (context) => {
    const { server, eventEmitter, port } = (0, temporalServer_1.startServer)();
    let FRONTENDID = null;
    try {
        const response1 = await axios_1.default.post('http://localhost:3000/api/auth/extension-oauth', { port, type: 'EXTAUTH' });
        const uri = response1.data.url;
        const userAccepted = await waitForUserDecision(uri);
        if (!userAccepted) {
            // console.log('El usuario canceló la solicitud de autenticación');
            server.close();
            return {
                message: 'The user did not accept the authentication request',
                success: false
            };
        }
        if (views_1.currentPanel) {
            views_1.currentPanel.webview.postMessage({ command: 'hideAuthResponse' });
            views_1.currentPanel.webview.postMessage({ command: 'showSpinner' });
        }
        const promise = await new Promise((resolve, reject) => {
            eventEmitter.once('codeReceived', (RESP) => {
                resolve({ code: RESP.code, FRONTENDTID: RESP.FRONTENDTID });
            });
        });
        // console.log('dbasjdbasjbdasbAAAA',promise);
        FRONTENDID = promise.FRONTENDTID;
        const response2 = await axios_1.default.post('http://localhost:3000/api/auth/extension-auth-user', { code: promise.code });
        const status = await (0, handleAuthResponse_1.handleAuthResponse)(response2, FRONTENDID, context);
        // console.log('status desde el desde auth.ts: ', status);
        server.close();
        return status;
    }
    catch (error) {
        server.close(); // Asegúrate de cerrar el servidor en todos los casos
        if (axios_1.default.isAxiosError(error) && error.response) {
            // Error de Axios con respuesta HTTP
            console.error('Authentication Error', error.response.data);
            return await (0, handleAuthResponse_1.handleAuthResponse)(error.response, FRONTENDID, context);
        }
        else if (error && typeof error === 'object' && 'message' in error && 'success' in error) {
            // Error personalizado proveniente de reject
            console.error('Authentication Error', error.message);
            vscode.window.showErrorMessage(error.message);
            return error; // Devuelve el objeto error directamente
        }
        else {
            // Otros errores no esperados
            console.error('Unexpected error during authentication', error);
            vscode.window.showErrorMessage('Unexpected error during authentication');
            return {
                success: false,
                message: 'Unexpected error during authentication'
            };
        }
    }
};
exports.authenticate = authenticate;
const login = async (context, socket) => {
    const response = await axios_1.default.post('http://localhost:3000/api/auth/extension-auth', {});
    return response.data;
};
exports.login = login;
//# sourceMappingURL=auth.js.map