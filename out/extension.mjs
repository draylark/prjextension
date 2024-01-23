// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { io } from 'socket.io-client';
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function connectToWebSocket() {
    const socket = io('http://localhost:8081');
    socket.on('connect', () => {
        console.log('Conectado al servidor socket en el puerto 8081!');
        vscode.window.showInformationMessage('Conectado al servidor socket en el puerto 8081!');
    });
    socket.on('disconnect', () => {
        console.log('Desconectado del servidor socket.');
        vscode.window.showInformationMessage('Desconectado del servidor socket.');
    });
    socket.on('error', (error) => {
        console.error('Error en la conexión de socket:', error);
        vscode.window.showErrorMessage(`Error en la conexión de socket: ${error}`);
    });
}
export function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.connectToWebSocket', () => {
        connectToWebSocket();
    });
    context.subscriptions.push(disposable);
}
// This method is called when your extension is deactivated
export function deactivate() { }
//# sourceMappingURL=extension.mjs.map