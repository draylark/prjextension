"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAuthResponseAfterReset = exports.handleAuthResponse = void 0;
const vscode = require("vscode");
const storage_js_1 = require("./storage.js");
const views_js_1 = require("../views/views.js");
const temporalServer_js_1 = require("./temporalServer.js");
const handleAuthResponse = async (response, FRONTENDID, context) => {
    switch (response.status) {
        case 200: // Success
            const dataToStore = { PAT: response.data.pat, PRJACCUID: response.data.user.uid, name: response.data.user.username, email: response.data.user.email };
            const personalUInfo = { PRJACCUID: response.data.user.uid, email: response.data.user.email };
            await (0, storage_js_1.saveToken)(response.data.token, context);
            await (0, storage_js_1.saveTemporalExtData)(dataToStore, context);
            await (0, storage_js_1.savePersonalUInfo)(personalUInfo, context);
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
        if (temporalServer_js_1.server && temporalServer_js_1.server.listening) {
            temporalServer_js_1.server.close();
        }
        await (0, storage_js_1.deleteToken)(context);
        if (views_js_1.currentPanel) {
            views_js_1.currentPanel.webview.postMessage({ command: 'hideSpinner' });
            views_js_1.currentPanel.webview.postMessage({ command: 'showAuthResponse', authResponse: response.message, success: response.success });
            views_js_1.currentPanel.webview.postMessage({ command: 'updateId', id: socketID });
        }
        vscode.window.showErrorMessage(response.message);
    }
    else {
        if (views_js_1.currentPanel) {
            views_js_1.currentPanel.webview.postMessage({ command: 'hideSpinner' });
            views_js_1.currentPanel.webview.postMessage({ command: 'showAuthResponse', authResponse: `${response.message}, you can close this window now.`, success: response.success });
        }
        vscode.window.showInformationMessage(response.message);
        await (0, storage_js_1.handleAuthExtUserData)(response.user, context);
    }
    ;
};
exports.handleAuthResponseAfterReset = handleAuthResponseAfterReset;
//# sourceMappingURL=handleAuthResponse.js.map