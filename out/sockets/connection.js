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
const vscode = __importStar(require("vscode"));
const socket_io_client_1 = require("socket.io-client");
const storage_1 = require("../helpers/storage");
const handlePATregistrationOrPersistence_1 = require("../helpers/handlePATregistrationOrPersistence");
const handleAuthResponse_1 = require("../helpers/handleAuthResponse");
const views_1 = require("../views/views");
const git_1 = require("../helpers/git");
const connectToWebSocket = (context) => {
    const socket = (0, socket_io_client_1.io)('http://localhost:8081');
    socket.on('connect', async () => {
        console.log('Connected to WebSocket server from PrJExtension', socket.id);
        (0, storage_1.getEXTDATAstorage)(context).then(async (authData) => {
            if (authData) {
                console.log('AuthData desde el storage', authData);
                await (0, handlePATregistrationOrPersistence_1.handlePATregistrationOrPersistence)(context, socket, authData);
            }
            else {
                console.log('No hay datos de autenticacion');
                const view = (0, views_1.showAuthenticatingView)(socket.id);
                (0, views_1.displayView)(view);
            }
        });
    });
    socket.on('disconnect', (reason) => {
        console.log('Razon de la desconexión', reason);
        if (reason === 'io server disconnect') {
            socket.connect();
        }
        ;
        vscode.window.showInformationMessage('Connection problems are occurring, please wait patiently and try again.');
    });
    // Authentication response handler
    socket.on('authenticationResult', (response) => {
        console.log('Response despues de el reinicio de socket', response);
        (0, handleAuthResponse_1.handleAuthResponseAfterReset)(response, context, socket.id);
    });
    // PrjConsole User login handler ( Updating socketID and PAT )
    socket.on('onCNPMlogin', (data) => {
        if (data.success) {
            (0, storage_1.handleCNPMlogin)(context, socket, data.NPMSOCKETID, data.PAT);
        }
        else {
            console.log('Error on CNPM login');
            vscode.window.showInformationMessage(data.message);
        }
    });
    // Server reconnection handler
    socket.on('onCNPMreconnected', (data) => {
        if (data.success) {
            (0, storage_1.handleCNPMlogin)(context, socket, data.user.SOCKETID, data.PAT);
            socket.emit('NEWCEXTID', { to: data.user.SOCKETID, CEXTID: socket.id });
        }
        else {
            console.log('Error al reconectar CNPM');
            vscode.window.showInformationMessage(data.message);
        }
    });
    // Authentication
    socket.on('authenticate', async (data) => {
        (0, storage_1.getPATstorage)(context).then(async (PAT) => {
            if (PAT) {
                socket.emit('authenticationResult', { to: data.EXECUTORID, authStatus: {
                        success: false,
                        message: 'This user is already authenticated, try login instead.',
                    } });
            }
            else {
                const authStatus = await vscode.commands.executeCommand('extension.authenticate');
                if (authStatus.success && authStatus.user.uid) {
                    await (0, storage_1.saveAuthKeys)('S', { EXECUTORID: data.EXECUTORID, FRONTENDID: authStatus.FRONTENDID }, context);
                    socket.emit('restartSocket');
                    return;
                }
                else {
                    if (views_1.currentPanel) {
                        views_1.currentPanel.webview.postMessage({ command: 'hideSpinner' });
                        views_1.currentPanel.webview.postMessage({ command: 'showAuthResponse', authResponse: authStatus.message, success: authStatus.success });
                    }
                    socket.emit('authenticationResult', { to: data.EXECUTORID, authStatus });
                }
            }
        });
    });
    socket.on('command', async (data) => {
        switch (data.command) {
            // Authentication
            case 'getPAT':
                (0, storage_1.handleNPMUSERValidation)(data.NPMUSER, context).then(async (resp) => {
                    if (resp) {
                        const PAT = await vscode.commands.executeCommand('extension.getPAT');
                        console.log('Impresion desde la extension', PAT);
                    }
                    else {
                        vscode.window.showInformationMessage('NPM user not validated.');
                    }
                });
                break;
            case 'getUSER':
                (0, storage_1.handleNPMUSERValidation)(data.NPMUSER, context).then(async (resp) => {
                    if (resp) {
                        const userdata = await vscode.commands.executeCommand('extension.PRJUID');
                        console.log('Impresion desde la extension', userdata);
                    }
                    else {
                        vscode.window.showInformationMessage('NPM user not validated.');
                    }
                });
                break;
            // Git
            case 'init':
                (0, storage_1.handleNPMUSERValidation)(data.NPMUSER, context).then(async (resp) => (0, git_1.initGitRepository)(resp));
                break;
            case 'add':
                (0, storage_1.handleNPMUSERValidation)(data.NPMUSER, context).then(async (resp) => (0, git_1.addFilesToGit)(resp));
                break;
            case 'commit':
                (0, storage_1.handleNPMUSERValidation)(data.NPMUSER, context).then(async (resp) => (0, git_1.commitChanges)(data.commitMessage, resp));
                break;
            case 'remote':
                (0, storage_1.handleNPMUSERValidation)(data.NPMUSER, context).then(async (resp) => (0, git_1.handleRemotes)(data, resp, socket, context));
                break;
            case 'push':
                (0, storage_1.handleNPMUSERValidation)(data.NPMUSER, context).then(async (resp) => (0, git_1.pushToRemote)(resp, context, data.remoteName));
                break;
            case 'pull':
                (0, storage_1.handleNPMUSERValidation)(data.NPMUSER, context).then(async (resp) => (0, git_1.pullFromRemote)(resp, context, data.remoteName));
                break;
            case 'clone':
                (0, storage_1.handleNPMUSERValidation)(data.NPMUSER, context).then(async (resp) => (0, git_1.cloneRepository)(data.repoUrl, resp, context, data.branch));
                break;
            case 'branch':
                (0, storage_1.handleNPMUSERValidation)(data.NPMUSER, context).then(async (resp) => (0, git_1.listBranch)(resp, context, socket, data.NPMUSER.SOCKETID));
                break;
            case 'createBranch':
                (0, storage_1.handleNPMUSERValidation)(data.NPMUSER, context).then(async (resp) => (0, git_1.createBranch)(resp, context, socket, data.NPMUSER.SOCKETID, data.branchName));
                break;
            case 'checkoutBranch':
                (0, storage_1.handleNPMUSERValidation)(data.NPMUSER, context).then(async (resp) => (0, git_1.checkoutBranch)(resp, context, socket, data.NPMUSER.SOCKETID, data.branchName));
                break;
            case 'status':
                (0, storage_1.handleNPMUSERValidation)(data.NPMUSER, context).then(async (resp) => (0, git_1.status)(resp, context, socket, data.NPMUSER.SOCKETID));
                break;
            default:
                break;
        }
    });
    return socket;
};
exports.default = connectToWebSocket;
//# sourceMappingURL=connection.js.map