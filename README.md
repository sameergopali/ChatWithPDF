## PDFChat — AI‑assisted PDF reader (Electron + React + Vite + TypeScript)

PDFChat is a desktop PDF reader that lets you open PDFs, select text, and start an AI chat about the content. It’s built with Electron for the desktop shell and a React + Vite frontend. The AI layer is currently mocked and can be wired up to any provider by implementing a single function.

### Features
- **PDF viewing**: Single page and continuous modes, zoom, fit-to-width/page, page navigation.
- **AI chat sidebar**: Resizable, toggleable chat panel.
- **Context menu on selection**: Copy text or send selection directly to the AI chat.
- **Electron IPC bridge**: Secure preload exposing limited APIs to the renderer.

### Tech stack
- **Electron 34**, **React 19**, **TypeScript 5**, **Vite 6**, **Zustand** for state, **react-pdf** for rendering.

## Getting started

### Prerequisites
- Node.js 18+ (recommended 20+)
- npm 8+
- macOS for packaged build script `dist:mac` (DMG, arm64). Other targets can be added via `electron-builder`.

### Install
```bash
npm ci
```

### Run in development
```bash
npm run dev
```
This starts:
- Electron with `NODE_ENV=development`
- Vite dev server on `http://localhost:3000`

The Electron app points to the dev server when `NODE_ENV=development`. Port `3000` is required by default. If you change it, update both `vite.config.ts` (`server.port`) and `src/electron/main.ts` where `loadURL('http://localhost:3000')` is referenced.

### Build frontend (production assets)
```bash
npm run build
```
Outputs the React app to `dist-react/` and compiles Electron code to `dist-electron/`.

### Package app (macOS, DMG arm64)
```bash
npm run dist:mac
```
Artifacts are produced by `electron-builder` (default output is `dist/`).

## How to use
1. Launch the app in dev or install a packaged build.
2. On the landing page, click “Open PDF” and select a `.pdf` file.
3. Use the toolbar to switch view modes, zoom, and fit.
4. Select any text in the PDF to open the context menu:
   - Copy text
   - Send to AI Chat (opens sidebar and posts the selection)

## AI integration
The AI is mocked. To integrate a real model, implement `chatWithAI` in `src/electron/service/aiService.ts` to call your provider and return a string.

```ts
// src/electron/service/aiService.ts
export class AIService {
  async chatWithAI(messages: { text: string; sender: 'user' | 'ai' }[]): Promise<string> {
    // Call your model provider here
    return 'AI response here';
  }
}
```

Renderer sends messages via `window.electronAPI.chatWithAI(messages)`. Responses are emitted by the main process on `ai:chat-response` and appended to the chat via the `useChatListener` hook.

## App architecture

### High level
- **Electron main**: creates the window, handles dialogs, reads files, and proxies AI calls.
- **Preload (isolated)**: exposes a minimal `electronAPI` to the renderer via `contextBridge`.
- **Renderer (React)**: PDF viewer, toolbar, chat sidebar, and UI state.




## Scripts
- `dev`: run Electron and Vite in parallel
- `dev:electron`: transpile Electron TS and run Electron in dev
- `dev:react`: start Vite dev server
- `build`: type-check/build Electron + build React
- `preview`: preview built React site
- `lint`: run ESLint
- `dist:mac`: transpile, build, and package a macOS DMG (arm64)





---
Made with Electron, React, and TypeScript.
