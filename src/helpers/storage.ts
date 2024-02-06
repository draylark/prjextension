import * as vscode from 'vscode';
import { CommandData } from '../types/commands_interfaces';
import { Socket } from 'socket.io-client';
import { PersistanceUser } from '../types/auth_types';
import { EXTDATA, PersonalUInfo, ClientsIDS } from '../types/storage_types';
import { GetExtDataStorageResult } from '../types/returns_types';

export const getPATstorage = async(context: vscode.ExtensionContext) => {
    const secretStorage = context.secrets;
    const pat = await secretStorage.get('personalAccessToken');
    if (pat) {
        return pat;
    } else {
        return null;
    }
};


export const getEXTDATAstorage = async(context: vscode.ExtensionContext): Promise<GetExtDataStorageResult> => {

    const secretStorage = context.secrets;
    const extdata = await secretStorage.get('EXTDATA');
    const EXECUTORID = await secretStorage.get('EXECUTORID');
    const FRONTENDID = await secretStorage.get('FRONTENDID');
    const PAT = await secretStorage.get('personalAccessToken');

    if ( extdata && EXECUTORID && FRONTENDID ) {
        const data = JSON.parse(extdata);
        return { EXECUTORID, FRONTENDID, extdata: data };
    } else if ( PAT ) {
        return { PAT };
    } else {
        return null;
    }

};


export const getEXTUSERstorage = async(context: vscode.ExtensionContext) => {
    const secretStorage = context.secrets;
    const extuser = await secretStorage.get('EXTUSERINFO');
    if (extuser) {
        const data = JSON.parse(extuser);
        return data;
    } else {
        vscode.window.showInformationMessage('No extension user data found.');
        return null;
    }
};

export const getEXTDATAINFOstorage = async(context: vscode.ExtensionContext) => {
    const secretStorage = context.secrets;
    const UID = await secretStorage.get('PRJACCUID');
    if (UID) {
        return UID;
    } else {
        vscode.window.showInformationMessage('No extension user data found.');
        return null;
    }
};

export const getPAT = async(context: vscode.ExtensionContext) => {
    const secretStorage = context.secrets;
    const PAT = await secretStorage.get('personalAccessToken');
    if (PAT) {
        return PAT;
    } else {
        vscode.window.showInformationMessage('No extension user data found.');
        return null;
    }
};

// Saving user data after login
export const handleAuthExtUserData = async( user: PersistanceUser, context: vscode.ExtensionContext) => {
    const { NPMUID, NPMSOCKETID, PAT, PRJACCUID, ...rest } = user;
    const secretStorage = context.secrets;
    const EXTUSERINFO = { NPMUID, NPMSOCKETID };
    await secretStorage.store('EXTUSERINFO', JSON.stringify(EXTUSERINFO));
    await secretStorage.store('PRJACCUID', PRJACCUID);
    await secretStorage.store('personalAccessToken', PAT);
};


// Validating PrJConsole user
export const handleNPMUSERValidation = async (data: CommandData, context: vscode.ExtensionContext) => {
    const extuser = await getEXTUSERstorage(context);
    const npmuser = data.NPMUSER;
    if (extuser) {
        const { NPMUID, NPMSOCKETID } = extuser;  
        if (npmuser.uid === NPMUID && npmuser.SOCKETID === NPMSOCKETID) {
            return true;
        } else {
            vscode.window.showInformationMessage('NPM user not validated.');
            return false;
        }
    } else {
        return false;
    }
};


// Updating socketID and PAT after login
export const handlePrJCUlogin = async (context: vscode.ExtensionContext, socket: Socket, NEWNPMSOCKETID: string, newpat: string) => {
    const secretStorage = context.secrets;
    const extuser = await getEXTUSERstorage(context);
    const { NPMUID, NPMSOCKETID } = extuser;  
    try {
        if (NPMSOCKETID !== NEWNPMSOCKETID) {
            await secretStorage.delete('EXTUSERINFO');
            await secretStorage.delete('personalAccessToken');
            const EXTUSERINFO = { NPMUID, NPMSOCKETID: NEWNPMSOCKETID };
            await secretStorage.store('personalAccessToken', newpat);
            await secretStorage.store('EXTUSERINFO', JSON.stringify(EXTUSERINFO));
        } 
    } catch (error) {
        console.log('hubo un error al guardar la informacion', error);
    }
   
};


export const saveTemporalExtData = async(data: EXTDATA, context: vscode.ExtensionContext) => {
    const secretStorage = context.secrets;
    try {
        await secretStorage.store('EXTDATA', JSON.stringify(data));
    } catch (error) {
        console.log('There was an error saving the information', error);
    }
};


export const savePersonalUInfo = async(data: PersonalUInfo, context: vscode.ExtensionContext) => {
    const secretStorage = context.secrets;
    try {
        await secretStorage.store('PRJUSERINFO', JSON.stringify(data));
    } catch (error) {
        console.log('There was an error saving the information', error);
    }
};

export const getPersonalUInfo = async(context: vscode.ExtensionContext) => {
    const secretStorage = context.secrets;
    const personalUInfo = await secretStorage.get('PRJUSERINFO');
    if (!personalUInfo) {
        vscode.window.showInformationMessage('No personal information found.');
    } else {
        const { PRJACCUID, email } = JSON.parse(personalUInfo);        
        vscode.window.showInformationMessage(`PrJManager ID: ${PRJACCUID}, Email: ${email}`);
    }
};

export const getPersonaForDeletionlUInfo = async(context: vscode.ExtensionContext) => {
    const secretStorage = context.secrets;
    const personalUInfo = await secretStorage.get('PRJUSERINFO');
    if (!personalUInfo) {
        vscode.window.showInformationMessage('No personal information found.');
    } else {
        const { PRJACCUID } = JSON.parse(personalUInfo);
        return PRJACCUID;
    }
};

export const saveClientsIDs = async(data: ClientsIDS, context: vscode.ExtensionContext) => {
    const secretStorage = context.secrets;
    try {
        await secretStorage.store('EXECUTORID', data.EXECUTORID);
        await secretStorage.store('FRONTENDID', data.FRONTENDID);
    } catch (error) {
        console.log('There was an error saving the information', error);
    }
};


export const clearSecretStorage = async(secretStorage: vscode.SecretStorage) => {
    const secretKeys = ['EXTDATA', 'EXECUTORID', 'FRONTENDID',]; // Las claves que conoces y has usado
    for (const key of secretKeys) {
        await secretStorage.delete(key);
    }
};

export const clearFullExtData = async (secretStorage: vscode.SecretStorage) => {
    const secretKeys = ['EXTDATA', 'EXECUTORID', 'FRONTENDID', 'personalAccessToken', 'EXTUSERINFO', 'PRJUSERINFO'];
    let dataDeleted = false; // Variable para rastrear si se ha borrado algún dato

    for (const key of secretKeys) {
        const secretValue = await secretStorage.get(key); // Intenta leer la clave
        if (secretValue !== undefined) { // Si la clave existe
            await secretStorage.delete(key); // Solo entonces borra la clave
            dataDeleted = true; // Marca que hemos borrado datos
        }
    }

    // Mensaje condicional basado en si se borraron datos o no
    if (dataDeleted) {
        vscode.window.showInformationMessage('User data deleted successfully.');
        return true;
    } else {
        return false;
    }
};

