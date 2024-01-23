"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePATregister = void 0;
const storage_1 = require("../../../helpers/storage");
const storage_2 = require("../../../helpers/storage");
const handlePATregister = async (context, socket) => {
    const secretStorage = context.secrets;
    const EXECUTORID = await secretStorage.get('EXECUTORID');
    const FRONTENDID = await secretStorage.get('FRONTENDID');
    const extdata = await (0, storage_1.getEXTDATAstorage)(context);
    console.log('EXECUTORID:', EXECUTORID, 'FRONTENDID:', FRONTENDID, 'extdata:', extdata);
    if (extdata && EXECUTORID && FRONTENDID) {
        const data = { to: EXECUTORID, authStatus: { success: true, message: 'Autenticación exitosa', FRONTENDID }, extdata: { type: 'EXTUSER', SOCKETID: socket.id, newuser: extdata } };
        socket.emit('authenticationResult', data);
        (0, storage_2.clearSecretStorage)(secretStorage);
        return;
    }
};
exports.handlePATregister = handlePATregister;
//# sourceMappingURL=handlePATregister.js.map