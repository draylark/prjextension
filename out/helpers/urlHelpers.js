"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLastCommitInDatabase = exports.handleClone = exports.handlePull = exports.handlePush = void 0;
const FormData = require('form-data');
const fs_1 = require("fs");
const axios_1 = __importDefault(require("axios"));
const fs_2 = require("fs");
const handlePush = async (PAT, UID, data) => {
    const { type, remoteUrl, filePath, branch } = data;
    try {
        const formData = new FormData();
        // Agregar los campos de texto a la solicitud
        formData.append('type', type);
        formData.append('remoteUrl', remoteUrl);
        formData.append('branch', branch);
        // Agregar el archivo
        formData.append('file', (0, fs_1.createReadStream)(filePath));
        const config = {
            headers: {
                ...formData.getHeaders(),
                'x-pat': PAT, // Agrega el PAT en los headers
                'x-uid': UID, // Agrega el UID en los headers
            },
        };
        const response = await axios_1.default.post('http://localhost:3005/api/git/access-push', formData, config);
        return response.data;
    }
    catch (error) {
        (0, fs_2.unlink)(filePath, (err) => { if (err) {
            throw err;
        } });
        return {
            success: false,
            message: error.response.data.message,
        };
    }
};
exports.handlePush = handlePush;
const handlePull = async (PAT, UID, data) => {
    const { type, remoteUrl, branch } = data;
    try {
        const body = {
            type: type,
            remoteUrl: remoteUrl,
            branch: branch,
        };
        const config = {
            headers: {
                'x-pat': PAT,
                'x-uid': UID,
            }
        };
        const response = await axios_1.default.post('http://localhost:3005/api/git/access-pull', body, config);
        return response.data;
    }
    catch (error) {
        return {
            success: false,
            message: error.response.data.message,
        };
    }
};
exports.handlePull = handlePull;
const handleClone = async (PAT, UID, data) => {
    const { type, remoteUrl, branch } = data;
    try {
        const body = {
            type: type,
            remoteUrl: remoteUrl,
            branch: branch,
        };
        const config = {
            headers: {
                'x-pat': PAT,
                'x-uid': UID,
            }
        };
        const response = await axios_1.default.post('http://localhost:3005/api/git/access-clone', body, config);
        return response.data;
    }
    catch (error) {
        return {
            success: false,
            message: error.response.data.message,
        };
    }
};
exports.handleClone = handleClone;
const updateLastCommitInDatabase = async (commitHash, UID, PAT, commitMessage) => {
    const body = {
        PAT: PAT,
        UID: UID,
        commitHash: commitHash,
        commitMessage: commitMessage,
        type: 'update'
    };
    try {
        console.log('Enviando solicitud de actualización de commit');
        const response = await axios_1.default.post('http://localhost:3005/api/git/create-commit', body);
        console.log('Respuesta del servidor:', response.data);
    }
    catch (error) {
        console.error('Error al procesar la solicitud de actualización de commit:', error);
    }
};
exports.updateLastCommitInDatabase = updateLastCommitInDatabase;
//# sourceMappingURL=urlHelpers.js.map