import { User, PersistanceUser } from "./auth_types.js";

export interface CodeReceivedResponse {
    code: string;
    FRONTENDTID: string;
}


// ? HandleAuthResponse Argument Interface

export interface AuthResponseHandling {
    status: number;
    data: {
        status: boolean;
        user: User;
        pat: string;
        token: string;    
    }
}

// ? HandleAuthResponse Return

export interface AuthResponse {
    success: boolean;
    message: string;
    FRONTENDID: string;

    // ? User data obtained correctly
    user: User;
}

export interface SuccessfulAuthResults {
    success: boolean;
    message: string;
    user: User;
    FRONTENDID: string;
}

export interface FailedAuthResults {
    success: boolean;
    message: string;
    FRONTENDID: string;
}

export type Response = SuccessfulAuthResults | FailedAuthResults;


export interface PersistanceData {
    success: boolean;
    message: string;

    // ? User data obtained correctly
    user: PersistanceUser;
}

