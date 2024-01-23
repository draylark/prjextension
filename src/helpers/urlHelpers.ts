const FormData = require('form-data');
import { createReadStream, writeFileSync } from "fs";
import axios from "axios";
import * as vscode from 'vscode';
import path, { join } from "path";
import AdmZip from "adm-zip";
import { applyPatch } from "./gitHelpers";
import simpleGit from "simple-git";

type Data = {
    type: string,
    r: string,
    filePath: string,
    branch: string,
    localHEAD: string,
    hash: string,
    commitMessage: string,
};


export const handlePush = async(PAT: string, UID: String, data: Data) => {

    const { type, r, filePath, branch, hash, commitMessage } = data; 

    console.log('Datos recibidos:', data);

    try {
        const formData = new FormData();

        // Agregar los campos de texto a la solicitud
        formData.append('PAT', PAT);
        formData.append('UID', UID);
        formData.append('type', type);
        formData.append('remoteUrl', r);
        formData.append('branch', branch);
        formData.append('lastCommitHash', hash);
        formData.append('commitMessage', commitMessage);

        // Agregar el archivo
        formData.append('file', createReadStream(filePath));

        const config = {
            headers: {
                ...formData.getHeaders(),
            },
        };
        console.log('Enviando solicitud de acceso');
        const response = await axios.post('http://localhost:3005/api/git/access-push', formData, config);
        if (response.data && response.status === 200) {
            return response.data.message;
        } else {
            // Mostrar mensaje de error
            vscode.window.showErrorMessage(response.data.message);
        }
    } catch (error) {
        vscode.window.showErrorMessage(error.response.data.message);
    }
};

// export const handlePull = async(PAT: string, UID: string, data: Data) => {
//     const { type, r, unpushedCommits, branch } = data; 

//     const body = {
//         PAT: PAT,
//         UID: UID,
//         type: type,
//         remoteUrl: r,
//         branch: branch,
//         unpushedCommits
//     };
    
//     try {
//         console.log('Enviando solicitud de acceso');
//         const response = await axios.post('http://localhost:3005/api/git/access-pull', body, {
//             responseType: 'arraybuffer'  // Importante para recibir un archivo binario
//         });

//         if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
//             const workspaceFolder = vscode.workspace.workspaceFolders[0];
//             const zipPath = path.join(workspaceFolder.uri.fsPath, 'patch.zip');

//             // Escribir el contenido del archivo en el sistema de archivos
//             writeFileSync(zipPath, Buffer.from(response.data));
//             vscode.window.showInformationMessage('Parche descargado en: ' + zipPath);

//             const zip = new AdmZip(zipPath);

//             // Obtener nombres de archivos dentro del ZIP
//             const zipEntries = zip.getEntries(); // Array de entradas del ZIP
//             let patchFileName = '';

//             zipEntries.forEach(zipEntry => {
//                 if (zipEntry.entryName.endsWith('.patch')) { // O cualquier otro criterio que necesites
//                     patchFileName = zipEntry.entryName;
//                 }
//             });

//             // console.log('Nombre del archivo de parche:', patchFileName);

//             const patchPath = path.join(workspaceFolder.uri.fsPath, patchFileName);
//             // const patchFileUri = vscode.Uri.file(path.join(workspaceFolder.uri.fsPath, patchFileName));
//             console.log('Ruta del archivo de parche:', patchPath);
//             // console.log('URI del archivo de parche:', patchFileUri);

//             zip.extractAllTo(workspaceFolder.uri.fsPath, true);
//             vscode.window.showInformationMessage('Parche descomprimido en: ' + workspaceFolder.uri.fsPath);

//             // Aplicar el parche
//             await applyPatch(workspaceFolder, patchPath, zipPath, UID, PAT);
//         } else {
//             vscode.window.showErrorMessage('No hay un espacio de trabajo abierto.');
//         }
//     } catch (error) {
//         console.error('Error al procesar la solicitud de pull:', error);
//         vscode.window.showErrorMessage('Error al procesar la solicitud de pull');
//     }
// };

export const handlePull = async(PAT: string, UID: string, data: Data) => {
    const { type, r, branch } = data; 

    const body = {
        PAT: PAT,
        UID: UID,
        type: type,
        remoteUrl: r,
    };
    
    try {
        console.log('Enviando solicitud de acceso');
        const response = await axios.post('http://localhost:3005/api/git/access-pull', body );
        const data = response.data;
        console.log(data);
        return data;
    } catch (error) {
        console.error('Error al procesar la solicitud de pull:', error);
        vscode.window.showErrorMessage('Error al procesar la solicitud de pull');
    }
};


export const updateLastCommitInDatabase = async (commitHash: string, UID: string, PAT: string, commitMessage ) => {

    const body = {
        PAT: PAT,
        UID: UID,
        commitHash: commitHash,
        commitMessage: commitMessage,
        type: 'update'
    };

    try {
        console.log('Enviando solicitud de actualización de commit');
        const response = await axios.post('http://localhost:3005/api/git/create-commit', body);
        console.log('Respuesta del servidor:', response.data);
    } catch (error) {
        console.error('Error al procesar la solicitud de actualización de commit:', error);
    }

};
