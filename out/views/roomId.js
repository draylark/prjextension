"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWebviewContent = void 0;
function getWebviewContent() {
    return `
        <html>
            <body>
                <h1>Unirse a Sala</h1>
                <input type="text" id="roomId" placeholder="ID de Sala"/>
                <button onclick="unirseASala()">Unirse</button>

                <script>
                    const vscode = acquireVsCodeApi();
                    function unirseASala() {
                        const roomId = document.getElementById('roomId').value;
                        vscode.postMessage({
                            command: 'joinRoom',
                            roomId: roomId
                        });
                    }
                </script>
            </body>
        </html>
    `;
}
exports.getWebviewContent = getWebviewContent;
//# sourceMappingURL=roomId.js.map