"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToWebSocket = exports.disconnectSocket = void 0;
const vscode = require("vscode");
const socket_io_client_1 = require("socket.io-client");
const storage_js_1 = require("../helpers/storage.js");
const handlePATregistrationOrPersistence_js_1 = require("../helpers/handlePATregistrationOrPersistence.js");
const handleAuthResponse_js_1 = require("../helpers/handleAuthResponse.js");
const views_js_1 = require("../views/views.js");
const git_js_1 = require("../commands/git/git.js");
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
        const socket = (0, socket_io_client_1.io)('https://prj-socketserver-5b972d7517e7.herokuapp.com/');
        socket.on('connect', async () => {
            (0, storage_js_1.getEXTDATAstorage)(context).then(async (authData) => {
                if (authData && authData !== null) {
                    await (0, handlePATregistrationOrPersistence_js_1.handlePATregistrationOrPersistence)(context, socket, authData);
                    resolve(socket);
                }
                else {
                    // const view = showAuthenticatingView(socket.id as string, context);
                    (0, views_js_1.displayView)(socket.id, context);
                    resolve(socket);
                }
            })
                .catch((error) => {
                console.error('Error during connection process.', error);
                reject(null);
            });
        });
        socket.on('disconnect', (reason) => {
            if (reason === 'io server disconnect') {
                socket.connect();
            }
            ;
        });
        // ! Authentication response handler
        socket.on('authenticationResult', (response) => {
            (0, handleAuthResponse_js_1.handleAuthResponseAfterReset)(response, context, socket.id);
        });
        // ! PrjConsole User login handler ( Updating npm socketID and PAT )
        socket.on('OnPrJCUPersistance', (data) => {
            if (data.success === true) {
                vscode.window.showInformationMessage(data.message);
                (0, storage_js_1.handlePrJCUlogin)(context, data.NPMSOCKETID, data.PAT, data.token);
            }
            else {
                vscode.window.showInformationMessage(data.message);
            }
        });
        // ! Server reconnection handler
        socket.on('onReestablishingConnection', (data) => {
            if (data.success) {
                (0, storage_js_1.handlePrJCUReconnection)(context, data.user.SOCKETID, data.PAT);
                socket.emit('NEWCEXTID', { to: data.user.SOCKETID, CEXTID: socket.id });
            }
            else {
                vscode.window.showInformationMessage(data.message);
            }
        });
        // ! Authentication
        socket.on('authenticate', async (data) => {
            (0, storage_js_1.getPATstorage)(context).then(async (PAT) => {
                if (PAT) {
                    socket.emit('authenticationResult', {
                        to: data.EXECUTORID, authStatus: {
                            success: false,
                            message: 'This user is already authenticated, try login instead.',
                        }
                    });
                }
                else {
                    const authResponse = await vscode.commands.executeCommand('extension.authenticate');
                    if (authResponse.success === true && authResponse.user.uid) {
                        await (0, storage_js_1.saveClientsIDs)({ EXECUTORID: data.EXECUTORID, FRONTENDID: authResponse.FRONTENDID }, context);
                        socket.emit('restartSocket');
                    }
                    else {
                        if (views_js_1.currentPanel) {
                            views_js_1.currentPanel.webview.postMessage({ command: 'hideSpinner' });
                            views_js_1.currentPanel.webview.postMessage({ command: 'showAuthResponse', authResponse: authResponse.message, success: authResponse.success });
                        }
                        socket.emit('authenticationResult', { to: data.EXECUTORID, authStatus: authResponse });
                    }
                }
            })
                .catch((error) => {
                socket.emit('authenticationResult', {
                    to: data.EXECUTORID, authStatus: {
                        success: false,
                        message: 'Error during authentication process.',
                    }
                });
            });
        });
        // ! Commands    
        socket.on('command', async (data) => {
            switch (data.command) {
                case 'verify':
                    const verifyData = data;
                    (0, storage_js_1.handleNPMUSERValidation)(verifyData, context).then(async (resp) => {
                        if (resp) {
                            vscode.window.showInformationMessage('Connection established successfully, you can start executing your commands. :)');
                        }
                        else {
                            vscode.window.showInformationMessage('NPM user not validated.');
                        }
                    });
                    break;
                // ! Git Commands
                case 'init':
                    const initData = data;
                    (0, storage_js_1.handleNPMUSERValidation)(initData, context).then(async (resp) => (0, git_js_1.initGitRepository)(resp));
                    break;
                case 'add':
                    const addData = data;
                    (0, storage_js_1.handleNPMUSERValidation)(addData, context).then(async (resp) => (0, git_js_1.addFilesToGit)(resp));
                    break;
                case 'commit':
                    const commitData = data;
                    (0, storage_js_1.handleNPMUSERValidation)(commitData, context).then(async (resp) => (0, git_js_1.commitChanges)(commitData.commitMessage, resp));
                    break;
                case 'remote':
                    const remoteData = data;
                    (0, storage_js_1.handleNPMUSERValidation)(remoteData, context).then(async (resp) => (0, git_js_1.handleRemotes)(remoteData, resp, socket, context));
                    break;
                case 'push':
                    const pushData = data;
                    (0, storage_js_1.handleNPMUSERValidation)(pushData, context).then(async (resp) => (0, git_js_1.pushToRemote)(resp, context, pushData.remoteName, pushData.taskId));
                    break;
                case 'pull':
                    const pullData = data;
                    (0, storage_js_1.handleNPMUSERValidation)(pullData, context).then(async (resp) => (0, git_js_1.pullFromRemote)(resp, context, pullData.remoteName));
                    break;
                case 'clone':
                    const cloneData = data;
                    (0, storage_js_1.handleNPMUSERValidation)(cloneData, context).then(async (resp) => (0, git_js_1.cloneRepository)(cloneData.repoUrl, resp, context, cloneData.branch));
                    break;
                case 'branch':
                    const branchData = data;
                    (0, storage_js_1.handleNPMUSERValidation)(branchData, context).then(async (resp) => (0, git_js_1.listBranch)(resp, context, socket, branchData.NPMUSER.SOCKETID));
                    break;
                case 'createBranch':
                    const createBranchData = data;
                    (0, storage_js_1.handleNPMUSERValidation)(createBranchData, context).then(async (resp) => (0, git_js_1.createBranch)(resp, context, socket, createBranchData.NPMUSER.SOCKETID, createBranchData.branchName));
                    break;
                case 'deleteBranch':
                    const deleteBranchData = data;
                    (0, storage_js_1.handleNPMUSERValidation)(deleteBranchData, context).then(async (resp) => (0, git_js_1.deleteBranch)(resp, context, socket, deleteBranchData.NPMUSER.SOCKETID, deleteBranchData.branchName));
                    break;
                case 'checkoutBranch':
                    const checkoutBranchData = data;
                    (0, storage_js_1.handleNPMUSERValidation)(checkoutBranchData, context).then(async (resp) => (0, git_js_1.checkoutBranch)(resp, context, socket, checkoutBranchData.NPMUSER.SOCKETID, checkoutBranchData.branchName));
                    break;
                case 'status':
                    const statusData = data;
                    (0, storage_js_1.handleNPMUSERValidation)(statusData, context).then(async (resp) => (0, git_js_1.status)(resp, context, socket, statusData.NPMUSER.SOCKETID));
                    break;
                default:
                    break;
            }
        });
        socket.on('connect_error', (error) => {
            console.error('Error during connection process.', error);
            reject(null);
        });
    });
};
exports.connectToWebSocket = connectToWebSocket;
//# sourceMappingURL=connection.js.map