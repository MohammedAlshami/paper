// Drives headless Chrome over the DevTools Protocol (no puppeteer/playwright needed)
// to screenshot each component's #/shot/<id> route, clipped to its #shot-root element.
import { spawn } from 'node:child_process';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.BASE ?? 'http://localhost:3100';
const OUT_DIR = process.env.OUT_DIR ?? new URL('../public/screenshots', import.meta.url).pathname;
const CDP_PORT = Number(process.env.CDP_PORT ?? 9333);
const IDS = process.argv.slice(2);

if (!IDS.length) {
  console.error('Usage: node screenshot.mjs <id> [<id> ...]');
  process.exit(1);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function jsonGet(url) {
  const res = await fetch(url);
  return res.json();
}

async function waitForCdp() {
  for (let i = 0; i < 50; i += 1) {
    try {
      await jsonGet(`http://127.0.0.1:${CDP_PORT}/json/version`);
      return;
    } catch {
      await sleep(200);
    }
  }
  throw new Error('Chrome DevTools endpoint never came up');
}

function send(ws, id, method, params = {}) {
  return new Promise((resolve, reject) => {
    const onMessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id === id) {
        ws.removeEventListener('message', onMessage);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      }
    };
    ws.addEventListener('message', onMessage);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function shootOne(ws, msgId, id) {
  const url = `${BASE}/shot/${id}`;
  await send(ws, msgId(), 'Page.navigate', { url });
  // Hash-only navigation on an already-open about:blank tab needs an explicit load;
  // give the SPA time to mount and any animation/pulse effects to settle.
  await sleep(700);

  const evalResult = await send(ws, msgId(), 'Runtime.evaluate', {
    expression: `(() => {
      const el = document.getElementById('shot-root');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    })()`,
    returnByValue: true,
  });

  const rect = evalResult.result.value;
  if (!rect) throw new Error(`#shot-root not found for ${id}`);

  const { data } = await send(ws, msgId(), 'Page.captureScreenshot', {
    format: 'png',
    clip: { x: rect.x, y: rect.y, width: Math.ceil(rect.width), height: Math.ceil(rect.height), scale: 1 },
    captureBeyondViewport: true,
  });

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, `${id}.png`), Buffer.from(data, 'base64'));
  console.log(`✓ ${id} (${Math.ceil(rect.width)}x${Math.ceil(rect.height)})`);
}

async function main() {
  const chrome = spawn(
    'google-chrome',
    [
      '--headless=new',
      `--remote-debugging-port=${CDP_PORT}`,
      '--window-size=1400,1000',
      '--force-device-scale-factor=2',
      '--hide-scrollbars',
      '--disable-gpu',
      '--no-sandbox',
      'about:blank',
    ],
    { stdio: 'ignore' },
  );

  try {
    await waitForCdp();
    const targets = await jsonGet(`http://127.0.0.1:${CDP_PORT}/json`);
    const target = targets.find((t) => t.type === 'page') ?? targets[0];
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve, { once: true });
      ws.addEventListener('error', reject, { once: true });
    });

    let counter = 1;
    const msgId = () => counter++;

    await send(ws, msgId(), 'Page.enable');
    await send(ws, msgId(), 'Emulation.setDeviceMetricsOverride', {
      width: 1400,
      height: 1000,
      deviceScaleFactor: 2,
      mobile: false,
    });

    for (const id of IDS) {
      try {
        await shootOne(ws, msgId, id);
      } catch (err) {
        console.error(`✗ ${id}: ${err.message}`);
      }
    }

    ws.close();
  } finally {
    chrome.kill();
  }
}

main();
