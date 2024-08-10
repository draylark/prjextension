"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearFullExtData = exports.clearSecretStorage = exports.saveClientsIDs = exports.getPersonaForDeletionlUInfo = exports.getPersonalUInfo = exports.savePersonalUInfo = exports.deleteToken = exports.saveToken = exports.saveTemporalExtData = exports.handlePrJCUReconnection = exports.handlePrJCUlogin = exports.handleNPMUSERValidation = exports.handleAuthExtUserData = exports.getToken = exports.getPAT = exports.getEXTDATAINFOstorage = exports.getEXTUSERstorage = exports.getEXTDATAstorage = exports.getPATstorage = void 0;
const vscode = require("vscode");
const getPATstorage = async (context) => {
    const secretStorage = context.secrets;
    const pat = await secretStorage.get('personalAccessToken');
    if (pat) {
        return pat;
    }
    else {
        return null;
    }
};
exports.getPATstorage = getPATstorage;
const getEXTDATAstorage = async (context) => {
    const secretStorage = context.secrets;
    const extdata = await secretStorage.get('EXTDATA');
    const EXECUTORID = await secretStorage.get('EXECUTORID');
    const FRONTENDID = await secretStorage.get('FRONTENDID');
    const PAT = await secretStorage.get('personalAccessToken');
    if (extdata && EXECUTORID && FRONTENDID) {
        const data = JSON.parse(extdata);
        return { EXECUTORID, FRONTENDID, extdata: data };
    }
    else if (PAT) {
        return { PAT };
    }
    else {
        return null;
    }
};
exports.getEXTDATAstorage = getEXTDATAstorage;
const getEXTUSERstorage = async (context) => {
    const secretStorage = context.secrets;
    const extuser = await secretStorage.get('EXTUSERINFO');
    if (extuser) {
        const data = JSON.parse(extuser);
        return data;
    }
    else {
        vscode.window.showInformationMessage('No extension user data found.');
        return null;
    }
};
exports.getEXTUSERstorage = getEXTUSERstorage;
const getEXTDATAINFOstorage = async (context) => {
    const secretStorage = context.secrets;
    const UID = await secretStorage.get('PRJACCUID');
    if (UID) {
        return UID;
    }
    else {
        vscode.window.showInformationMessage('No extension user data found.');
        return null;
    }
};
exports.getEXTDATAINFOstorage = getEXTDATAINFOstorage;
const getPAT = async (context) => {
    const secretStorage = context.secrets;
    const PAT = await secretStorage.get('personalAccessToken');
    if (PAT) {
        return PAT;
    }
    else {
        vscode.window.showInformationMessage('No extension user data found.');
        return null;
    }
};
exports.getPAT = getPAT;
const getToken = async (context) => {
    const secretStorage = context.secrets;
    const token = await secretStorage.get('token');
    if (token) {
        return token;
    }
    else {
        vscode.window.showInformationMessage('No extension user data found.');
        return null;
    }
};
exports.getToken = getToken;
// Saving user data after login
const handleAuthExtUserData = async (user, context) => {
    const { NPMUID, NPMSOCKETID, PAT, PRJACCUID, ...rest } = user;
    const secretStorage = context.secrets;
    const EXTUSERINFO = { NPMUID, NPMSOCKETID };
    await secretStorage.store('EXTUSERINFO', JSON.stringify(EXTUSERINFO));
    await secretStorage.store('PRJACCUID', PRJACCUID);
    await secretStorage.store('personalAccessToken', PAT);
};
exports.handleAuthExtUserData = handleAuthExtUserData;
// Validating PrJConsole user
const handleNPMUSERValidation = async (data, context) => {
    const extuser = await (0, exports.getEXTUSERstorage)(context);
    const npmuser = data.NPMUSER;
    if (extuser) {
        const { NPMUID, NPMSOCKETID } = extuser;
        if (npmuser.uid === NPMUID && npmuser.SOCKETID === NPMSOCKETID) {
            return true;
        }
        else {
            vscode.window.showInformationMessage('NPM user not validated.');
            return false;
        }
    }
    else {
        return false;
    }
};
exports.handleNPMUSERValidation = handleNPMUSERValidation;
// Updating socketID and PAT after login
const handlePrJCUlogin = async (context, NEWNPMSOCKETID, newpat, token) => {
    const secretStorage = context.secrets;
    const extuser = await (0, exports.getEXTUSERstorage)(context);
    const { NPMUID, NPMSOCKETID } = extuser;
    try {
        if (NPMSOCKETID !== NEWNPMSOCKETID) {
            await secretStorage.delete('EXTUSERINFO');
            await secretStorage.delete('personalAccessToken');
            await secretStorage.delete('token');
            const EXTUSERINFO = { NPMUID, NPMSOCKETID: NEWNPMSOCKETID };
            await secretStorage.store('personalAccessToken', newpat);
            await secretStorage.store('token', token);
            await secretStorage.store('EXTUSERINFO', JSON.stringify(EXTUSERINFO));
        }
        ;
    }
    catch (error) {
        vscode.window.showInformationMessage('There was an error updating the user data.');
    }
    ;
};
exports.handlePrJCUlogin = handlePrJCUlogin;
const handlePrJCUReconnection = async (context, NEWNPMSOCKETID, newpat) => {
    const secretStorage = context.secrets;
    const extuser = await (0, exports.getEXTUSERstorage)(context);
    const { NPMUID, NPMSOCKETID } = extuser;
    try {
        if (NPMSOCKETID !== NEWNPMSOCKETID) {
            await secretStorage.delete('EXTUSERINFO');
            await secretStorage.delete('personalAccessToken');
            const EXTUSERINFO = { NPMUID, NPMSOCKETID: NEWNPMSOCKETID };
            await secretStorage.store('personalAccessToken', newpat);
            await secretStorage.store('EXTUSERINFO', JSON.stringify(EXTUSERINFO));
        }
        ;
    }
    catch (error) {
        vscode.window.showInformationMessage('There was an error updating the user data.');
    }
    ;
};
exports.handlePrJCUReconnection = handlePrJCUReconnection;
const saveTemporalExtData = async (data, context) => {
    const secretStorage = context.secrets;
    try {
        await secretStorage.store('EXTDATA', JSON.stringify(data));
    }
    catch (error) {
        vscode.window.showInformationMessage('There was an error saving the information');
    }
};
exports.saveTemporalExtData = saveTemporalExtData;
const saveToken = async (token, context) => {
    const secretStorage = context.secrets;
    try {
        await secretStorage.store('token', token);
    }
    catch (error) {
        vscode.window.showInformationMessage('There was an error saving the information');
    }
};
exports.saveToken = saveToken;
const deleteToken = async (context) => {
    const secretStorage = context.secrets;
    try {
        await secretStorage.delete('token');
    }
    catch (error) {
        vscode.window.showInformationMessage('There was an error deleting the token');
    }
};
exports.deleteToken = deleteToken;
const savePersonalUInfo = async (data, context) => {
    const secretStorage = context.secrets;
    try {
        await secretStorage.store('PRJUSERINFO', JSON.stringify(data));
    }
    catch (error) {
        vscode.window.showInformationMessage('There was an error saving the information');
    }
};
exports.savePersonalUInfo = savePersonalUInfo;
const getPersonalUInfo = async (context) => {
    const secretStorage = context.secrets;
    const personalUInfo = await secretStorage.get('PRJUSERINFO');
    if (!personalUInfo) {
        vscode.window.showInformationMessage('No personal information found.');
    }
    else {
        const { PRJACCUID, email } = JSON.parse(personalUInfo);
        vscode.window.showInformationMessage(`PrJManager ID: ${PRJACCUID}, Email: ${email}`);
    }
};
exports.getPersonalUInfo = getPersonalUInfo;
const getPersonaForDeletionlUInfo = async (context) => {
    const secretStorage = context.secrets;
    const personalUInfo = await secretStorage.get('PRJUSERINFO');
    if (!personalUInfo) {
        vscode.window.showInformationMessage('No personal information found.');
    }
    else {
        const { PRJACCUID } = JSON.parse(personalUInfo);
        return PRJACCUID;
    }
};
exports.getPersonaForDeletionlUInfo = getPersonaForDeletionlUInfo;
const saveClientsIDs = async (data, context) => {
    const secretStorage = context.secrets;
    try {
        await secretStorage.store('EXECUTORID', data.EXECUTORID);
        await secretStorage.store('FRONTENDID', data.FRONTENDID);
    }
    catch (error) {
        vscode.window.showInformationMessage('There was an error saving the information');
    }
};
exports.saveClientsIDs = saveClientsIDs;
const clearSecretStorage = async (secretStorage) => {
    const secretKeys = ['EXTDATA', 'EXECUTORID', 'FRONTENDID',]; // Las claves que conoces y has usado
    for (const key of secretKeys) {
        await secretStorage.delete(key);
    }
};
exports.clearSecretStorage = clearSecretStorage;
const clearFullExtData = async (secretStorage) => {
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
    }
    else {
        return false;
    }
};
exports.clearFullExtData = clearFullExtData;
//# sourceMappingURL=storage.js.map