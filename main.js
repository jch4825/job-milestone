/**
 * 직업 마1스톤 - Electron 메인 프로세스
 *  - app:// 프로토콜로 로컬 파일을 제공(ES 모듈·fetch 가 file:// 제약 없이 동작)
 *  - 로컬 LLM(Ollama) 호출은 메인 프로세스에서 처리(IPC)
 *  - F11 전체 화면, 단일 실행
 */

const { app, BrowserWindow, ipcMain, protocol, net, Menu } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } },
]);

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 760,
    minWidth: 960,
    minHeight: 560,
    title: '직업 마1스톤',
    icon: path.join(__dirname, 'assets', 'icon.png'), // 창·작업 표시줄 아이콘(npm start 때도). 설치 파일 아이콘은 build/icon.ico(tools/make-icon.py)
    backgroundColor: '#0E0C12',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      autoplayPolicy: 'no-user-gesture-required', // 앱을 켜면 오프닝 음악·표지 읽기가 바로(브라우저처럼 첫 누름을 기다리지 않음)
    },
  });
  Menu.setApplicationMenu(null);
  mainWindow.loadURL('app://game/index.html');
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
      event.preventDefault();
    }
  });
  // 외부 링크는 앱 안에서 열지 않음
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
}

app.whenReady().then(() => {
  const root = path.resolve(__dirname);
  protocol.handle('app', (request) => {
    const { pathname } = new URL(request.url);
    const file = path.normalize(path.join(root, decodeURIComponent(pathname)));
    if (!file.startsWith(root)) return new Response('forbidden', { status: 403 });
    return net.fetch(pathToFileURL(file).toString());
  });
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// 로컬 LLM (Ollama) 호출: 렌더러는 IPC 로만 요청
ipcMain.handle('llm-chat', async (_event, payload = {}) => {
  const { endpoint, model, messages, options } = payload;
  const url = typeof endpoint === 'string' && /^http:\/\/(127\.0\.0\.1|localhost):\d+\//.test(endpoint) ? endpoint : 'http://127.0.0.1:11434/api/chat';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({ model: model || 'gemma:2b', messages, stream: false, options }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return { success: true, content: data.message?.content || '' };
  } catch (err) {
    return { success: false, error: err.message };
  } finally {
    clearTimeout(timer);
  }
});

ipcMain.handle('toggle-fullscreen', () => {
  if (mainWindow) mainWindow.setFullScreen(!mainWindow.isFullScreen());
});
