import axios from 'axios';
import * as vscode from 'vscode';
import { currentPanel } from '../../views/views';
import { startServer } from '../../helpers/temporalServer';
import { handleAuthResponse } from '../../helpers/handleAuthResponse';
import { CodeReceivedResponse } from '../../types/auth_interfaces';
import EventEmitter from 'events';
const AUTH_TIMEOUT = 30000; // 1 minuto por ejemplo


const waitForUserDecision = async(uri: string) => {
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

const waitForCode = (eventEmitter: EventEmitter, timeout: number = 30000): Promise<CodeReceivedResponse> => {
    return new Promise((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        reject(new Error('Timeout waiting for code'));
      }, timeout);
  
      eventEmitter.once('codeReceived', (resp: CodeReceivedResponse) => {
        clearTimeout(timeoutHandle);
        resolve(resp);
      });
    });
};

export const authenticate = async (context: vscode.ExtensionContext) => {

    const { server, eventEmitter, port } = startServer();
    if( !server || !eventEmitter || !port ) {
        return {
            message: 'Error starting the authentication server',
            success: false
        };
    }

    let FRONTENDID = null;

    try {
        const response1 = await axios.post('http://localhost:3000/api/auth/extension-oauth', { port, type: 'EXTAUTH' });
        const uri = response1.data.url;
        const userAccepted = await waitForUserDecision(uri);

        if (!userAccepted) {
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

        const promise = await waitForCode(eventEmitter);

        FRONTENDID = promise.FRONTENDTID;
        const response2 = await axios.post('http://localhost:3000/api/auth/extension-auth-user', { code: promise.code } );
        const status = await handleAuthResponse(response2, FRONTENDID, context);

        server.close();
        return status;

    } catch (error) {       
        server.close();
        if (axios.isAxiosError(error) && error.response) {
            // Error from axios response
            return await handleAuthResponse(error.response, FRONTENDID, context);
        } else if (error && typeof error === 'object' && 'message' in error && 'success' in error) {
            // Error from the application
            vscode.window.showErrorMessage(error.message);
            return error; // Devuelve el objeto error directamente
        } else {
            // Unexpected errors
            vscode.window.showErrorMessage('Unexpected error during authentication');
            return {
                success: false,
                message: 'Unexpected error during authentication'
            };
        }
    }
};