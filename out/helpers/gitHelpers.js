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
exports.handleCloneAccess = exports.handlePullAccess = exports.requestAccess = exports.packageRepository = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const archiver_1 = __importDefault(require("archiver"));
const globby_1 = __importDefault(require("globby"));
const urlHelpers_1 = require("./urlHelpers");
const vscode = __importStar(require("vscode"));
const checkers_1 = require("../types/checkers");
const packageRepository = (workspaceFolderPath) => {
    return new Promise(async (resolve, reject) => {
        const outputPath = path_1.default.join(workspaceFolderPath, 'repository.zip');
        const output = (0, fs_1.createWriteStream)(outputPath);
        const archive = (0, archiver_1.default)('zip', { zlib: { level: 5 } });
        output.on('close', () => resolve(outputPath));
        output.on('error', (err) => reject(err));
        archive.on('error', (err) => reject(err));
        try {
            // Utiliza globby para obtener todos los archivos y carpetas, incluyendo .git
            const files = await (0, globby_1.default)(['**', '**/.*'], {
                cwd: workspaceFolderPath,
                dot: true, // Esto incluye archivos y carpetas que comienzan con un punto (.)
                ignore: ['repository.zip'] // Ignora el propio archivo ZIP que se está creando
            });
            files.forEach(file => {
                archive.file(path_1.default.join(workspaceFolderPath, file), { name: file });
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
const requestAccess = async (PAT, UID, type, data) => {
    switch (type) {
        case 'push':
            if ((0, checkers_1.isReqPushData)(data)) {
                return await (0, urlHelpers_1.handlePush)(PAT, UID, data);
            }
            ;
            break;
        case 'pull':
            if ((0, checkers_1.isReqPullData)(data)) {
                return await (0, urlHelpers_1.handlePull)(PAT, UID, data);
            }
            ;
            break;
        case 'clone':
            if ((0, checkers_1.isReqCloneData)(data)) {
                return await (0, urlHelpers_1.handleClone)(PAT, UID, data);
            }
            ;
            break;
        default:
            break;
    }
};
exports.requestAccess = requestAccess;
const handlePullAccess = async (access, branch, git, workspaceFolderPath) => {
    try {
        const commandParts = ['pull', access, branch];
        await git.raw(commandParts);
        vscode.window.showInformationMessage('Successfully pulled from the remote repository.');
    }
    catch (error) {
        // console.error('Error processing the pull request:', error);
        // Detect specific error of local changes that would be overwritten by merge
        if (error.message.includes('Your local changes to the following files would be overwritten by merge')) {
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
            workspaceFolderPath = path_1.default.join(workspaceFolderPath, repoName);
            (0, fs_1.mkdirSync)(workspaceFolderPath, { recursive: true });
            await git.clone(access, workspaceFolderPath, cloneOptions);
            vscode.window.showInformationMessage('Repository cloned succesfully.');
        }
        ;
    }
    catch (error) {
        vscode.window.showErrorMessage(`Error cloning the repository: ${error.message}`);
    }
    ;
};
exports.handleCloneAccess = handleCloneAccess;
//# sourceMappingURL=gitHelpers.js.map