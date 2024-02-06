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
exports.deleteAllUData = void 0;
const vscode = __importStar(require("vscode"));
const storage_1 = require("../../helpers/storage");
const deleteAllUData = async (socket, context) => {
    if (socket && socket.connected) {
        try {
            const extdata = await (0, storage_1.getEXTUSERstorage)(context);
            const PRJACCUID = await (0, storage_1.getPersonaForDeletionlUInfo)(context);
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