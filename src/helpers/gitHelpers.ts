import { createWriteStream, readdirSync, mkdirSync } from "fs";
// import path from "path";
// import archiver from "archiver";
// import globby from "globby";
import path = require('path');
import archiver = require('archiver');
import globby = require('globby');
import { handlePull, handlePush, handleClone } from "./urlHelpers.js";
import * as vscode from 'vscode';
import { SimpleGit } from "simple-git";
import { ReqData } from "../types/commands_types.js";
import { isReqCloneData, isReqPullData, isReqPushData } from "../types/checkers.js";


interface Error {
    message: string;
}


export const packageRepository = ( workspaceFolderPath: string ): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        const outputPath = path.join(workspaceFolderPath, 'repository.zip');
        const output = createWriteStream(outputPath);
        const archive = archiver('zip', { zlib: { level: 5 } });

        output.on('close', () => resolve(outputPath));
        output.on('error', (err) => reject(err));
        archive.on('error', (err) => reject(err));

        try {
            // Utiliza globby para obtener todos los archivos y carpetas, incluyendo .git
            const files = await globby(['**', '**/.*'], {
                cwd: workspaceFolderPath,
                dot: true, // Esto incluye archivos y carpetas que comienzan con un punto (.)
                ignore: ['repository.zip'] // Ignora el propio archivo ZIP que se está creando
            });

            files.forEach(file => {
                archive.file(path.join(workspaceFolderPath, file), { name: file });
            });

            archive.pipe(output);
            archive.finalize();
        } catch (error) {
            reject(error);
        }
    });
};

export const requestAccess = async ( PAT: string, UID: string, TOKEN: string, type: string, data: ReqData ) => { 
    switch (type) {
        case 'push':    
            if (isReqPushData(data)) {
                return await handlePush(PAT, UID, TOKEN, data);
            };
            break;
        case 'pull':
            if (isReqPullData(data)) {
                return await handlePull(PAT, UID, TOKEN, data);
            };
            break;   
        case 'clone':
            if (isReqCloneData(data)) {
                return await handleClone(PAT, UID, TOKEN, data);
            };
            break;
        default:
            break;
    };
};

export const handlePullAccess = async ( access: string, branch: string, git: SimpleGit, workspaceFolderPath: string ) => {
    try {
        const commandParts = ['pull', '--allow-unrelated-histories', access, branch]; 
        await git.raw(commandParts);
        vscode.window.showInformationMessage('Successfully pulled from the remote repository.');
    } catch (error) {
        const Error = error as Error;

        // Detect specific error of local changes that would be overwritten by merge
        if (Error.message.includes('Your local changes to the following files would be overwritten by merge')) {
            vscode.window.showErrorMessage('There are local changes that would be overwritten by the pull. Please commit your changes before continuing.');
        } else {
            // Show a generic error message if it's not the specific error we're looking for
            vscode.window.showErrorMessage('Error processing the pull request');
        };  
    };
};

export const handleCloneAccess = async ( access: string, git: SimpleGit, repoName: string, workspaceFolderPath: string, branch: string | undefined ) => {
    try {
        // Verificar la existencia de la rama en el repositorio remoto
        const remoteBranches = await git.listRemote(['--heads', access]);
        if (branch && !remoteBranches.includes(`refs/heads/${branch}`)) {
            return vscode.window.showErrorMessage(`The branch '${branch}' does not exist in the remote repository.`);
        };;

        let cloneOptions = branch ? ['-b', branch] : [];

        if (readdirSync(workspaceFolderPath).length === 0) {
            await git.clone(access, workspaceFolderPath, cloneOptions);
            vscode.window.showInformationMessage('Repository successfully cloned.');
        } else {
            // The directory is not empty, create a new directory with the name of the repository
            workspaceFolderPath = path.join(workspaceFolderPath, repoName);
            mkdirSync(workspaceFolderPath, { recursive: true });
            await git.clone(access, workspaceFolderPath, cloneOptions);
            vscode.window.showInformationMessage( 'Repository cloned succesfully.' );
        };
    } catch (error) {
        const Error = error as Error;
        vscode.window.showErrorMessage(`Error cloning the repository: ${Error.message}`);
    };
};
