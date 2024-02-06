import * as vscode from 'vscode';
import { getEXTUSERstorage, getPersonaForDeletionlUInfo, clearFullExtData } from '../../helpers/storage';
import { Socket } from 'socket.io-client';

export const deleteAllUData = async(socket: Socket, context: vscode.ExtensionContext) => {
    if( socket && socket.connected ) {
        try {
            const extdata = await getEXTUSERstorage(context);
            const PRJACCUID = await getPersonaForDeletionlUInfo(context);

            if (!extdata || !PRJACCUID) { return false; }
            const { NPMUID } = extdata;

            socket.emit('deleteAllUData', { NPMUID, PRJACCUID }, async(response) => {
                if ( response.success  ) {
                    vscode.window.showInformationMessage(response.message);
                    return true;
                } else {
                    vscode.window.showInformationMessage(response.message);
                    return false;
                }
            });
        } catch (error) {
            vscode.window.showInformationMessage('Error during deletion.');
            return false;
        };
    } else {
        vscode.window.showInformationMessage('No active connection found.');
        return false;
    }
};
