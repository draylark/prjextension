import { createWriteStream, readdirSync, mkdirSync } from "fs";
import path from "path";
import archiver from "archiver";
import globby from "globby";
import { handlePull, handlePush, handleClone } from "./urlHelpers";
import * as vscode from 'vscode';


export const packageRepository = ( workspaceFolderPath ) => {
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

export const requestAccess = async ( PAT, UID, type, data ) => { 
    switch (type) {
        case 'push':    
            return await handlePush(PAT, UID, data);
            break;
        case 'pull':
            return await handlePull(PAT, UID, data);
            break;   
        case 'clone':
            return await handleClone(PAT, UID, data);
            break;
        default:
            break;
    }
};

export const handlePullAccess = async ( access, branch, git ) => {
    try {
        const commandParts = ['pull', access, branch]; 
        await git.raw(commandParts);
        vscode.window.showInformationMessage('Successfully pulled from the remote repository.');
    } catch (error) {
        // console.error('Error processing the pull request:', error);
        // Detect specific error of local changes that would be overwritten by merge
        if (error.message.includes('Your local changes to the following files would be overwritten by merge')) {
            vscode.window.showErrorMessage('There are local changes that would be overwritten by the pull. Please commit your changes before continuing.');
        } else {
            // Show a generic error message if it's not the specific error we're looking for
            vscode.window.showErrorMessage('Error processing the pull request');
        };  
    };
};

export const handleCloneAccess = async ( access, git, repoName, workspaceFolderPath, branch ) => {
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
        vscode.window.showErrorMessage(`Error cloning the repository: ${error.message}`);
    };
};
