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
exports.isAuthenticated = exports.createAuthWebView = exports.getAuthFormHtml = void 0;
const vscode = __importStar(require("vscode"));
const axios_1 = __importDefault(require("axios"));
const getAuthFormHtml = async () => {
    return `
		<!DOCTYPE html>
		<html>
			<head>
				<style>
					body {
						font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
						margin: 0;
						padding: 0;
						display: flex;
						justify-content: center;
						align-items: center;
						height: 100vh;
						background-color: #f3f4f6;
					}
					.login-container {
						display: flex;
						flex-direction: column;
						max-width: 300px;
						text-align: center;
						box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
						padding: 25px;
						border-radius: 10px;
						background-color: #ffffff;
					}
					input[type="text"], input[type="password"] {
						width: 100%;
						padding: 12px;
						margin: 10px 0;
						border-radius: 5px;
						border: 1px solid #d1d5db;
						box-sizing: border-box;
					}
					button {
						width: 100%;
						padding: 12px;
						background-color: #4f46e5;
						color: white;
						border: none;
						border-radius: 5px;
						cursor: pointer;
						font-weight: bold;
						margin-top: 10px;
					}
					button:hover {
						background-color: #4338ca;
					}
					.login-container h2 {
						margin-bottom: 20px;
						color: #1f2937;
					}
				</style>

				<script>
					const vscode = acquireVsCodeApi();
				</script>

			</head>
			<body>
				<div class="login-container">
					<h2>Prjmanager</h2>
					<form id="loginForm">
						<input type="text" id="email" placeholder="email">
						<input type="password" id="password" placeholder="Password">
						<button type="submit">Login</button>
					</form>
				</div>

				<script>
					const form = document.getElementById('loginForm');
					form.addEventListener('submit', function(event) {
						event.preventDefault();
					
						const email = document.getElementById('email').value;
						const password = document.getElementById('password').value;
					
						// Enviar mensaje a la extensión
						vscode.postMessage({
							command: 'submit',
							email: email,
							password: password
						});
					});
				</script>
			</body>
		</html>
	`;
};
exports.getAuthFormHtml = getAuthFormHtml;
const createAuthWebView = async (context) => {
    const panel = vscode.window.createWebviewPanel('authView', 'Login', vscode.ViewColumn.One, {
        enableScripts: true
    });
    panel.webview.html = await (0, exports.getAuthFormHtml)();
    // Añade más lógica aquí si es necesario
    panel.webview.onDidReceiveMessage(async (message) => {
        switch (message.command) {
            case 'submit':
                const { email, password } = message;
                // Manejar las credenciales aquí
                try {
                    // Utiliza fetch o axios para enviar una solicitud al backend
                    const response = await axios_1.default.post('http://localhost:3000/api/auth/extension', { email, password });
                    const token = response.data.tokenJWT;
                    // Haz algo con el token
                    if (token) {
                        context.globalState.update('authToken', token);
                    }
                    console.log('Solicitud recibida', response);
                }
                catch (error) {
                    console.error('Error al enviar solicitud:', error);
                }
                break;
        }
    }, undefined, context.subscriptions);
};
exports.createAuthWebView = createAuthWebView;
const isAuthenticated = (context) => {
    const token = context.globalState.get('authToken');
    // Aquí podrías agregar lógica adicional para verificar si el token es válido
    return !!token; // Devuelve true si el token existe, false en caso contrario
};
exports.isAuthenticated = isAuthenticated;
//# sourceMappingURL=auth.js.map