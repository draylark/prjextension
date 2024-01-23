import { SimpleGit, LogResult } from "simple-git";
import { createWriteStream, createReadStream, readdirSync, existsSync, mkdirSync, rmSync, unlinkSync } from "fs";
import path from "path";
import archiver from "archiver";
import globby from "globby";
import { handlePull, handlePush, updateLastCommitInDatabase } from "./urlHelpers";
import unzipper from "unzipper";
import simpleGit from "simple-git";
import * as vscode from 'vscode';


export const packageRepository = (workspaceFolderPath) => {
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


export const getLastCommit = async (repoPath) => {
    const git = simpleGit(repoPath);

    try {
        const log = await git.log({ n: 1 });
        const lastCommit = log.latest;
        return {
            hash: lastCommit.hash,
            commitMessage: lastCommit.message
        };
    } catch (error) {
        console.error('Error al obtener el último commit:', error);
        throw error;
    }
};


export const getUnpushedCommits = async (git) => {
    try {
        // Obtener los hashes de los commits que están en el local pero no en ningún remoto
        const localCommits = await git.raw([
            'log', 
            '--pretty=format:%H', 
            'HEAD', 
            '--not', 
            '--remotes'
        ]);
        const unpushedCommits = localCommits.trim().split('\n');

        return unpushedCommits;
    } catch (error) {
        console.error('Error al obtener los commits no empujados:', error);
        throw error;
    }
};


export const applyPatch = async (workspaceFolder, patchFilePath, zipPath, UID, PAT) => {
    try {

        // Extraer el hash del último commit del remoto del nombre del archivo de parche
        // Asumiendo que el formato es siempre 'changes-<localHash>-to-<remoteHash>.patch'
        const remoteCommitHash = patchFilePath.match(/to-([0-9a-f]+)\.patch$/)[1];

        console.log(remoteCommitHash);
        // Crear una instancia de simple-git en el directorio del espacio de trabajo
        const git = simpleGit(workspaceFolder.uri.fsPath);

        // Aplicar el parche utilizando el comando raw
        // await git.raw(['apply', patchFilePath]);


        if (existsSync(zipPath)) {
            unlinkSync(zipPath);
        }

        if (existsSync(patchFilePath)) {
            unlinkSync(patchFilePath);
        }

        console.log(remoteCommitHash);
        // // Verificar el estado del repositorio
        const status = await git.status();
        if (status.conflicted.length > 0) {
            // Manejar conflictos
            vscode.window.showWarningMessage('Hay conflictos que resolver después de aplicar el parche.');
            // Aquí podrías abrir un diálogo para resolver conflictos o mostrar instrucciones
        } else {
            // Añadir cambios al área de staging y hacer commit
            const commitMessage = `Local repositorie updated to commit ${remoteCommitHash}`;
            // await git.add('.');
            // await git.commit(commitMessage);
            // vscode.window.showInformationMessage('Parche aplicado y cambios comprometidos con éxito.');

        //     // Actualizar el registro en MongoDB con el nuevo último commit (implementar esta función)
        await updateLastCommitInDatabase(remoteCommitHash, UID, PAT, commitMessage);
        }
    } catch (error) {
        console.error('Error al aplicar el parche:', error);
        vscode.window.showErrorMessage('Error al aplicar el parche: ' + error.message);
    }
};


export const requestAccess = async (PAT, UID, type, data ) => { 
    switch (type) {
        case 'push':    
            return await handlePush(PAT, UID, data);
            break;
        case 'pull':
            return await handlePull(PAT, UID, data);
            break;   
        default:
            break;
    }
};
// 2d4a6092ae7c8a74025681489edcfd44e1780f09
export const handleAccess = async (access, branch, git, path) => {
    try {
        console.log('Ejecutando git pull');
        const commandParts = ['pull', access, branch]; 
        await git.raw(commandParts);
        console.log('Pull ejecutado con éxito');
    } catch (error) {
        console.error('Error al procesar la solicitud de pull:', error);

        // Detectar el error específico de cambios locales que serían sobrescritos
        if (error.message.includes('Your local changes to the following files would be overwritten by merge')) {
            vscode.window.showErrorMessage('Error: Hay cambios locales que serían sobrescritos por el pull. Por favor, haz commit o stashea tus cambios antes de continuar.');
        } else {
            // Mostrar un mensaje de error genérico si no es el error específico que estamos buscando
            vscode.window.showErrorMessage('Error al procesar la solicitud de pull');
        }   
    }
};


// export const verifyZipContent = (zipPath, workspaceFolderPath) => {
//     return new Promise((resolve, reject) => {
//         const tempUnzipPath = path.join(workspaceFolderPath, 'tempUnzip');
//         if (!existsSync(tempUnzipPath)) {
//             mkdirSync(tempUnzipPath, { recursive: true });
//         }

//         createReadStream(zipPath)
//             .pipe(unzipper.Extract({ path: tempUnzipPath }))
//             .on('close', () => {
//                 console.log('Contenido del ZIP descomprimido:');
//                 const files = readdirSync(tempUnzipPath);
//                 console.log(files);
//                 // Limpieza: eliminar el directorio temporal
//                 rmSync(tempUnzipPath, { recursive: true, force: true });
//                 resolve();
//             })
//             .on('error', reject);
//     });
// };

