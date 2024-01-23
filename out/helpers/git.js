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
exports.status = exports.deleteBranch = exports.checkoutBranch = exports.createBranch = exports.listBranch = exports.cloneRepository = exports.pullFromRemote = exports.pushToRemote = exports.handleRemotes = exports.commitChanges = exports.addFilesToGit = exports.initGitRepository = void 0;
const vscode = __importStar(require("vscode"));
const simple_git_1 = __importDefault(require("simple-git"));
const storage_1 = require("./storage");
const gitHelpers_1 = require("./gitHelpers");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const gitHelpers_2 = require("./gitHelpers");
// import { verifyZipContent } from './gitHelpers';
const gitHelpers_3 = require("./gitHelpers");
const getRemoteUrl = async (git, remoteName) => {
    const remotes = await git.getRemotes(true);
    const remote = remotes.find(r => r.name === remoteName);
    return remote ? remote.refs.fetch : null;
};
const initGitRepository = async (validated) => {
    if (validated) {
        // Verificar si hay carpetas en el espacio de trabajo
        if (vscode.workspace.workspaceFolders) {
            // Utiliza la primera carpeta del espacio de trabajo
            const workspaceFolder = vscode.workspace.workspaceFolders[0];
            const workspaceFolderPath = workspaceFolder.uri.fsPath;
            try {
                // Crea una instancia de simple-git para el directorio del espacio de trabajo
                const git = (0, simple_git_1.default)(workspaceFolderPath);
                // Inicializa un nuevo repositorio Git en el directorio del espacio de trabajo
                await git.init();
                vscode.window.showInformationMessage('Repositorio Git inicializado con éxito en el espacio de trabajo.');
            }
            catch (error) {
                vscode.window.showErrorMessage(`Error al inicializar el repositorio Git: ${error.message}`);
            }
        }
        else {
            vscode.window.showErrorMessage('No hay carpetas en el espacio de trabajo.');
        }
    }
    else {
        vscode.window.showInformationMessage('NPM user not validated.');
    }
};
exports.initGitRepository = initGitRepository;
const addFilesToGit = async (resp) => {
    if (resp) {
        if (vscode.workspace.workspaceFolders) {
            const workspaceFolder = vscode.workspace.workspaceFolders[0];
            const workspaceFolderPath = workspaceFolder.uri.fsPath;
            try {
                const git = (0, simple_git_1.default)(workspaceFolderPath);
                // Verificar si el directorio es un repositorio Git
                const isRepo = await git.checkIsRepo();
                if (!isRepo) {
                    // No es un repositorio Git, mostrar mensaje de error
                    return vscode.window.showErrorMessage('No hay un repositorio Git inicializado en este directorio.');
                }
                // Agregar archivos al staging
                await git.add('.');
                vscode.window.showInformationMessage('Todos los archivos han sido agregados al staging de Git.');
            }
            catch (error) {
                vscode.window.showErrorMessage(`Error al agregar archivos al staging: ${error.message}`);
            }
        }
        else {
            vscode.window.showErrorMessage('No hay carpetas en el espacio de trabajo.');
        }
    }
    else {
        vscode.window.showInformationMessage('Usuario de NPM no validado.');
    }
};
exports.addFilesToGit = addFilesToGit;
const commitChanges = async (commitMessage, resp) => {
    if (resp) {
        if (vscode.workspace.workspaceFolders) {
            const workspaceFolder = vscode.workspace.workspaceFolders[0];
            const workspaceFolderPath = workspaceFolder.uri.fsPath;
            try {
                const git = (0, simple_git_1.default)(workspaceFolderPath);
                // Verificar si el directorio es un repositorio Git
                const isRepo = await git.checkIsRepo();
                if (!isRepo) {
                    return vscode.window.showErrorMessage('No hay un repositorio Git inicializado en este directorio.');
                }
                // Verificar si hay un merge en progreso
                const mergeInProgress = await git.raw(['rev-parse', '--verify', '--quiet', 'MERGE_HEAD']);
                if (mergeInProgress) {
                    await git.commit(commitMessage);
                    vscode.window.showInformationMessage(`Cambios confirmados con el mensaje: "${commitMessage}"`);
                    return;
                }
                // Obtener el estado del repositorio
                const status = await git.status();
                if (status.files.length === 0) {
                    return vscode.window.showInformationMessage('No hay archivos en staging para hacer commit.');
                }
                // Realizar un commit con el mensaje proporcionado
                await git.commit(commitMessage);
                vscode.window.showInformationMessage(`Cambios confirmados con el mensaje: "${commitMessage}"`);
            }
            catch (error) {
                vscode.window.showErrorMessage(`Error al realizar commit: ${error.message}`);
            }
        }
        else {
            vscode.window.showErrorMessage('No hay carpetas en el espacio de trabajo.');
        }
    }
    else {
        vscode.window.showInformationMessage('Usuario de NPM no validado.');
    }
};
exports.commitChanges = commitChanges;
const handleRemotes = async (data, resp, socket, context) => {
    const PAT = await (0, storage_1.getPAT)(context);
    const UID = await (0, storage_1.getEXTDATAINFOstorage)(context);
    if (!PAT || !UID) {
        return;
    }
    if (resp) {
        if (vscode.workspace.workspaceFolders) {
            const workspaceFolder = vscode.workspace.workspaceFolders[0];
            const workspaceFolderPath = workspaceFolder.uri.fsPath;
            const git = (0, simple_git_1.default)(workspaceFolderPath);
            // Verificar si el directorio es un repositorio Git
            const isRepo = await git.checkIsRepo();
            if (!isRepo) {
                return vscode.window.showErrorMessage('No hay un repositorio Git inicializado en este directorio.');
            }
            switch (data.type) {
                case 'get':
                    const remotes = await git.getRemotes(true);
                    socket.emit('remotesList', { to: data.NPMUSER.SOCKETID, remotes });
                    break;
                case 'add':
                    const existingRemotes = await git.getRemotes(true);
                    const isRemoteExist = existingRemotes.some(remote => remote.name === data.remoteName);
                    if (!isRemoteExist) {
                        await git.addRemote(data.remoteName, data.remoteUrl);
                        socket.emit('remotesList', { to: data.NPMUSER.SOCKETID, remotes: await git.getRemotes(true) });
                        vscode.window.showInformationMessage(`Remoto '${data.remoteName}' agregado con éxito.`);
                    }
                    else {
                        socket.emit('remotesList', { to: data.NPMUSER.SOCKETID, remotes: await git.getRemotes(true) });
                        vscode.window.showErrorMessage(`El remoto '${data.remoteName}' ya existe.`);
                    }
                    break;
                case 'remove':
                    const existingRemotesForRemove = await git.getRemotes(true);
                    const isRemoteExistForRemove = existingRemotesForRemove.some(remote => remote.name === data.remoteName);
                    if (isRemoteExistForRemove) {
                        await git.removeRemote(data.remoteName);
                        socket.emit('remotesList', { to: data.NPMUSER.SOCKETID, remotes: await git.getRemotes(true) });
                        vscode.window.showInformationMessage(`Remoto '${data.remoteName}' eliminado con éxito.`);
                    }
                    else {
                        socket.emit('remotesList', { to: data.NPMUSER.SOCKETID, remotes: await git.getRemotes(true) });
                        vscode.window.showErrorMessage(`El remoto '${data.remoteName}' no existe y por lo tanto no puede ser eliminado.`);
                    }
                    break;
                default:
                    break;
            }
            ;
        }
        else {
            vscode.window.showErrorMessage('No hay carpetas en el espacio de trabajo.');
        }
    }
    else {
        vscode.window.showInformationMessage('Usuario de NPM no validado.');
    }
};
exports.handleRemotes = handleRemotes;
const pushToRemote = async (status, context) => {
    const PAT = await (0, storage_1.getPAT)(context);
    const UID = await (0, storage_1.getEXTDATAINFOstorage)(context);
    const type = 'push';
    if (!PAT || !UID) {
        return;
    }
    if (status) {
        if (vscode.workspace.workspaceFolders) {
            const workspaceFolder = vscode.workspace.workspaceFolders[0];
            const workspaceFolderPath = workspaceFolder.uri.fsPath;
            const git = (0, simple_git_1.default)({
                baseDir: workspaceFolderPath,
            });
            const remoteUrl = await getRemoteUrl(git, "origin");
            if (!remoteUrl) {
                console.error('No se pudo obtener la URL del remoto.');
                return;
            }
            const parts = remoteUrl.split('/');
            const r = parts.slice(3).join('/'); // Extrae el grupo y el nombre del repositorio, manteniendo '.git'
            const filePath = await (0, gitHelpers_2.packageRepository)(workspaceFolderPath);
            const branchSummary = await git.branchLocal();
            const { hash, commitMessage } = await (0, gitHelpers_2.getLastCommit)(workspaceFolderPath);
            const data = { type, r, filePath, branch: branchSummary.current, hash, commitMessage };
            (0, gitHelpers_1.requestAccess)(PAT, UID, type, data).then(async (ACCESS) => {
                if (ACCESS) {
                    console.log(ACCESS);
                }
                else {
                    vscode.window.showErrorMessage('Hubo un error');
                }
            });
        }
        else {
            vscode.window.showErrorMessage('No hay carpetas en el espacio de trabajo.');
        }
    }
    else {
        vscode.window.showInformationMessage('Usuario de NPM no validado.');
    }
    ;
};
exports.pushToRemote = pushToRemote;
const pullFromRemote = async (resp, context) => {
    const PAT = await (0, storage_1.getPAT)(context);
    const UID = await (0, storage_1.getEXTDATAINFOstorage)(context);
    const type = 'pull';
    if (!PAT || !UID) {
        vscode.window.showErrorMessage('No se pudo obtener el token de acceso o la información del usuario.');
        return;
    }
    if (vscode.workspace.workspaceFolders) {
        const workspaceFolder = vscode.workspace.workspaceFolders[0];
        const workspaceFolderPath = workspaceFolder.uri.fsPath;
        const git = (0, simple_git_1.default)(workspaceFolderPath);
        // Obtener la URL del remoto configurada
        const remoteUrl = await getRemoteUrl(git, "origin");
        if (!remoteUrl) {
            console.error('No se pudo obtener la URL del remoto.');
            return;
        }
        const parts = remoteUrl.split('/');
        const r = parts.slice(3).join('/'); // Extrae el grupo y el nombre del repositorio, manteniendo '.git'
        const branchSummary = await git.branchLocal();
        const data = { type, r, branch: branchSummary.current, };
        (0, gitHelpers_1.requestAccess)(PAT, UID, type, data).then(async (data) => {
            if (data) {
                await (0, gitHelpers_3.handleAccess)(data.access, branchSummary.current, git, workspaceFolderPath);
            }
            else {
                vscode.window.showErrorMessage('El servidor no permite realizar el pull.');
            }
        });
    }
    else {
        vscode.window.showErrorMessage('No hay carpetas en el espacio de trabajo.');
    }
};
exports.pullFromRemote = pullFromRemote;
const cloneRepository = async (repoUrl, resp, context) => {
    const PAT = await (0, storage_1.getPAT)(context);
    const UID = await (0, storage_1.getEXTDATAINFOstorage)(context);
    if (!PAT || !UID) {
        return;
    }
    if (resp) {
        (0, gitHelpers_1.requestAccess)(PAT, UID).then(async (ACCESS) => {
            if (ACCESS) {
                if (vscode.workspace.workspaceFolders) {
                    const git = (0, simple_git_1.default)();
                    const workspaceFolder = vscode.workspace.workspaceFolders[0];
                    let workspaceFolderPath = workspaceFolder.uri.fsPath;
                    const parts = repoUrl.split('/');
                    const groupAndRepo = parts.slice(3).join('/');
                    const command = `${ACCESS}${groupAndRepo}`;
                    console.log(command);
                    try {
                        // Verifica si el directorio está vacío
                        if ((0, fs_1.readdirSync)(workspaceFolderPath).length === 0) {
                            await git.clone(command, workspaceFolderPath);
                            vscode.window.showInformationMessage('Repositorio clonado con éxito.');
                        }
                        else {
                            // El directorio no está vacío, crea un nuevo directorio con el nombre del repositorio
                            const repoName = repoUrl.split('/').pop().replace('.git', ''); // Extrae el nombre del repositorio de la URL
                            workspaceFolderPath = path_1.default.join(workspaceFolderPath, repoName);
                            (0, fs_1.mkdirSync)(workspaceFolderPath, { recursive: true });
                            await git.clone(command, workspaceFolderPath);
                            vscode.window.showInformationMessage('Reposiotrio clonado con éxito.');
                        }
                    }
                    catch (error) {
                        vscode.window.showErrorMessage(`Error al clonar el repositorio: ${error.message}`);
                    }
                }
                else {
                    vscode.window.showErrorMessage('No se pudo obtener el token de acceso.');
                }
                ;
            }
            else {
                vscode.window.showErrorMessage('No se pudo obtener el token de acceso.');
            }
        });
    }
    else {
        vscode.window.showInformationMessage('Usuario de NPM no validado.');
    }
};
exports.cloneRepository = cloneRepository;
const listBranch = async (resp, context, socket, SOCKETID) => {
    const PAT = await (0, storage_1.getPAT)(context);
    const UID = await (0, storage_1.getEXTDATAINFOstorage)(context);
    if (!PAT || !UID) {
        return;
    }
    if (resp) {
        if (vscode.workspace.workspaceFolders) {
            const workspaceFolder = vscode.workspace.workspaceFolders[0];
            const workspaceFolderPath = workspaceFolder.uri.fsPath;
            const git = (0, simple_git_1.default)(workspaceFolderPath);
            try {
                // Obtener la lista de ramas locales
                const branchSummary = await git.branchLocal();
                socket.emit('branchList', { to: SOCKETID, branchSummary });
            }
            catch (error) {
                vscode.window.showErrorMessage(`Error al listar las ramas: ${error.message}`);
            }
        }
        else {
            vscode.window.showErrorMessage('No hay carpetas en el espacio de trabajo.');
        }
    }
    else {
        vscode.window.showInformationMessage('Usuario de NPM no validado.');
    }
    ;
};
exports.listBranch = listBranch;
const createBranch = async (resp, context, socket, SOCKETID, branchName) => {
    const PAT = await (0, storage_1.getPAT)(context);
    const UID = await (0, storage_1.getEXTDATAINFOstorage)(context);
    if (!PAT || !UID) {
        return;
    }
    if (resp) {
        if (vscode.workspace.workspaceFolders) {
            const workspaceFolder = vscode.workspace.workspaceFolders[0];
            const workspaceFolderPath = workspaceFolder.uri.fsPath;
            const git = (0, simple_git_1.default)(workspaceFolderPath);
            try {
                // Crear la nueva rama
                await git.checkoutLocalBranch(branchName);
                ;
                // Obtener la lista actualizada de ramas locales
                const branchSummary = await git.branchLocal();
                socket.emit('branchList', { to: SOCKETID, branchSummary });
                vscode.window.showInformationMessage(`Rama '${branchName}' creada con éxito.`);
            }
            catch (error) {
                vscode.window.showErrorMessage(`Error al crear la rama: ${error.message}`);
            }
        }
        else {
            vscode.window.showErrorMessage('No hay carpetas en el espacio de trabajo.');
        }
    }
    else {
        vscode.window.showInformationMessage('Usuario de NPM no validado.');
    }
};
exports.createBranch = createBranch;
const checkoutBranch = async (resp, context, socket, SOCKETID, branchName) => {
    const PAT = await (0, storage_1.getPAT)(context);
    const UID = await (0, storage_1.getEXTDATAINFOstorage)(context);
    if (!PAT || !UID) {
        return;
    }
    if (resp) {
        if (vscode.workspace.workspaceFolders) {
            const workspaceFolder = vscode.workspace.workspaceFolders[0];
            const workspaceFolderPath = workspaceFolder.uri.fsPath;
            const git = (0, simple_git_1.default)(workspaceFolderPath);
            try {
                // Cambiar a la rama especificada
                await git.checkout(branchName);
                // Obtener la lista actualizada de ramas locales
                const branchSummary = await git.branchLocal();
                socket.emit('branchList', { to: SOCKETID, branchSummary });
                vscode.window.showInformationMessage(`Cambiado a la rama '${branchName}' con éxito.`);
            }
            catch (error) {
                vscode.window.showErrorMessage(`Error al cambiar a la rama: ${error.message}`);
            }
        }
        else {
            vscode.window.showErrorMessage('No hay carpetas en el espacio de trabajo.');
        }
    }
    else {
        vscode.window.showInformationMessage('Usuario de NPM no validado.');
    }
};
exports.checkoutBranch = checkoutBranch;
const deleteBranch = async (resp, context, socket, SOCKETID, branchName) => {
    const PAT = await (0, storage_1.getPAT)(context);
    const UID = await (0, storage_1.getEXTDATAINFOstorage)(context);
    if (!PAT || !UID) {
        return;
    }
    if (resp) {
        if (vscode.workspace.workspaceFolders) {
            const workspaceFolder = vscode.workspace.workspaceFolders[0];
            const workspaceFolderPath = workspaceFolder.uri.fsPath;
            const git = (0, simple_git_1.default)(workspaceFolderPath);
            try {
                // Eliminar la rama especificada
                await git.deleteLocalBranch(branchName);
                // Obtener la lista actualizada de ramas locales
                const branchSummary = await git.branchLocal();
                socket.emit('branchList', { to: SOCKETID, branchSummary });
                vscode.window.showInformationMessage(`Rama '${branchName}' eliminada con éxito.`);
            }
            catch (error) {
                vscode.window.showErrorMessage(`Error al eliminar la rama: ${error.message}`);
            }
        }
        else {
            vscode.window.showErrorMessage('No hay carpetas en el espacio de trabajo.');
        }
    }
    else {
        vscode.window.showInformationMessage('Usuario de NPM no validado.');
    }
};
exports.deleteBranch = deleteBranch;
const status = async (resp, context, socket, SOCKETID) => {
    const PAT = await (0, storage_1.getPAT)(context);
    const UID = await (0, storage_1.getEXTDATAINFOstorage)(context);
    if (!PAT || !UID) {
        return;
    }
    if (resp) {
        if (vscode.workspace.workspaceFolders) {
            const workspaceFolder = vscode.workspace.workspaceFolders[0];
            const workspaceFolderPath = workspaceFolder.uri.fsPath;
            const git = (0, simple_git_1.default)(workspaceFolderPath);
            try {
                // Obtener el estado del repositorio
                const status = await git.status();
                socket.emit('status', { to: SOCKETID, status });
            }
            catch (error) {
                vscode.window.showErrorMessage(`Error al obtener el estado del repositorio: ${error.message}`);
            }
        }
        else {
            vscode.window.showErrorMessage('No hay carpetas en el espacio de trabajo.');
        }
    }
    else {
        vscode.window.showInformationMessage('Usuario de NPM no validado.');
    }
};
exports.status = status;
// const git = simpleGit({
//     baseDir: workspaceFolderPath,
// });
// // Verificar si el directorio es un repositorio Git
// const isRepo = await git.checkIsRepo();
// if (!isRepo) {
//     return vscode.window.showErrorMessage('No hay un repositorio Git inicializado en este directorio.');
// }
// // Obtener el nombre de la rama actual
// const branchSummary = await git.branchLocal();
// const currentBranch = branchSummary.current;
// // Verificar si hay un remoto configurado
// const remotes = await git.getRemotes();
// if (remotes.length === 0) {
//     return vscode.window.showErrorMessage('No hay un repositorio remoto configurado.');
// }
// const remoteUrl = await getRemoteUrl(git, "origin");
// if (!remoteUrl) {
//     console.error('No se pudo obtener la URL del remoto.');
//     return;
// }
// const parts = remoteUrl.split('/');
// const groupAndRepo = parts.slice(3).join('/'); // Extrae el grupo y el nombre del repositorio, manteniendo '.git'
// const command = `git push ${ACCESS}${groupAndRepo} ${currentBranch}`;
// console.log(command);
// await exec(command, { cwd: workspaceFolderPath }, (error, stdout, stderr) => {
//     if (error) {
//         console.error(`Error al ejecutar git push: ${error}`);
//         return;
//     }
//     console.log('salida luego de git push stdrr', stderr);
//     console.log('salida luego de git push', stdout);
// });
//# sourceMappingURL=git.js.map