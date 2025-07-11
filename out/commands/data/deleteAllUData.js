"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAllUData = void 0;
const vscode = require("vscode");
const storage_js_1 = require("../../helpers/storage.js");
const deleteAllUData = async (socket, context) => {
    if (socket && socket.connected) {
        try {
            const extdata = await (0, storage_js_1.getEXTUSERstorage)(context);
            const PRJACCUID = await (0, storage_js_1.getPersonaForDeletionlUInfo)(context);
            if (!extdata || !PRJACCUID) {
                return false;
            }
            const { NPMUID } = extdata;
            socket.emit('deleteAllUData', { NPMUID, PRJACCUID }, async (response) => {
                if (response.success) {
                    vscode.window.showInformationMessage(response.message);
                    return true;
                }
                else {
                    vscode.window.showInformationMessage(response.message);
                    return false;
                }
            });
        }
        catch (error) {
            vscode.window.showInformationMessage('Error during deletion.');
            return false;
        }
        ;
    }
    else {
        vscode.window.showInformationMessage('No active connection found.');
        return false;
    }
};
exports.deleteAllUData = deleteAllUData;
//# sourceMappingURL=deleteAllUData.js.map