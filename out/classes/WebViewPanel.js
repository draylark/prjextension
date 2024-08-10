"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebViewPanel = void 0;
const vscode = require("vscode");
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