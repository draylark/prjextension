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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const auth_1 = require("./commands/auth/auth");
const storage_js_1 = require("./helpers/storage.js");
const storage_js_2 = require("./helpers/storage.js");
const deleteAllUData_1 = require("./commands/data/deleteAllUData");
const connection_1 = __importStar(require("./sockets/connection"));
const startExtension_1 = require("./commands/data/startExtension");
function activate(context) {
    // clearFullExtData(context.secrets)
    const subscriptions = context.subscriptions;
    let socket;
    // Menu Commands
    let start = vscode.commands.registerCommand('extension.start', async () => {
        socket = await (0, connection_1.default)(context);
    });
    let close = vscode.commands.registerCommand('extension.close', async () => {
        (0, connection_1.disconnectSocket)(socket);
    });
    let getPersonalInformation = vscode.commands.registerCommand('extension.personalInformation', async () => {
        (0, storage_js_1.getPersonalUInfo)(context);
    });
    let deletetPersonalInformation = vscode.commands.registerCommand('extension.deletePersonalInformation', async () => {
        await (0, deleteAllUData_1.deleteAllUData)(socket, context);
        const response = await (0, storage_js_2.clearFullExtData)(context.secrets);
        if (!response) {
            return vscode.window.showInformationMessage('No personal information found.');
        }
        await (0, connection_1.disconnectSocket)(socket);
        socket = await (0, connection_1.default)(context);
    });
    let documentation = vscode.commands.registerCommand('extension.documentation', async () => {
        vscode.window.showInformationMessage('Documentation is not available yet.');
    });
    // Authentication Command
    let authenticateCommand = vscode.commands.registerCommand('extension.authenticate', async () => {
        return await (0, auth_1.authenticate)(context);
    });
    subscriptions.push(start, close, getPersonalInformation, deletetPersonalInformation, documentation, authenticateCommand, (0, startExtension_1.startExtension)(), (0, startExtension_1.interactiveMenu)());
}
exports.activate = activate;
// This method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map