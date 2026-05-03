#!/usr/bin/env node

import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT || 8776);
const origin = `http://127.0.0.1:${port}`;
const chromePath =
  process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHttp(url, timeoutMs = 15000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Server is still starting.
    }
    await delay(150);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function waitForJson(url, timeoutMs = 15000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return response.json();
      }
    } catch {
      // Chrome is still starting.
    }
    await delay(150);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function connectWebSocket(url) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url);
    socket.addEventListener("open", () => resolve(socket), { once: true });
    socket.addEventListener("error", () => reject(new Error(`Cannot connect to ${url}`)), { once: true });
  });
}

class CdpClient {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 1;
    this.pending = new Map();
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (!message.id || !this.pending.has(message.id)) {
        return;
      }
      const { resolve, reject } = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) {
        reject(new Error(message.error.message || "CDP command failed"));
      } else {
        resolve(message.result || {});
      }
    });
  }

  send(method, params = {}) {
    const id = this.nextId;
    this.nextId += 1;
    this.socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
  }

  close() {
    this.socket.close();
  }
}

const browserProbe = String.raw`
(async () => {
  const wait = async (predicate, timeoutMs = 60000, label = "condition") => {
    const started = performance.now();
    while (performance.now() - started < timeoutMs) {
      const value = await predicate();
      if (value) return value;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error("Timed out waiting for " + label);
  };

  const setControl = (id, value) => {
    const control = document.getElementById(id);
    if (!control) throw new Error("Missing control " + id);
    if (control.type === "checkbox") {
      control.checked = Boolean(value);
    } else {
      if (control.type === "range" && control.dataset.hardMax) {
        const number = Number(value);
        const softMax = Number(control.dataset.softMax || control.max);
        const hardMax = Number(control.dataset.hardMax);
        if (Number.isFinite(number) && Number.isFinite(softMax) && Number.isFinite(hardMax)) {
          control.max = String(number > softMax ? Math.min(number, hardMax) : softMax);
        }
      }
      control.value = String(value);
    }
    control.dispatchEvent(new Event("input", { bubbles: true }));
    control.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const sampleVideo = async (video, timeSec) => {
    await new Promise((resolve) => {
      const done = () => {
        video.removeEventListener("seeked", done);
        resolve();
      };
      video.addEventListener("seeked", done);
      video.currentTime = Math.max(0, Math.min(timeSec, Math.max(0, video.duration - 0.02)));
    });
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  };

  const hexToRgb = (hex) => {
    const clean = hex.replace("#", "");
    return [
      parseInt(clean.slice(0, 2), 16),
      parseInt(clean.slice(2, 4), 16),
      parseInt(clean.slice(4, 6), 16)
    ];
  };

  const colorDistance = (data, index, rgb) => {
    const dr = data[index] - rgb[0];
    const dg = data[index + 1] - rgb[1];
    const db = data[index + 2] - rgb[2];
    return Math.sqrt(dr * dr + dg * dg + db * db);
  };

  const countColorPixels = (imageData, rgb, threshold = 75) => {
    const { data, width, height } = imageData;
    let count = 0;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = (y * width + x) * 4;
        if (colorDistance(data, index, rgb) <= threshold) {
          count += 1;
        }
      }
    }
    return count;
  };

  const parseCsv = (text) => {
    const rows = [];
    let row = [];
    let cell = "";
    let quoted = false;
    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      if (char === '"' && quoted && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = !quoted;
      } else if (char === "," && !quoted) {
        row.push(cell);
        cell = "";
      } else if ((char === "\n" || char === "\r") && !quoted) {
        if (char === "\r" && text[index + 1] === "\n") index += 1;
        row.push(cell);
        if (row.some((value) => value !== "")) rows.push(row);
        row = [];
        cell = "";
      } else {
        cell += char;
      }
    }
    if (cell || row.length) {
      row.push(cell);
      rows.push(row);
    }
    const [headers, ...dataRows] = rows;
    return dataRows.map((dataRow) =>
      Object.fromEntries(headers.map((header, index) => [header, dataRow[index] ?? ""]))
    );
  };

  const fetchTextFromLink = async (id) => {
    const link = document.getElementById(id);
    if (!link?.href) throw new Error("Missing generated link " + id);
    return fetch(link.href).then((response) => response.text());
  };

  await wait(() => window.launchingVideoMakerReady && document.getElementById("exportButton"), 15000, "app ready");

  setControl("outputFormat", "webm-vp8");
  setControl("exportHeightPx", 360);
  setControl("fps", 20);
  setControl("videoBitrate", 2);
  setControl("renderMode", "stimulus");
  setControl("stageTheme", "dark");
  setControl("objectStyle", "flat");
  setControl("contextMode", "none");
  setControl("durationMs", 600);
  setControl("launcherColor", "#ff3030");
  setControl("targetColor", "#28c76f");
  setControl("fileLabel", "sequence-probe");
  setControl("soundEnabled", false);
  setControl("physicsEngineEnabled", false);

  document.getElementById("sequenceAddClipButton").click();
  await wait(() => document.querySelectorAll("#sequenceClipList [data-sequence-index]").length === 2, 5000, "two clips");

  setControl("durationMs", 900);
  setControl("launcherColor", "#2c7be5");
  setControl("targetColor", "#ffd447");
  setControl("targetAngle", 35);

  const previousSrc = document.getElementById("exportedVideo").src;
  const exportButton = document.getElementById("exportButton");
  if (exportButton.disabled) {
    throw new Error("Export button disabled: " + document.getElementById("statusText").textContent);
  }
  exportButton.click();

  const video = await wait(() => {
    const current = document.getElementById("exportedVideo");
    return current.src && current.src !== previousSrc ? current : null;
  }, 60000, "exported sequence video");
  await wait(() => video.readyState >= 1 && Number.isFinite(video.duration), 15000, "video metadata");

  const metadata = await fetch(document.getElementById("metadataJsonLink").href).then((response) => response.json());
  const psychopyRows = parseCsv(await fetchTextFromLink("psychopyLink"));

  const previousFrameLog = document.getElementById("positionCsvLink").href;
  document.getElementById("positionCsvButton").click();
  await wait(() => document.getElementById("positionCsvLink").href && document.getElementById("positionCsvLink").href !== previousFrameLog, 15000, "frame log CSV");
  const frameLogRows = parseCsv(await fetchTextFromLink("positionCsvLink"));

  const clip1Frame = await sampleVideo(video, 0.3);
  const clip2Frame = await sampleVideo(video, 0.9);
  const clip1RedPixels = countColorPixels(clip1Frame, hexToRgb("#ff3030"));
  const clip1BluePixels = countColorPixels(clip1Frame, hexToRgb("#2c7be5"));
  const clip2RedPixels = countColorPixels(clip2Frame, hexToRgb("#ff3030"));
  const clip2BluePixels = countColorPixels(clip2Frame, hexToRgb("#2c7be5"));

  const clipIndices = [...new Set(frameLogRows.map((row) => row.clipIndex).filter(Boolean))];
  const frameLogClipStarts = Object.fromEntries(
    frameLogRows
      .filter((row) => row.frame === "0" || row.frame === "12")
      .map((row) => [row.clipIndex + ":" + row.frame, row.clipStartMs])
  );

  return {
    statusText: document.getElementById("statusText").textContent,
    exportMeta: document.getElementById("exportMeta").textContent,
    downloadName: document.getElementById("downloadLink").download,
    video: {
      durationSec: Number(video.duration.toFixed(3)),
      width: video.videoWidth,
      height: video.videoHeight
    },
    metadata: {
      compositionEnabled: metadata.composition?.enabled,
      clipCount: metadata.composition?.clipCount,
      totalDurationMs: metadata.composition?.totalDurationMs,
      timingFrameCount: metadata.timing?.frameCount,
      encodedDurationSec: metadata.timing?.encodedDurationSec,
      intendedDurationSec: metadata.timing?.intendedDurationSec,
      clipStartsMs: metadata.composition?.clips?.map((clip) => clip.startMs),
      clipDurationsMs: metadata.composition?.clips?.map((clip) => clip.durationMs),
      clipColors: metadata.composition?.clips?.map((clip) => [
        clip.parameters.launcherColor,
        clip.parameters.targetColor
      ])
    },
    psychopy: {
      rows: psychopyRows.length,
      compositionClipCount: psychopyRows[0]?.compositionClipCount,
      compositionClipStartsMs: psychopyRows[0]?.compositionClipStartsMs,
      compositionClipDurationsMs: psychopyRows[0]?.compositionClipDurationsMs,
      movieDurationSec: psychopyRows[0]?.movieDurationSec,
      intendedDurationSec: psychopyRows[0]?.intendedDurationSec
    },
    frameLog: {
      rows: frameLogRows.length,
      clipIndices,
      frameLogClipStarts
    },
    pixels: {
      clip1RedPixels,
      clip1BluePixels,
      clip2RedPixels,
      clip2BluePixels,
      clip1LooksRed: clip1RedPixels > 500 && clip1RedPixels > clip1BluePixels * 4,
      clip2LooksBlue: clip2BluePixels > 500 && clip2BluePixels > clip2RedPixels * 4
    },
    pass: {
      sequenceMetadata:
        metadata.composition?.enabled === true &&
        metadata.composition?.clipCount === 2 &&
        metadata.composition?.totalDurationMs === 1500,
      psychopyComposition:
        psychopyRows.length === 1 &&
        psychopyRows[0]?.compositionClipCount === "2" &&
        psychopyRows[0]?.compositionClipStartsMs === "0|600" &&
        psychopyRows[0]?.compositionClipDurationsMs === "600|900",
      frameLogComposition: clipIndices.includes("1") && clipIndices.includes("2"),
      videoDuration: Math.abs(video.duration - metadata.timing.encodedDurationSec) < 0.25,
      distinctClipPixels:
        clip1RedPixels > 500 &&
        clip1RedPixels > clip1BluePixels * 4 &&
        clip2BluePixels > 500 &&
        clip2BluePixels > clip2RedPixels * 4
    }
  };
})()
`;

