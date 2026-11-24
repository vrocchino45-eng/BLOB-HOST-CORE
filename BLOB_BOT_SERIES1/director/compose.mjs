import { createReadStream } from 'node:fs';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';

const readJSON = async file => JSON.parse(await readFile(file, 'utf8'));
const modes = ['input', 'objective'];

async function composeGroup(page, clips, mode) {
  return page.evaluate(async ({ clips, mode }) => {
    function nextEvent(target, name) {
      return new Promise((resolve, reject) => {
        const clear = () => {
          target.removeEventListener(name, done);
          target.removeEventListener('error', failed);
          clearTimeout(timeout);
        };
        const done = event => { clear(); resolve(event); };
        const failed = () => { clear(); reject(new Error(name + ' failed')); };
        const timeout = setTimeout(failed, 20_000);
        target.addEventListener(name, done, { once: true });
        target.addEventListener('error', failed, { once: true });
      });
    }
    const makeVideo = async clip => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;
      video.style.cssText = 'position:fixed;bottom:0;right:0;width:2px;height:2px;opacity:0.01';
      document.body.append(video);
      const ready = nextEvent(video, 'loadeddata');
      video.src = clip.url;
      await ready;
      if (!Number.isFinite(video.duration)) {
        const found = nextEvent(video, 'seeked');
        video.currentTime = 10_000_000;
        await found;
      }
      if (!Number.isFinite(video.duration)) throw new Error('Source has unknown duration');
      return video;
    };
    const videos = await Promise.all(clips.map(makeVideo));
    const pixelCanvas = document.createElement('canvas');
    pixelCanvas.width = pixelCanvas.height = 1;
    const pixel = pixelCanvas.getContext('2d', { willReadFrequently: true });
    const seek = async (video, time) => {
      if (Math.abs(video.currentTime - time) < 0.002 && video.readyState >= 2) return;
      const done = nextEvent(video, 'seeked');
      video.currentTime = time;
      await done;
    };
    const cue = async (video, time) => {
      await seek(video, Math.max(0, Math.min(video.duration - 0.004, time)));
      pixel.drawImage(video, 10, video.videoHeight - 14, 4, 4, 0, 0, 1, 1);
      const [r, g, b] = pixel.getImageData(0, 0, 1, 1).data;
      return b > 140 && r > 148 && g < 100 ? 'start' : b > 140 && g > 148 && r < 100 ? 'end' : null;
    };
    const refine = async (video, low, high, kind) => {
      for (let i = 0; i < 5; i += 1) {
        const mid = (low + high) / 2;
        if (await cue(video, mid) === kind) high = mid;
        else low = mid;
      }
      return { at: high, bracketSeconds: high - low };
    };
    const locate = async (video, clip) => {
      const cap = video.duration - 0.008;
      const find = async (kind, guesses) => {
        for (const guess of guesses) {
          const at = Math.max(0, Math.min(cap, guess));
          if (await cue(video, at) !== kind) continue;
          // Seek backward exponentially to bracket the first frame of this cue.
          let high = at;
          let low = Math.max(0, high - 0.10);
          for (let back = 0.1; low > 0 && await cue(video, low) === kind; back *= 2) {
            high = low;
            low = Math.max(0, low - back);
          }
          return refine(video, low, high, kind);
        }
        return null;
      };
      const start = await find('start', [clip.startEstimate + 2, clip.startEstimate, cap / 2,
        cap * 0.76, cap - 3, cap * 0.9]);
      if (!start) throw new Error('Source clip lacks start sync marker: ' + clip.label);
      const endGuess = start.at + clip.telemetryDurationMs / 1000;
      const end = await find('end', [cap, cap - 0.2, endGuess + 0.3, endGuess + 0.8, endGuess + 1.4, cap - 0.6, cap - 1.0]);
      if (!end || end.at <= start.at) throw new Error('Source clip lacks end sync marker: ' + clip.label);
      return { start, end, duration: video.duration, sourceWallComparisonMs:
        1000 * (end.at - start.at) - clip.telemetryDurationMs };
    };
    const anchors = await Promise.all(videos.map((video, i) => locate(video, clips[i])));
    await Promise.all(videos.map((video, i) => seek(video, anchors[i].start.at)));

    const canvas = document.createElement('canvas');
    canvas.width = 1536;
    canvas.height = 376;
    document.body.style.margin = '0';
    document.body.append(canvas);
    const ctx = canvas.getContext('2d', { alpha: false });
    const fps = 24;
    const stream = canvas.captureStream(fps);
    const mimeType = 'video/webm;codecs=vp8';
    if (!MediaRecorder.isTypeSupported(mimeType)) throw new Error('VP8 MediaRecorder unavailable');
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5_000_000 });
    const chunks = [];
    recorder.addEventListener('dataavailable', event => { if (event.data.size) chunks.push(event.data); });
    
    const panelWidth = 512;
    const imageHeight = 288;
    const tailSeconds = 4;
    const introSeconds = 3;
    const metrics = clips.map(() => ({ driftMsMax: 0, driftSamples: 0 }));
    const sound = 'Silent capture';
    const fullSeconds = Math.max(...anchors.map(cue => cue.end.at - cue.start.at));
    const paintText = (text, x, y, size = 21, color = '#eff5f6') => {
      ctx.fillStyle = color;
      ctx.font = size + 'px system-ui, sans-serif';
      ctx.fillText(text, x, y);
    };
    const fmt = value => Number.isFinite(value) ? value.toFixed(3) : '—';
    let outputTicks = 0;
    let missedOutputIntervals = 0;
    let largestOutputIntervalMs = 0;
    let previousPaintAt;
    function draw(total, now) {
      const elapsed = Math.max(0, total - introSeconds);
      ctx.fillStyle = '#101819';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.textBaseline = 'middle';
      paintText((mode === 'input' ? 'Same input' : 'Same objective') + '  ·  ' + elapsed.toFixed(1) + ' s  ·  ' + sound, 12, 16);
      clips.forEach((clip, i) => {
        const x = i * panelWidth;
        const video = videos[i];
        const { start, end } = anchors[i];
        const clipTime = video.currentTime - start.at;
        const eventMs = 1000 * Math.max(0, clipTime);
        const finished = video.currentTime >= end.at - 0.04 || video.ended;
        if (finished && !video.paused) video.pause();
        let label = 'Preparing';
        for (const event of clip.events) if (eventMs >= event.ms) label = event.label;
        if (finished) label = clip.status === 'PASS' ? 'Completed' : clip.status;
        if (total >= introSeconds && !finished) {
          const drift = Math.abs(clipTime - elapsed) * 1000;
          metrics[i].driftMsMax = Math.max(metrics[i].driftMsMax, drift);
          metrics[i].driftSamples++;
        }
        ctx.drawImage(video, x, 33, panelWidth, imageHeight);
        paintText(clip.label + '  ·  ' + label, x + 10, 334, 18);
        paintText('Pressure dose ' + (finished ? fmt(clip.dose) : '…') + '   ·   Reserve ' + (finished ? fmt(clip.reserve) : '…'),
          x + 10, 358, 17, '#b9d5cf');
      });
      if (previousPaintAt !== undefined) {
        const interval = now - previousPaintAt;
        largestOutputIntervalMs = Math.max(largestOutputIntervalMs, interval);
        missedOutputIntervals += Math.max(0, Math.round(interval / (1000 / fps)) - 1);
      }
      previousPaintAt = now;
      outputTicks++;
    }
    recorder.start();
    const start = performance.now();
    let playing = false;
    await new Promise((resolve, reject) => {
      const frame = now => {
        try {
          const total = Math.max(0, (now - start) / 1000);
          if (total >= fullSeconds + introSeconds + tailSeconds) { resolve(); return; }
          if (total >= introSeconds && !playing) {
            playing = true;
            for (const video of videos) video.play().catch(reject);
          }
          if (previousPaintAt === undefined || now - previousPaintAt >= 33) draw(total, now);
          requestAnimationFrame(frame);
        } catch (error) { reject(error); }
      };
      requestAnimationFrame(frame);
    });
    const recordEnd = nextEvent(recorder, 'stop');
    recorder.stop();
    await recordEnd;
    for (const track of stream.getTracks()) track.stop();
    const href = URL.createObjectURL(new Blob(chunks, { type: mimeType }));
    const link = document.createElement('a');
    link.href = href;
    link.download = 'DL-EXP-001-' + mode + '.webm';
    link.click();
    return { anchors, outputTicks, estimatedMissedOutputIntervals: missedOutputIntervals, largestOutputIntervalMs,
      durationSeconds: fullSeconds + introSeconds + tailSeconds, dimensions: [canvas.width, canvas.height],
      audio: 'No audio captured by Playwright source recorder', panels: videos.map((video, i) => {
        const quality = video.getVideoPlaybackQuality();
        return { label: clips[i].label, ...metrics[i], decodedFrames: quality.totalVideoFrames,
          droppedDuringDecode: quality.droppedVideoFrames, sourceCaptureDroppedFrames: 'unavailable from source encoder' };
      }) };
  }, { clips, mode });
}

