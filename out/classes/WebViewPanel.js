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
exports.WebViewPanel = void 0;
const vscode = __importStar(require("vscode"));
class WebViewPanel {
    panel;
    static currentPanel;
    static createOrShow(extensionUri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        if (WebViewPanel.currentPanel) {
            WebViewPanel.currentPanel.panel.reveal(column);
            return;
        }
        const panel = vscode.window.createWebviewPanel('webView', 'Socket Connection ID', column || vscode.ViewColumn.One, {});
        WebViewPanel.currentPanel = new WebViewPanel(panel, extensionUri);
    }
    constructor(panel, extensionUri) {
        this.panel = panel;
        this.panel.webview.html = this.getHtmlForWebview(extensionUri);
    }
    getHtmlForWebview(extensionUri) {
        // Aquí va el HTML de la vista, incluyendo las instrucciones y el ID de conexión.
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Socket Connection</title>
            </head>
            <body>
                <h1>ID de Conexión: [Aquí va el ID]</h1>
                <p>Instrucciones para autenticarse...</p>
            </body>
            </html>`;
    }
}
exports.WebViewPanel = WebViewPanel;
//# sourceMappingURL=WebViewPanel.js.map