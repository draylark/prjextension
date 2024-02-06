"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isReqCloneData = exports.isReqPullData = exports.isReqPushData = void 0;
const isReqPushData = (data) => {
    return data.remoteUrl !== undefined && data.filePath !== undefined && data.branch !== undefined;
};
exports.isReqPushData = isReqPushData;
const isReqPullData = (data) => {
    return data.remoteUrl !== undefined && data.branch !== undefined;
};
exports.isReqPullData = isReqPullData;
const isReqCloneData = (data) => {
    return data.remoteUrl !== undefined;
};
exports.isReqCloneData = isReqCloneData;
//# sourceMappingURL=checkers.js.map