async function main() {
  const [runsDirArg, outArg] = process.argv.slice(2);
  if (!runsDirArg || !outArg) throw new Error('Usage: node BLOB_BOT_SERIES1/director/compose.mjs <run-dir> <new-output-dir>');
  const runsDir = path.resolve(runsDirArg);
  const out = path.resolve(outArg);
  const report = await readJSON(path.join(runsDir, 'runs.json'));
  if (report.status !== 'PASS' || report.runs.length !== 6) throw new Error('Composition requires six accepted, matched trials');
  await mkdir(out);
  const source = new Map();
  const clips = {};
  for (const mode of modes) {
    clips[mode] = [];
    for (const run of report.runs.filter(r => r.mode === mode)) {
      const local = path.resolve(runsDir, run.scenario + '-' + mode, 'gameplay.webm');
      if (path.resolve(run.video) !== local) throw new Error('Unexpected raw video path');
      const trial = await readJSON(path.join(path.dirname(local), 'trial.json'));
      const { evidence } = trial;
      const id = mode + '-' + clips[mode].length;
      const url = '/video/' + id;
      source.set(url, { local, size: (await stat(local)).size });
      const events = [];
      const accepted = evidence.samples.find(s => s.flow?.effect?.acceptedCurrent01 > 0);
      const add = (sample, label) => {
        if (Number.isFinite(sample?.wallMs)) events.push({ ms: sample.wallMs - evidence.replayAnchor.wallMs, label });
      };
      add(accepted, 'Current accepted');
      add(evidence.releaseCommand, 'Released');
      const name = run.scenario.split('.').at(-1);
      clips[mode].push({ label: name[0].toUpperCase() + name.slice(1), url,
        status: run.evaluation.status, dose: run.evaluation.dose, reserve: run.evaluation.reserveAtEnd, events,
        startEstimate: (evidence.timeOrigin + evidence.replayAnchor.wallMs - trial.started) / 1000,
        telemetryDurationMs: evidence.end.wallMs - evidence.replayAnchor.wallMs });
    }
  }
  const server = http.createServer((request, response) => {
    if (request.url === '/') {
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      response.end('<!doctype html><title>Director compositor</title>');
      return;
    }
    const media = source.get(request.url);
    if (!media) { response.writeHead(404).end(); return; }
    const range = /^bytes=(\d+)-(\d*)$/.exec(request.headers.range ?? '');
    const start = range ? Number(range[1]) : 0;
    const end = range && range[2] ? Number(range[2]) : media.size - 1;
    if (start > end || end >= media.size) { response.writeHead(416).end(); return; }
    response.writeHead(range ? 206 : 200, {
      'Content-Type': 'video/webm', 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1,
      ...(range ? { 'Content-Range': `bytes ${start}-${end}/${media.size}` } : {})
    });
    createReadStream(media.local, { start, end }).pipe(response);
  });
  let browser;
  try {
    await new Promise((resolve, reject) => server.listen(0, '127.0.0.1', resolve).once('error', reject));
    const executablePath = process.env.BLOB_BOT_CHROMIUM_EXECUTABLE;
    browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
    const context = await browser.newContext({ viewport: { width: 1536, height: 376 }, acceptDownloads: true });
    const results = {};
    for (const mode of modes) {
      const page = await context.newPage();
      await page.goto('http://127.0.0.1:' + server.address().port);
      const [download, result] = await Promise.all([
        page.waitForEvent('download', { timeout: 180_000 }), composeGroup(page, clips[mode], mode)
      ]);
      const video = path.join(out, 'DL-EXP-001-' + mode + '.webm');
      await download.saveAs(video);
      results[mode] = { ...result, video, bytes: (await stat(video)).size };
      await writeFile(path.join(out, mode + '-sync.json'), JSON.stringify(results[mode], null, 2) + '\n', { flag: 'wx' });
      await page.close();
    }
    await writeFile(path.join(out, 'composition.json'), JSON.stringify(results, null, 2) + '\n', { flag: 'wx' });
    console.log(JSON.stringify(results));
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
  }
}

try { await main(); } catch (error) { console.error(error.stack); process.exitCode = 1; }
