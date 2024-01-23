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
exports.handleAuthResponse = void 0;
const vscode = __importStar(require("vscode"));
const storage_1 = require("../../../helpers/storage");
const handleAuthResponse = async (response, FRONTENDID, context) => {
    switch (response.status) {
        case 200: // Éxito
            const dataToStore = { PAT: response.data.pat, PRJACCUID: response.data.user.uid, name: response.data.user.username, email: response.data.user.email };
            await (0, storage_1.saveAuthKeys)('R', { dataToStore, pat: response.data.pat }, context);
            vscode.window.showInformationMessage('Autenticación exitosa');
            return {
                user: response.data.user,
                success: true,
                message: 'User data obtained correctly',
                FRONTENDID
            };
        case 404: // No registrado
            vscode.window.showErrorMessage('The email is not registered');
            return {
                success: false,
                message: 'The email is not registered',
                FRONTENDID
            };
        case 403: // Cuenta suspendida
            vscode.window.showErrorMessage('The account no longer exists or has been suspended');
            return {
                success: false,
                message: 'The account no longer exists or has been suspended',
                FRONTENDID
            };
        default:
            // Manejar otros códigos de estado o errores inesperados
            vscode.window.showErrorMessage('Unexpected error during authentication');
            return {
                success: false,
                message: 'Unexpected error during authentication'
            };
    }
};
exports.handleAuthResponse = handleAuthResponse;
//# sourceMappingURL=handleAuthResponse.js.map