import * as vscode from 'vscode';
import connectToWebSocket from './sockets/connection';
import { login, authenticate } from './commands/auth/auth';
import { getPATstorage, getEXTUSERstorage, getEXTDATAINFOstorage } from './helpers/storage.js';
import { clearSecretStorage2 } from './helpers/storage.js';

export function activate(context: vscode.ExtensionContext) {

    // Uso de la función
    // clearSecretStorage2(context.secrets);

    const subscriptions = context.subscriptions;
    connectToWebSocket(context);


    // Authentication Commands

    let getPAT = vscode.commands.registerCommand('extension.getPAT', async () => {
         return await getPATstorage(context);
    });

    let getPRJUID = vscode.commands.registerCommand('extension.PRJUID', async () => {
         return await getEXTUSERstorage(context);
    });
    
    let authenticateCommand = vscode.commands.registerCommand('extension.authenticate', async() => {
        return await authenticate(context);
    });


    // Git Commands

    let getEXTUSERDATA = vscode.commands.registerCommand('extension.getEXTDATA', async() => {
        const data = await getEXTDATAINFOstorage(context);
        console.log('Impresion desde el comando', data);
    });



    subscriptions.push( authenticateCommand, getPAT, getPRJUID, getEXTUSERDATA);

}
// This method is called when your extension is deactivated
export function deactivate() {}
