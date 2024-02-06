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
exports.handleAuthResponseAfterReset = exports.handleAuthResponse = void 0;
const vscode = __importStar(require("vscode"));
const storage_1 = require("./storage");
const views_1 = require("../views/views");
const temporalServer_1 = require("./temporalServer");
const handleAuthResponse = async (response, FRONTENDID, context) => {
    switch (response.status) {
        case 200: // Success
            const dataToStore = { PAT: response.data.pat, PRJACCUID: response.data.user.uid, name: response.data.user.username, email: response.data.user.email };
            const personalUInfo = { PRJACCUID: response.data.user.uid, email: response.data.user.email };
            await (0, storage_1.saveTemporalExtData)(dataToStore, context);
            await (0, storage_1.savePersonalUInfo)(personalUInfo, context);
            return {
                user: response.data.user,
                success: true,
                message: 'User data obtained correctly',
                FRONTENDID
            };
        case 404: // Email not registered
            vscode.window.showErrorMessage('The email is not registered');
            return {
                success: false,
                message: 'The email is not registered on PrJManager, please create an account first.',
                FRONTENDID
            };
        case 403: // Account suspended
            vscode.window.showErrorMessage('The account no longer exists or has been suspended');
            return {
                success: false,
                message: 'The account no longer exists or has been suspended',
                FRONTENDID
            };
        default:
            // Handle unexpected errors
            vscode.window.showErrorMessage('Unexpected error during authentication');
            return {
                success: false,
                message: 'Unexpected error during authentication',
                FRONTENDID
            };
    }
};
exports.handleAuthResponse = handleAuthResponse;
const handleAuthResponseAfterReset = async (response, context, socketID) => {
    if (!response.success) {
        if (temporalServer_1.server && temporalServer_1.server.listening) {
            temporalServer_1.server.close();
        }
        if (views_1.currentPanel) {
            views_1.currentPanel.webview.postMessage({ command: 'hideSpinner' });
            views_1.currentPanel.webview.postMessage({ command: 'showAuthResponse', authResponse: response.message, success: response.success });
            views_1.currentPanel.webview.postMessage({ command: 'updateId', id: socketID });
        }
        vscode.window.showErrorMessage(response.message);
    }
    else {
        if (views_1.currentPanel) {
            views_1.currentPanel.webview.postMessage({ command: 'hideSpinner' });
            views_1.currentPanel.webview.postMessage({ command: 'showAuthResponse', authResponse: `${response.message}, you can close this window now.`, success: response.success });
        }
        vscode.window.showInformationMessage(response.message);
        await (0, storage_1.handleAuthExtUserData)(response.user, context);
    }
    ;
};
exports.handleAuthResponseAfterReset = handleAuthResponseAfterReset;
//# sourceMappingURL=handleAuthResponse.js.map