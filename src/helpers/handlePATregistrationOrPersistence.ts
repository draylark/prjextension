import * as vscode from 'vscode';
import { clearSecretStorage, handleAuthExtUserData } from './storage';



export const handlePersistence = async(context: vscode.ExtensionContext, socket, PAT ) => {
    socket.emit('startPersistance', { type: 'EXT', PAT, SOCKETID: socket.id }, async( resp: object ) => {
        if (resp) {
            console.log('Impresion desde handle persistance', resp);
            await handleAuthExtUserData(resp.user, context);
        } else {
            vscode.window.showInformationMessage('Error during persistance.');
        }
    });
};



export const handlePATregistrationOrPersistence = async(context: vscode.ExtensionContext, socket, authData ) => {
    
    const secretStorage = context.secrets;
    const { EXECUTORID, FRONTENDID, extdata, PAT } = authData;

    if ( extdata && EXECUTORID && FRONTENDID ) {
        const data =  { to: EXECUTORID, authStatus: { success: true, message: 'Autenticación exitosa', FRONTENDID }, extdata: { SOCKETID: socket.id, newuser: extdata } };
        socket.emit('authenticationResult', data );
        clearSecretStorage(secretStorage);
        return;
    } else if ( PAT ) {
        console.log('holi')
        handlePersistence(context, socket, PAT);
        // clearSecretStorage(secretStorage);
        return;
    }
};
