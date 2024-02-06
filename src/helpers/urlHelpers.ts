const FormData = require('form-data');
import { createReadStream } from "fs";
import axios from "axios";
import { unlink } from "fs";
import { ReqCloneData, ReqPullData, ReqPushData } from "../types/commands_types";


export const handlePush = async(PAT: string, UID: String, data: ReqPushData) => {
    const { type, remoteUrl, filePath, branch } = data; 

    try {
        const formData = new FormData();

        // Agregar los campos de texto a la solicitud
        formData.append('type', type);
        formData.append('remoteUrl', remoteUrl);
        formData.append('branch', branch);

        // Agregar el archivo
        formData.append('file', createReadStream(filePath));

        const config = {
            headers: {
                ...formData.getHeaders(),
                'x-pat': PAT, // Agrega el PAT en los headers
                'x-uid': UID, // Agrega el UID en los headers
            },
        };

        const response = await axios.post('http://localhost:3005/api/git/access-push', formData, config);
        return response.data;
    } catch (error) {
        unlink(filePath, (err) => { if (err) { throw err; } });
        return {
            success: false,
            message: error.response.data.message,
        };
    }
};


export const handlePull = async(PAT: string, UID: string, data: ReqPullData) => {
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

        const response = await axios.post('http://localhost:3005/api/git/access-pull', body, config );
        return response.data;

    } catch (error) {
        return {
            success: false,
            message: error.response.data.message,
        };
    }
};



export const handleClone = async(PAT: string, UID: string, data: ReqCloneData) => {
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


        const response = await axios.post('http://localhost:3005/api/git/access-clone', body, config );
        return response.data;

    } catch (error) {
        return { 
            success: false,
            message: error.response.data.message,
        };
    }
};


export const updateLastCommitInDatabase = async (commitHash: string, UID: string, PAT: string, commitMessage: string ) => {

    const body = {
        PAT: PAT,
        UID: UID,
        commitHash: commitHash,
        commitMessage: commitMessage,
        type: 'update'
    };

    try {
        console.log('Enviando solicitud de actualización de commit');
        const response = await axios.post('http://localhost:3005/api/git/create-commit', body);
        console.log('Respuesta del servidor:', response.data);
    } catch (error) {
        console.error('Error al procesar la solicitud de actualización de commit:', error);
    }

};
