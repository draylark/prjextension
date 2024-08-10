import { ReqCloneData, ReqPullData, ReqPushData } from "./commands_types.js";


export const isReqPushData = (data: any): data is ReqPushData => {
    return  data.remoteUrl !== undefined && data.filePath !== undefined && data.branch !== undefined; 
};

export const isReqPullData = (data: any): data is ReqPullData => {
    return  data.remoteUrl !== undefined && data.branch !== undefined;
};

export const isReqCloneData = (data: any): data is ReqCloneData => {
    return  data.remoteUrl !== undefined;
};