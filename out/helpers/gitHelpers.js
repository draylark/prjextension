"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCloneAccess = exports.handlePullAccess = exports.requestAccess = exports.packageRepository = void 0;
const fs_1 = require("fs");
// import path from "path";
// import archiver from "archiver";
// import globby from "globby";
const path = require("path");
const archiver = require("archiver");
const globby = require("globby");
const urlHelpers_js_1 = require("./urlHelpers.js");
const vscode = require("vscode");
const checkers_js_1 = require("../types/checkers.js");
const packageRepository = (workspaceFolderPath) => {
    return new Promise(async (resolve, reject) => {
        const outputPath = path.join(workspaceFolderPath, 'repository.zip');
        const output = (0, fs_1.createWriteStream)(outputPath);
        const archive = archiver('zip', { zlib: { level: 5 } });
        output.on('close', () => resolve(outputPath));
        output.on('error', (err) => reject(err));
        archive.on('error', (err) => reject(err));
        try {
            // Utiliza globby para obtener todos los archivos y carpetas, incluyendo .git
            const files = await globby(['**', '**/.*'], {
                cwd: workspaceFolderPath,
                dot: true,
                ignore: ['repository.zip'] // Ignora el propio archivo ZIP que se está creando
            });
            files.forEach(file => {
                archive.file(path.join(workspaceFolderPath, file), { name: file });
            });
            archive.pipe(output);
            archive.finalize();
        }
        catch (error) {
            reject(error);
        }
    });
};
exports.packageRepository = packageRepository;
const requestAccess = async (PAT, UID, TOKEN, type, data) => {
    switch (type) {
        case 'push':
            if ((0, checkers_js_1.isReqPushData)(data)) {
                return await (0, urlHelpers_js_1.handlePush)(PAT, UID, TOKEN, data);
            }
            ;
            break;
        case 'pull':
            if ((0, checkers_js_1.isReqPullData)(data)) {
                return await (0, urlHelpers_js_1.handlePull)(PAT, UID, TOKEN, data);
            }
            ;
            break;
        case 'clone':
            if ((0, checkers_js_1.isReqCloneData)(data)) {
                return await (0, urlHelpers_js_1.handleClone)(PAT, UID, TOKEN, data);
            }
            ;
            break;
        default:
            break;
    }
    ;
};
exports.requestAccess = requestAccess;
const handlePullAccess = async (access, branch, git, workspaceFolderPath) => {
    try {
        const commandParts = ['pull', '--allow-unrelated-histories', access, branch];
        await git.raw(commandParts);
        vscode.window.showInformationMessage('Successfully pulled from the remote repository.');
    }
    catch (error) {
        const Error = error;
        // Detect specific error of local changes that would be overwritten by merge
        if (Error.message.includes('Your local changes to the following files would be overwritten by merge')) {
            vscode.window.showErrorMessage('There are local changes that would be overwritten by the pull. Please commit your changes before continuing.');
        }
        else {
            // Show a generic error message if it's not the specific error we're looking for
            vscode.window.showErrorMessage('Error processing the pull request');
        }
        ;
    }
    ;
};
exports.handlePullAccess = handlePullAccess;
const handleCloneAccess = async (access, git, repoName, workspaceFolderPath, branch) => {
    try {
        // Verificar la existencia de la rama en el repositorio remoto
        const remoteBranches = await git.listRemote(['--heads', access]);
        if (branch && !remoteBranches.includes(`refs/heads/${branch}`)) {
            return vscode.window.showErrorMessage(`The branch '${branch}' does not exist in the remote repository.`);
        }
        ;
        ;
        let cloneOptions = branch ? ['-b', branch] : [];
        if ((0, fs_1.readdirSync)(workspaceFolderPath).length === 0) {
            await git.clone(access, workspaceFolderPath, cloneOptions);
            vscode.window.showInformationMessage('Repository successfully cloned.');
        }
        else {
            // The directory is not empty, create a new directory with the name of the repository
            workspaceFolderPath = path.join(workspaceFolderPath, repoName);
            (0, fs_1.mkdirSync)(workspaceFolderPath, { recursive: true });
            await git.clone(access, workspaceFolderPath, cloneOptions);
            vscode.window.showInformationMessage('Repository cloned succesfully.');
        }
        ;
    }
    catch (error) {
        const Error = error;
        vscode.window.showErrorMessage(`Error cloning the repository: ${Error.message}`);
    }
    ;
};
exports.handleCloneAccess = handleCloneAccess;
//# sourceMappingURL=gitHelpers.js.map