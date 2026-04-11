#!/usr/bin/env node
/**
 * p5.js Skill — Headless Frame Export
 *
 * Captures frames from a p5.js sketch using Puppeteer (headless Chrome).
 * Uses noLoop() + redraw() for DETERMINISTIC frame-by-frame control.
 *
 * IMPORTANT: Your sketch must call noLoop() in setup() and set
 * window._p5Ready = true when initialized. This script calls redraw()
 * for each frame capture, ensuring exact 1:1 correspondence between
 * frameCount and captured frames.
 *
 * If the sketch does NOT set window._p5Ready, the script falls back to
 * a timed capture mode (less precise, may drop/duplicate frames).
 *
 * Usage:
 *   node export-frames.js sketch.html [options]
 *
 * Options:
 *   --output <dir>    Output directory (default: ./frames)
 *   --width <px>      Canvas width (default: 1920)
 *   --height <px>     Canvas height (default: 1080)
 *   --frames <n>      Number of frames to capture (default: 1)
 *   --fps <n>         Target FPS for timed fallback mode (default: 30)
 *   --wait <ms>       Wait before first capture (default: 2000)
 *   --selector <sel>  Canvas CSS selector (default: canvas)
 *
 * Examples:
 *   node export-frames.js sketch.html --frames 1                     # single PNG
 *   node export-frames.js sketch.html --frames 300 --fps 30          # 10s at 30fps
 *   node export-frames.js sketch.html --width 3840 --height 2160     # 4K still
 *
 * Sketch template for deterministic capture:
 *   function setup() {
 *     createCanvas(1920, 1080);
 *     pixelDensity(1);
 *     noLoop();                    // REQUIRED for deterministic capture
 *     window._p5Ready = true;      // REQUIRED to signal readiness
 *   }
 *   function draw() { ... }
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    input: null,
    output: './frames',
    width: 1920,
    height: 1080,
    frames: 1,
    fps: 30,
    wait: 2000,
    selector: 'canvas',
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const val = args[i + 1];
      if (key in opts && val !== undefined) {
        opts[key] = isNaN(Number(val)) ? val : Number(val);
        i++;
      }
    } else if (!opts.input) {
      opts.input = args[i];
    }
  }

  if (!opts.input) {
    console.error('Usage: node export-frames.js <sketch.html> [options]');
    process.exit(1);
  }

  return opts;
}

async function main() {
  const opts = parseArgs();
  const inputPath = path.resolve(opts.input);

  if (!fs.existsSync(inputPath)) {
    console.error(`File not found: ${inputPath}`);
    process.exit(1);
  }

  // Create output directory
  fs.mkdirSync(opts.output, { recursive: true });

  console.log(`Capturing ${opts.frames} frame(s) from ${opts.input}`);
  console.log(`Resolution: ${opts.width}x${opts.height}`);
  console.log(`Output: ${opts.output}/`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--allow-file-access-from-files',
    ],
  });

  const page = await browser.newPage();

  await page.setViewport({
    width: opts.width,
    height: opts.height,
    deviceScaleFactor: 1,
  });

  // Navigate to sketch
  const fileUrl = `file://${inputPath}`;
  await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait for canvas to appear
  await page.waitForSelector(opts.selector, { timeout: 10000 });

  // Detect capture mode: deterministic (noLoop+redraw) vs timed (fallback)
  let deterministic = false;
  try {
    await page.waitForFunction('window._p5Ready === true', { timeout: 5000 });
    deterministic = true;
    console.log(`Mode: deterministic (noLoop + redraw)`);
  } catch {
    console.log(`Mode: timed fallback (sketch does not set window._p5Ready)`);
    console.log(`  For frame-perfect capture, add noLoop() and window._p5Ready=true to setup()`);
    await new Promise(r => setTimeout(r, opts.wait));
  }

  const startTime = Date.now();

  for (let i = 0; i < opts.frames; i++) {
    if (deterministic) {
      // Advance exactly one frame
      await page.evaluate(() => { redraw(); });
      // Brief settle time for render to complete
      await new Promise(r => setTimeout(r, 20));
    }

    const frameName = `frame-${String(i).padStart(4, '0')}.png`;
    const framePath = path.join(opts.output, frameName);

    // Capture the canvas element
    const canvas = await page.$(opts.selector);
    if (!canvas) {
      console.error('Canvas element not found');
      break;
    }

    await canvas.screenshot({ path: framePath, type: 'png' });

    // Progress
    if (i % 30 === 0 || i === opts.frames - 1) {
      const pct = ((i + 1) / opts.frames * 100).toFixed(1);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      process.stdout.write(`\r  Frame ${i + 1}/${opts.frames} (${pct}%) — ${elapsed}s`);
    }

    // In timed mode, wait between frames
    if (!deterministic && i < opts.frames - 1) {
      await new Promise(r => setTimeout(r, 1000 / opts.fps));
    }
  }

  console.log('\n  Done.');
  await browser.close();
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
