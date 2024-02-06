export type ReqData = ReqPullData | ReqPushData | ReqCloneData;


export type ReqPushData = {
    type: string,
    remoteUrl: string,
    filePath: string,
    branch: string
};

export type ReqPullData = {
    type: string,
    remoteUrl: string,
    branch: string
};

export type ReqCloneData = {
    type: string,
    remoteUrl: string,
    branch: string | undefined
};
