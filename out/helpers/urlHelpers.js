"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLastCommitInDatabase = exports.handlePull = exports.handlePush = void 0;
const FormData = require('form-data');
const fs_1 = require("fs");
const axios_1 = __importDefault(require("axios"));
const vscode = __importStar(require("vscode"));
const handlePush = async (PAT, UID, data) => {
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
        formData.append('file', (0, fs_1.createReadStream)(filePath));
        const config = {
            headers: {
                ...formData.getHeaders(),
            },
        };
        console.log('Enviando solicitud de acceso');
        const response = await axios_1.default.post('http://localhost:3005/api/git/access-push', formData, config);
        if (response.data && response.status === 200) {
            return response.data.message;
        }
        else {
            // Mostrar mensaje de error
            vscode.window.showErrorMessage(response.data.message);
        }
    }
    catch (error) {
        vscode.window.showErrorMessage(error.response.data.message);
    }
};
exports.handlePush = handlePush;
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
const handlePull = async (PAT, UID, data) => {
    const { type, r, branch } = data;
    const body = {
        PAT: PAT,
        UID: UID,
        type: type,
        remoteUrl: r,
    };
    try {
        console.log('Enviando solicitud de acceso');
        const response = await axios_1.default.post('http://localhost:3005/api/git/access-pull', body);
        const data = response.data;
        console.log(data);
        return data;
    }
    catch (error) {
        console.error('Error al procesar la solicitud de pull:', error);
        vscode.window.showErrorMessage('Error al procesar la solicitud de pull');
    }
};
exports.handlePull = handlePull;
const updateLastCommitInDatabase = async (commitHash, UID, PAT, commitMessage) => {
    const body = {
        PAT: PAT,
        UID: UID,
        commitHash: commitHash,
        commitMessage: commitMessage,
        type: 'update'
    };
    try {
        console.log('Enviando solicitud de actualización de commit');
        const response = await axios_1.default.post('http://localhost:3005/api/git/create-commit', body);
        console.log('Respuesta del servidor:', response.data);
    }
    catch (error) {
        console.error('Error al procesar la solicitud de actualización de commit:', error);
    }
};
exports.updateLastCommitInDatabase = updateLastCommitInDatabase;
//# sourceMappingURL=urlHelpers.js.map