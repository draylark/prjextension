import * as vscode from 'vscode';
import { clearSecretStorage, handleAuthExtUserData } from './storage';
import { PersistanceData } from '../types/auth_interfaces';
import { Socket } from 'socket.io-client';
import { AuthData } from '../types/storage_types';

export const handlePersistence = async(context: vscode.ExtensionContext, socket: Socket, PAT: string ) => {
    socket.emit('onExtPersistance', { type: 'EXT', PAT, SOCKETID: socket.id }, async( resp: PersistanceData ) => {
        if ( resp && resp.success === true ) {
            await handleAuthExtUserData(resp.user, context);
        } else {
            vscode.window.showInformationMessage('Error during persistance.');
        }
    });
};


export const handlePATregistrationOrPersistence = async(context: vscode.ExtensionContext, socket: Socket, authData: AuthData ) => {   
    const secretStorage = context.secrets;
    const { EXECUTORID, FRONTENDID, extdata, PAT } = authData;

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
