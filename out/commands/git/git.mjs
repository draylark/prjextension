import * as vscode from 'vscode';
import simpleGit from 'simple-git';
import { getPAT, getEXTDATAINFOstorage, getToken } from '../../helpers/storage.js';
import { handleCloneAccess, handlePullAccess, packageRepository, requestAccess } from '../../helpers/gitHelpers.js';
import { unlink } from 'fs';
const getRemoteUrl = async (git, remoteName) => {
    const remotes = await git.getRemotes(true);
    const remote = remotes.find(r => r.name === remoteName);
    return remote ? remote.refs.fetch : null;
};
export const initGitRepository = async (status) => {
    if (status) {
        if (vscode.workspace.workspaceFolders) {
            const workspaceFolder = vscode.workspace.workspaceFolders[0];
            const workspaceFolderPath = workspaceFolder.uri.fsPath;
            try {
                // Creates a new simple-git instance in the current working directory
                const git = simpleGit(workspaceFolderPath);
                // Initialize a new Git repository in the current working directory
                await git.init();
                vscode.window.showInformationMessage('Git repository successfully initialized in the workspace.');
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while initializing the Git repository.';
                vscode.window.showErrorMessage(`Error initializing the Git repository: ${errorMessage}`);
            }
            ;
        }
        else {
            vscode.window.showInformationMessage('There are no folders in the workspace.');
        }
        ;
    }
    else {
        vscode.window.showErrorMessage('NPM user not validated.');
    }
    ;
};
export const addFilesToGit = async (status) => {
    if (status) {
        if (vscode.workspace.workspaceFolders) {
            const workspaceFolder = vscode.workspace.workspaceFolders[0];
            const workspaceFolderPath = workspaceFolder.uri.fsPath;
            try {
                const git = simpleGit(workspaceFolderPath);
                // Checks if the current working directory is a Git repository
                const isRepo = await git.checkIsRepo();
                if (!isRepo) {
                    return vscode.window.showErrorMessage('There is no Git repository initialized in this directory.');
                }
                // Add all files to the staging area
                await git.add('.');
                vscode.window.showInformationMessage('Files successfully added to staging.');
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while adding files to staging.';
                vscode.window.showErrorMessage(`Error adding files to staging: ${errorMessage}`);
            }
            ;
        }
        else {
            vscode.window.showInformationMessage('There are no folders in the workspace.');
        }
        ;
    }
    else {
        vscode.window.showErrorMessage('NPM user not validated.');
    }
    ;
};
export const commitChanges = async (commitMessage, status) => {
    if (status) {
        if (vscode.workspace.workspaceFolders) {
            const workspaceFolder = vscode.workspace.workspaceFolders[0];
            const workspaceFolderPath = workspaceFolder.uri.fsPath;
            try {
                const git = simpleGit(workspaceFolderPath);
                const isRepo = await git.checkIsRepo();
                if (!isRepo) {
                    return vscode.window.showErrorMessage('There is no Git repository initialized in this directory.');
                }
                ;
                // Check if a merge is in progress
                const mergeInProgress = await git.raw(['rev-parse', '--verify', '--quiet', 'MERGE_HEAD']);
                if (mergeInProgress) {
                    await git.commit(commitMessage);
                    vscode.window.showInformationMessage(`Merge successfully committed with message: "${commitMessage}"`);
                    return;
                }
                ;
                // Get the status of the working directory
                const status = await git.status();
                if (status.files.length === 0) {
                    return vscode.window.showInformationMessage('There are no changes to commit. No files were added to the staging area.');
                }
                ;
                // Commit the changes with the specified message
                await git.commit(commitMessage);
                vscode.window.showInformationMessage(`Changes successfully committed with message: "${commitMessage}"`);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while committing the changes.';
                vscode.window.showErrorMessage(`Error committing the changes: ${errorMessage}`);
            }
            ;
        }
        else {
            vscode.window.showInformationMessage('There are no folders in the workspace.');
        }
        ;
    }
    else {
        vscode.window.showErrorMessage('NPM user not validated.');
    }
    ;
};
export const handleRemotes = async (data, status, socket, context) => {
    const PAT = await getPAT(context);
    const UID = await getEXTDATAINFOstorage(context);
    if (!PAT || !UID) {
        vscode.window.showErrorMessage('NPM user not validated.');
        return;
    }
    ;
    if (status) {
        if (vscode.workspace.workspaceFolders) {
            const workspaceFolder = vscode.workspace.workspaceFolders[0];
            const workspaceFolderPath = workspaceFolder.uri.fsPath;
            const git = simpleGit(workspaceFolderPath);
            const isRepo = await git.checkIsRepo();
            if (!isRepo) {
                return vscode.window.showErrorMessage('There is no Git repository initialized in this directory.');
            }
            ;
            try {
                switch (data.type) {
                    case 'get':
                        const remotes = await git.getRemotes(true);
                        socket.emit('remotesList', { to: data.NPMUSER.SOCKETID, remotes });
                        break;
                    case 'add':
                        const addData = data;
                        const existingRemotes = await git.getRemotes(true);
                        const isRemoteExist = existingRemotes.some(remote => remote.name === addData.remoteName);
                        if (!isRemoteExist) {
                            await git.addRemote(addData.remoteName, addData.remoteUrl);
                            socket.emit('remotesList', { to: addData.NPMUSER.SOCKETID, remotes: await git.getRemotes(true) });
                            vscode.window.showInformationMessage(`Remote '${addData.remoteName}' successfully added.`);
                        }
                        else {
                            socket.emit('remotesList', { to: addData.NPMUSER.SOCKETID, remotes: await git.getRemotes(true) });
                            vscode.window.showInformationMessage(`The remote '${addData.remoteName}' already exists and therefore cannot be added.`);
                        }
                        break;
                    case 'remove':
                        const removeData = data;
                        const existingRemotesForRemove = await git.getRemotes(true);
                        const isRemoteExistForRemove = existingRemotesForRemove.some(remote => remote.name === removeData.remoteName);
                        if (isRemoteExistForRemove) {
                            await git.removeRemote(removeData.remoteName);
                            socket.emit('remotesList', { to: removeData.NPMUSER.SOCKETID, remotes: await git.getRemotes(true) });
                            vscode.window.showInformationMessage(`Remote '${removeData.remoteName}' successfully removed.`);
                        }
                        else {
                            socket.emit('remotesList', { to: removeData.NPMUSER.SOCKETID, remotes: await git.getRemotes(true) });
                            vscode.window.showInformationMessage(`The remote '${removeData.remoteName}' does not exist and therefore cannot be removed.`);
                        }
                        break;
                    default:
                        break;
                }
                ;
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while handling the remotes.';
                vscode.window.showErrorMessage(`Error handling remotes: ${errorMessage}`);
                socket.emit('remotesList', { to: data.NPMUSER.SOCKETID, remotes: await git.getRemotes(true) });
            }
            ;
        }
        else {
            vscode.window.showInformationMessage('There are no folders in the workspace.');
        }
        ;
    }
    else {
        vscode.window.showErrorMessage('NPM user not validated.');
    }
    ;
};
export const pushToRemote = async (status, context, remoteName, taskId) => {
    const PAT = await getPAT(context);
    const UID = await getEXTDATAINFOstorage(context);
    const token = await getToken(context);
    const type = 'push';
    if (!PAT || !UID || !token) {
        vscode.window.showErrorMessage('NPM user not validated.');
        return;
    }
    ;
    if (status) {
        if (vscode.workspace.workspaceFolders) {
            const workspaceFolder = vscode.workspace.workspaceFolders[0];
            const workspaceFolderPath = workspaceFolder.uri.fsPath;
            const git = simpleGit(workspaceFolderPath);
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
            ;
            // Si no se ha seleccionado un remoto y hay múltiples remotos, usar 'origin' por defecto
            if (!selectedRemoteName) {
                selectedRemoteName = 'origin';
            }
            ;
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
            ;
            const branchSummary = await git.branchLocal();
            const filePath = await packageRepository(workspaceFolderPath);
            const data = { type, remoteUrl, filePath, branch: branchSummary.current, taskId };
            console.log('data:', data);
            requestAccess(PAT, UID, token, type, data).then(async (access) => {
                if (access.success) {
                    vscode.window.showInformationMessage(access.message || 'Push executed successfully.');
                    unlink(filePath, (err) => { if (err) {
                        throw err;
                    } });
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
    ;
};
export const pullFromRemote = async (status, context, remoteName) => {
    const PAT = await getPAT(context);
    const UID = await getEXTDATAINFOstorage(context);
    const token = await getToken(context);
    const type = 'pull';
    if (!PAT || !UID || !token) {
        vscode.window.showErrorMessage('NPM user not validated.');
        return;
    }
    ;
    if (status) {
        if (vscode.workspace.workspaceFolders) {
            const workspaceFolder = vscode.workspace.workspaceFolders[0];
            const workspaceFolderPath = workspaceFolder.uri.fsPath;
            const git = simpleGit(workspaceFolderPath);
            const isRepo = await git.checkIsRepo();
            if (!isRepo) {
                return vscode.window.showErrorMessage('There is no Git repository initialized in this directory.');
            }
            ;
            // Obtener la lista de remotos configurados
            const remotes = await git.getRemotes();
            let selectedRemoteName = remoteName;
            // Si solo hay un remoto y no se proporcionó un remoteName, usar ese único remoto
            if (!selectedRemoteName && remotes.length === 1) {
                selectedRemoteName = remotes[0].name;
            }
            ;
            // Si no se ha seleccionado un remoto y hay múltiples remotos, usar 'origin' por defecto
            if (!selectedRemoteName) {
                selectedRemoteName = 'origin';
            }
            ;
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
            ;
            const branchSummary = await git.branchLocal();
            const data = { type, remoteUrl, branch: branchSummary.current };
            requestAccess(PAT, UID, token, type, data).then(async (access) => {
                if (access.success) {
                    await handlePullAccess(access.access, branchSummary.current, git, workspaceFolderPath);
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
    ;
};
export const cloneRepository = async (repoUrl, status, context, branch) => {
    const PAT = await getPAT(context);
    const UID = await getEXTDATAINFOstorage(context);
    const token = await getToken(context);
    const type = 'clone';
    if (!PAT || !UID || !token) {
        vscode.window.showErrorMessage('NPM user not validated.');
        return;
    }
    ;
    if (status) {
        if (vscode.workspace.workspaceFolders) {
            const workspaceFolder = vscode.workspace.workspaceFolders[0];
            let workspaceFolderPath = workspaceFolder.uri.fsPath;
            const git = simpleGit(workspaceFolderPath);
            const data = { type, remoteUrl: repoUrl, branch };
            requestAccess(PAT, UID, token, type, data).then(async (access) => {
                if (access.success) {
                    await handleCloneAccess(access.access, git, access.repoName, workspaceFolderPath, branch);
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
export const listBranch = async (status, context, socket, SOCKETID) => {
    const PAT = await getPAT(context);
    const UID = await getEXTDATAINFOstorage(context);
    if (!PAT || !UID) {
        vscode.window.showErrorMessage('NPM user not validated.');
        return;
    }
    ;
    if (status) {
        if (vscode.workspace.workspaceFolders) {
            const workspaceFolder = vscode.workspace.workspaceFolders[0];
            const workspaceFolderPath = workspaceFolder.uri.fsPath;
            const git = simpleGit(workspaceFolderPath);
            const isRepo = await git.checkIsRepo();
            if (!isRepo) {
                return vscode.window.showErrorMessage('There is no Git repository initialized in this directory.');
            }
            ;
            try {
                // Obtener la lista de ramas locales
                const branchSummary = await git.branchLocal();
                socket.emit('branchList', { to: SOCKETID, branchSummary });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while listing branches.';
                vscode.window.showErrorMessage(`Error listing branches: ${errorMessage}`);
            }
            ;
        }
        else {
            vscode.window.showInformationMessage('There are no folders in the workspace.');
        }
        ;
    }
    else {
        vscode.window.showErrorMessage('NPM user not validated.');
    }
    ;
};
export const createBranch = async (status, context, socket, SOCKETID, branchName) => {
    const PAT = await getPAT(context);
    const UID = await getEXTDATAINFOstorage(context);
    if (!PAT || !UID) {
        vscode.window.showErrorMessage('NPM user not validated.');
        return;
    }
    ;
    if (status) {
        if (vscode.workspace.workspaceFolders) {
            const workspaceFolder = vscode.workspace.workspaceFolders[0];
            const workspaceFolderPath = workspaceFolder.uri.fsPath;
            const git = simpleGit(workspaceFolderPath);
            const isRepo = await git.checkIsRepo();
            if (!isRepo) {
                return vscode.window.showErrorMessage('There is no Git repository initialized in this directory.');
            }
            ;
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
                const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while creating the branch.';
                vscode.window.showErrorMessage(`Error creating branch '${branchName}': ${errorMessage}`);
            }
            ;
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
export const checkoutBranch = async (status, context, socket, SOCKETID, branchName) => {
    const PAT = await getPAT(context);
    const UID = await getEXTDATAINFOstorage(context);
    if (!PAT || !UID) {
        vscode.window.showErrorMessage('NPM user not validated.');
        return;
    }
    ;
    if (status) {
        if (vscode.workspace.workspaceFolders) {
            const workspaceFolder = vscode.workspace.workspaceFolders[0];
            const workspaceFolderPath = workspaceFolder.uri.fsPath;
            const git = simpleGit(workspaceFolderPath);
            const isRepo = await git.checkIsRepo();
            if (!isRepo) {
                return vscode.window.showErrorMessage('There is no Git repository initialized in this directory.');
            }
            ;
            try {
                // Cambiar a la rama especificada
                await git.checkout(branchName);
                // Obtener la lista actualizada de ramas locales
                const branchSummary = await git.branchLocal();
                socket.emit('branchList', { to: SOCKETID, branchSummary });
                vscode.window.showInformationMessage(`Switched to branch '${branchName}' successfully.`);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while switching branches.';
                vscode.window.showErrorMessage(`Error switching to branch '${branchName}': ${errorMessage}`);
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
export const deleteBranch = async (status, context, socket, SOCKETID, branchName) => {
    const PAT = await getPAT(context);
    const UID = await getEXTDATAINFOstorage(context);
    if (!PAT || !UID) {
        vscode.window.showErrorMessage('NPM user not validated.');
        return;
    }
    ;
    if (status) {
        if (vscode.workspace.workspaceFolders) {
            const workspaceFolder = vscode.workspace.workspaceFolders[0];
            const workspaceFolderPath = workspaceFolder.uri.fsPath;
            const git = simpleGit(workspaceFolderPath);
            const isRepo = await git.checkIsRepo();
            if (!isRepo) {
                return vscode.window.showErrorMessage('There is no Git repository initialized in this directory.');
            }
            ;
            try {
                // Obtener la lista actual de ramas locales
                const branchSummary = await git.branchLocal();
                if (branchSummary.all.includes(branchName) && branchName !== branchSummary.current) {
                    await git.deleteLocalBranch(branchName, true); // El segundo argumento `true` fuerza la eliminación si es necesario
                    vscode.window.showInformationMessage(`Branch '${branchName}' deleted successfully.`);
                    const updatedBranchSummary = await git.branchLocal();
                    socket.emit('branchList', { to: SOCKETID, branchSummary: updatedBranchSummary });
                }
                else {
                    const branchSummary = await git.branchLocal();
                    socket.emit('branchList', { to: SOCKETID, branchSummary: branchSummary });
                    vscode.window.showErrorMessage(`The branch '${branchName}' does not exist in the local repository, or it is the current branch and therefore cannot be deleted.`);
                }
                ;
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while deleting the branch.';
                vscode.window.showErrorMessage(`Error deleting branch '${branchName}': ${errorMessage}`);
            }
            ;
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
export const status = async (status, context, socket, SOCKETID) => {
    const PAT = await getPAT(context);
    const UID = await getEXTDATAINFOstorage(context);
    if (!PAT || !UID) {
        vscode.window.showErrorMessage('NPM user not validated.');
        return;
    }
    ;
    if (status) {
        if (vscode.workspace.workspaceFolders) {
            const workspaceFolder = vscode.workspace.workspaceFolders[0];
            const workspaceFolderPath = workspaceFolder.uri.fsPath;
            const git = simpleGit(workspaceFolderPath);
            const isRepo = await git.checkIsRepo();
            if (!isRepo) {
                return vscode.window.showErrorMessage('There is no Git repository initialized in this directory.');
            }
            ;
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
                const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while retrieving the repository status.';
                vscode.window.showErrorMessage(`Error retrieving the repository status: ${errorMessage}`);
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
//# sourceMappingURL=git.mjs.map