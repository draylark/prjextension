"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth0AuthenticationProvider = exports.AUTH_TYPE = void 0;
const vscode_1 = require("vscode");
const uuid_1 = require("uuid");
const util_1 = require("./util");
const node_fetch_1 = __importDefault(require("node-fetch"));
exports.AUTH_TYPE = `auth0`;
const AUTH_NAME = `Auth0`;
const CLIENT_ID = `3GUryQ7ldAeKEuD2obYnppsnmj58eP5u`;
const AUTH0_DOMAIN = `dev-txghew0y.us.auth0.com`;
const SESSIONS_SECRET_KEY = `${exports.AUTH_TYPE}.sessions`;
class UriEventHandler extends vscode_1.EventEmitter {
    handleUri(uri) {
        this.fire(uri);
    }
}
class Auth0AuthenticationProvider {
    context;
    _sessionChangeEmitter = new vscode_1.EventEmitter();
    _disposable;
    _pendingStates = [];
    _codeExchangePromises = new Map();
    _uriHandler = new UriEventHandler();
    constructor(context) {
        this.context = context;
        this._disposable = vscode_1.Disposable.from(vscode_1.authentication.registerAuthenticationProvider(exports.AUTH_TYPE, AUTH_NAME, this, { supportsMultipleAccounts: false }), vscode_1.window.registerUriHandler(this._uriHandler));
    }
    get onDidChangeSessions() {
        return this._sessionChangeEmitter.event;
    }
    get redirectUri() {
        const publisher = this.context.extension.packageJSON.publisher;
        const name = this.context.extension.packageJSON.name;
        return `${vscode_1.env.uriScheme}://${publisher}.${name}`;
    }
    /**
     * Get the existing sessions
     * @param scopes
     * @returns
     */
    async getSessions(scopes) {
        const allSessions = await this.context.secrets.get(SESSIONS_SECRET_KEY);
        if (allSessions) {
            return JSON.parse(allSessions);
        }
        return [];
    }
    /**
     * Create a new auth session
     * @param scopes
     * @returns
     */
    async createSession(scopes) {
        try {
            const token = await this.login(scopes);
            if (!token) {
                throw new Error(`Auth0 login failure`);
            }
            const userinfo = await this.getUserInfo(token);
            const session = {
                id: (0, uuid_1.v4)(),
                accessToken: token,
                account: {
                    label: userinfo.name,
                    id: userinfo.email
                },
                scopes: []
            };
            await this.context.secrets.store(SESSIONS_SECRET_KEY, JSON.stringify([session]));
            this._sessionChangeEmitter.fire({ added: [session], removed: [], changed: [] });
            return session;
        }
        catch (e) {
            vscode_1.window.showErrorMessage(`Sign in failed: ${e}`);
            throw e;
        }
    }
    /**
     * Remove an existing session
     * @param sessionId
     */
    async removeSession(sessionId) {
        const allSessions = await this.context.secrets.get(SESSIONS_SECRET_KEY);
        if (allSessions) {
            let sessions = JSON.parse(allSessions);
            const sessionIdx = sessions.findIndex(s => s.id === sessionId);
            const session = sessions[sessionIdx];
            sessions.splice(sessionIdx, 1);
            await this.context.secrets.store(SESSIONS_SECRET_KEY, JSON.stringify(sessions));
            if (session) {
                this._sessionChangeEmitter.fire({ added: [], removed: [session], changed: [] });
            }
        }
    }
    /**
     * Dispose the registered services
     */
    async dispose() {
        this._disposable.dispose();
    }
    /**
     * Log in to Auth0
     */
    async login(scopes = []) {
        return await vscode_1.window.withProgress({
            location: vscode_1.ProgressLocation.Notification,
            title: "Signing in to Auth0...",
            cancellable: true
        }, async (_, token) => {
            const stateId = (0, uuid_1.v4)();
            this._pendingStates.push(stateId);
            const scopeString = scopes.join(' ');
            if (!scopes.includes('openid')) {
                scopes.push('openid');
            }
            if (!scopes.includes('profile')) {
                scopes.push('profile');
            }
            if (!scopes.includes('email')) {
                scopes.push('email');
            }
            const searchParams = new URLSearchParams([
                ['response_type', "token"],
                ['client_id', CLIENT_ID],
                ['redirect_uri', this.redirectUri],
                ['state', stateId],
                ['scope', scopes.join(' ')],
                ['prompt', "login"]
            ]);
            const uri = vscode_1.Uri.parse(`https://${AUTH0_DOMAIN}/authorize?${searchParams.toString()}`);
            await vscode_1.env.openExternal(uri);
            let codeExchangePromise = this._codeExchangePromises.get(scopeString);
            if (!codeExchangePromise) {
                codeExchangePromise = (0, util_1.promiseFromEvent)(this._uriHandler.event, this.handleUri(scopes));
                this._codeExchangePromises.set(scopeString, codeExchangePromise);
            }
            try {
                return await Promise.race([
                    codeExchangePromise.promise,
                    new Promise((_, reject) => setTimeout(() => reject('Cancelled'), 60000)),
                    (0, util_1.promiseFromEvent)(token.onCancellationRequested, (_, __, reject) => { reject('User Cancelled'); }).promise
                ]);
            }
            finally {
                this._pendingStates = this._pendingStates.filter(n => n !== stateId);
                codeExchangePromise?.cancel.fire();
                this._codeExchangePromises.delete(scopeString);
            }
        });
    }
    /**
     * Handle the redirect to VS Code (after sign in from Auth0)
     * @param scopes
     * @returns
     */
    handleUri = (scopes) => async (uri, resolve, reject) => {
        const query = new URLSearchParams(uri.fragment);
        const access_token = query.get('access_token');
        const state = query.get('state');
        if (!access_token) {
            reject(new Error('No token'));
            return;
        }
        if (!state) {
            reject(new Error('No state'));
            return;
        }
        // Check if it is a valid auth request started by the extension
        if (!this._pendingStates.some(n => n === state)) {
            reject(new Error('State not found'));
            return;
        }
        resolve(access_token);
    };
    /**
     * Get the user info from Auth0
     * @param token
     * @returns
     */
    async getUserInfo(token) {
        const response = await (0, node_fetch_1.default)(`https://${AUTH0_DOMAIN}/userinfo`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return await response.json();
    }
}
exports.Auth0AuthenticationProvider = Auth0AuthenticationProvider;
//# sourceMappingURL=AutheticationProvider.js.map