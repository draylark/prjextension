import * as vscode from 'vscode';
import { io, Socket } from 'socket.io-client';
import { handleNPMUSERValidation, getEXTDATAstorage, getPATstorage, handlePrJCUlogin, handlePrJCUReconnection, saveClientsIDs } from '../helpers/storage.js';
import { handlePATregistrationOrPersistence } from '../helpers/handlePATregistrationOrPersistence.js';
import { handleAuthResponseAfterReset } from '../helpers/handleAuthResponse.js';
import {  displayView, currentPanel } from '../views/views.js';
import { initGitRepository, addFilesToGit, commitChanges, handleRemotes, pushToRemote, pullFromRemote, cloneRepository, listBranch, createBranch, deleteBranch, checkoutBranch, status } from '../commands/git/git.js';
import { AuthResponse } from '../types/auth_interfaces.js';
import { PushCommand, PullCommand, CloneCommand, CommitCommand, RemoteCommand, CommandData, BranchCommand, CommonCommand } from '../types/commands_interfaces.js';


export const disconnectSocket = async (socket: Socket) => {
  if (socket && socket.connected) {
    try {
      socket.disconnect();
      vscode.window.showInformationMessage('Connection closed.');
    } catch (error) {
      vscode.window.showInformationMessage('Error during disconnection.');
    }
  } else {
    vscode.window.showInformationMessage('No active connection found.');
  }
};


export const connectToWebSocket = (context: vscode.ExtensionContext): Promise<Socket> => {
  return new Promise((resolve, reject) => {

    const socket = io('https://prj-socketserver-5b972d7517e7.herokuapp.com/');

    socket.on('connect', async () => {
      getEXTDATAstorage(context).then(async (authData) => {
        if (authData && authData !== null) {
          await handlePATregistrationOrPersistence(context, socket, authData);
          resolve(socket);
        } else {
          // const view = showAuthenticatingView(socket.id as string, context);
          displayView(socket.id as string, context);
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
      };
    });



    // ! Authentication response handler
    socket.on('authenticationResult', (response) => {
      handleAuthResponseAfterReset(response, context, socket.id as string);
    });


    // ! PrjConsole User login handler ( Updating npm socketID and PAT )
    socket.on('OnPrJCUPersistance', (data) => {
      if (data.success === true) {
        vscode.window.showInformationMessage(data.message);
        handlePrJCUlogin(context, data.NPMSOCKETID, data.PAT, data.token);
      } else {
        vscode.window.showInformationMessage(data.message);
      }
    });


    // ! Server reconnection handler
    socket.on('onReestablishingConnection', (data) => {
      if (data.success) {
        handlePrJCUReconnection(context, data.user.SOCKETID, data.PAT);
        socket.emit('NEWCEXTID', { to: data.user.SOCKETID, CEXTID: socket.id });
      } else {
        vscode.window.showInformationMessage(data.message);
      }
    });




    // ! Authentication
    socket.on('authenticate', async (data) => {
      getPATstorage(context).then(async (PAT) => {
        if (PAT) {
          socket.emit('authenticationResult', {
            to: data.EXECUTORID, authStatus: {
              success: false,
              message: 'This user is already authenticated, try login instead.',
            }
          });
        } else {
          const authResponse: AuthResponse = await vscode.commands.executeCommand('extension.authenticate');
          if (authResponse.success === true && authResponse.user.uid) {
            await saveClientsIDs({ EXECUTORID: data.EXECUTORID, FRONTENDID: authResponse.FRONTENDID }, context);
            socket.emit('restartSocket');
          } else {
            if (currentPanel) {
              currentPanel.webview.postMessage({ command: 'hideSpinner' });
              currentPanel.webview.postMessage({ command: 'showAuthResponse', authResponse: authResponse.message, success: authResponse.success });
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
    socket.on('command', async (data: CommandData) => {
      switch (data.command) {
        case 'verify':
          const verifyData = data as CommonCommand;
          handleNPMUSERValidation(verifyData, context).then(async (resp) => {
            if (resp) {
              vscode.window.showInformationMessage('Connection established successfully, you can start executing your commands. :)');
            } else {
              vscode.window.showInformationMessage('NPM user not validated.');
            }
          });
          break;

        // ! Git Commands
        case 'init':
          const initData = data as CommandData;
          handleNPMUSERValidation(initData, context).then(async (resp) => initGitRepository(resp));
          break;

        case 'add':
          const addData = data as CommandData;
          handleNPMUSERValidation(addData, context).then(async (resp) => addFilesToGit(resp));
          break;

        case 'commit':
          const commitData = data as CommitCommand;
          handleNPMUSERValidation(commitData, context).then(async (resp) => commitChanges(commitData.commitMessage, resp));
          break;

        case 'remote':
          const remoteData = data as RemoteCommand;
          handleNPMUSERValidation(remoteData, context).then(async (resp) => handleRemotes(remoteData, resp, socket, context));
          break;

        case 'push':
          const pushData = data as PushCommand;
          handleNPMUSERValidation(pushData, context).then(async (resp) => pushToRemote(resp, context, pushData.remoteName, pushData.taskId));
          break;

        case 'pull':
          const pullData = data as PullCommand;
          handleNPMUSERValidation(pullData, context).then(async (resp) => pullFromRemote(resp, context, pullData.remoteName));
          break;

        case 'clone':
          const cloneData = data as CloneCommand;
          handleNPMUSERValidation(cloneData, context).then(async (resp) => cloneRepository(cloneData.repoUrl, resp, context, cloneData.branch));
          break;

        case 'branch':
          const branchData = data as CommonCommand;
          handleNPMUSERValidation(branchData, context).then(async (resp) => listBranch(resp, context, socket, branchData.NPMUSER.SOCKETID));
          break;

        case 'createBranch':
          const createBranchData = data as BranchCommand;
          handleNPMUSERValidation(createBranchData, context).then(async (resp) => createBranch(resp, context, socket, createBranchData.NPMUSER.SOCKETID, createBranchData.branchName));
          break;

        case 'deleteBranch':
          const deleteBranchData = data as BranchCommand;
          handleNPMUSERValidation(deleteBranchData, context).then(async (resp) => deleteBranch(resp, context, socket, deleteBranchData.NPMUSER.SOCKETID, deleteBranchData.branchName));
          break;

        case 'checkoutBranch':
          const checkoutBranchData = data as BranchCommand;
          handleNPMUSERValidation(checkoutBranchData, context).then(async (resp) => checkoutBranch(resp, context, socket, checkoutBranchData.NPMUSER.SOCKETID, checkoutBranchData.branchName));
          break;

        case 'status':
          const statusData = data as CommonCommand;
          handleNPMUSERValidation(statusData, context).then(async (resp) => status(resp, context, socket, statusData.NPMUSER.SOCKETID));
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
