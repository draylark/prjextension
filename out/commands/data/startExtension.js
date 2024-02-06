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
exports.interactiveMenu = exports.startExtension = void 0;
const vscode = __importStar(require("vscode"));
const startExtension = () => {
    let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'extension.interactiveMenu'; // Comando que se ejecutará al hacer clic
    statusBarItem.text = "PrJExtension"; // Texto mostrado en el botón, $(rocket) es un icono
    statusBarItem.tooltip = "PrJExtension Options"; // Tooltip al pasar el mouse sobre el botón
    statusBarItem.show();
    return statusBarItem;
};
exports.startExtension = startExtension;
const interactiveMenu = () => {
    let disposable = vscode.commands.registerCommand('extension.interactiveMenu', () => {
        const quickPick = vscode.window.createQuickPick();
        quickPick.items = [
            { label: 'Start', description: 'Establishes the connection between the extension and the interactive console (PrJConsole User)' },
            { label: 'Close', description: 'Closes the connection between the extension and the interactive console (PrJConsole User)' },
            { label: 'Personal Information', description: 'Displays the personal information that the extension instance holds.' },
            { label: 'Delete Personal Information', description: 'Delete all the information that the instance holds about the user.' },
            { label: 'Documentation', description: 'Display the documentation available for the correct use of the extension.' },
        ];
        quickPick.onDidChangeSelection(selection => {
            switch (selection[0].label) {
                case 'Start':
                    vscode.commands.executeCommand('extension.start');
                    break;
                case 'Close':
                    vscode.commands.executeCommand('extension.close');
                    break;
                case 'Personal Information':
                    vscode.commands.executeCommand('extension.personalInformation');
                    break;
                case 'Delete Personal Information':
                    vscode.commands.executeCommand('extension.deletePersonalInformation');
                    break;
                case 'Documentation':
                    vscode.commands.executeCommand('extension.documentation');
                    break;
            }
        });
        quickPick.onDidHide(() => quickPick.dispose());
        quickPick.show();
    });
    return disposable;
};
exports.interactiveMenu = interactiveMenu;
//# sourceMappingURL=startExtension.js.map