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
exports.showAuthenticatingView = exports.displayView = exports.currentPanel = void 0;
const vscode = __importStar(require("vscode"));
exports.currentPanel = undefined;
const displayView = (content) => {
    if (exports.currentPanel) {
        exports.currentPanel.webview.html = content;
        exports.currentPanel.reveal(vscode.ViewColumn.One);
    }
    else {
        exports.currentPanel = vscode.window.createWebviewPanel('authView', 'Authenticate', vscode.ViewColumn.One, {
            enableScripts: true
        });
        exports.currentPanel.webview.html = content;
        exports.currentPanel.onDidDispose(() => { exports.currentPanel = undefined; }, null, []);
    }
};
exports.displayView = displayView;
const showAuthenticatingView = (ID) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Socket Connection</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                    color: #f8f8f2;
                    background-color: #282a36;
                }
                .container {
                    background-color: ##282a36;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                h1 {
                    margin-bottom: 5px; /* Reduce el margen debajo del h1 */
                }
                .id {
                    display: flex;
                    align-items: center; /* Alinea los elementos en la línea de base */
                    margin-bottom: 25px; /* Margen debajo del ID */
                }
                .id h2 {
                    font-size: 1em;
                    color: #50fa7b;
                    margin: 0; /* Elimina los márgenes predeterminados */
                }
                .id span {
                    margin-left: 10px;
                    font-size: 1em;
                    color: #50fa7b;
                }
                p {
                    font-size: 1em;
                    color: #bd93f9; /* Color del texto del párrafo */
                }
                .instructions-title {
                    color: #ffffff; /* Color blanco para el título */
                    margin-bottom: 5px; /* Espaciado después del título */
                }
                .instructions {
                    color: #bd93f9; /* Color del texto de las instrucciones */
                    margin-bottom: 10px; /* Espaciado después de las instrucciones */
                }
                .highlighted-text {
                    color: #8be9fd; /* Un color azul claro, por ejemplo */
                    font-weight: bold; /* Opcional: hace el texto en negrita */
                }

                .spinner {
                    border: 4px solid rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    border-top: 4px solid #fff;
                    width: 16px; /* Tamaño reducido */
                    height: 16px; /* Tamaño reducido */
                    animation: spin 2s linear infinite;
                    margin-left: 10px; /* Margen izquierdo más pronunciado */
                }

                .authResponse {
                    margin-left: 10px; /* Margen izquierdo más pronunciado */
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .header {
                    display: flex;
                    align-items: center;
                }
                
            </style>
            <script>
                const vscode = acquireVsCodeApi();
                
                window.addEventListener('message', event => {
                    console.log("Mensaje recibido:", event.data);
                    const message = event.data;
                    switch (message.command) {
                        case 'updateId':
                            document.querySelector('.id span').textContent = message.id;
                            break;
                        case 'showSpinner':
                            document.querySelector('.spinner').style.display = 'block';
                            break;
                        case 'hideSpinner':
                            document.querySelector('.spinner').style.display = 'none';
                            break;
                        case 'showAuthResponse':
                            document.querySelector('.authResponse').style.display = 'block';
                            document.querySelector('.authResponse').style.color = message.success ? '#50fa7b' : '#ff5555';
                            document.querySelector('.id').style.display = message.success ? 'none' : 'flex';
                            document.querySelector('.authResponse').textContent = message.authResponse;
                            break;
                        case 'hideAuthResponse':
                            document.querySelector('.authResponse').style.display = 'none';
                            break;
                    }
                });
            </script>
        </head>
            <body>
                <div class="container">
                    <h4>PrJManager Extension</h4>

                    <div class="header">
                        <h1>Authenticate</h1>
                        <div class="spinner" style="display: none;"></div> <!-- Spinner oculto inicialmente -->
                        <span class="authResponse" style="display: none;"></span> <!-- Respuesta oculta inicialmente -->
                    </div>

                    <div class="id">
                        <h2>Extension ID:</h2>
                        <span>${ID}</span>
                    </div>

                    <div class="instructions-title">Authentication Instructions:</div>
                    <div class="instructions">
                        1. Install the PrJManager interactive console by running <span class='highlighted-text'>'npm install prjmanager'</span> in the command line.<br>
                        2. Execute the command <span class='highlighted-text'>'prj init'</span> in the command line.<br>
                        3. Choose the <span class='highlighted-text'>'register'</span> option.<br>
                        4. Copy and enter the extension ID when prompted.<br>
                        5. Choose the <span class='highlighted-text'>'authenticate'</span> option.<br>
                        6. Authenticate with the email address you used to create your account on PrJManager.<br>
                    </div>
                                 
                </div>
            </body>
        </html>
    `;
};
exports.showAuthenticatingView = showAuthenticatingView;
//# sourceMappingURL=views.js.map