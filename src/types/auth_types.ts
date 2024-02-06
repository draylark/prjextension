export type User = {
    uid: string;
    email: string;
    username: string; 
    photoUrl: string;
};

export type PersistanceUser = {
    _id: string;
    PRJACCUID: string;
    NPMUID: string;
    NPMSOCKETID: string;
    SOCKETID: string;
    PAT: string;
    pastSession: string;
    createdAt: Date;
};
