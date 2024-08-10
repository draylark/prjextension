"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const auth_js_1 = require("./commands/auth/auth.js");
const storage_js_1 = require("./helpers/storage.js");
const storage_js_2 = require("./helpers/storage.js");
const deleteAllUData_js_1 = require("./commands/data/deleteAllUData.js");
const connection_js_1 = require("./sockets/connection.js");
const startExtension_js_1 = require("./commands/data/startExtension.js");
function activate(context) {
    // clearFullExtData(context.secrets)
    const subscriptions = context.subscriptions;
    let socket;
    // Menu Commands
    let start = vscode.commands.registerCommand('extension.start', async () => {
        socket = await (0, connection_js_1.connectToWebSocket)(context);
    });
    let close = vscode.commands.registerCommand('extension.close', async () => {
        (0, connection_js_1.disconnectSocket)(socket);
    });
    let getPersonalInformation = vscode.commands.registerCommand('extension.personalInformation', async () => {
        (0, storage_js_1.getPersonalUInfo)(context);
    });
    let deletetPersonalInformation = vscode.commands.registerCommand('extension.deletePersonalInformation', async () => {
        await (0, deleteAllUData_js_1.deleteAllUData)(socket, context);
        const response = await (0, storage_js_2.clearFullExtData)(context.secrets);
        if (!response) {
            return vscode.window.showInformationMessage('No personal information found.');
        }
        await (0, connection_js_1.disconnectSocket)(socket);
        socket = await (0, connection_js_1.connectToWebSocket)(context);
    });
    let documentation = vscode.commands.registerCommand('extension.documentation', async () => {
        vscode.window.showInformationMessage('Documentation is not available yet.');
    });
    // Authentication Command
    let authenticateCommand = vscode.commands.registerCommand('extension.authenticate', async () => {
        return await (0, auth_js_1.authenticate)(context);
    });
    subscriptions.push(start, close, getPersonalInformation, deletetPersonalInformation, documentation, authenticateCommand, (0, startExtension_js_1.startExtension)(), (0, startExtension_js_1.interactiveMenu)());
}
exports.activate = activate;
// This method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map