async function main() {
  const tempProfile = await mkdtemp(path.join(tmpdir(), "launching-sequence-probe-chrome-"));
  const server = spawn("python3", ["serve.py", "--port", String(port)], {
    cwd: repoRoot,
    stdio: ["ignore", "ignore", "ignore"]
  });
  let chrome;
  let cdp;

  try {
    await waitForHttp(origin);
    chrome = spawn(
      chromePath,
      [
        "--headless=new",
        `--remote-debugging-port=${port + 1}`,
        `--user-data-dir=${tempProfile}`,
        "--autoplay-policy=no-user-gesture-required",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        origin
      ],
      { stdio: ["ignore", "ignore", "ignore"] }
    );

    const tabs = await waitForJson(`http://127.0.0.1:${port + 1}/json/list`);
    const page = tabs.find((tab) => tab.type === "page") || tabs[0];
    if (!page?.webSocketDebuggerUrl) {
      throw new Error("Could not find a debuggable Chrome page");
    }
    cdp = new CdpClient(await connectWebSocket(page.webSocketDebuggerUrl));
    await cdp.send("Runtime.enable");
    await cdp.send("Page.enable");
    await cdp.send("Page.navigate", { url: origin });
    await delay(500);
    const result = await cdp.send("Runtime.evaluate", {
      expression: browserProbe,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true,
      timeout: 120000
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.text || "Sequence export probe failed");
    }
    console.log(JSON.stringify(result.result.value, null, 2));
  } finally {
    cdp?.close();
    chrome?.kill();
    server.kill();
    await rm(tempProfile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }).catch(() => {});
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
