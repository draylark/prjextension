"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePATregistrationOrPersistence = exports.handlePersistence = void 0;
const vscode = require("vscode");
const storage_js_1 = require("./storage.js");
const handlePersistence = async (context, socket, PAT) => {
    socket.emit('onExtPersistance', { type: 'EXT', PAT, SOCKETID: socket.id }, async (resp) => {
        if (resp && resp.success === true) {
            vscode.window.showInformationMessage(resp.message);
            await (0, storage_js_1.handleAuthExtUserData)(resp.user, context);
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
        (0, storage_js_1.clearSecretStorage)(secretStorage);
    }
    else if (PAT) {
        // Case: Persistence
        await (0, exports.handlePersistence)(context, socket, PAT);
    }
};
exports.handlePATregistrationOrPersistence = handlePATregistrationOrPersistence;
//# sourceMappingURL=handlePATregistrationOrPersistence.js.map