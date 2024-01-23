"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleUriHandler = void 0;
const vscode = __importStar(require("vscode"));
class SimpleUriHandler {
    context;
    constructor(context) {
        this.context = context;
    }
    handleUri(uri) {
        // Aquí puedes procesar el URI
        const queryParams = new URLSearchParams(uri.query);
        const authCode = queryParams.get('code');
        if (authCode) {
            // Manejar el código de autorización aquí
            console.log('Código de Autorización:', authCode);
            // Aquí puedes realizar más acciones, como enviar el código al backend
        }
    }
    get redirectUri() {
        const publisher = this.context.extension.packageJSON.publisher;
        const name = this.context.extension.packageJSON.name;
        return `${vscode.env.uriScheme}://${publisher}.${name}`;
    }
}
exports.SimpleUriHandler = SimpleUriHandler;
//# sourceMappingURL=MyUriHandler.js.map