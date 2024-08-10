import * as vscode from 'vscode';
import { clearSecretStorage, handleAuthExtUserData } from './storage.js';
import { PersistanceData } from '../types/auth_interfaces.js';
import { Socket } from 'socket.io-client';
import { AuthData } from '../types/storage_types.js';
import { ExtDataSuccess, PatSuccess } from '../types/returns_types.js';

export const handlePersistence = async(context: vscode.ExtensionContext, socket: Socket, PAT: string ) => {
    socket.emit('onExtPersistance', { type: 'EXT', PAT, SOCKETID: socket.id }, async( resp: PersistanceData ) => {
        if ( resp && resp.success === true ) {
            vscode.window.showInformationMessage(resp.message);
            await handleAuthExtUserData(resp.user, context);
        } else {
            vscode.window.showInformationMessage('Error during persistance.');
        }
    });
};




export const handlePATregistrationOrPersistence = async(context: vscode.ExtensionContext, socket: Socket, authData: ExtDataSuccess | PatSuccess ) => {   
    const secretStorage = context.secrets;
    const { EXECUTORID, FRONTENDID, extdata, PAT } = authData as AuthData;

    if ( extdata && EXECUTORID && FRONTENDID ) {
        // Case: Registration
        const data =  { to: EXECUTORID, authStatus: { success: true, message: 'Autenticación exitosa', FRONTENDID }, extdata: { SOCKETID: socket.id, newuser: extdata } };
        socket.emit('authenticationResult', data );
        clearSecretStorage(secretStorage);

    } else if ( PAT ) {
        // Case: Persistence
        await handlePersistence(context, socket, PAT);
    }
};
