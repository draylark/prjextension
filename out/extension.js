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
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const connection_1 = __importDefault(require("./sockets/connection"));
const auth_1 = require("./commands/auth/auth");
const storage_js_1 = require("./helpers/storage.js");
function activate(context) {
    // Uso de la función
    // clearSecretStorage2(context.secrets);
    const subscriptions = context.subscriptions;
    (0, connection_1.default)(context);
    // Authentication Commands
    let getPAT = vscode.commands.registerCommand('extension.getPAT', async () => {
        return await (0, storage_js_1.getPATstorage)(context);
    });
    let getPRJUID = vscode.commands.registerCommand('extension.PRJUID', async () => {
        return await (0, storage_js_1.getEXTUSERstorage)(context);
    });
    let authenticateCommand = vscode.commands.registerCommand('extension.authenticate', async () => {
        return await (0, auth_1.authenticate)(context);
    });
    let getEXTUSERDATA = vscode.commands.registerCommand('extension.getEXTDATA', async () => {
        const data = await (0, storage_js_1.getEXTDATAINFOstorage)(context);
        console.log('Impresion desde el comando', data);
    });
    subscriptions.push(authenticateCommand, getPAT, getPRJUID, getEXTUSERDATA);
}
exports.activate = activate;
// This method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map