import * as vscode from 'vscode';
import axios from 'axios';
import { startServer } from '../../helpers/temporalServer';
import { handleAuthResponse } from '../../helpers/handleAuthResponse';
const AUTH_TIMEOUT = 30000; // 1 minuto por ejemplo
import { currentPanel } from '../../views/views';

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

const waitForUserDecision = async(uri) => {
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

export const authenticate = async (context: vscode.ExtensionContext) => {

    const { server, eventEmitter, port } = startServer();
    let FRONTENDID = null;

    try {
        const response1 = await axios.post('http://localhost:3000/api/auth/extension-oauth', { port, type: 'EXTAUTH' });
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

        if (currentPanel) { 
            currentPanel.webview.postMessage({ command: 'hideAuthResponse' }); 
            currentPanel.webview.postMessage({ command: 'showSpinner' }); 
        } 

        const promise = await new Promise((resolve, reject) => {
            eventEmitter.once('codeReceived', (RESP) => {
                resolve({ code: RESP.code, FRONTENDTID: RESP.FRONTENDTID  });
            });
        });

        // console.log('dbasjdbasjbdasbAAAA',promise);
        FRONTENDID = promise.FRONTENDTID;
        const response2 = await axios.post('http://localhost:3000/api/auth/extension-auth-user', { code: promise.code } );
        const status = await handleAuthResponse(response2, FRONTENDID, context);
        // console.log('status desde el desde auth.ts: ', status);
        server.close();
        return status;

    } catch (error) {       
        server.close();

        if (axios.isAxiosError(error) && error.response) {
            // Error de Axios con respuesta HTTP
            console.error('Authentication Error', error.response.data);
            return await handleAuthResponse(error.response, FRONTENDID, context);
        } else if (error && typeof error === 'object' && 'message' in error && 'success' in error) {
            // Error personalizado proveniente de reject
            console.error('Authentication Error', error.message);
            vscode.window.showErrorMessage(error.message);
            return error; // Devuelve el objeto error directamente
        } else {
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


export const login = async (context, socket) => {

    const response = await axios.post('http://localhost:3000/api/auth/extension-auth', {});
    return response.data;

};