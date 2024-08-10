export type CommandData = PullCommand | PushCommand | CloneCommand | CommitCommand | RemoteCommand | CommonCommand | BranchCommand;
export type RemotesData = AddRemoteCommand | RemoveRemoteCommand | RemoteCommand; 


export interface CommonCommand {
    NPMUSER: {
        SOCKETID: string;
        uid: string;
    }
    command: string;
}


export interface PushCommand {  
    NPMUSER: {
        SOCKETID: string;
        uid: string;
    }
    command: string;
    remoteName: string;
    taskId: string
}

export interface PullCommand {
    NPMUSER: {
        SOCKETID: string;
        uid: string;
    }
    command: string;
    remoteName: string;
};

export interface CloneCommand {
    NPMUSER: {
        SOCKETID: string;
        uid: string;
    }
    command: string;
    repoUrl: string;
    branch: undefined | string;
};

export interface CommitCommand {
    NPMUSER: {
        SOCKETID: string;
        uid: string;
    }
    command: string;
    commitMessage: string;
};

export interface BranchCommand {
    NPMUSER: {
        SOCKETID: string;
        uid: string;
    }
    command: string;
    branchName: string;
};

export interface RemoteCommand {
    NPMUSER: {
        SOCKETID: string;
        uid: string;
    }
    command: string;
    type: string;
};

export interface AddRemoteCommand {
    NPMUSER: {
        SOCKETID: string;
        uid: string;
    }
    command: string;
    remoteName: string;
    remoteUrl: string;
    type: string;
};

export interface RemoveRemoteCommand {
    NPMUSER: {
        SOCKETID: string;
        uid: string;
    }
    command: string;
    remoteName: string;
    type: string;
};



