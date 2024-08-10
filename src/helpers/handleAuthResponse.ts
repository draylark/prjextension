import * as vscode from 'vscode';
import { saveTemporalExtData, handleAuthExtUserData, savePersonalUInfo, saveToken, deleteToken } from './storage.js';
import { currentPanel } from '../views/views.js';
import { server } from './temporalServer.js';
import { Response } from '../types/auth_interfaces.js';
import { AuthResponseHandling, PersistanceData, } from '../types/auth_interfaces.js';

export const handleAuthResponse = async (response: AuthResponseHandling, FRONTENDID: string, context: vscode.ExtensionContext): Promise<Response> => {
    switch (response.status) {
        case 200: // Success
            const dataToStore = { PAT: response.data.pat, PRJACCUID: response.data.user.uid, name: response.data.user.username, email: response.data.user.email };
            const personalUInfo = { PRJACCUID: response.data.user.uid, email: response.data.user.email };
            await saveToken(response.data.token, context);
            await saveTemporalExtData(dataToStore, context);     
            await savePersonalUInfo(personalUInfo, context); 
            return {
                user: response.data.user,
                success: true,
                message: 'User data obtained correctly',
                FRONTENDID
            };

        case 404: // Email not registered
            vscode.window.showErrorMessage('The email is not registered');
            return {
                success: false,
                message: 'The email is not registered on PrJManager, please create an account first.',
                FRONTENDID
            };

        case 403: // Account suspended
            vscode.window.showErrorMessage('The account no longer exists or has been suspended');
            return {
                success: false,
                message: 'The account no longer exists or has been suspended',
                FRONTENDID
            };

        default:
            // Handle unexpected errors
            vscode.window.showErrorMessage('Unexpected error during authentication');
            return {
                success: false,
                message: 'Unexpected error during authentication',
                FRONTENDID
            };
    }
};


export const handleAuthResponseAfterReset = async (response: PersistanceData, context: vscode.ExtensionContext, socketID: string) => {
    if( !response.success ) {   
        if( server && server.listening ) { server.close(); } 
        await deleteToken(context);             
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
        
        vscode.window.showInformationMessage(response.message);
        await handleAuthExtUserData(response.user, context);
    };
};

