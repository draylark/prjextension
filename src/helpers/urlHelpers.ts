const FormData = require('form-data');
import * as vscode from 'vscode';
import { createReadStream } from "fs";
import axios, { AxiosError } from "axios";
import { unlink } from "fs";
import { ReqCloneData, ReqPullData, ReqPushData } from "../types/commands_types.js";
import { PersistanceUser } from '../types/auth_types.js';
import os = require('os');

interface Error {
    message: string;
}


export const handlePush = async(PAT: string, UID: string, TOKEN: string, data: ReqPushData) => {
    const { type, remoteUrl, filePath, branch, taskId } = data; 
    try {
        const formData = new FormData();

        formData.append('type', type);
        formData.append('remoteUrl', remoteUrl);
        formData.append('branch', branch);
        formData.append('taskId', taskId);
        formData.append('file', createReadStream(filePath));

        const config = {
            headers: {
                ...formData.getHeaders(),
                'authorization': `Bearer ${TOKEN}`,
                'x-pat': PAT, 
                'x-uid': UID, 
            },
        };

        const response = await axios.post('https://prj-gitserver-d3e2c98f103c.herokuapp.com/api/git/access-push', formData, config);;
        return response.data;
    } catch (error) {
        unlink(filePath, (err) => { if (err) { throw err; } });

        const axiosError = error as AxiosError<Error>;
        if(axiosError.response){
            return {
                success: false,
                message: axiosError.response.data.message,
            };
        } else {
            return {
                success: false,
                message: 'Unexpected error during push',
            };
        }
    }
};


export const handlePull = async(PAT: string, UID: string, TOKEN: string, data: ReqPullData) => {
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

        const response = await axios.post('https://prj-gitserver-d3e2c98f103c.herokuapp.com/api/git/access-pull', body, config );
        return response.data;

    } catch (error) {
        const axiosError = error as AxiosError<Error>;
        if(axiosError.response){
            return {
                success: false,
                message: axiosError.response.data.message,
            };
        } else {
            return {
                success: false,
                message: 'Unexpected error during pull',
            };
        }
    }
};


export const handleClone = async(PAT: string, UID: string, TOKEN: string, data: ReqCloneData) => {
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


        const response = await axios.post('https://prj-gitserver-d3e2c98f103c.herokuapp.com/api/git/access-clone', body, config );
        return response.data;

    } catch (error) {
        const axiosError = error as AxiosError<Error>;
        if(axiosError.response){
            return {
                success: false,
                message: axiosError.response.data.message,
            };
        } else {
            return {
                success: false,
                message: 'Unexpected error during clone',
            };
        }
    }
};
