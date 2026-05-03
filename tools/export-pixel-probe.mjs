#!/usr/bin/env node

import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT || 8765);
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
  const wait = async (predicate, timeoutMs = 45000, label = "condition") => {
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
      control.value = String(value);
    }
    control.dispatchEvent(new Event("input", { bubbles: true }));
    control.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const setChoice = (id, value) => {
    const control = document.getElementById(id);
    if (!control) throw new Error("Missing control " + id);
    control.value = value;
    control.dispatchEvent(new Event("input", { bubbles: true }));
    control.dispatchEvent(new Event("change", { bubbles: true }));
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

  const componentBox = (imageData, rgb, threshold = 95) => {
    const { data, width, height } = imageData;
    let count = 0;
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;
    let sumX = 0;
    let sumY = 0;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = (y * width + x) * 4;
        if (colorDistance(data, index, rgb) <= threshold) {
          count += 1;
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
          sumX += x;
          sumY += y;
        }
      }
    }
    if (count === 0) {
      return { count, minX: null, minY: null, maxX: null, maxY: null, centerX: null, centerY: null, radius: 0 };
    }
    return {
      count,
      minX,
      minY,
      maxX,
      maxY,
      centerX: sumX / count,
      centerY: sumY / count,
      radius: ((maxX - minX + 1) + (maxY - minY + 1)) / 4
    };
  };

  const countColorPixels = (imageData, rgb, threshold = 55) => {
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

  const previewImageData = () => {
    const canvas = document.getElementById("stage");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  };

  const isControlVisible = (id) => {
    const control = document.getElementById(id);
    return Boolean(control && control.offsetParent !== null);
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

  const exportAndRead = async () => {
    const previousSrc = document.getElementById("exportedVideo").src;
    const exportButton = document.getElementById("exportButton");
    if (exportButton.disabled) {
      throw new Error(
        "Export button disabled: " +
          document.getElementById("statusText").textContent +
          " MediaRecorder=" +
          (typeof MediaRecorder !== "undefined") +
          " captureStream=" +
          Boolean(document.createElement("canvas").captureStream)
      );
    }
    exportButton.click();
    let video;
    try {
      video = await wait(() => {
        const current = document.getElementById("exportedVideo");
        return current.src && current.src !== previousSrc ? current : null;
      }, 60000, "exported video src");
    } catch (error) {
      throw new Error(
        error.message +
          '; status="' +
          document.getElementById("statusText").textContent +
          '"; download="' +
          document.getElementById("downloadLink").href +
          '"; video="' +
          document.getElementById("exportedVideo").src +
          '"'
      );
    }
    await wait(() => video.readyState >= 1, 15000, "exported video metadata");
    const metadata = await fetch(document.getElementById("metadataJsonLink").href).then((response) => response.json());
    return { video, metadata };
  };

  await wait(() => window.launchingVideoMakerReady && document.getElementById("outputFormat"), 15000, "app ready");

  const commonControls = () => {
    setChoice("outputFormat", "webm-vp8");
    setControl("exportHeightPx", 360);
    setControl("fps", 30);
    setControl("videoBitrate", 4);
    setControl("contextMode", "none");
    setControl("contextPairCount", 1);
    setControl("trajectoryEditEnabled", false);
    setControl("soundEnabled", false);
    setControl("crosshairEnabled", false);
    setControl("physicsEngineEnabled", false);
    setChoice("renderMode", "stimulus");
    setChoice("stageTheme", "dark");
    setChoice("objectStyle", "flat");
    setControl("launcherVisibleMs", 9000);
    setControl("targetVisibleMs", 9000);
    setControl("targetTravelMs", 9000);
  };

  commonControls();
  setControl("durationMs", 900);
  setControl("gapPx", 0);
  setControl("delayMs", 0);
  setControl("fileLabel", "probe-contact");
  const contactExport = await exportAndRead();
  const contactTime = contactExport.metadata.timing.impactSec;
  const contactSamples = [];
  for (let offsetFrame = -3; offsetFrame <= 6; offsetFrame += 1) {
    const sampleSec = contactTime + offsetFrame / contactExport.metadata.timing.nativeMovieFps;
    const contactFrame = await sampleVideo(contactExport.video, sampleSec);
    const red = componentBox(contactFrame, hexToRgb(contactExport.metadata.parameters.launcherColor));
    const green = componentBox(contactFrame, hexToRgb(contactExport.metadata.parameters.targetColor));
    const bboxGapPx = red.count && green.count ? green.minX - red.maxX - 1 : null;
    const centerGapPx =
      red.count && green.count
        ? Math.hypot(green.centerX - red.centerX, green.centerY - red.centerY) - red.radius - green.radius
        : null;
    contactSamples.push({
      sampledSec: Number(sampleSec.toFixed(3)),
      bboxGapPx,
      centerGapPx: centerGapPx === null ? null : Number(centerGapPx.toFixed(2)),
      red,
      green
    });
  }
  const bestContact = contactSamples
    .filter((sample) => sample.centerGapPx !== null)
    .sort((a, b) => Math.abs(a.centerGapPx) - Math.abs(b.centerGapPx))[0];

  commonControls();
  setControl("durationMs", 1000);
  setControl("gapPx", 0);
  setControl("targetVisibleMs", 150);
  setControl("fileLabel", "probe-o2-visible");
  const visibilityExport = await exportAndRead();
  const onsetSec = visibilityExport.metadata.timing.targetOnsetSec;
  const visibilitySamples = [];
  for (const offsetSec of [-0.05, 0.1, 0.22]) {
    const frame = await sampleVideo(visibilityExport.video, onsetSec + offsetSec);
    const box = componentBox(frame, hexToRgb(visibilityExport.metadata.parameters.targetColor));
    visibilitySamples.push({
      timeSec: Number((onsetSec + offsetSec).toFixed(3)),
      offsetFromO2StartSec: offsetSec,
      greenPixelCount: box.count
    });
  }

  commonControls();
  setControl("durationMs", 1200);
  setControl("gapPx", 0);
  setControl("targetTravelMs", 150);
  setControl("targetVisibleMs", 9000);
  setControl("fileLabel", "probe-travel-time");
  const travelExport = await exportAndRead();
  const travelOnsetSec = travelExport.metadata.timing.targetOnsetSec;
  const travelRgb = hexToRgb(travelExport.metadata.parameters.targetColor);
  const travelOffsets = [0.04, 0.14, 0.28, 0.38];
  const travelBoxes = [];
  for (const offsetSec of travelOffsets) {
    const frame = await sampleVideo(travelExport.video, travelOnsetSec + offsetSec);
    const box = componentBox(frame, travelRgb);
    travelBoxes.push({
      timeSec: Number((travelOnsetSec + offsetSec).toFixed(3)),
      offsetFromO2StartSec: offsetSec,
      centerX: box.centerX === null ? null : Number(box.centerX.toFixed(2)),
      centerY: box.centerY === null ? null : Number(box.centerY.toFixed(2)),
      greenPixelCount: box.count
    });
  }
  const travelDelta = (from, to) =>
    from.centerX === null || to.centerX === null
      ? null
      : Math.hypot(to.centerX - from.centerX, to.centerY - from.centerY);
  const movingWindowPx = travelDelta(travelBoxes[0], travelBoxes[1]);
  const stoppedWindowPx = travelDelta(travelBoxes[2], travelBoxes[3]);

  commonControls();
  setControl("durationMs", 1800);
  setControl("launcherSpeed", 500);
  setControl("physicsEngineEnabled", true);
  setControl("billiardFriction", 900);
  setControl("billiardWallRestitution", 0.8);
  setControl("fileLabel", "probe-billiard");
  const billiardExport = await exportAndRead();
  const billiardFrame = await sampleVideo(billiardExport.video, 1.75);
  const billiardTarget = componentBox(billiardFrame, hexToRgb(billiardExport.metadata.parameters.targetColor));
  const rightRailCenterX = billiardFrame.width - billiardTarget.radius;

  commonControls();
  setControl("durationMs", 1200);
  setControl("physicsEngineEnabled", true);
  setControl("trajectoryEditEnabled", true);
  await wait(() => isControlVisible("selectedTrajectoryAngle"), 15000, "trajectory controls visible");
  const trajectoryFrame = previewImageData();
  const trajectoryHighlightPixels = countColorPixels(trajectoryFrame, [232, 197, 116], 65);
  const trajectoryStatus = document.getElementById("statusText").textContent.trim();
  const billiardOffAfterTrajectoryToggle = !document.getElementById("physicsEngineEnabled").checked;
  const selectedTrajectoryAngleVisible = isControlVisible("selectedTrajectoryAngle");

  commonControls();
  setControl("durationMs", 1800);
  setControl("contextMode", "launch");
  setControl("contextPairCount", 3);
  setControl("soundEnabled", true);
  setControl("fileLabel", "probe-context-sound");
  const contextSoundExport = await exportAndRead();
  const contextSoundEvents = contextSoundExport.metadata.sound?.cueEvents || [];
  const contextSoundLabels = contextSoundEvents.map((event) => event.label);

  commonControls();
  setControl("durationMs", 2400);
  setControl("physicsEngineEnabled", true);
  setControl("billiardFriction", 0);
  setControl("billiardWallRestitution", 0.8);
  setControl("soundEnabled", true);
  setControl("fileLabel", "probe-billiard-sound");
  const billiardSoundExport = await exportAndRead();
  const billiardSoundEvents = billiardSoundExport.metadata.sound?.cueEvents || [];
  const billiardSoundLabels = billiardSoundEvents.map((event) => event.label);

  return {
    contact: {
      expectedImpactSec: Number(contactTime.toFixed(3)),
      best: bestContact,
      samples: contactSamples.map((sample) => ({
        sampledSec: sample.sampledSec,
        bboxGapPx: sample.bboxGapPx,
        centerGapPx: sample.centerGapPx
      }))
    },
    o2Visibility: {
      targetOnsetSec: onsetSec,
      targetVisibleMs: 150,
      samples: visibilitySamples
    },
    travelTime: {
      targetOnsetSec: travelOnsetSec,
      targetTravelAfterCollisionMs: travelExport.metadata.parameters.targetTravelMs,
      metadataTravelAfterCollisionSec: travelExport.metadata.timing.targetTravelAfterCollisionSec,
      samples: travelBoxes,
      movingWindowPx: movingWindowPx === null ? null : Number(movingWindowPx.toFixed(2)),
      stoppedWindowPx: stoppedWindowPx === null ? null : Number(stoppedWindowPx.toFixed(2)),
      movingBeforeLimit: movingWindowPx !== null && movingWindowPx > 2,
      stoppedAfterLimit: stoppedWindowPx !== null && stoppedWindowPx < 2.5
    },
    billiard: {
      sampledSec: 1.75,
      frictionPxPerSec2: billiardExport.metadata.parameters.billiardFriction,
      targetCenterX: billiardTarget.centerX === null ? null : Number(billiardTarget.centerX.toFixed(2)),
      rightRailCenterX: Number(rightRailCenterX.toFixed(2)),
      stoppedBeforeRightRail: billiardTarget.centerX !== null && billiardTarget.centerX < rightRailCenterX - 8
    },
    trajectoryOverlay: {
      billiardOffAfterTrajectoryToggle,
      selectedAngleVisible: selectedTrajectoryAngleVisible,
      highlightPixels: trajectoryHighlightPixels,
      overlayVisible: trajectoryHighlightPixels > 250,
      status: trajectoryStatus
    },
    soundCues: {
      contextLaunch: {
        eventCount: contextSoundEvents.length,
        timesMs: contextSoundEvents.map((event) => Math.round(event.timeMs)),
        labels: contextSoundLabels,
        hasOriginalCollision: contextSoundLabels.includes("Original pair collision"),
        hasContext1Collision: contextSoundLabels.includes("Context 1 collision"),
        hasContext2Collision: contextSoundLabels.includes("Context 2 collision"),
        hasContext3Collision: contextSoundLabels.includes("Context 3 collision")
      },
      billiard: {
        eventCount: billiardSoundEvents.length,
        timesMs: billiardSoundEvents.map((event) => Math.round(event.timeMs)),
        labels: billiardSoundLabels,
        hasOriginalCollision: billiardSoundLabels.includes("Original pair collision"),
        hasRailCollision: billiardSoundLabels.some((label) => label.includes("rail collision"))
      }
    }
  };
})()
`;

async function main() {
  const tempProfile = await mkdtemp(path.join(tmpdir(), "launching-probe-chrome-"));
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
    const result = await cdp.send("Runtime.evaluate", {
      expression: browserProbe,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true,
      timeout: 120000
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.text || "Browser probe failed");
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
