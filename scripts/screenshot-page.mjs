// Screenshot any page of the running site, at desktop or phone width, and report horizontal overflow and console errors.
// Usage: BASE=http://localhost:3100 CDP_PORT=9500 node scripts/screenshot-page.mjs <out.png> <path> [width=1440] [height=900] [full]
// Set EVAL to a JS expression to run on the page before the shot (e.g. click something).
//   e.g. node scripts/screenshot-page.mjs /tmp/a.png /t/garage/vehicles 1440 900
//        node scripts/screenshot-page.mjs /tmp/m.png /t/garage 390 844 full   (390 wide is treated as a phone)
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const [out, route, w = '1440', h = '900', full] = process.argv.slice(2);
if (!out || !route) {
  console.error('Usage: node screenshot-page.mjs <out.png> <path> [width] [height] [full]');
  process.exit(1);
}
const BASE = process.env.BASE ?? 'http://localhost:3100';
const PORT = Number(process.env.CDP_PORT ?? 9500);
const width = Number(w);
const height = Number(h);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn('google-chrome', ['--headless=new', `--remote-debugging-port=${PORT}`, '--hide-scrollbars', '--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', 'about:blank'], { stdio: 'ignore' });
try {
  for (let i = 0; i < 50; i += 1) {
    try { await fetch(`http://127.0.0.1:${PORT}/json/version`); break; } catch { await sleep(200); }
  }
  const targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
  const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  let id = 1;
  const pending = new Map();
  const errors = [];
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result ?? m); pending.delete(m.id); }
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text);
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map((a) => a.value ?? a.description).join(' ').slice(0, 300));
  });
  const send = (method, params = {}) => new Promise((res) => { const i = id++; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  await send('Page.enable');
  await send('Runtime.enable');
  const phone = width < 600;
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 2, mobile: phone });
  if (phone) await send('Emulation.setTouchEmulationEnabled', { enabled: true });
  await send('Page.navigate', { url: `${BASE}${route}` });
  await sleep(Number(process.env.WAIT ?? 3500));
  // HIDE="css selector" hides overlays (the template pill, the dev inspector) before the shot.
  if (process.env.HIDE) await send('Runtime.evaluate', { expression: `(() => { const s = document.createElement('style'); s.textContent = ${JSON.stringify(process.env.HIDE + '{display:none !important}')}; document.head.append(s); })()` });
  if (process.env.EVAL) {
    await send('Runtime.evaluate', { expression: process.env.EVAL, awaitPromise: true });
    await sleep(1000);
  }
  const info = await send('Runtime.evaluate', { returnByValue: true, expression: 'JSON.stringify({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth, scrollHeight: document.documentElement.scrollHeight })' });
  const dims = JSON.parse(info.result.value);
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: Boolean(full), ...(full ? { clip: { x: 0, y: 0, width, height: Math.min(dims.scrollHeight, 6000), scale: 1 } } : {}) });
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, Buffer.from(shot.data, 'base64'));
  console.log(JSON.stringify({ out, route, ...dims, overflowX: dims.scrollWidth > dims.clientWidth + 1, errors: errors.slice(0, 5) }));
  ws.close();
} finally {
  chrome.kill();
}
