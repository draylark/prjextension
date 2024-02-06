import * as vscode from 'vscode';
import { authenticate } from './commands/auth/auth';
import { getPersonalUInfo } from './helpers/storage.js';
import { clearFullExtData } from './helpers/storage.js';
import { deleteAllUData } from './commands/data/deleteAllUData';
import connectToWebSocket, { disconnectSocket } from './sockets/connection';
import { startExtension, interactiveMenu } from './commands/data/startExtension';


export function activate(context: vscode.ExtensionContext) {

    // clearFullExtData(context.secrets)
    const subscriptions = context.subscriptions;
    let socket;

    // Menu Commands

    let start = vscode.commands.registerCommand('extension.start', async () => {
        socket =  await connectToWebSocket(context);
    });

    let close = vscode.commands.registerCommand('extension.close', async () => {
        disconnectSocket(socket);
    });

    let getPersonalInformation = vscode.commands.registerCommand('extension.personalInformation', async () => {
        getPersonalUInfo(context);
    });

    let deletetPersonalInformation = vscode.commands.registerCommand('extension.deletePersonalInformation', async () => {
        await deleteAllUData(socket, context)
        const response = await clearFullExtData(context.secrets);
        if (!response) { return vscode.window.showInformationMessage('No personal information found.');}
        await disconnectSocket(socket);
        socket = await connectToWebSocket(context);
    });

    let documentation = vscode.commands.registerCommand('extension.documentation', async () => {
        vscode.window.showInformationMessage('Documentation is not available yet.');
    });

    // Authentication Command

    let authenticateCommand = vscode.commands.registerCommand('extension.authenticate', async() => {
        return await authenticate(context);
    });


    subscriptions.push( start, close, getPersonalInformation, deletetPersonalInformation, documentation, authenticateCommand, startExtension(), interactiveMenu());

}
// This method is called when your extension is deactivated
export function deactivate() {}
