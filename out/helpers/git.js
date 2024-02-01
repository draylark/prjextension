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
const getRemoteUrl = async (git, remoteName) => {
    const remotes = await git.getRemotes(true);
    const remote = remotes.find(r => r.name === remoteName);
    return remote ? remote.refs.fetch : null;
};
const initGitRepository = async (status) => {
    if (status) {
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
                vscode.window.showInformationMessage('Git repository successfully initialized in the workspace.');
            }
            catch (error) {
                vscode.window.showErrorMessage(`There was an error initializing the Git repository: ${error.message}`);
            }
        }
        else {
            vscode.window.showInformationMessage('There are no folders in the workspace.');
        }
    }
    else {
        vscode.window.showErrorMessage('NPM user not validated.');
    }
};
exports.initGitRepository = initGitRepository;
const addFilesToGit = async (status) => {
    if (status) {
        if (vscode.workspace.workspaceFolders) {
            const workspaceFolder = vscode.workspace.workspaceFolders[0];
            const workspaceFolderPath = workspaceFolder.uri.fsPath;
            try {
                const git = (0, simple_git_1.default)(workspaceFolderPath);
                // Verificar si el directorio es un repositorio Git
                const isRepo = await git.checkIsRepo();
                if (!isRepo) {
                    return vscode.window.showErrorMessage('There is no Git repository initialized in this directory.');
                }
                // Agregar archivos al staging
                await git.add('.');
                vscode.window.showInformationMessage('Files successfully added to staging.');
            }
            catch (error) {
                vscode.window.showErrorMessage(`There was an error adding the files to staging: ${error.message}`);
            }
        }
        else {
            vscode.window.showInformationMessage('There are no folders in the workspace.');
        }
    }
    else {
        vscode.window.showErrorMessage('NPM user not validated.');
    }
};
exports.addFilesToGit = addFilesToGit;
const commitChanges = async (commitMessage, status) => {
    if (status) {
        if (vscode.workspace.workspaceFolders) {
            const workspaceFolder = vscode.workspace.workspaceFolders[0];
            const workspaceFolderPath = workspaceFolder.uri.fsPath;
            try {
                const git = (0, simple_git_1.default)(workspaceFolderPath);
                // Verificar si el directorio es un repositorio Git
                const isRepo = await git.checkIsRepo();
                if (!isRepo) {
                    return vscode.window.showErrorMessage('There is no Git repository initialized in this directory.');
                }
                // Verificar si hay un merge en progreso
                const mergeInProgress = await git.raw(['rev-parse', '--verify', '--quiet', 'MERGE_HEAD']);
                if (mergeInProgress) {
                    await git.commit(commitMessage);
                    vscode.window.showInformationMessage(`Merge successfully committed with message: "${commitMessage}"`);
                    return;
                }
                // Obtener el estado del repositorio
                const status = await git.status();
                if (status.files.length === 0) {
                    return vscode.window.showInformationMessage('There are no changes to commit. No files were added to the staging area.');
                }
                // Realizar un commit con el mensaje proporcionado
                await git.commit(commitMessage);
                vscode.window.showInformationMessage(`Changes successfully committed with message: "${commitMessage}"`);
            }
            catch (error) {
                vscode.window.showErrorMessage(`There was an error committing the changes: ${error.message}`);
            }
        }
        else {
            vscode.window.showInformationMessage('There are no folders in the workspace.');
        }
    }
    else {
        vscode.window.showErrorMessage('NPM user not validated.');
    }
};
exports.commitChanges = commitChanges;
const handleRemotes = async (data, status, socket, context) => {
    const PAT = await (0, storage_1.getPAT)(context);
    const UID = await (0, storage_1.getEXTDATAINFOstorage)(context);
    if (!PAT || !UID) {
        vscode.window.showErrorMessage('NPM user not validated.');
        return;
    }
    ;
    if (status) {
        if (vscode.workspace.workspaceFolders) {
            const workspaceFolder = vscode.workspace.workspaceFolders[0];
            const workspaceFolderPath = workspaceFolder.uri.fsPath;
            const git = (0, simple_git_1.default)(workspaceFolderPath);
            // Verificar si el directorio es un repositorio Git
            const isRepo = await git.checkIsRepo();
            if (!isRepo) {
                return vscode.window.showErrorMessage('There is no Git repository initialized in this directory.');
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
                        vscode.window.showInformationMessage(`Remote '${data.remoteName}' successfully added.`);
                    }
                    else {
                        socket.emit('remotesList', { to: data.NPMUSER.SOCKETID, remotes: await git.getRemotes(true) });
                        vscode.window.showInformationMessage(`The remote '${data.remoteName}' already exists and therefore cannot be added.`);
                    }
                    break;
                case 'remove':
                    const existingRemotesForRemove = await git.getRemotes(true);
                    const isRemoteExistForRemove = existingRemotesForRemove.some(remote => remote.name === data.remoteName);
                    if (isRemoteExistForRemove) {
                        await git.removeRemote(data.remoteName);
                        socket.emit('remotesList', { to: data.NPMUSER.SOCKETID, remotes: await git.getRemotes(true) });
                        vscode.window.showInformationMessage(`Remote '${data.remoteName}' successfully removed.`);
                    }
                    else {
                        socket.emit('remotesList', { to: data.NPMUSER.SOCKETID, remotes: await git.getRemotes(true) });
                        vscode.window.showInformationMessage(`The remote '${data.remoteName}' does not exist and therefore cannot be removed.`);
                    }
                    break;
                default:
                    break;
            }
            ;
        }
        else {
            vscode.window.showInformationMessage('There are no folders in the workspace.');
        }
    }
    else {
        vscode.window.showErrorMessage('NPM user not validated.');
    }
};
exports.handleRemotes = handleRemotes;
const pushToRemote = async (status, context, remoteName) => {
    const PAT = await (0, storage_1.getPAT)(context);
    const UID = await (0, storage_1.getEXTDATAINFOstorage)(context);
    const type = 'push';
    if (!PAT || !UID) {
        vscode.window.showErrorMessage('NPM user not validated.');
        return;
    }
    ;
    if (status) {
        if (vscode.workspace.workspaceFolders) {
            const workspaceFolder = vscode.workspace.workspaceFolders[0];
            const workspaceFolderPath = workspaceFolder.uri.fsPath;
            const git = (0, simple_git_1.default)(workspaceFolderPath);
            const isRepo = await git.checkIsRepo();
            if (!isRepo) {
                return vscode.window.showErrorMessage('There is no Git repository initialized in this directory.');
            }
            // Obtener la lista de remotos configurados
            const remotes = await git.getRemotes();
            let selectedRemoteName = remoteName;
            // Si solo hay un remoto y no se proporcionó un remoteName, usar ese único remoto
            if (!selectedRemoteName && remotes.length === 1) {
                selectedRemoteName = remotes[0].name;
            }
            // Si no se ha seleccionado un remoto y hay múltiples remotos, usar 'origin' por defecto
            if (!selectedRemoteName) {
                selectedRemoteName = 'origin';
            }
            // Obtener la URL del remoto configurada
            const remoteUrl = await getRemoteUrl(git, selectedRemoteName);
            if (!remoteUrl) {
                return vscode.window.showErrorMessage(`Unable to obtain the remote URL for '${selectedRemoteName}'. ` +
                    `This may be due to several reasons: \n` +
                    `- There is no remote with the name '${selectedRemoteName}'. ` +
                    `- The local repository does not have any remotes configured. ` +
                    `- There might be an issue with the local repository configuration. ` +
                    `- If you are expecting 'origin' to be the default remote, check that it is properly configured executing 'remote' command in the interactive console.`);
            }
            const branchSummary = await git.branchLocal();
            const filePath = await (0, gitHelpers_1.packageRepository)(workspaceFolderPath);
            const data = { type, remoteUrl, filePath, branch: branchSummary.current, };
            (0, gitHelpers_1.requestAccess)(PAT, UID, type, data).then(async (access) => {
                if (access.success) {
                    vscode.window.showInformationMessage(access.message || 'Push executed successfully.');
                }
                else {
                    vscode.window.showErrorMessage(access.message || `The server does not allow to execute the ${type}.`);
                }
            });
        }
        else {
            vscode.window.showInformationMessage('There are no folders in the workspace.');
        }
    }
    else {
        vscode.window.showErrorMessage('NPM user not validated.');
    }
    ;
};
exports.pushToRemote = pushToRemote;
const pullFromRemote = async (status, context, remoteName) => {
    const PAT = await (0, storage_1.getPAT)(context);
    const UID = await (0, storage_1.getEXTDATAINFOstorage)(context);
    const type = 'pull';
    if (!PAT || !UID) {
        vscode.window.showErrorMessage('NPM user not validated.');
        return;
    }
    ;
    if (status) {
        if (vscode.workspace.workspaceFolders) {
            const workspaceFolder = vscode.workspace.workspaceFolders[0];
            const workspaceFolderPath = workspaceFolder.uri.fsPath;
            const git = (0, simple_git_1.default)(workspaceFolderPath);
            const isRepo = await git.checkIsRepo();
            if (!isRepo) {
                return vscode.window.showErrorMessage('There is no Git repository initialized in this directory.');
            }
            // Obtener la lista de remotos configurados
            const remotes = await git.getRemotes();
            let selectedRemoteName = remoteName;
            // Si solo hay un remoto y no se proporcionó un remoteName, usar ese único remoto
            if (!selectedRemoteName && remotes.length === 1) {
                selectedRemoteName = remotes[0].name;
            }
            // Si no se ha seleccionado un remoto y hay múltiples remotos, usar 'origin' por defecto
            if (!selectedRemoteName) {
                selectedRemoteName = 'origin';
            }
            // Obtener la URL del remoto configurada
            const remoteUrl = await getRemoteUrl(git, selectedRemoteName);
            if (!remoteUrl) {
                return vscode.window.showErrorMessage(`Unable to obtain the remote URL for '${selectedRemoteName}'. ` +
                    `This may be due to several reasons: \n` +
                    `- There is no remote with the name '${selectedRemoteName}'. ` +
                    `- The local repository does not have any remotes configured. ` +
                    `- There might be an issue with the local repository configuration. ` +
                    `- If you are expecting 'origin' to be the default remote, check that it is properly configured executing 'remote' command in the interactive console.`);
            }
            const branchSummary = await git.branchLocal();
            const data = { type, remoteUrl, branch: branchSummary.current };
            (0, gitHelpers_1.requestAccess)(PAT, UID, type, data).then(async (access) => {
                if (access.success) {
                    await (0, gitHelpers_1.handlePullAccess)(access.access, branchSummary.current, git, workspaceFolderPath);
                }
                else {
                    vscode.window.showErrorMessage(access.message || `The server does not allow to execute the ${type}.`);
                }
            });
        }
        else {
            vscode.window.showInformationMessage('There are no folders in the workspace.');
        }
    }
    else {
        vscode.window.showErrorMessage('NPM user not validated.');
    }
    ;
};
exports.pullFromRemote = pullFromRemote;
const cloneRepository = async (repoUrl, status, context, branch) => {
    const PAT = await (0, storage_1.getPAT)(context);
    const UID = await (0, storage_1.getEXTDATAINFOstorage)(context);
    const type = 'clone';
    if (!PAT || !UID) {
        vscode.window.showErrorMessage('NPM user not validated.');
        return;
    }
    ;
    if (status) {
        if (vscode.workspace.workspaceFolders) {
            const workspaceFolder = vscode.workspace.workspaceFolders[0];
            let workspaceFolderPath = workspaceFolder.uri.fsPath;
            const git = (0, simple_git_1.default)(workspaceFolderPath);
            const data = { type, remoteUrl: repoUrl, branch };
            (0, gitHelpers_1.requestAccess)(PAT, UID, type, data).then(async (access) => {
                if (access.success) {
                    await (0, gitHelpers_1.handleCloneAccess)(access.access, git, access.repoName, workspaceFolderPath, branch);
                }
                else {
                    vscode.window.showErrorMessage(access.message || `The server does not allow to execute the ${type}.`);
                }
            });
        }
        else {
            vscode.window.showInformationMessage('There are no folders in the workspace.');
        }
        ;
    }
    else {
        vscode.window.showErrorMessage('NPM user not validated.');
    }
};
exports.cloneRepository = cloneRepository;
const listBranch = async (status, context, socket, SOCKETID) => {
    const PAT = await (0, storage_1.getPAT)(context);
    const UID = await (0, storage_1.getEXTDATAINFOstorage)(context);
    if (!PAT || !UID) {
        vscode.window.showErrorMessage('NPM user not validated.');
        return;
    }
    ;
    if (status) {
        if (vscode.workspace.workspaceFolders) {
            const workspaceFolder = vscode.workspace.workspaceFolders[0];
            const workspaceFolderPath = workspaceFolder.uri.fsPath;
            const git = (0, simple_git_1.default)(workspaceFolderPath);
            const isRepo = await git.checkIsRepo();
            if (!isRepo) {
                return vscode.window.showErrorMessage('There is no Git repository initialized in this directory.');
            }
            try {
                // Obtener la lista de ramas locales
                const branchSummary = await git.branchLocal();
                socket.emit('branchList', { to: SOCKETID, branchSummary });
            }
            catch (error) {
                vscode.window.showErrorMessage(`There was an error listing the branches: ${error.message}`);
            }
        }
        else {
            vscode.window.showInformationMessage('There are no folders in the workspace.');
        }
    }
    else {
        vscode.window.showErrorMessage('NPM user not validated.');
    }
    ;
};
exports.listBranch = listBranch;
const createBranch = async (status, context, socket, SOCKETID, branchName) => {
    const PAT = await (0, storage_1.getPAT)(context);
    const UID = await (0, storage_1.getEXTDATAINFOstorage)(context);
    if (!PAT || !UID) {
        vscode.window.showErrorMessage('NPM user not validated.');
        return;
    }
    ;
    if (status) {
        if (vscode.workspace.workspaceFolders) {
            const workspaceFolder = vscode.workspace.workspaceFolders[0];
            const workspaceFolderPath = workspaceFolder.uri.fsPath;
            const git = (0, simple_git_1.default)(workspaceFolderPath);
            const isRepo = await git.checkIsRepo();
            if (!isRepo) {
                return vscode.window.showErrorMessage('There is no Git repository initialized in this directory.');
            }
            try {
                // Crear la nueva rama
                await git.checkoutLocalBranch(branchName);
                ;
                // Obtener la lista actualizada de ramas locales
                const branchSummary = await git.branchLocal();
                socket.emit('branchList', { to: SOCKETID, branchSummary });
                vscode.window.showInformationMessage(`Branch '${branchName}' created successfully.`);
            }
            catch (error) {
                vscode.window.showErrorMessage(`There was an error creating the branch: ${error.message}`);
            }
        }
        else {
            vscode.window.showInformationMessage('There are no folders in the workspace.');
        }
    }
    else {
        vscode.window.showErrorMessage('NPM user not validated.');
    }
};
exports.createBranch = createBranch;
const checkoutBranch = async (status, context, socket, SOCKETID, branchName) => {
    const PAT = await (0, storage_1.getPAT)(context);
    const UID = await (0, storage_1.getEXTDATAINFOstorage)(context);
    if (!PAT || !UID) {
        vscode.window.showErrorMessage('NPM user not validated.');
        return;
    }
    ;
    if (status) {
        if (vscode.workspace.workspaceFolders) {
            const workspaceFolder = vscode.workspace.workspaceFolders[0];
            const workspaceFolderPath = workspaceFolder.uri.fsPath;
            const git = (0, simple_git_1.default)(workspaceFolderPath);
            const isRepo = await git.checkIsRepo();
            if (!isRepo) {
                return vscode.window.showErrorMessage('There is no Git repository initialized in this directory.');
            }
            try {
                // Cambiar a la rama especificada
                await git.checkout(branchName);
                // Obtener la lista actualizada de ramas locales
                const branchSummary = await git.branchLocal();
                socket.emit('branchList', { to: SOCKETID, branchSummary });
                vscode.window.showInformationMessage(`Switched to branch '${branchName}' successfully.`);
            }
            catch (error) {
                vscode.window.showErrorMessage(`There was an error switching to the branch: ${error.message}`);
            }
        }
        else {
            vscode.window.showInformationMessage('There are no folders in the workspace.');
        }
    }
    else {
        vscode.window.showErrorMessage('NPM user not validated.');
    }
};
exports.checkoutBranch = checkoutBranch;
const deleteBranch = async (status, context, socket, SOCKETID, branchName) => {
    const PAT = await (0, storage_1.getPAT)(context);
    const UID = await (0, storage_1.getEXTDATAINFOstorage)(context);
    if (!PAT || !UID) {
        vscode.window.showErrorMessage('NPM user not validated.');
        return;
    }
    ;
    if (status) {
        if (vscode.workspace.workspaceFolders) {
            const workspaceFolder = vscode.workspace.workspaceFolders[0];
            const workspaceFolderPath = workspaceFolder.uri.fsPath;
            const git = (0, simple_git_1.default)(workspaceFolderPath);
            const isRepo = await git.checkIsRepo();
            if (!isRepo) {
                return vscode.window.showErrorMessage('There is no Git repository initialized in this directory.');
            }
            try {
                // Eliminar la rama especificada
                await git.deleteLocalBranch(branchName);
                // Obtener la lista actualizada de ramas locales
                const branchSummary = await git.branchLocal();
                socket.emit('branchList', { to: SOCKETID, branchSummary });
                vscode.window.showInformationMessage(`Branch '${branchName}' deleted successfully.`);
            }
            catch (error) {
                vscode.window.showErrorMessage(`Error deleting branch: ${error.message}`);
            }
        }
        else {
            vscode.window.showInformationMessage('There are no folders in the workspace.');
        }
    }
    else {
        vscode.window.showErrorMessage('NPM user not validated.');
    }
};
exports.deleteBranch = deleteBranch;
const status = async (status, context, socket, SOCKETID) => {
    const PAT = await (0, storage_1.getPAT)(context);
    const UID = await (0, storage_1.getEXTDATAINFOstorage)(context);
    if (!PAT || !UID) {
        vscode.window.showErrorMessage('NPM user not validated.');
        return;
    }
    ;
    if (status) {
        if (vscode.workspace.workspaceFolders) {
            const workspaceFolder = vscode.workspace.workspaceFolders[0];
            const workspaceFolderPath = workspaceFolder.uri.fsPath;
            const git = (0, simple_git_1.default)(workspaceFolderPath);
            const isRepo = await git.checkIsRepo();
            if (!isRepo) {
                return vscode.window.showErrorMessage('There is no Git repository initialized in this directory.');
            }
            try {
                // Obtener el estado del repositorio
                let merging = '';
                const status = await git.status();
                const rawStatus = await git.raw(['status']);
                if (rawStatus.includes('All conflicts fixed but you are still merging.')) {
                    merging = 'All conflicts fixed but you are still merging, use "commit" to conclude merge';
                }
                ;
                socket.emit('status', { to: SOCKETID, status, merging });
            }
            catch (error) {
                vscode.window.showErrorMessage(`There was an error getting the status: ${error.message}`);
            }
        }
        else {
            vscode.window.showInformationMessage('There are no folders in the workspace.');
        }
    }
    else {
        vscode.window.showErrorMessage('NPM user not validated.');
    }
};
exports.status = status;
//# sourceMappingURL=git.js.map