import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

const DIR = process.argv[2];
const SALIDA = process.argv[3];
const FPS = 30;

// Servidor mínimo para el guion (los módulos ES no cargan desde file://)
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => {
  const ruta = join(DIR, req.url === '/' ? 'storyboard.html' : req.url.split('?')[0]);
  try {
    const buf = await readFile(ruta);
    res.writeHead(200, { 'Content-Type': TIPOS[extname(ruta)] ?? 'application/octet-stream' });
    res.end(buf);
  } catch { res.writeHead(404); res.end(''); }
});
await new Promise((r) => server.listen(4100, r));

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--force-color-profile=srgb', '--disable-lcd-text'],
});
const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 })).newPage();
await page.goto('http://localhost:4100/', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

const duracion = await page.evaluate(() => window.DURACION);
const total = Math.round(duracion * FPS);
console.log(`grabando ${total} cuadros (${duracion}s a ${FPS}fps)`);

// Los PNG van directo por tubería a ffmpeg: sin archivos intermedios en disco
const ff = spawn('/usr/bin/ffmpeg', [
  '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', 'pipe:0',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
  '-pix_fmt', 'yuv420p', SALIDA,
], { stdio: ['pipe', 'ignore', 'pipe'] });
let errFf = '';
ff.stderr.on('data', (d) => { errFf += d.toString(); });

const inicio = Date.now();
for (let f = 0; f < total; f += 1) {
  await page.evaluate((t) => window.seek(t), f / FPS);
  const buf = await page.screenshot({ type: 'png' });
  if (!ff.stdin.write(buf)) await once(ff.stdin, 'drain');
  if (f % 150 === 0) {
    const seg = ((Date.now() - inicio) / 1000).toFixed(0);
    console.log(`  cuadro ${f}/${total}  (${seg}s)`);
  }
}
ff.stdin.end();
const [codigo] = await once(ff, 'close');
if (codigo !== 0) {
  console.error(errFf.slice(-1500));
  throw new Error(`ffmpeg falló con código ${codigo}`);
}
console.log('master listo:', SALIDA);

await browser.close();
server.close();

/* ---------- derivados para la web ---------- */

const DESTINO = process.argv[4] ?? 'public/video';

/** Corre ffmpeg y espera a que termine bien. */
async function ffmpeg(args, etiqueta) {
  const proc = spawn('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args], {
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  let err = '';
  proc.stderr.on('data', (d) => { err += d.toString(); });
  const [code] = await once(proc, 'close');
  if (code !== 0) {
    console.error(err.slice(-1200));
    throw new Error(`${etiqueta} falló`);
  }
  console.log('ok:', etiqueta);
}

// MP4: el que anda en todos lados, incluido Safari en iOS.
// `faststart` mueve el índice al principio para que empiece sin bajarlo entero.
await ffmpeg([
  '-i', SALIDA,
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '25',
  '-profile:v', 'main', '-level', '4.0', '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart', '-an', `${DESTINO}/intro.mp4`,
], 'intro.mp4');

// WebM VP9: pesa menos donde se soporta; el navegador elige.
await ffmpeg([
  '-i', SALIDA,
  '-c:v', 'libvpx-vp9', '-crf', '36', '-b:v', '0',
  '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2',
  '-pix_fmt', 'yuv420p', '-an', `${DESTINO}/intro.webm`,
], 'intro.webm');

// Póster: lo que se ve antes de tocar reproducir.
await ffmpeg([
  '-ss', '25.0', '-i', SALIDA, '-frames:v', '1', '-q:v', '3', `${DESTINO}/poster.jpg`,
], 'poster.jpg');

console.log('listo. Archivos en', DESTINO);
