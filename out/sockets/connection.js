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
exports.connectToWebSocket = exports.disconnectSocket = void 0;
const vscode = __importStar(require("vscode"));
const socket_io_client_1 = require("socket.io-client");
const storage_1 = require("../helpers/storage");
const handlePATregistrationOrPersistence_1 = require("../helpers/handlePATregistrationOrPersistence");
const handleAuthResponse_1 = require("../helpers/handleAuthResponse");
const views_1 = require("../views/views");
const git_1 = require("../helpers/git");
const disconnectSocket = async (socket) => {
    if (socket && socket.connected) {
        try {
            socket.disconnect();
            vscode.window.showInformationMessage('Connection closed.');
        }
        catch (error) {
            vscode.window.showInformationMessage('Error during disconnection.');
        }
    }
    else {
        vscode.window.showInformationMessage('No active connection found.');
    }
};
exports.disconnectSocket = disconnectSocket;
const connectToWebSocket = (context) => {
    return new Promise((resolve, reject) => {
        const socket = (0, socket_io_client_1.io)('http://localhost:8081');
        socket.on('connect', async () => {
            (0, storage_1.getEXTDATAstorage)(context).then(async (authData) => {
                if (authData && authData !== null) {
                    await (0, handlePATregistrationOrPersistence_1.handlePATregistrationOrPersistence)(context, socket, authData);
                    resolve(socket);
                }
                else {
                    const view = (0, views_1.showAuthenticatingView)(socket.id);
                    (0, views_1.displayView)(view);
                    resolve(socket);
                }
            });
        });
        socket.on('disconnect', (reason) => {
            if (reason === 'io server disconnect') {
                socket.connect();
            }
            ;
        });
        // Authentication response handler
        socket.on('authenticationResult', (response) => {
            console.log('Response despues de el reinicio de socket', response);
            (0, handleAuthResponse_1.handleAuthResponseAfterReset)(response, context, socket.id);
        });
        // PrjConsole User login handler ( Updating socketID and PAT )
        socket.on('OnPrJCUPersistance', (data) => {
            if (data.success) {
                (0, storage_1.handlePrJCUlogin)(context, socket, data.NPMSOCKETID, data.PAT);
            }
            else {
                vscode.window.showInformationMessage(data.message);
            }
        });
        // Server reconnection handler
        socket.on('onReestablishingConnection', (data) => {
            if (data.success) {
                (0, storage_1.handlePrJCUlogin)(context, socket, data.user.SOCKETID, data.PAT);
                socket.emit('NEWCEXTID', { to: data.user.SOCKETID, CEXTID: socket.id });
            }
            else {
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
                    const authResponse = await vscode.commands.executeCommand('extension.authenticate');
                    if (authResponse.success && authResponse.user.uid) {
                        await (0, storage_1.saveClientsIDs)({ EXECUTORID: data.EXECUTORID, FRONTENDID: authResponse.FRONTENDID }, context);
                        socket.emit('restartSocket');
                    }
                    else {
                        if (views_1.currentPanel) {
                            views_1.currentPanel.webview.postMessage({ command: 'hideSpinner' });
                            views_1.currentPanel.webview.postMessage({ command: 'showAuthResponse', authResponse: authResponse.message, success: authResponse.success });
                        }
                        socket.emit('authenticationResult', { to: data.EXECUTORID, authStatus: authResponse });
                    }
                }
            });
        });
        // Git commands    
        socket.on('command', async (data) => {
            switch (data.command) {
                case 'verify':
                    const verifyData = data;
                    (0, storage_1.handleNPMUSERValidation)(verifyData, context).then(async (resp) => {
                        if (resp) {
                            vscode.window.showInformationMessage('Connection established successfully, you can start executing your commands. :)');
                        }
                        else {
                            vscode.window.showInformationMessage('NPM user not validated.');
                        }
                    });
                    break;
                // Git
                case 'init':
                    const initData = data;
                    (0, storage_1.handleNPMUSERValidation)(initData, context).then(async (resp) => (0, git_1.initGitRepository)(resp));
                    break;
                case 'add':
                    const addData = data;
                    (0, storage_1.handleNPMUSERValidation)(addData, context).then(async (resp) => (0, git_1.addFilesToGit)(resp));
                    break;
                case 'commit':
                    const commitData = data;
                    (0, storage_1.handleNPMUSERValidation)(commitData, context).then(async (resp) => (0, git_1.commitChanges)(commitData.commitMessage, resp));
                    break;
                case 'remote':
                    const remoteData = data;
                    (0, storage_1.handleNPMUSERValidation)(remoteData, context).then(async (resp) => (0, git_1.handleRemotes)(remoteData, resp, socket, context));
                    break;
                case 'push':
                    const pushData = data;
                    (0, storage_1.handleNPMUSERValidation)(pushData, context).then(async (resp) => (0, git_1.pushToRemote)(resp, context, pushData.remoteName));
                    break;
                case 'pull':
                    const pullData = data;
                    (0, storage_1.handleNPMUSERValidation)(pullData, context).then(async (resp) => (0, git_1.pullFromRemote)(resp, context, pullData.remoteName));
                    break;
                case 'clone':
                    const cloneData = data;
                    (0, storage_1.handleNPMUSERValidation)(cloneData, context).then(async (resp) => (0, git_1.cloneRepository)(cloneData.repoUrl, resp, context, cloneData.branch));
                    break;
                case 'branch':
                    const branchData = data;
                    (0, storage_1.handleNPMUSERValidation)(branchData, context).then(async (resp) => (0, git_1.listBranch)(resp, context, socket, branchData.NPMUSER.SOCKETID));
                    break;
                case 'createBranch':
                    const createBranchData = data;
                    (0, storage_1.handleNPMUSERValidation)(createBranchData, context).then(async (resp) => (0, git_1.createBranch)(resp, context, socket, createBranchData.NPMUSER.SOCKETID, createBranchData.branchName));
                    break;
                case 'deleteBranch':
                    const deleteBranchData = data;
                    (0, storage_1.handleNPMUSERValidation)(deleteBranchData, context).then(async (resp) => (0, git_1.deleteBranch)(resp, context, socket, deleteBranchData.NPMUSER.SOCKETID, deleteBranchData.branchName));
                    break;
                case 'checkoutBranch':
                    const checkoutBranchData = data;
                    (0, storage_1.handleNPMUSERValidation)(checkoutBranchData, context).then(async (resp) => (0, git_1.checkoutBranch)(resp, context, socket, checkoutBranchData.NPMUSER.SOCKETID, checkoutBranchData.branchName));
                    break;
                case 'status':
                    const statusData = data;
                    (0, storage_1.handleNPMUSERValidation)(statusData, context).then(async (resp) => (0, git_1.status)(resp, context, socket, statusData.NPMUSER.SOCKETID));
                    break;
                default:
                    break;
            }
        });
        socket.on('connect_error', (error) => {
            vscode.window.showInformationMessage('Error during connection.');
            reject(null);
        });
    });
};
exports.connectToWebSocket = connectToWebSocket;
exports.default = exports.connectToWebSocket;
//# sourceMappingURL=connection.js.map