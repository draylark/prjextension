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
exports.joinRoomLogic = void 0;
const vscode = __importStar(require("vscode"));
const views_1 = require("../views/views");
const joinRoomLogic = (context, socket) => {
    const panel = vscode.window.createWebviewPanel('joinRoom', // Identificador del tipo de Webview
    'Unirse a Sala', // Título del panel
    vscode.ViewColumn.One, // Editor column en el que mostrar el nuevo panel
    {
        enableScripts: true // Habilitar scripts en el webview
    } // Opciones adicionales
    );
    panel.webview.html = (0, views_1.getRoomIdWebviewContent)();
    panel.webview.onDidReceiveMessage(message => {
        switch (message.command) {
            case 'joinRoom':
                const roomId = message.roomId;
                socket.emit('joinRoom', roomId);
                break;
        }
    }, undefined, context.subscriptions);
};
exports.joinRoomLogic = joinRoomLogic;
//# sourceMappingURL=joinRoom.js.map