import * as vscode from 'vscode';
import { saveAuthKeys, handleAuthExtUserData } from './storage';
import { currentPanel } from '../views/views';
import { server } from './temporalServer';

export const handleAuthResponse = async (response, FRONTENDID, context: vscode.ExtensionContext) => {
    switch (response.status) {
        case 200: // Éxito
            const dataToStore = { PAT: response.data.pat, PRJACCUID: response.data.user.uid, name: response.data.user.username, email: response.data.user.email };
            await saveAuthKeys('R', dataToStore, context);      
            return {
                user: response.data.user,
                success: true,
                message: 'User data obtained correctly',
                FRONTENDID
            };

        case 404: // No registrado
            vscode.window.showErrorMessage('The email is not registered');
            return {
                success: false,
                message: 'The email is not registered on PrJManager, please create an account first.',
                FRONTENDID
            };

        case 403: // Cuenta suspendida
            vscode.window.showErrorMessage('The account no longer exists or has been suspended');
            return {
                success: false,
                message: 'The account no longer exists or has been suspended',
                FRONTENDID
            };

        default:
            // Manejar otros códigos de estado o errores inesperados
            vscode.window.showErrorMessage('Unexpected error during authentication');
            return {
                success: false,
                message: 'Unexpected error during authentication'
            };
    }
};


export const handleAuthResponseAfterReset = async (response, context: vscode.ExtensionContext, socketID) => {
    if( !response.success ) {   
        if( server && server.listening ) { server.close(); }              
        if (currentPanel) {
            currentPanel.webview.postMessage({ command: 'hideSpinner' });
            currentPanel.webview.postMessage({ command: 'showAuthResponse', authResponse: response.message, success: response.success });
            currentPanel.webview.postMessage({ command: 'updateId', id: socketID });
        }
        vscode.window.showErrorMessage(response.message);
    } else {
        if (currentPanel) {
            currentPanel.webview.postMessage({ command: 'hideSpinner' });
            currentPanel.webview.postMessage({ command: 'showAuthResponse', authResponse: `${response.message}, you can close this window now.`, success: response.success });
        }
        handleAuthExtUserData(response.user, context);
    }
};

