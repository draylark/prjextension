import * as vscode from 'vscode';

export const getPATstorage = async(context: vscode.ExtensionContext) => {
    const secretStorage = context.secrets;
    const pat = await secretStorage.get('personalAccessToken');
    if (pat) {
        return pat;
    } else {
        vscode.window.showInformationMessage('No PAT found.');
        return null;
    }
};


export const getEXTDATAstorage = async(context: vscode.ExtensionContext) => {

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
        // vscode.window.showInformationMessage('No user data found.');
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


export const handleAuthExtUserData = async( user, context: vscode.ExtensionContext) => {
    const { NPMUID, NPMSOCKETID, PAT, PRJACCUID, ...rest } = user;
    const secretStorage = context.secrets;
    const EXTUSERINFO = { NPMUID, NPMSOCKETID };
    await secretStorage.store('EXTUSERINFO', JSON.stringify(EXTUSERINFO));
    await secretStorage.store('PRJACCUID', PRJACCUID);
    await secretStorage.store('personalAccessToken', PAT);
};


export const handleNPMUSERValidation = async (npmuser, context: vscode.ExtensionContext) => {
    const extuser = await getEXTUSERstorage(context);
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


export const handleCNPMlogin = async (context: vscode.ExtensionContext, socket, NEWNPMSOCKETID, newpat) => {
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


export const saveAuthKeys = async(type, data, context: vscode.ExtensionContext) => {
    const secretStorage = context.secrets;
    try {
        switch (type) {
            case 'S':
                await secretStorage.store('EXECUTORID', data.EXECUTORID);
                await secretStorage.store('FRONTENDID', data.FRONTENDID);
                break;
            case 'R':
                await secretStorage.store('EXTDATA', JSON.stringify(data));
                break;
            default:
                break;
        }
    } catch (error) {
        console.log('hubo un error al guardar la informacion', error);
    }
};

export const clearSecretStorage = async(secretStorage) => {
    const secretKeys = ['EXTDATA', 'EXECUTORID', 'FRONTENDID',]; // Las claves que conoces y has usado

    for (const key of secretKeys) {
        await secretStorage.delete(key);
    }
};





export const clearSecretStorage2 = async(secretStorage) => {
    const secretKeys = ['EXTDATA', 'EXECUTORID', 'FRONTENDID', 'personalAccessToken', 'EXTUSERINFO']; // Las claves que conoces y has usado

    for (const key of secretKeys) {
        await secretStorage.delete(key);
    }
};

