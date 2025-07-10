
<img width="2320" height="1424" alt="Screenshot 2025-07-10 204915" src="https://github.com/user-attachments/assets/4cc964a4-c8f3-42af-a91e-db65a099b452" />

# PrJExtension 🧩

**PrJExtension** is a custom Visual Studio Code extension designed to integrate seamlessly with [PrJManager](https://github.com/nemrodc/PrJManager), a centralized project management platform. It allows developers to interact with remote repositories, execute real-time commands, and manage workflows directly from within the editor.

## ✨ Features

- ⚡ **Real-time Communication** – Powered by WebSockets for low-latency interaction with the backend.
- 🖥️ **Interactive Console (PrJConsole)** – Execute commands and receive instant responses via a built-in terminal interface.
- 🔐 **Authentication Layer** – Easily extendable to support OAuth2 or token-based authentication.
- 📁 **Remote Repository Access** – Fetch and interact with project structures managed by PrJManager.
- 🧠 **Context-Aware Commands** – Execute contextual actions directly tied to your active workspace.

## 🔌 How It Works

**PrJExtension** is tightly integrated with [PrJManager](https://github.com/your-username/PrJManager) and depends on the **PrJConsole** NPM library to enable command execution workflows.

### 🛂 OAuth2 Authentication with Google

Upon activation, the extension initiates an **OAuth2 login flow with Google**.  
- If the selected Google account is **already registered in PrJManager**, the authentication is accepted and the session is stored locally for future usage.
- If not, access is denied and the extension remains locked.

### 🧩 PrJConsole – Socket-Based Command Interface

**PrJConsole** is a required client-side library installed via NPM, responsible for facilitating communication between the **extension** and **external command interfaces**.

- Both the extension and the external **PrJConsole** client connect to a shared, custom **WebSocket server**.
- Once both parties authenticate and exchange a secure connection key, the **console can begin sending commands to the extension**.
- The extension parses each command and executes logic conditionally based on its type or context.

This architecture allows for real-time, modular, and secure interaction between the code editor and external tools, enabling advanced workflows directly inside VSCode.

> 🧠 PrJExtension **cannot operate without PrJConsole** installed and connected. Ensure `prjconsole` is included as a dependency:

```bash
npm install prjconsole
```


## 🔗 Component Interaction Overview


[User] ⇨ [VSCode Extension] ⇄ [WebSocket Server] ⇄ [PrJConsole CLI] ⇄ [PrJManager]



## 🛠 Tech Stack

- **Language:** JavaScript
- **Extension Host:** Visual Studio Code
- **Communication:** WebSockets
- **Auth-ready:** OAuth2 / Custom token systems
- **Companion Services:**  
  - [PrJManager](https://github.com/your-username/PrJManager) – backend platform  
  - PrJConsole – interactive CLI layer built into the extension
