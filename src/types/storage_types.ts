export type EXTDATA = {
   PAT: string;
   PRJACCUID: string;
   name: string;
   email: string;
};

export type  PersonalUInfo = {
    PRJACCUID: string;
    email: string;
};

export type ClientsIDS = {
    EXECUTORID: string;
    FRONTENDID: string;
};


export type AuthData = {
    EXECUTORID: string;
    FRONTENDID: string;
    extdata: EXTDATA;
    PAT: string;
};


