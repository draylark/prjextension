"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleClone = exports.handlePull = exports.handlePush = void 0;
const FormData = require('form-data');
const fs_1 = require("fs");
const axios_1 = require("axios");
const fs_2 = require("fs");
const handlePush = async (PAT, UID, TOKEN, data) => {
    const { type, remoteUrl, filePath, branch, taskId } = data;
    try {
        const formData = new FormData();
        formData.append('type', type);
        formData.append('remoteUrl', remoteUrl);
        formData.append('branch', branch);
        formData.append('taskId', taskId);
        formData.append('file', (0, fs_1.createReadStream)(filePath));
        const config = {
            headers: {
                ...formData.getHeaders(),
                'authorization': `Bearer ${TOKEN}`,
                'x-pat': PAT,
                'x-uid': UID,
            },
        };
        const response = await axios_1.default.post('https://prj-gitserver-d3e2c98f103c.herokuapp.com/api/git/access-push', formData, config);
        ;
        return response.data;
    }
    catch (error) {
        (0, fs_2.unlink)(filePath, (err) => { if (err) {
            throw err;
        } });
        const axiosError = error;
        if (axiosError.response) {
            return {
                success: false,
                message: axiosError.response.data.message,
            };
        }
        else {
            return {
                success: false,
                message: 'Unexpected error during push',
            };
        }
    }
};
exports.handlePush = handlePush;
const handlePull = async (PAT, UID, TOKEN, data) => {
    const { type, remoteUrl, branch } = data;
    try {
        const body = {
            type: type,
            remoteUrl: remoteUrl,
            branch: branch,
        };
        const config = {
            headers: {
                'authorization': `Bearer ${TOKEN}`,
                'x-pat': PAT,
                'x-uid': UID,
            }
        };
        const response = await axios_1.default.post('https://prj-gitserver-d3e2c98f103c.herokuapp.com/api/git/access-pull', body, config);
        return response.data;
    }
    catch (error) {
        const axiosError = error;
        if (axiosError.response) {
            return {
                success: false,
                message: axiosError.response.data.message,
            };
        }
        else {
            return {
                success: false,
                message: 'Unexpected error during pull',
            };
        }
    }
};
exports.handlePull = handlePull;
const handleClone = async (PAT, UID, TOKEN, data) => {
    const { type, remoteUrl, branch } = data;
    try {
        const body = {
            type: type,
            remoteUrl: remoteUrl,
            branch: branch,
        };
        const config = {
            headers: {
                'authorization': `Bearer ${TOKEN}`,
                'x-pat': PAT,
                'x-uid': UID,
            }
        };
        const response = await axios_1.default.post('https://prj-gitserver-d3e2c98f103c.herokuapp.com/api/git/access-clone', body, config);
        return response.data;
    }
    catch (error) {
        const axiosError = error;
        if (axiosError.response) {
            return {
                success: false,
                message: axiosError.response.data.message,
            };
        }
        else {
            return {
                success: false,
                message: 'Unexpected error during clone',
            };
        }
    }
};
exports.handleClone = handleClone;
//# sourceMappingURL=urlHelpers.js.map