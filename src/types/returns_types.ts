import { EXTDATA } from "./storage_types.js";

export type ExtDataSuccess = {
    EXECUTORID: string;
    FRONTENDID: string;
    extdata: EXTDATA; // Considera definir un tipo más específico para `extdata` si es posible
};

export type PatSuccess = {
    PAT: string;
};

export type GetExtDataStorageResult = ExtDataSuccess | PatSuccess | null;