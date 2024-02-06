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
exports.handlePATregistrationOrPersistence = exports.handlePersistence = void 0;
const vscode = __importStar(require("vscode"));
const storage_1 = require("./storage");
const handlePersistence = async (context, socket, PAT) => {
    socket.emit('onExtPersistance', { type: 'EXT', PAT, SOCKETID: socket.id }, async (resp) => {
        if (resp && resp.success === true) {
            await (0, storage_1.handleAuthExtUserData)(resp.user, context);
        }
        else {
            vscode.window.showInformationMessage('Error during persistance.');
        }
    });
};
exports.handlePersistence = handlePersistence;
const handlePATregistrationOrPersistence = async (context, socket, authData) => {
    const secretStorage = context.secrets;
    const { EXECUTORID, FRONTENDID, extdata, PAT } = authData;
    if (extdata && EXECUTORID && FRONTENDID) {
        // Case: Registration
        const data = { to: EXECUTORID, authStatus: { success: true, message: 'Autenticación exitosa', FRONTENDID }, extdata: { SOCKETID: socket.id, newuser: extdata } };
        socket.emit('authenticationResult', data);
        (0, storage_1.clearSecretStorage)(secretStorage);
    }
    else if (PAT) {
        // Case: Persistence
        await (0, exports.handlePersistence)(context, socket, PAT);
    }
};
exports.handlePATregistrationOrPersistence = handlePATregistrationOrPersistence;
//# sourceMappingURL=handlePATregistrationOrPersistence.js.map