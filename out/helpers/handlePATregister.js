"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePATregistrationOrPersistence = void 0;
const storage_1 = require("./storage");
const handlePATregistrationOrPersistence = async (context, socket, registrationData) => {
    const secretStorage = context.secrets;
    const { EXECUTORID, FRONTENDID, extdata, PAT } = registrationData;
    if (extdata && EXECUTORID && FRONTENDID) {
        const data = { to: EXECUTORID, authStatus: { success: true, message: 'Autenticación exitosa', FRONTENDID }, extdata: { SOCKETID: socket.id, newuser: extdata } };
        socket.emit('authenticationResult', data);
        (0, storage_1.clearSecretStorage)(secretStorage);
        return;
    }
};
exports.handlePATregistrationOrPersistence = handlePATregistrationOrPersistence;
//# sourceMappingURL=handlePATregister.js.map