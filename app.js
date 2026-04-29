(function () {
  const canvas = document.getElementById("stage");
  const ctx = canvas.getContext("2d");
  const STAGE_WIDTH = 960;
  const STAGE_HEIGHT = 540;
  const MAX_PREVIEW_PIXEL_RATIO = 3;
  const EXPORT_SCALE = 2;
  const CUSTOM_PRESETS_STORAGE_KEY = "causal-launching-custom-presets-v1";
  const HIDDEN_BUILT_IN_PRESETS_STORAGE_KEY = "causal-launching-hidden-built-ins-v1";

  const presetSelect = document.getElementById("presetSelect");
  const applyPresetButton = document.getElementById("applyPresetButton");
  const presetNameInput = document.getElementById("presetNameInput");
  const savePresetButton = document.getElementById("savePresetButton");
  const deletePresetButton = document.getElementById("deletePresetButton");
  const previewButton = document.getElementById("previewButton");
  const exportButton = document.getElementById("exportButton");
  const metadataButton = document.getElementById("metadataButton");
  const downloadLink = document.getElementById("downloadLink");
  const metadataLink = document.getElementById("metadataLink");
  const statusText = document.getElementById("statusText");
  const stageOverlay = document.querySelector(".stage-overlay");
  const scenarioBadge = document.getElementById("scenarioBadge");
  const timingBadge = document.getElementById("timingBadge");
  const literatureBlurb = document.getElementById("literatureBlurb");
  const presetSummary = document.getElementById("presetSummary");
  const presetNote = document.getElementById("presetNote");
  const videoPanel = document.getElementById("videoPanel");
  const exportMeta = document.getElementById("exportMeta");
  const exportedVideo = document.getElementById("exportedVideo");
  const relationMetric = document.getElementById("relationMetric");
  const categoryMetric = document.getElementById("categoryMetric");
  const captureMetric = document.getElementById("captureMetric");
  const timingMetric = document.getElementById("timingMetric");

  const controlIds = [
    "durationMs",
    "leadInMs",
    "launcherSpeed",
    "launcherAccel",
    "targetSpeedRatio",
    "targetAccel",
    "launcherBehavior",
    "targetAngle",
    "delayMs",
    "gapPx",
    "markerMode",
    "ballRadius",
    "occluderEnabled",
    "occluderWidth",
    "contactOcclusionMode",
    "contextMode",
    "contextDurationMs",
    "contextOffsetMs",
    "contextDirection",
    "contextYOffset",
    "renderMode",
    "stageTheme",
    "objectStyle",
    "colorChangeMode",
    "colorChangeColor",
    "launcherColor",
    "targetColor",
    "contextColor",
    "pxPerDva",
    "fixationDva",
    "stimulusXOffset",
    "stimulusYOffset",
    "soundEnabled",
    "soundType",
    "soundVolume",
    "outputFormat",
    "fps",
    "videoBitrate",
    "fileLabel"
  ];

  const parameterHelp = {
    presetNameInput: "Name saved settings.",
    durationMs: "Total clip length.",
    leadInMs: "Pause before motion starts.",
    launcherSpeed: "First-object speed.",
    launcherAccel: "First-object acceleration.",
    targetSpeedRatio: "Second-object speed ratio.",
    targetAccel: "Second-object acceleration.",
    launcherBehavior: "What the first object does after contact.",
    targetAngle: "Second-object direction.",
    delayMs: "Wait before the second object moves.",
    gapPx: "Contact gap or overlap.",
    markerMode: "Optional distance marker.",
    ballRadius: "Object size.",
    occluderEnabled: "Add a tunnel occluder.",
    occluderWidth: "Tunnel width.",
    contactOcclusionMode: "Which object appears in front.",
    contextMode: "Nearby event type.",
    contextDurationMs: "Context visibility window.",
    contextOffsetMs: "Context timing offset.",
    contextDirection: "Context motion direction.",
    contextYOffset: "Distance between main and context rows.",
    renderMode: "Preview/export display style.",
    stageTheme: "Background luminance.",
    objectStyle: "Flat or shaded objects.",
    colorChangeMode: "Sudden color switch at contact.",
    colorChangeColor: "Post-contact color.",
    launcherColor: "First-object color.",
    targetColor: "Second-object color.",
    contextColor: "Context-object color.",
    pxPerDva: "Pixels per visual degree.",
    fixationDva: "Fixation size.",
    stimulusXOffset: "Horizontal stimulus shift.",
    stimulusYOffset: "Vertical stimulus shift.",
    soundEnabled: "Add impact sound.",
    soundType: "Impact sound type.",
    soundVolume: "Impact sound volume.",
    outputFormat: "Video format preference.",
    fps: "Output frames per second.",
    videoBitrate: "Output video bitrate.",
    fileLabel: "Export filename base."
  };

  const presets = {
    canonical: {
      label: "Clear launch (0% overlap)",
      summary:
        "Reference event from Scholl and Nakayama: 0% overlap, no context, and a direct launch.",
      note:
        "Use this as the clear-launch comparison. The moving disc stops when the second disc starts.",
      literature:
        "Scholl and Nakayama used adjacent-disc launches as the unambiguous causal reference condition.",
      values: {
        durationMs: 1200,
        leadInMs: 200,
        launcherSpeed: 860,
        targetSpeedRatio: 1,
        launcherBehavior: "stop",
        targetAngle: 0,
        delayMs: 0,
        gapPx: 0,
        markerMode: "none",
        ballRadius: 28,
        occluderEnabled: false,
        occluderWidth: 150,
        contextMode: "none",
        contextDurationMs: 750,
        contextOffsetMs: 0,
        contextDirection: "same",
        contextYOffset: 112,
        fps: 60,
        fileLabel: "sn-0-overlap-launch"
      }
    },
    snPassBaseline: {
      label: "Pass baseline (100% overlap)",
      summary:
        "The judged event has 100% overlap and no context; Scholl and Nakayama report mostly pass percepts.",
      note:
        "This is the baseline full-overlap test. Kinematically A stops and B starts, but observers usually see a pass.",
      literature:
        "In Scholl and Nakayama's Experiment 1, the full-overlap event without context was judged causal on 10.7% of trials.",
      values: {
        durationMs: 1200,
        leadInMs: 200,
        launcherSpeed: 860,
        targetSpeedRatio: 1,
        launcherBehavior: "stop",
        targetAngle: 0,
        delayMs: 0,
        gapPx: -56,
        markerMode: "none",
        ballRadius: 28,
        occluderEnabled: false,
        occluderWidth: 150,
        contextMode: "none",
        contextDurationMs: 750,
        contextOffsetMs: 0,
        contextDirection: "same",
        contextYOffset: 112,
        fps: 60,
        fileLabel: "sn-100-overlap-pass"
      }
    },
    causalCaptureScenario: {
      label: "Causal capture demo",
      summary:
        "A full-overlap test event is judged while a synchronized nearby launch supplies the causal context.",
      note:
        "Use this as the quick demo condition: the upper event is the ambiguous test, and the lower event is the inducer.",
      literature:
        "This recreates Scholl and Nakayama's causal-capture logic: the same 100% overlap event looks mostly like a pass alone, but looks causal when paired with a synchronized nearby launch.",
      values: {
        durationMs: 1400,
        leadInMs: 240,
        launcherSpeed: 760,
        targetSpeedRatio: 1,
        launcherBehavior: "stop",
        targetAngle: 0,
        delayMs: 0,
        gapPx: -56,
        markerMode: "none",
        ballRadius: 30,
        occluderEnabled: false,
        occluderWidth: 150,
        contextMode: "launch",
        contextDurationMs: 750,
        contextOffsetMs: 0,
        contextDirection: "same",
        contextYOffset: 120,
        renderMode: "stimulus",
        stageTheme: "dark",
        fps: 60,
        fileLabel: "causal-capture-scenario"
      }
    },
    delayed: {
      label: "Delayed launch control",
      summary:
        "Delay the target after contact to weaken the causal impression while keeping the rest of the event canonical.",
      note:
        "Michotte-style delay manipulations are useful for shifting participants from direct launching toward delayed launching or independent motion.",
      literature:
        "Michotte and later replications report acute sensitivity to delay: ratings begin to weaken quickly, and delayed-launch impressions peak around the 70-100 ms region.",
      values: {
        durationMs: 2800,
        leadInMs: 340,
        launcherSpeed: 270,
        targetSpeedRatio: 0.92,
        launcherBehavior: "stop",
        targetAngle: 0,
        delayMs: 95,
        gapPx: 0,
        markerMode: "none",
        ballRadius: 28,
        occluderEnabled: false,
        occluderWidth: 150,
        contextMode: "none",
        contextOffsetMs: 0,
        contextDirection: "same",
        contextYOffset: 135,
        fps: 30,
        fileLabel: "delayed-launching"
      }
    },
    gapped: {
      label: "Gap control",
      summary:
        "Stop the launcher short of the target. Gap displays often weaken causal appearance, though speed and wording matter.",
      note:
        "This is a good non-canonical comparison for experiments that want to separate visible contact from a broader making-move impression.",
      literature:
        "Spatial gaps generally reduce launching ratings. Recent replication work suggests the decline is strong but not always all-or-none, especially at higher speeds.",
      values: {
        durationMs: 2600,
        leadInMs: 320,
        launcherSpeed: 320,
        targetSpeedRatio: 0.9,
        launcherBehavior: "stop",
        targetAngle: 0,
        delayMs: 0,
        gapPx: 22,
        markerMode: "none",
        ballRadius: 28,
        occluderEnabled: false,
        occluderWidth: 150,
        contextMode: "none",
        contextOffsetMs: 0,
        contextDirection: "same",
        contextYOffset: 135,
        fps: 30,
        fileLabel: "spatial-gap"
      }
    },
    capture: {
      label: "Capture: nearby launch",
      summary:
        "The same 100% overlap test is paired with a synchronized nearby launch context.",
      note:
        "This is the main causal-capture preset: judge the upper event while the lower event supplies a clear launch.",
      literature:
        "Scholl and Nakayama report 92.1% causal reports for this synchronized launch-context condition, compared with 10.7% for the same test alone.",
      values: {
        durationMs: 1200,
        leadInMs: 200,
        launcherSpeed: 860,
        targetSpeedRatio: 1,
        launcherBehavior: "stop",
        targetAngle: 0,
        delayMs: 0,
        gapPx: -56,
        markerMode: "none",
        ballRadius: 28,
        occluderEnabled: false,
        occluderWidth: 150,
        contextMode: "launch",
        contextDurationMs: 750,
        contextOffsetMs: 0,
        contextDirection: "same",
        contextYOffset: 112,
        fps: 60,
        fileLabel: "sn-causal-capture"
      }
    },
    snSingleContext: {
      label: "Control: single moving object",
      summary:
        "The 100% overlap test is paired with one moving context disc, not a launch.",
      note:
        "This checks whether mere nearby motion is enough. In the paper, it was not.",
      literature:
        "Scholl and Nakayama's single-object context produced only 5% causal reports, so the context must be launch-like rather than merely salient.",
      values: {
        durationMs: 1200,
        leadInMs: 200,
        launcherSpeed: 860,
        targetSpeedRatio: 1,
        launcherBehavior: "stop",
        targetAngle: 0,
        delayMs: 0,
        gapPx: -56,
        markerMode: "none",
        ballRadius: 28,
        occluderEnabled: false,
        occluderWidth: 150,
        contextMode: "single",
        contextDurationMs: 750,
        contextOffsetMs: 0,
        contextDirection: "same",
        contextYOffset: 112,
        fps: 60,
        fileLabel: "sn-single-context-control"
      }
    },
    captureBrief50: {
      label: "Capture with 50 ms context",
      summary:
        "Only the impact-centered part of the launch context is shown.",
      note:
        "Use this to recreate the duration result: a very short causal context still captures the test event.",
      literature:
        "In Scholl and Nakayama's duration manipulation, a 50 ms impact-centered launch context still yielded 60.7% causal reports.",
      values: {
        durationMs: 1200,
        leadInMs: 200,
        launcherSpeed: 860,
        targetSpeedRatio: 1,
        launcherBehavior: "stop",
        targetAngle: 0,
        delayMs: 0,
        gapPx: -56,
        markerMode: "none",
        ballRadius: 28,
        occluderEnabled: false,
        occluderWidth: 150,
        contextMode: "launch",
        contextDurationMs: 50,
        contextOffsetMs: 0,
        contextDirection: "same",
        contextYOffset: 112,
        fps: 60,
        fileLabel: "sn-50ms-context-window"
      }
    },
    captureAsync200: {
      label: "Control: context 200 ms early",
      summary:
        "The launch context occurs 200 ms before the full-overlap test event.",
      note:
        "This is the temporal-asynchrony control. It should strongly weaken capture.",
      literature:
        "Scholl and Nakayama report that a 200 ms asynchrony reduced causal reports to a small minority, about 20%.",
      values: {
        durationMs: 1200,
        leadInMs: 200,
        launcherSpeed: 860,
        targetSpeedRatio: 1,
        launcherBehavior: "stop",
        targetAngle: 0,
        delayMs: 0,
        gapPx: -56,
        markerMode: "none",
        ballRadius: 28,
        occluderEnabled: false,
        occluderWidth: 150,
        contextMode: "launch",
        contextDurationMs: 750,
        contextOffsetMs: -200,
        contextDirection: "same",
        contextYOffset: 112,
        fps: 60,
        fileLabel: "sn-200ms-async-control"
      }
    },
    captureOpposite: {
      label: "Control: opposite-direction context",
      summary:
        "The context remains a launch, but its motion direction is reversed.",
      note:
        "This recreates the directional-phase check. Capture should persist but be weaker than same-direction launch context.",
      literature:
        "Scholl and Nakayama found that same-direction motion produced stronger capture, though opposite-direction launch context still produced some capture.",
      values: {
        durationMs: 1200,
        leadInMs: 200,
        launcherSpeed: 860,
        targetSpeedRatio: 1,
        launcherBehavior: "stop",
        targetAngle: 0,
        delayMs: 0,
        gapPx: -56,
        markerMode: "none",
        ballRadius: 28,
        occluderEnabled: false,
        occluderWidth: 150,
        contextMode: "launch",
        contextDurationMs: 750,
        contextOffsetMs: 0,
        contextDirection: "opposite",
        contextYOffset: 112,
        fps: 60,
        fileLabel: "sn-opposite-direction-capture"
      }
    },
    occludedCapture: {
      label: "Hidden launch with occluder",
      summary:
        "A tunnel occluder makes the main event ambiguous between a pass-through and a hidden launch. A nearby launch context biases the hidden-launch reading.",
      note:
        "This is an amodal-causal-capture style display: the visible motion on the main row is sparse, but context can still favor a causal interpretation behind the occluder.",
      literature:
        "Bae and Flombaum report that tunnel events are usually judged as passes in isolation, but synchronized causal context can make observers see a hidden launch behind the occluder.",
      values: {
        durationMs: 2800,
        leadInMs: 320,
        launcherSpeed: 260,
        targetSpeedRatio: 0.95,
        launcherBehavior: "stop",
        targetAngle: 0,
        delayMs: 30,
        gapPx: 0,
        markerMode: "none",
        ballRadius: 28,
        occluderEnabled: true,
        occluderWidth: 190,
        contextMode: "launch",
        contextOffsetMs: 0,
        contextDirection: "same",
        contextYOffset: 160,
        fps: 30,
        fileLabel: "occluded-hidden-launch"
      }
    },
    tunnelPass: {
      label: "Tunnel pass",
      summary:
        "Occluded motion without causal context tends to preserve a pass-through reading by spatiotemporal continuity.",
      note:
        "Use this as the comparison case for hidden-launch conditions. The context is absent, so the tunnel effect can dominate.",
      literature:
        "In tunnel-effect displays, spatiotemporal continuity often outweighs feature mismatch, so viewers readily treat the visible segments as one object passing behind an occluder.",
      values: {
        durationMs: 2800,
        leadInMs: 320,
        launcherSpeed: 260,
        targetSpeedRatio: 1,
        launcherBehavior: "continue",
        targetAngle: 0,
        delayMs: 0,
        gapPx: 0,
        markerMode: "none",
        ballRadius: 28,
        occluderEnabled: true,
        occluderWidth: 190,
        contextMode: "none",
        contextOffsetMs: 0,
        contextDirection: "same",
        contextYOffset: 160,
        fps: 30,
        fileLabel: "tunnel-pass"
      }
    },
    ohlAmbiguous: {
      label: "Ambiguous test (50% overlap)",
      summary:
        "A fast 50% overlap display matching the launch/pass continuum used in recent visual-adaptation work.",
      note:
        "Ohl and Rolfs use seven overlap steps from 0% to 100%; this preset lands on the ambiguous midpoint.",
      literature:
        "Recent adaptation studies present brief 175 ms events and ask for launch/pass reports across a 0-100% overlap continuum.",
      values: {
        durationMs: 500,
        leadInMs: 0,
        launcherSpeed: 2500,
        targetSpeedRatio: 1,
        launcherBehavior: "stop",
        targetAngle: 0,
        delayMs: 0,
        gapPx: -28,
        markerMode: "none",
        ballRadius: 28,
        occluderEnabled: false,
        occluderWidth: 150,
        contextMode: "none",
        contextOffsetMs: 0,
        contextDirection: "same",
        contextYOffset: 135,
        fps: 60,
        fileLabel: "ohl-ambiguous-50-overlap"
      }
    },
    triggering: {
      label: "Triggering event",
      summary:
        "The target moves faster than the launcher after contact, producing a triggering-style causal event.",
      note:
        "Kominsky and Scholl treat triggering as launching-like for adaptation transfer, unlike entraining.",
      literature:
        "Triggering displays keep the contact structure but make the launched object move faster than the launcher.",
      values: {
        durationMs: 1700,
        leadInMs: 160,
        launcherSpeed: 720,
        targetSpeedRatio: 1.55,
        launcherBehavior: "stop",
        targetAngle: 0,
        delayMs: 0,
        gapPx: 0,
        markerMode: "none",
        ballRadius: 28,
        occluderEnabled: false,
        occluderWidth: 150,
        contextMode: "none",
        contextOffsetMs: 0,
        contextDirection: "same",
        contextYOffset: 135,
        fps: 60,
        fileLabel: "triggering-like-launch"
      }
    },
    entraining: {
      label: "Entraining / push event",
      summary:
        "The launcher continues with the target after contact, producing the push/entrain event family.",
      note:
        "Keep this only for the COGS launch/push contrast; it is not part of the Scholl/Nakayama capture display.",
      literature:
        "Kominsky and Wenig use launch/push displays to distinguish launching-like causality from entraining.",
      values: {
        durationMs: 900,
        leadInMs: 0,
        launcherSpeed: 2500,
        targetSpeedRatio: 1,
        launcherBehavior: "entrain",
        targetAngle: 0,
        delayMs: 0,
        gapPx: 0,
        markerMode: "none",
        ballRadius: 28,
        occluderEnabled: false,
        occluderWidth: 150,
        contextMode: "none",
        contextDurationMs: 750,
        contextOffsetMs: 0,
        contextDirection: "same",
        contextYOffset: 135,
        fps: 60,
        fileLabel: "cogs-entraining"
      }
    },
    cogsOverlap50: {
      label: "Overlap midpoint (50%)",
      summary:
        "A launch/pass test event at the middle of the 0-100% overlap continuum.",
      note:
        "This is a quick midpoint check for the launch/pass continuum.",
      literature:
        "Kominsky and Wenig describe launch/pass tests with nine overlap levels from 0% launch to 100% pass in 12.5% steps.",
      values: {
        durationMs: 320,
        leadInMs: 0,
        launcherSpeed: 4200,
        targetSpeedRatio: 1,
        launcherBehavior: "stop",
        targetAngle: 0,
        delayMs: 0,
        gapPx: -28,
        markerMode: "none",
        ballRadius: 28,
        occluderEnabled: false,
        occluderWidth: 150,
        contextMode: "none",
        contextDurationMs: 750,
        contextOffsetMs: 0,
        contextDirection: "same",
        contextYOffset: 135,
        fps: 60,
        fileLabel: "cogs-50-overlap-test"
      }
    },
    bridgedGap: {
      label: "Distal launch with bridge marker",
      summary:
        "A spatial gap display with a bridge marker, after Young and Falmier's distance-marker manipulation.",
      note:
        "Use this against the unmarked gap preset to test whether a conduit-like marker raises causal ratings.",
      literature:
        "Young and Falmier found that markers bridging or marking a gap can raise causal judgments, depending on marker location.",
      values: {
        durationMs: 2600,
        leadInMs: 300,
        launcherSpeed: 320,
        targetSpeedRatio: 0.9,
        launcherBehavior: "stop",
        targetAngle: 0,
        delayMs: 0,
        gapPx: 54,
        markerMode: "bridge",
        ballRadius: 28,
        occluderEnabled: false,
        occluderWidth: 150,
        contextMode: "none",
        contextOffsetMs: 0,
        contextDirection: "same",
        contextYOffset: 135,
        fps: 30,
        fileLabel: "bridged-distal-launch"
      }
    }
  };

  const primaryPresetKeys = [
    "canonical",
    "snPassBaseline",
    "causalCaptureScenario",
    "snSingleContext",
    "captureBrief50",
    "captureAsync200"
  ];

  const controlDefaults = presets.canonical.values;
  const stimulusDefaults = {
    launcherAccel: 0,
    targetAccel: 0,
    contextDurationMs: 750,
    contactOcclusionMode: "target-front"
  };
  const presentationDefaults = {
    renderMode: "stimulus",
    stageTheme: "dark",
    objectStyle: "flat",
    colorChangeMode: "none",
    colorChangeColor: "#f2d94e",
    launcherColor: "#e53935",
    targetColor: "#27c35a",
    contextColor: "#e53935",
    pxPerDva: 40,
    fixationDva: 0.3,
    stimulusXOffset: 0,
    stimulusYOffset: 0,
    soundEnabled: false,
    soundType: "click",
    soundVolume: 0.35,
    outputFormat: "lab",
    videoBitrate: 8
  };
  const controls = {};

  controlIds.forEach((id) => {
    controls[id] = document.getElementById(id);
  });

  let activePresetKey = "canonical";
  let selectedPresetKey = "canonical";
  let currentObjectUrl = null;
  let currentMetadataUrl = null;
  let previewHandle = null;
  let impactSoundTimer = null;
  let sharedAudioContext = null;
  let previewStart = 0;
  let isExporting = false;
  let customPresetKeys = [];
  let hiddenBuiltInPresetKeys = [];

  function resizePreviewCanvas() {
    const rect = canvas.getBoundingClientRect();
    const cssWidth = rect.width || STAGE_WIDTH;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PREVIEW_PIXEL_RATIO);
    const targetWidth = Math.max(STAGE_WIDTH, Math.round(cssWidth * pixelRatio));
    const targetHeight = Math.round((targetWidth * STAGE_HEIGHT) / STAGE_WIDTH);

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }
  }

  function prepareFrameContext(drawCtx) {
    const scaleX = drawCtx.canvas.width / STAGE_WIDTH;
    const scaleY = drawCtx.canvas.height / STAGE_HEIGHT;
    drawCtx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
    drawCtx.imageSmoothingEnabled = true;
    drawCtx.imageSmoothingQuality = "high";
  }

  function cloneState() {
    return {
      durationMs: Number(controls.durationMs.value),
      leadInMs: Number(controls.leadInMs.value),
      launcherSpeed: Number(controls.launcherSpeed.value),
      launcherAccel: Number(controls.launcherAccel.value),
      targetSpeedRatio: Number(controls.targetSpeedRatio.value),
      targetAccel: Number(controls.targetAccel.value),
      launcherBehavior: controls.launcherBehavior.value,
      targetAngle: Number(controls.targetAngle.value),
      delayMs: Number(controls.delayMs.value),
      gapPx: Number(controls.gapPx.value),
      markerMode: controls.markerMode.value,
      ballRadius: Number(controls.ballRadius.value),
      occluderEnabled: controls.occluderEnabled.checked,
      occluderWidth: Number(controls.occluderWidth.value),
      contactOcclusionMode: controls.contactOcclusionMode.value,
      contextMode: controls.contextMode.value,
      contextDurationMs: Number(controls.contextDurationMs.value),
      contextOffsetMs: Number(controls.contextOffsetMs.value),
      contextDirection: controls.contextDirection.value,
      contextYOffset: Number(controls.contextYOffset.value),
      renderMode: controls.renderMode.value,
      stageTheme: controls.stageTheme.value,
      objectStyle: controls.objectStyle.value,
      colorChangeMode: controls.colorChangeMode.value,
      colorChangeColor: controls.colorChangeColor.value,
      launcherColor: controls.launcherColor.value,
      targetColor: controls.targetColor.value,
      contextColor: controls.contextColor.value,
      pxPerDva: Number(controls.pxPerDva.value),
      fixationDva: Number(controls.fixationDva.value),
      stimulusXOffset: Number(controls.stimulusXOffset.value),
      stimulusYOffset: Number(controls.stimulusYOffset.value),
      soundEnabled: controls.soundEnabled.checked,
      soundType: controls.soundType.value,
      soundVolume: Number(controls.soundVolume.value),
      outputFormat: controls.outputFormat.value,
      fps: Number(controls.fps.value),
      videoBitrate: Number(controls.videoBitrate.value),
      fileLabel: controls.fileLabel.value.trim() || "causal-launching"
    };
  }

  function formatValue(format, value) {
    const number = Number(value);
    switch (format) {
      case "int":
        return `${Math.round(number)} ms`;
      case "float1":
        return `${number.toFixed(1)} px/s`;
      case "float2":
        return `${number.toFixed(2)} ×`;
      case "accel":
        return `${number >= 0 ? "+" : ""}${Math.round(number)} px/s^2`;
      case "degrees":
        return `${number >= 0 ? "+" : ""}${Math.round(number)}°`;
      case "ms":
        return `${Math.round(number)} ms`;
      case "signedMs":
        return `${number >= 0 ? "+" : ""}${Math.round(number)} ms`;
      case "signedPx":
        return `${number >= 0 ? "+" : ""}${Math.round(number)} px`;
      case "overlap": {
        const radius = controls.ballRadius ? Number(controls.ballRadius.value) : 28;
        if (number < 0) {
          const overlap = clamp((-number / Math.max(1, radius * 2)) * 100, 0, 100);
          return `${Math.round(overlap)}% overlap`;
        }
        if (number > 0) {
          return `gap ${Math.round(number)} px`;
        }
        return "0% overlap";
      }
      case "intPx":
        return `${Math.round(number)} px`;
      case "fps":
        return `${Math.round(number)} fps`;
      case "percent":
        return `${Math.round(number * 100)}%`;
      case "mbps":
        return `${number.toFixed(1)} Mbps`;
      case "pxPerDva":
        return `${Math.round(number)} px/deg`;
      case "dva":
        return `${number.toFixed(1)} deg`;
      default:
        return String(value);
    }
  }

  function updateOutputs() {
    document.querySelectorAll("output[data-for]").forEach((output) => {
      const input = document.getElementById(output.dataset.for);
      output.textContent = formatValue(input.dataset.format, input.value);
      const fineInput = input.dataset.fineControlId ? document.getElementById(input.dataset.fineControlId) : null;
      if (fineInput && document.activeElement !== fineInput) {
        fineInput.value = input.value;
      }
    });
  }

  function enhanceRangePrecision() {
    document.querySelectorAll('input[type="range"]').forEach((range) => {
      if (range.dataset.precisionEnhanced === "true") {
        return;
      }
      const labelText = range.closest(".field")?.querySelector("span")?.textContent?.trim() || range.id;
      const fineInput = document.createElement("input");
      fineInput.type = "number";
      fineInput.className = "fine-input";
      fineInput.id = `${range.id}Fine`;
      fineInput.value = range.value;
      fineInput.min = range.min;
      fineInput.max = range.max;
      fineInput.step = range.step || "1";
      fineInput.inputMode = "decimal";
      fineInput.setAttribute("aria-label", `${labelText} exact value`);

      const pair = document.createElement("div");
      pair.className = "range-pair";
      range.parentNode.insertBefore(pair, range);
      pair.appendChild(range);
      pair.appendChild(fineInput);

      range.dataset.precisionEnhanced = "true";
      range.dataset.fineControlId = fineInput.id;

      range.addEventListener("input", () => {
        fineInput.value = range.value;
      });
      fineInput.addEventListener("input", () => {
        const nextValue = fineInput.value === "" ? range.min : fineInput.value;
        range.value = clamp(Number(nextValue), Number(range.min), Number(range.max));
        range.dispatchEvent(new Event("input", { bubbles: true }));
      });
      fineInput.addEventListener("change", () => {
        fineInput.value = range.value;
      });
    });
  }

  function addParameterHelp() {
    Object.entries(parameterHelp).forEach(([id, text]) => {
      const control = document.getElementById(id);
      const field = control?.closest(".field");
      if (!control || !field || field.querySelector(".field-help")) {
        return;
      }

      const help = document.createElement("p");
      help.className = "field-help";
      help.id = `${id}Help`;
      help.textContent = text;
      field.appendChild(help);

      const describedBy = control.getAttribute("aria-describedby");
      control.setAttribute("aria-describedby", describedBy ? `${describedBy} ${help.id}` : help.id);
    });
  }

  function getPreset(presetKey) {
    return presets[presetKey] || presets.canonical;
  }

  function isCustomPresetKey(presetKey) {
    return customPresetKeys.includes(presetKey);
  }

  function isPrimaryPresetKey(presetKey) {
    return primaryPresetKeys.includes(presetKey);
  }

  function getVisiblePrimaryPresetKeys() {
    return primaryPresetKeys.filter((key) => presets[key] && !hiddenBuiltInPresetKeys.includes(key));
  }

  function syncPresetActions() {
    deletePresetButton.disabled = !selectedPresetKey;
  }

  function makePresetOption(key, preset) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = preset.label;
    return option;
  }

  function populatePresetMenu() {
    presetSelect.innerHTML = "";
    let visiblePrimaryKeys = getVisiblePrimaryPresetKeys();
    if (visiblePrimaryKeys.length === 0 && customPresetKeys.length === 0) {
      hiddenBuiltInPresetKeys = [];
      writeHiddenBuiltInPresets();
      visiblePrimaryKeys = getVisiblePrimaryPresetKeys();
    }

    visiblePrimaryKeys.forEach((key) => {
      const preset = presets[key];
      presetSelect.appendChild(makePresetOption(key, preset));
    });

    if (customPresetKeys.length > 0) {
      const savedGroup = document.createElement("optgroup");
      savedGroup.label = "Saved";
      customPresetKeys.forEach((key) => {
        const preset = getPreset(key);
        if (preset) {
          savedGroup.appendChild(makePresetOption(key, preset));
        }
      });
      presetSelect.appendChild(savedGroup);
    }
  }

  function readCustomPresets() {
    try {
      const stored = JSON.parse(localStorage.getItem(CUSTOM_PRESETS_STORAGE_KEY) || "[]");
      return Array.isArray(stored) ? stored : [];
    } catch (error) {
      return [];
    }
  }

  function readHiddenBuiltInPresets() {
    try {
      const stored = JSON.parse(localStorage.getItem(HIDDEN_BUILT_IN_PRESETS_STORAGE_KEY) || "[]");
      return Array.isArray(stored) ? stored.filter((key) => primaryPresetKeys.includes(key)) : [];
    } catch (error) {
      return [];
    }
  }

  function writeHiddenBuiltInPresets() {
    try {
      localStorage.setItem(HIDDEN_BUILT_IN_PRESETS_STORAGE_KEY, JSON.stringify(hiddenBuiltInPresetKeys));
    } catch (error) {
      statusText.textContent = "Preset storage unavailable.";
    }
  }

  function loadHiddenBuiltInPresets() {
    hiddenBuiltInPresetKeys = readHiddenBuiltInPresets();
  }

  function writeCustomPresets() {
    try {
      const savedPresets = customPresetKeys.map((key) => presets[key]).filter(Boolean);
      localStorage.setItem(CUSTOM_PRESETS_STORAGE_KEY, JSON.stringify(savedPresets));
    } catch (error) {
      statusText.textContent = "Preset storage unavailable.";
    }
  }

  function loadCustomPresets() {
    readCustomPresets().forEach((preset) => {
      if (!preset || !preset.label || !preset.values) {
        return;
      }
      const key = preset.key || `custom-${sanitizeLabel(preset.label)}`;
      presets[key] = {
        key,
        label: preset.label,
        summary: preset.summary || "Saved local preset.",
        note: preset.note || "Saved in this browser.",
        literature: preset.literature || "Custom preset saved from the current controls.",
        values: preset.values
      };
      if (!customPresetKeys.includes(key)) {
        customPresetKeys.push(key);
      }
    });
  }

  function saveCurrentPreset() {
    const rawName = (presetNameInput.value || controls.fileLabel.value || "Custom preset").trim();
    const label = rawName || "Custom preset";
    const baseKey = `custom-${sanitizeLabel(label)}`;
    const existingKey =
      customPresetKeys.find((key) => key === baseKey || presets[key]?.label.toLowerCase() === label.toLowerCase()) ||
      baseKey;
    const state = cloneState();
    const preset = {
      key: existingKey,
      label,
      summary: "Saved local preset.",
      note: "Saved in this browser.",
      literature: "Custom preset saved from the current controls.",
      values: state
    };

    presets[existingKey] = preset;
    if (!customPresetKeys.includes(existingKey)) {
      customPresetKeys.push(existingKey);
    }
    writeCustomPresets();
    populatePresetMenu();
    activePresetKey = existingKey;
    selectedPresetKey = existingKey;
    presetSelect.value = existingKey;
    presetSummary.textContent = preset.summary;
    presetNote.textContent = preset.note;
    literatureBlurb.textContent = preset.literature;
    scenarioBadge.textContent = preset.label;
    statusText.textContent = "Preset saved.";
    syncPresetActions();
  }

  function deleteSelectedPreset() {
    if (isPrimaryPresetKey(selectedPresetKey)) {
      const visibleBuiltIns = getVisiblePrimaryPresetKeys();
      const hasOtherPreset = visibleBuiltIns.length > 1 || customPresetKeys.length > 0;
      if (!hasOtherPreset) {
        statusText.textContent = "Keep at least one preset.";
        return;
      }

      hiddenBuiltInPresetKeys = [...new Set([...hiddenBuiltInPresetKeys, selectedPresetKey])];
      writeHiddenBuiltInPresets();
      populatePresetMenu();
      const nextPresetKey = presetSelect.value || getVisiblePrimaryPresetKeys()[0] || customPresetKeys[0] || "canonical";
      applyPreset(nextPresetKey);
      statusText.textContent = "Preset hidden.";
      return;
    }

    if (!isCustomPresetKey(selectedPresetKey)) {
      statusText.textContent = "Preset unavailable.";
      return;
    }

    delete presets[selectedPresetKey];
    customPresetKeys = customPresetKeys.filter((key) => key !== selectedPresetKey);
    writeCustomPresets();
    populatePresetMenu();
    const nextPresetKey = presetSelect.value || getVisiblePrimaryPresetKeys()[0] || customPresetKeys[0] || "canonical";
    applyPreset(nextPresetKey);
    statusText.textContent = "Preset removed.";
  }

  function setControls(values) {
    Object.entries(values).forEach(([key, value]) => {
      const control = controls[key];
      if (!control) {
        return;
      }
      if (control.type === "checkbox") {
        control.checked = Boolean(value);
      } else {
        control.value = value;
      }
    });
    updateOutputs();
    refreshText();
    drawFrame(cloneState(), 0, ctx);
  }

  function applyPreset(presetKey) {
    const preset = getPreset(presetKey);
    activePresetKey = presetKey;
    selectedPresetKey = presetKey;
    presetSelect.value = presetKey;
    presetNameInput.value = isCustomPresetKey(presetKey) ? preset.label : "";
    syncPresetActions();
    setControls({ ...stimulusDefaults, ...preset.values });
  }

  function getDynamicCopy(state) {
    if (state.launcherBehavior === "entrain") {
      return {
        label: "Custom entraining display",
        summary: "The mover continues with the target after contact.",
        note: "This is now an entraining event, not a standard launch.",
        literature:
          "Entraining matters because adaptation studies distinguish it from launching-like causal perception."
      };
    }

    if (state.targetSpeedRatio >= 1.25 && state.launcherBehavior === "stop") {
      return {
        label: "Custom triggering display",
        summary: "The target leaves faster than the launcher arrived.",
        note: "This is closer to triggering than to equal-speed launching.",
        literature:
          "Triggering keeps the launch structure while increasing the target's post-contact speed."
      };
    }

    if (state.occluderEnabled && state.contextMode === "launch") {
      return {
        label: "Custom hidden launch",
        summary: "A tunnel occluder and launch context are currently active.",
        note: "This custom setup keeps the tunnel structure but departs from a stock preset.",
        literature:
          "Tunnel events often default to a pass-through reading, but synchronized launch context can favor a hidden-launch interpretation."
      };
    }

    if (state.contextMode === "launch" && state.gapPx < -10) {
      return {
        label: "Custom capture display",
        summary: "The current settings preserve an ambiguous overlap plus a nearby launch context.",
        note: "This remains capture-like, but the parameters no longer match a stock preset exactly.",
        literature:
          "Ambiguous overlap events can be pushed toward a causal reading when a nearby launch is synchronized in time and direction."
      };
    }

    if (state.delayMs >= 60) {
      return {
        label: "Custom delayed launch",
        summary: "The current delay is large enough to weaken a direct launching impression.",
        note: "This is now closer to a delayed-launch manipulation than a canonical contact event.",
        literature:
          "As contact delay grows, observers often shift from direct launching toward delayed launching or independent motion."
      };
    }

    if (state.gapPx >= 8) {
      const markerText = state.markerMode === "none" ? "without a marker" : "with a spatial marker";
      return {
        label: "Custom gap display",
        summary: `The launcher now stops short of visible contact ${markerText}.`,
        note: "This is a spatial-gap manipulation rather than a strict canonical launch.",
        literature:
          "Visible spatial gaps usually weaken the causal impression; spatial markers can partly restore causal judgments when they mark timing or bridge the gap."
      };
    }

    return {
      label: "Custom stimulus",
      summary: "The sliders now define a custom stimulus rather than a stock literature preset.",
      note: "Use export to save this exact parameter combination for piloting or preregistered stimuli.",
      literature:
        "Causal-perception studies rely on small spatiotemporal adjustments, so custom parameter sweeps are often worth saving explicitly."
    };
  }

  function getStandards(state) {
    const overlapPercent = clamp((-state.gapPx / (state.ballRadius * 2)) * 100, 0, 100);
    const gapMagnitude = Math.max(0, state.gapPx);
    const relation =
      gapMagnitude > 0
        ? `gap ${Math.round(gapMagnitude)} px`
        : overlapPercent > 0
          ? `${Math.round(overlapPercent)}% overlap`
          : "0% overlap contact";

    let category = "launching";
    if (state.launcherBehavior === "entrain") {
      category = "entraining";
    } else if (state.launcherBehavior === "continue") {
      category = "pass/slip";
    } else if (state.targetSpeedRatio >= 1.25) {
      category = "triggering-like";
    } else if (overlapPercent >= 85) {
      category = "pass-biased";
    } else if (overlapPercent >= 25) {
      category = "ambiguous";
    } else if (state.gapPx > 0) {
      category = state.markerMode === "none" ? "distal gap" : "marked distal gap";
    }

    let capture = "no context";
    if (state.contextMode !== "none") {
      const offset = Math.abs(state.contextOffsetMs);
      const contextLabel =
        state.contextMode === "launch" ? "launch context" : state.contextMode === "single" ? "single context" : "pass context";
      if (offset <= 50) {
        capture = "synchronized";
      } else if (offset <= 90) {
        capture = "narrow window";
      } else if (offset < 200) {
        capture = "weak window";
      } else {
        capture = "asynchronous";
      }
      capture += `, ${contextLabel}`;
      if (state.contextDurationMs < 740) {
        capture += `, ${Math.round(state.contextDurationMs)} ms`;
      }
      if (state.contextDirection === "opposite") {
        capture += ", opposite";
      }
    }

    const geometry = getGeometry(state, STAGE_HEIGHT / 2);
    const direction =
      Math.abs(state.targetAngle) > 30 ? `, ${Math.abs(Math.round(state.targetAngle))}° off-axis` : "";
    const accelerationTag =
      state.launcherAccel !== 0 || state.targetAccel !== 0
        ? `, accel L ${Math.round(state.launcherAccel)}/T ${Math.round(state.targetAccel)}`
        : "";
    const timing = `approach ${Math.round(geometry.travelMs)} ms, onset ${Math.round(
      geometry.targetStartTime
    )} ms${direction}${accelerationTag}`;
    const pxPerDva = Math.max(1, state.pxPerDva);
    const ballDiameterDva = (state.ballRadius * 2) / pxPerDva;
    const contextSeparationDva = state.contextYOffset / pxPerDva;
    const gapDva = gapMagnitude / pxPerDva;
    const stimulusOffsetDva = {
      x: Number((state.stimulusXOffset / pxPerDva).toFixed(2)),
      y: Number((state.stimulusYOffset / pxPerDva).toFixed(2))
    };

    return {
      relation,
      category,
      capture,
      timing,
      overlapPercent: Math.round(overlapPercent),
      gapPx: Math.round(gapMagnitude),
      gapDva: Number(gapDva.toFixed(2)),
      ballDiameterDva: Number(ballDiameterDva.toFixed(2)),
      contextSeparationDva: Number(contextSeparationDva.toFixed(2)),
      fixationDiameterDva: Number(state.fixationDva.toFixed(2)),
      stimulusOffsetPx: {
        x: Math.round(state.stimulusXOffset),
        y: Math.round(state.stimulusYOffset)
      },
      stimulusOffsetDva,
      impactMs: Math.round(geometry.stopTime),
      targetOnsetMs: Math.round(geometry.targetStartTime),
      approachMs: Math.round(geometry.travelMs),
      clipDurationMs: Math.round(state.durationMs)
    };
  }

  function updateStandards(state) {
    const standards = getStandards(state);
    relationMetric.textContent = standards.relation;
    categoryMetric.textContent = standards.category;
    captureMetric.textContent = standards.capture;
    timingMetric.textContent = standards.timing;
  }

  function refreshText() {
    const state = cloneState();
    const copy = activePresetKey ? getPreset(activePresetKey) : getDynamicCopy(state);
    const queuedPreset = getPreset(selectedPresetKey);
    presetSummary.textContent = queuedPreset.summary;
    presetNote.textContent = copy.note;
    literatureBlurb.textContent = copy.literature;
    scenarioBadge.textContent = copy.label;
    stageOverlay.classList.toggle("hidden", state.renderMode !== "lab");

    const standards = getStandards(state);
    const spatialTag =
      state.gapPx > 6
        ? `gap ${Math.round(state.gapPx)} px`
        : state.gapPx < -6
          ? `${standards.overlapPercent}% overlap`
          : "contact";
    const occlusionTag = state.occluderEnabled ? " + tunnel occluder" : "";
    timingBadge.textContent = `${spatialTag} + ${Math.round(state.delayMs)} ms delay${occlusionTag}`;
    updateStandards(state);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function normalizeHexColor(value, fallback) {
    return /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
  }

  function shadeHexColor(hex, amount) {
    const safeHex = normalizeHexColor(hex, "#7fd0c8").slice(1);
    const target = amount < 0 ? 0 : 255;
    const weight = Math.min(1, Math.abs(amount));
    const channel = (offset) => {
      const value = parseInt(safeHex.slice(offset, offset + 2), 16);
      return Math.round(value + (target - value) * weight)
        .toString(16)
        .padStart(2, "0");
    };
    return `#${channel(0)}${channel(2)}${channel(4)}`;
  }

  function getPalette(state) {
    const launcher = normalizeHexColor(state.launcherColor, "#e53935");
    const target = normalizeHexColor(state.targetColor, "#27c35a");
    const context = normalizeHexColor(state.contextColor, "#e53935");
    return {
      launcher: {
        fill: launcher,
        outline: shadeHexColor(launcher, -0.48)
      },
      target: {
        fill: target,
        outline: shadeHexColor(target, -0.46)
      },
      context: {
        fill: context,
        outline: shadeHexColor(context, -0.5)
      }
    };
  }

  function getPaletteAtTime(state, eventState) {
    const palette = getPalette(state);
    if (state.colorChangeMode === "none" || eventState.time < eventState.geometry.targetStartTime) {
      return palette;
    }

    const changed = normalizeHexColor(state.colorChangeColor, "#f2d94e");
    const changedStyle = {
      fill: changed,
      outline: shadeHexColor(changed, -0.48)
    };

    if (state.colorChangeMode === "launcher" || state.colorChangeMode === "both") {
      palette.launcher = changedStyle;
    }
    if (state.colorChangeMode === "target" || state.colorChangeMode === "both") {
      palette.target = changedStyle;
    }

    return palette;
  }

  function displacementAt(elapsedMs, initialVelocity, acceleration) {
    const minVelocity = 20;
    const velocity = Math.max(minVelocity, initialVelocity);
    const t = Math.max(0, elapsedMs) / 1000;
    const a = Number(acceleration) || 0;

    if (Math.abs(a) < 0.001) {
      return velocity * t;
    }

    if (a < 0) {
      const floorTime = Math.max(0, (minVelocity - velocity) / a);
      if (t > floorTime) {
        const distanceBeforeFloor = velocity * floorTime + 0.5 * a * floorTime * floorTime;
        return distanceBeforeFloor + minVelocity * (t - floorTime);
      }
    }

    return Math.max(0, velocity * t + 0.5 * a * t * t);
  }

  function velocityAt(elapsedMs, initialVelocity, acceleration) {
    const minVelocity = 20;
    const velocity = Math.max(minVelocity, initialVelocity);
    const t = Math.max(0, elapsedMs) / 1000;
    return Math.max(minVelocity, velocity + (Number(acceleration) || 0) * t);
  }

  function solveTravelMs(distance, initialVelocity, acceleration) {
    let low = 0;
    let high = Math.max(100, (distance / Math.max(20, initialVelocity)) * 1000);

    while (displacementAt(high, initialVelocity, acceleration) < distance && high < 12000) {
      high *= 1.5;
    }

    for (let i = 0; i < 36; i += 1) {
      const mid = (low + high) / 2;
      if (displacementAt(mid, initialVelocity, acceleration) >= distance) {
        high = mid;
      } else {
        low = mid;
      }
    }

    return high;
  }

  function drawBall(drawCtx, x, y, radius, fill, outline) {
    const gradient = drawCtx.createRadialGradient(
      x - radius * 0.36,
      y - radius * 0.36,
      radius * 0.18,
      x,
      y,
      radius
    );
    gradient.addColorStop(0, "rgba(255,255,255,0.9)");
    gradient.addColorStop(0.14, fill);
    gradient.addColorStop(1, outline);

    drawCtx.beginPath();
    drawCtx.arc(x, y, radius, 0, Math.PI * 2);
    drawCtx.fillStyle = gradient;
    drawCtx.fill();
    drawCtx.lineWidth = 1.5;
    drawCtx.strokeStyle = "rgba(255,255,255,0.22)";
    drawCtx.stroke();
  }

  function drawObject(drawCtx, state, x, y, radius, fill, outline) {
    if (state.objectStyle === "shaded") {
      drawBall(drawCtx, x, y, radius, fill, outline);
      return;
    }

    drawCtx.beginPath();
    drawCtx.arc(x, y, radius, 0, Math.PI * 2);
    drawCtx.fillStyle = fill;
    drawCtx.fill();
    drawCtx.lineWidth = 2;
    drawCtx.strokeStyle = outline;
    drawCtx.stroke();
  }

  function drawStageBackground(drawCtx, state) {
    const themes = {
      dark: ["#0a1516", "rgba(48, 87, 86, 0.18)", "rgba(237, 244, 244, 0.18)"],
      midgray: ["#7a7f7d", "rgba(255, 255, 255, 0.12)", "rgba(255, 255, 255, 0.2)"],
      light: ["#f4f5ef", "rgba(31, 103, 98, 0.08)", "rgba(23, 34, 32, 0.16)"]
    };
    const theme = themes[state.stageTheme] || themes.dark;
    drawCtx.fillStyle = theme[0];
    drawCtx.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
    return theme;
  }

  function drawFixation(drawCtx, state) {
    if (state.renderMode !== "fixation") {
      return;
    }

    const radius = Math.max(2, (state.pxPerDva * state.fixationDva) / 2);
    const x = STAGE_WIDTH / 2;
    const y = STAGE_HEIGHT / 2;
    drawCtx.save();
    drawCtx.strokeStyle = state.stageTheme === "light" ? "rgba(17, 34, 33, 0.86)" : "rgba(245, 245, 240, 0.92)";
    drawCtx.lineWidth = 2;
    drawCtx.beginPath();
    drawCtx.arc(x, y, radius, 0, Math.PI * 2);
    drawCtx.stroke();
    drawCtx.beginPath();
    drawCtx.moveTo(x - radius * 1.6, y);
    drawCtx.lineTo(x + radius * 1.6, y);
    drawCtx.moveTo(x, y - radius * 1.6);
    drawCtx.lineTo(x, y + radius * 1.6);
    drawCtx.stroke();
    drawCtx.restore();
  }

  function drawSpatialMarker(drawCtx, state, eventState) {
    if (state.markerMode === "none" || state.gapPx <= 0) {
      return;
    }

    const { radius, launcherStopX, targetBaseX, laneY } = eventState.geometry;
    const stopEdge = launcherStopX + radius;
    const startEdge = targetBaseX - radius;
    const markerY = laneY;

    drawCtx.save();
    drawCtx.strokeStyle = "rgba(245, 224, 137, 0.92)";
    drawCtx.fillStyle = "rgba(245, 224, 137, 0.2)";
    drawCtx.lineWidth = 3;

    if (state.markerMode === "bridge") {
      drawCtx.beginPath();
      drawCtx.roundRect(stopEdge, markerY - 6, Math.max(4, startEdge - stopEdge), 12, 6);
      drawCtx.fill();
      drawCtx.stroke();
    }

    if (state.markerMode === "stop" || state.markerMode === "both") {
      drawCtx.setLineDash([8, 6]);
      drawCtx.beginPath();
      drawCtx.moveTo(stopEdge, markerY - radius * 1.7);
      drawCtx.lineTo(stopEdge, markerY + radius * 1.7);
      drawCtx.stroke();
    }

    if (state.markerMode === "start" || state.markerMode === "both") {
      drawCtx.setLineDash([8, 6]);
      drawCtx.beginPath();
      drawCtx.moveTo(startEdge, markerY - radius * 1.7);
      drawCtx.lineTo(startEdge, markerY + radius * 1.7);
      drawCtx.stroke();
    }

    drawCtx.restore();
  }

  function getGeometry(state, laneY) {
    const radius = state.ballRadius;
    const targetBaseX = (state.occluderEnabled ? STAGE_WIDTH * 0.62 : STAGE_WIDTH * 0.58) + state.stimulusXOffset;
    const launcherStopX = targetBaseX - radius * 2 - state.gapPx;
    const launcherStartX = 92 + state.stimulusXOffset;
    const launcherDistance = Math.max(launcherStopX - launcherStartX, 1);
    const travelMs = solveTravelMs(launcherDistance, state.launcherSpeed, state.launcherAccel);
    const stopTime = state.leadInMs + travelMs;
    const targetStartTime = stopTime + state.delayMs;
    const remainingMs = Math.max(state.durationMs - targetStartTime - 240, 80);
    const launcherImpactSpeed = velocityAt(travelMs, state.launcherSpeed, state.launcherAccel);
    const targetSpeed = launcherImpactSpeed * state.targetSpeedRatio;
    const angleRad = (state.targetAngle * Math.PI) / 180;
    const targetDistance = displacementAt(remainingMs, targetSpeed, state.targetAccel);
    const contextDirectionSign = state.contextDirection === "same" ? 1 : -1;

    return {
      radius,
      laneY,
      targetBaseX,
      launcherStopX,
      launcherStartX,
      launcherDistance,
      travelMs,
      stopTime,
      targetStartTime,
      remainingMs,
      launcherImpactSpeed,
      targetSpeed,
      angleRad,
      targetDistance,
      contextDirectionSign
    };
  }

  function getMainEventState(state, t, laneY) {
    const geometry = getGeometry(state, laneY);
    const approachElapsed = clamp(t - state.leadInMs, 0, geometry.travelMs);
    const approachDistance = Math.min(
      geometry.launcherDistance,
      displacementAt(approachElapsed, state.launcherSpeed, state.launcherAccel)
    );
    let launcherX = geometry.launcherStartX + approachDistance;
    let launcherY = laneY;

    let targetX = geometry.targetBaseX;
    let targetY = laneY;
    if (state.launcherBehavior !== "continue" && t >= geometry.targetStartTime) {
      const targetElapsed = t - geometry.targetStartTime;
      const moveDistance = displacementAt(targetElapsed, geometry.targetSpeed, state.targetAccel);
      targetX += Math.cos(geometry.angleRad) * moveDistance;
      targetY += Math.sin(geometry.angleRad) * moveDistance;
    }

    if (state.launcherBehavior === "continue" && t >= geometry.stopTime) {
      const elapsed = t - geometry.stopTime;
      const moveDistance = displacementAt(elapsed, geometry.launcherImpactSpeed, state.launcherAccel);
      launcherX = geometry.launcherStopX + Math.cos(geometry.angleRad) * moveDistance;
      launcherY = laneY + Math.sin(geometry.angleRad) * moveDistance;
    }

    if (state.launcherBehavior === "entrain" && t >= geometry.targetStartTime) {
      const separation = geometry.radius * 2;
      launcherX = targetX - Math.cos(geometry.angleRad) * separation;
      launcherY = targetY - Math.sin(geometry.angleRad) * separation;
    }

    return {
      geometry,
      time: t,
      launcherX,
      launcherY,
      targetX,
      targetY
    };
  }

  function drawContextEvent(drawCtx, state, t, mainEvent) {
    if (state.contextMode === "none") {
      return;
    }

    const palette = getPalette(state);
    const laneY = mainEvent.geometry.laneY + state.contextYOffset;
    const directionSign = mainEvent.geometry.contextDirectionSign;
    const contextRadius = state.ballRadius * 0.92;
    const targetBaseX = directionSign === 1 ? mainEvent.geometry.targetBaseX : STAGE_WIDTH - mainEvent.geometry.targetBaseX;
    const launcherStartX = directionSign === 1 ? 92 : STAGE_WIDTH - 92;
    const adjustedTime = t - state.contextOffsetMs;
    const contextWindowMs = Number(state.contextDurationMs) || 750;

    if (contextWindowMs < 740 && Math.abs(adjustedTime - mainEvent.geometry.stopTime) > contextWindowMs / 2) {
      return;
    }

    if (state.contextMode === "single") {
      const impactX = targetBaseX;
      let singleX = launcherStartX;

      if (adjustedTime >= state.leadInMs && adjustedTime <= mainEvent.geometry.stopTime) {
        const progress = clamp(
          (adjustedTime - state.leadInMs) / Math.max(1, mainEvent.geometry.travelMs),
          0,
          1
        );
        singleX = lerp(launcherStartX, impactX, progress);
      } else if (adjustedTime > mainEvent.geometry.stopTime) {
        const elapsed = adjustedTime - mainEvent.geometry.stopTime;
        singleX =
          impactX + directionSign * displacementAt(elapsed, mainEvent.geometry.launcherImpactSpeed, state.launcherAccel);
      }

      const singlePalette = adjustedTime < mainEvent.geometry.stopTime ? palette.context : palette.target;
      drawObject(drawCtx, state, singleX, laneY, contextRadius, singlePalette.fill, singlePalette.outline);
      return;
    }

    const launcherStopX =
      state.contextMode === "pass" ? targetBaseX : targetBaseX - directionSign * contextRadius * 2;
    const distance = Math.abs(launcherStopX - launcherStartX);
    const travelMs = Math.max(1, mainEvent.geometry.travelMs);
    const contextImpactSpeed = distance / (travelMs / 1000);
    const approachElapsed = clamp(adjustedTime - state.leadInMs, 0, travelMs);
    const approachDistance = distance * (approachElapsed / travelMs);
    let launcherX = launcherStartX + directionSign * approachDistance;

    if (state.contextMode === "pass") {
      if (adjustedTime >= mainEvent.geometry.stopTime) {
        const elapsed = adjustedTime - mainEvent.geometry.stopTime;
        launcherX =
          launcherStopX + directionSign * displacementAt(elapsed, contextImpactSpeed, state.launcherAccel);
      }
      drawObject(drawCtx, state, targetBaseX, laneY, contextRadius, palette.target.fill, palette.target.outline);
      drawObject(drawCtx, state, launcherX, laneY, contextRadius, palette.context.fill, palette.context.outline);
      return;
    }

    let targetX = targetBaseX;
    if (adjustedTime >= mainEvent.geometry.stopTime) {
      const elapsed = adjustedTime - mainEvent.geometry.stopTime;
      const distanceMoved = displacementAt(elapsed, contextImpactSpeed, state.targetAccel);
      targetX += directionSign * distanceMoved;
    }

    drawObject(drawCtx, state, launcherX, laneY, contextRadius, palette.context.fill, palette.context.outline);
    drawObject(drawCtx, state, targetX, laneY, contextRadius, palette.target.fill, palette.target.outline);
  }

  function drawOccluder(drawCtx, state, laneY) {
    if (!state.occluderEnabled) {
      return {
        left: 0,
        right: 0
      };
    }

    const width = state.occluderWidth;
    const left = STAGE_WIDTH / 2 - width / 2;
    const top = laneY - state.ballRadius * 1.9;
    const height = state.ballRadius * 3.8;
    const right = left + width;

    drawCtx.fillStyle = "rgba(235, 233, 223, 0.88)";
    drawCtx.strokeStyle = "rgba(17, 34, 33, 0.16)";
    drawCtx.lineWidth = 2;
    drawCtx.beginPath();
    drawCtx.roundRect(left, top, width, height, 18);
    drawCtx.fill();
    drawCtx.stroke();

    drawCtx.fillStyle = "rgba(17, 34, 33, 0.07)";
    drawCtx.fillRect(left + 14, top + 12, width - 28, height - 24);

    return { left, right };
  }

  function drawOpenEvent(drawCtx, state, eventState) {
    const palette = getPaletteAtTime(state, eventState);
    const radius = state.ballRadius;
    const launcher = {
      x: eventState.launcherX,
      y: eventState.launcherY,
      fill: palette.launcher.fill,
      outline: palette.launcher.outline
    };
    const target = {
      x: eventState.targetX,
      y: eventState.targetY,
      fill: palette.target.fill,
      outline: palette.target.outline
    };
    const overlapDistance = Math.hypot(target.x - launcher.x, target.y - launcher.y);
    const isAfterContact = eventState.time >= eventState.geometry.targetStartTime;
    const isOverlapping = overlapDistance < radius * 2;
    let drawOrder = [launcher, target];

    if (isAfterContact && isOverlapping) {
      if (state.contactOcclusionMode === "launcher-front") {
        drawOrder = [target, launcher];
      } else if (state.contactOcclusionMode === "alternate") {
        const phase = Math.floor((eventState.time - eventState.geometry.targetStartTime) / 80);
        drawOrder = phase % 2 === 0 ? [target, launcher] : [launcher, target];
      }
    }

    if (state.contactOcclusionMode === "none") {
      drawOrder = [launcher, target];
    }

    drawOrder.forEach((object) => {
      drawObject(drawCtx, state, object.x, object.y, radius, object.fill, object.outline);
    });
  }

  function drawOccludedEvent(drawCtx, state, eventState, occluderBounds) {
    const radius = state.ballRadius;
    const palette = getPaletteAtTime(state, eventState);

    if (eventState.launcherX + radius < occluderBounds.left) {
      drawObject(
        drawCtx,
        state,
        eventState.launcherX,
        eventState.launcherY,
        radius,
        palette.launcher.fill,
        palette.launcher.outline
      );
    }

    if (eventState.targetX - radius > occluderBounds.right && eventState.targetX < STAGE_WIDTH + radius) {
      drawObject(
        drawCtx,
        state,
        eventState.targetX,
        eventState.targetY,
        radius,
        palette.target.fill,
        palette.target.outline
      );
    }
  }

  function drawLegend(drawCtx, state) {
    const palette = getPalette(state);
    drawCtx.save();
    drawCtx.font = '600 14px "Avenir Next", "Segoe UI", sans-serif';
    drawCtx.fillStyle = "rgba(240, 245, 245, 0.92)";
    drawCtx.fillText("Launcher", 80, 32);
    drawCtx.fillText("Target", 192, 32);
    drawObject(drawCtx, state, 54, 26, 10, palette.launcher.fill, palette.launcher.outline);
    drawObject(drawCtx, state, 166, 26, 10, palette.target.fill, palette.target.outline);

    if (state.contextMode !== "none") {
      drawCtx.fillText("Context", 302, 32);
      drawObject(drawCtx, state, 272, 26, 10, palette.context.fill, palette.context.outline);
    }
    drawCtx.restore();
  }

  function drawFrame(state, t, drawCtx) {
    if (drawCtx === ctx) {
      resizePreviewCanvas();
    }
    prepareFrameContext(drawCtx);
    drawCtx.clearRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
    drawStageBackground(drawCtx, state);

    const laneY = getMainLaneY(state);

    const eventState = getMainEventState(state, t, laneY);
    drawContextEvent(drawCtx, state, t, eventState);
    drawSpatialMarker(drawCtx, state, eventState);
    const occluderBounds = drawOccluder(drawCtx, state, laneY);

    if (state.occluderEnabled) {
      drawOccludedEvent(drawCtx, state, eventState, occluderBounds);
    } else {
      drawOpenEvent(drawCtx, state, eventState);
    }

    drawFixation(drawCtx, state);

    if (state.renderMode === "lab") {
      drawLegend(drawCtx, state);

      drawCtx.save();
      drawCtx.font = '500 14px "Avenir Next", "Segoe UI", sans-serif';
      drawCtx.fillStyle = "rgba(240, 245, 245, 0.7)";
      drawCtx.fillText(`t = ${Math.round(t)} ms`, STAGE_WIDTH - 116, STAGE_HEIGHT - 28);
      drawCtx.restore();
    }
  }

  function getAudioContextClass() {
    return window.AudioContext || window.webkitAudioContext || null;
  }

  function getPreviewAudioContext() {
    const AudioContextClass = getAudioContextClass();
    if (!AudioContextClass) {
      return null;
    }

    if (!sharedAudioContext || sharedAudioContext.state === "closed") {
      sharedAudioContext = new AudioContextClass();
    }
    return sharedAudioContext;
  }

  function scheduleImpactSound(audioContext, state, destinationNode, startTime) {
    const volume = clamp(state.soundVolume, 0, 1);
    if (!state.soundEnabled || !audioContext || volume <= 0) {
      return;
    }

    const start = Math.max(audioContext.currentTime, startTime);
    const soundProfiles = {
      click: {
        type: "square",
        startFrequency: 1600,
        endFrequency: 900,
        duration: 0.045
      },
      thud: {
        type: "sine",
        startFrequency: 140,
        endFrequency: 70,
        duration: 0.16
      },
      tone: {
        type: "triangle",
        startFrequency: 520,
        endFrequency: 520,
        duration: 0.1
      }
    };
    const profile = soundProfiles[state.soundType] || soundProfiles.click;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const destination = destinationNode || audioContext.destination;

    oscillator.type = profile.type;
    oscillator.frequency.setValueAtTime(profile.startFrequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, profile.endFrequency), start + profile.duration);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, volume), start + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + profile.duration);

    oscillator.connect(gain);
    gain.connect(destination);
    oscillator.start(start);
    oscillator.stop(start + profile.duration + 0.02);
  }

  function playImpactSound(state) {
    const audioContext = getPreviewAudioContext();
    if (!audioContext) {
      statusText.textContent = "AudioContext is unavailable; preview is silent.";
      return;
    }

    if (audioContext.state === "suspended") {
      audioContext.resume().catch(() => {});
    }
    scheduleImpactSound(audioContext, state, audioContext.destination, audioContext.currentTime + 0.01);
  }

  function getMainLaneY(state) {
    return STAGE_HEIGHT / 2 - (state.contextMode === "none" ? 0 : 52) + state.stimulusYOffset;
  }

  function stopPreview() {
    if (previewHandle !== null) {
      cancelAnimationFrame(previewHandle);
      previewHandle = null;
    }
    if (impactSoundTimer !== null) {
      window.clearTimeout(impactSoundTimer);
      impactSoundTimer = null;
    }
  }

  function tickPreview(now) {
    const state = cloneState();
    if (previewStart === 0) {
      previewStart = now;
    }
    const elapsed = now - previewStart;
    drawFrame(state, Math.min(elapsed, state.durationMs), ctx);

    if (elapsed < state.durationMs) {
      previewHandle = requestAnimationFrame(tickPreview);
    } else {
      previewHandle = null;
      previewStart = 0;
    }
  }

  function playPreview() {
    stopPreview();
    const state = cloneState();
    if (state.soundEnabled) {
      const audioContext = getPreviewAudioContext();
      if (audioContext && audioContext.state === "suspended") {
        audioContext.resume().catch(() => {});
      }
      const geometry = getGeometry(state, getMainLaneY(state));
      impactSoundTimer = window.setTimeout(() => {
        playImpactSound(state);
        impactSoundTimer = null;
      }, Math.max(0, Math.min(geometry.stopTime, state.durationMs)));
    }
    previewStart = 0;
    previewHandle = requestAnimationFrame(tickPreview);
  }

  function sanitizeLabel(label) {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "causal-launching";
  }

  function getMimeCandidates(state) {
    const mp4 = state.soundEnabled
      ? ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/mp4"]
      : ["video/mp4;codecs=avc1.42E01E", "video/mp4"];
    const vp9 = state.soundEnabled
      ? ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp9"]
      : ["video/webm;codecs=vp9"];
    const vp8 = state.soundEnabled
      ? ["video/webm;codecs=vp8,opus", "video/webm;codecs=vp8"]
      : ["video/webm;codecs=vp8"];
    const webm = ["video/webm"];

    if (state.outputFormat === "mp4") {
      return [...mp4, ...vp9, ...vp8, ...webm];
    }
    if (state.outputFormat === "webm-vp9") {
      return [...vp9, ...webm];
    }
    if (state.outputFormat === "webm-vp8") {
      return [...vp8, ...webm];
    }
    if (state.outputFormat === "webm") {
      return webm;
    }
    return [...mp4, ...vp9, ...vp8, ...webm];
  }

  function chooseExportFormat(state) {
    const candidates = getMimeCandidates(state);
    const mimeType = candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate)) || "video/webm";
    const extension = mimeType.includes("mp4") ? "mp4" : "webm";
    const usedFallback =
      state.outputFormat === "mp4" && !mimeType.includes("mp4")
        ? true
        : state.outputFormat.startsWith("webm") && !mimeType.includes("webm");
    return {
      mimeType,
      extension,
      usedFallback
    };
  }

  function buildMetadata(state, filename, exportDetails = {}) {
    const standards = getStandards(state);
    return {
      filename,
      generatedAt: new Date().toISOString(),
      preset: activePresetKey ? getPreset(activePresetKey).label : "Custom stimulus",
      standards,
      parameters: {
        durationMs: state.durationMs,
        leadInMs: state.leadInMs,
        launcherSpeedPxPerSec: state.launcherSpeed,
        launcherAccelerationPxPerSec2: state.launcherAccel,
        targetSpeedRatio: state.targetSpeedRatio,
        targetAccelerationPxPerSec2: state.targetAccel,
        launcherBehavior: state.launcherBehavior,
        targetAngleDegrees: state.targetAngle,
        contactDelayMs: state.delayMs,
        spatialGapPx: Math.max(0, state.gapPx),
        overlapPercent: getStandards(state).overlapPercent,
        markerMode: state.markerMode,
        ballRadiusPx: state.ballRadius,
        occluderEnabled: state.occluderEnabled,
        occluderWidthPx: state.occluderWidth,
        contactOcclusionMode: state.contactOcclusionMode,
        contextMode: state.contextMode,
        contextDurationMs: state.contextDurationMs,
        contextOffsetMs: state.contextOffsetMs,
        contextDirection: state.contextDirection,
        contextYOffsetPx: state.contextYOffset,
        renderMode: state.renderMode,
        stageTheme: state.stageTheme,
        objectStyle: state.objectStyle,
        colorChangeMode: state.colorChangeMode,
        colorChangeColor: state.colorChangeColor,
        launcherColor: state.launcherColor,
        targetColor: state.targetColor,
        contextColor: state.contextColor,
        pxPerDva: state.pxPerDva,
        ballDiameterDva: standards.ballDiameterDva,
        gapDva: standards.gapDva,
        contextSeparationDva: standards.contextSeparationDva,
        fixationDiameterDva: standards.fixationDiameterDva,
        stimulusXOffsetPx: state.stimulusXOffset,
        stimulusYOffsetPx: state.stimulusYOffset,
        stimulusOffsetDva: standards.stimulusOffsetDva,
        soundEnabled: state.soundEnabled,
        soundType: state.soundType,
        soundVolume: state.soundVolume,
        outputFormat: state.outputFormat,
        videoBitrateMbps: state.videoBitrate,
        fps: state.fps
      },
      export: {
        requestedFormat: state.outputFormat,
        actualMimeType: exportDetails.mimeType || null,
        extension: exportDetails.extension || null,
        logicalWidthPx: STAGE_WIDTH,
        logicalHeightPx: STAGE_HEIGHT,
        encodedWidthPx: exportDetails.width || null,
        encodedHeightPx: exportDetails.height || null,
        bitrateMbps: state.videoBitrate,
        browserEncoded: true
      },
      literatureBasis: [
        "Scholl & Nakayama 2002: full-overlap test events, synchronized launch context, brief impact windows, temporal asynchrony, and direction phase.",
        "Kominsky & Wenig 2025: launch/pass overlap continua and launch/push entraining contrasts."
      ]
    };
  }

  function setMetadataDownload(metadata, preferredName) {
    const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: "application/json" });
    if (currentMetadataUrl) {
      URL.revokeObjectURL(currentMetadataUrl);
    }
    currentMetadataUrl = URL.createObjectURL(blob);
    metadataLink.href = currentMetadataUrl;
    metadataLink.download = preferredName;
    metadataLink.textContent = `Download ${preferredName}`;
    metadataLink.classList.remove("hidden");
  }

  function exportParameters() {
    const state = cloneState();
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const filename = `${sanitizeLabel(state.fileLabel)}-${timestamp}.json`;
    setMetadataDownload(buildMetadata(state, filename), filename);
    statusText.textContent = "Parameter JSON ready.";
  }

  function withCondition(baseState, overrides) {
    const condition = {
      ...baseState,
      ...overrides
    };
    const standards = getStandards(condition);
    return {
      label: overrides.label,
      phase: overrides.phase || "stimulus",
      role: overrides.role || "",
      pairId: overrides.pairId || "",
      prediction: overrides.prediction || "",
      literatureAnchor: overrides.literatureAnchor || "",
      standards,
      parameters: {
        durationMs: condition.durationMs,
        leadInMs: condition.leadInMs,
        launcherSpeedPxPerSec: condition.launcherSpeed,
        launcherAccelerationPxPerSec2: condition.launcherAccel,
        targetSpeedRatio: condition.targetSpeedRatio,
        targetAccelerationPxPerSec2: condition.targetAccel,
        launcherBehavior: condition.launcherBehavior,
        targetAngleDegrees: condition.targetAngle,
        contactDelayMs: condition.delayMs,
        gapPx: condition.gapPx,
        markerMode: condition.markerMode,
        ballRadiusPx: condition.ballRadius,
        occluderEnabled: condition.occluderEnabled,
        occluderWidthPx: condition.occluderWidth,
        contactOcclusionMode: condition.contactOcclusionMode,
        contextMode: condition.contextMode,
        contextDurationMs: condition.contextDurationMs,
        contextOffsetMs: condition.contextOffsetMs,
        contextDirection: condition.contextDirection,
        contextYOffsetPx: condition.contextYOffset,
        renderMode: condition.renderMode,
        stageTheme: condition.stageTheme,
        objectStyle: condition.objectStyle,
        colorChangeMode: condition.colorChangeMode,
        colorChangeColor: condition.colorChangeColor,
        launcherColor: condition.launcherColor,
        targetColor: condition.targetColor,
        contextColor: condition.contextColor,
        pxPerDva: condition.pxPerDva,
        fixationDva: condition.fixationDva,
        stimulusXOffsetPx: condition.stimulusXOffset,
        stimulusYOffsetPx: condition.stimulusYOffset,
        soundEnabled: condition.soundEnabled,
        soundType: condition.soundType,
        soundVolume: condition.soundVolume,
        outputFormat: condition.outputFormat,
        videoBitrateMbps: condition.videoBitrate,
        fps: condition.fps
      }
    };
  }

  function buildConditionSet(kind, baseState) {
    const base = {
      ...baseState,
      renderMode: baseState.renderMode === "lab" ? "fixation" : baseState.renderMode,
      objectStyle: "flat",
      stageTheme: baseState.stageTheme,
      contextDurationMs: 750,
      contextOffsetMs: 0,
      contextDirection: "same",
      markerMode: "none",
      occluderEnabled: false,
      launcherAccel: 0,
      targetAccel: 0,
      contactOcclusionMode: "target-front",
      stimulusXOffset: 0,
      stimulusYOffset: 0,
      soundEnabled: false
    };

    if (kind === "delayOverlap") {
      const overlaps = [0, 25, 50, 75, 100];
      const delays = [0, 50, 90, 140];
      return {
        family: "Delay x overlap boundary",
        note:
          "A compact psychometric grid for separating direct launching, delayed launching, and pass-biased overlap displays.",
        conditions: delays.flatMap((delay) =>
          overlaps.map((overlap) =>
            withCondition(base, {
              label: `delay-${delay}-overlap-${overlap}`,
              role: "psychometric-boundary",
              prediction:
                "Launch reports should fall as overlap and delay increase, with the steepest changes near ambiguous overlap and 50-90 ms delay.",
              literatureAnchor: "Michotte delay/gap work; Ohl/Rolfs and Kominsky/Scholl overlap continua.",
              durationMs: 700,
              leadInMs: 0,
              launcherSpeed: 2500,
              targetSpeedRatio: 1,
              launcherBehavior: "stop",
              delayMs: delay,
              gapPx: Math.round(-(overlap / 100) * base.ballRadius * 2),
              contextMode: "none",
              fps: 60
            })
          )
        )
      };
    }

    if (kind === "ohl7") {
      const overlaps = [0, 16.7, 33.3, 50, 66.7, 83.3, 100];
      return {
        family: "Ohl/Rolfs 7-step overlap continuum",
        note: "Seven equidistant overlap steps from 0% to 100%, with a 175 ms approach/onset event.",
        conditions: overlaps.map((overlap) =>
          withCondition(base, {
            label: `overlap-${overlap.toFixed(1).replace(".", "-")}`,
            durationMs: 500,
            leadInMs: 0,
            launcherSpeed: 2500,
            targetSpeedRatio: 1,
            launcherBehavior: "stop",
            delayMs: 0,
            gapPx: Math.round(-(overlap / 100) * base.ballRadius * 2),
            contextMode: "none",
            fps: 60
          })
        )
      };
    }

    if (kind === "kominsky9") {
      const overlaps = [0, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100];
      return {
        family: "Kominsky/Scholl 9-step overlap continuum",
        note: "Nine overlap steps in 12.5% increments for launch/pass psychometric functions.",
        conditions: overlaps.map((overlap) =>
          withCondition(base, {
            label: `overlap-${overlap.toFixed(1).replace(".", "-")}`,
            durationMs: 320,
            leadInMs: 0,
            launcherSpeed: 4200,
            targetSpeedRatio: 1,
            launcherBehavior: "stop",
            delayMs: 0,
            gapPx: Math.round(-(overlap / 100) * base.ballRadius * 2),
            contextMode: "none",
            fps: 60
          })
        )
      };
    }

    if (kind === "captureContext") {
      const contexts = ["none", "single", "launch"];
      return {
        family: "Scholl/Nakayama context types",
        note: "Full-overlap test event paired with no context, a single-object context, or a synchronized launch context.",
        conditions: contexts.map((contextMode) =>
          withCondition(base, {
            label: `full-overlap-${contextMode}-context`,
            gapPx: -base.ballRadius * 2,
            launcherBehavior: "stop",
            targetSpeedRatio: 1,
            delayMs: 0,
            contextMode,
            contextDurationMs: 750,
            contextOffsetMs: 0,
            fps: 60
          })
        )
      };
    }

    if (kind === "captureDuration") {
      const durations = [750, 500, 100, 50];
      return {
        family: "Scholl/Nakayama context durations",
        note: "Full-overlap test event with synchronized launch context shown for the full event or for an impact-centered window.",
        conditions: durations.map((duration) =>
          withCondition(base, {
            label: duration === 750 ? "launch-context-full-750" : `launch-context-window-${duration}`,
            gapPx: -base.ballRadius * 2,
            launcherBehavior: "stop",
            targetSpeedRatio: 1,
            delayMs: 0,
            contextMode: "launch",
            contextDurationMs: duration,
            contextOffsetMs: 0,
            fps: 60
          })
        )
      };
    }

    if (kind === "captureTiming") {
      const offsets = [0, -50, -100, -200];
      return {
        family: "Scholl/Nakayama timing offsets",
        note: "Full-overlap test event with the launch context occurring 0, 50, 100, or 200 ms before the test overlap.",
        conditions: offsets.map((offset) =>
          withCondition(base, {
            label: offset === 0 ? "launch-context-synchronous" : `launch-context-first-${Math.abs(offset)}ms`,
            gapPx: -base.ballRadius * 2,
            launcherBehavior: "stop",
            targetSpeedRatio: 1,
            delayMs: 0,
            contextMode: "launch",
            contextDurationMs: 750,
            contextOffsetMs: offset,
            fps: 60
          })
        )
      };
    }

    if (kind === "captureDirection") {
      const conditions = [
        { contextMode: "launch", contextDirection: "same", label: "same-direction-launch" },
        { contextMode: "launch", contextDirection: "opposite", label: "opposite-direction-launch" },
        { contextMode: "single", contextDirection: "same", label: "same-direction-single" },
        { contextMode: "single", contextDirection: "opposite", label: "opposite-direction-single" }
      ];
      return {
        family: "Scholl/Nakayama direction phase",
        note: "Full-overlap test event crossed with launch versus single-object context and same versus opposite direction.",
        conditions: conditions.map((condition) =>
          withCondition(base, {
            ...condition,
            gapPx: -base.ballRadius * 2,
            launcherBehavior: "stop",
            targetSpeedRatio: 1,
            delayMs: 0,
            contextDurationMs: 750,
            contextOffsetMs: 0,
            fps: 60
          })
        )
      };
    }

    if (kind === "retinotopicTransfer") {
      const ambiguousGap = Math.round(-0.5 * base.ballRadius * 2);
      const shiftedX = 150;
      const shiftedY = 90;
      const pairs = [
        {
          pairId: "same-location",
          testLabel: "test-same-retinotopic-location",
          stimulusXOffset: 0,
          stimulusYOffset: 0
        },
        {
          pairId: "shifted-right",
          testLabel: "test-shifted-right",
          stimulusXOffset: shiftedX,
          stimulusYOffset: 0
        },
        {
          pairId: "shifted-up",
          testLabel: "test-shifted-up",
          stimulusXOffset: 0,
          stimulusYOffset: -shiftedY
        }
      ];
      return {
        family: "Retinotopic transfer plan",
        note:
          "Adaptation clip plus same-location and shifted-location ambiguous tests for checking whether causal adaptation is spatially local.",
        conditions: [
          withCondition(base, {
            label: "adapt-unambiguous-launch-center",
            phase: "adaptation",
            role: "adapt-to-launch",
            pairId: "retinotopic-baseline",
            prediction: "Launch adaptation should reduce later launch reports most strongly at the same retinotopic location.",
            literatureAnchor: "Kominsky & Scholl 2020; Kominsky & Wenig 2025.",
            durationMs: 700,
            leadInMs: 0,
            launcherSpeed: 2500,
            targetSpeedRatio: 1,
            launcherBehavior: "stop",
            delayMs: 0,
            gapPx: 0,
            contextMode: "none",
            fps: 60
          }),
          ...pairs.map((pair) =>
            withCondition(base, {
              label: pair.testLabel,
              phase: "test",
              role: "ambiguous-launch-pass-test",
              pairId: pair.pairId,
              prediction:
                pair.pairId === "same-location"
                  ? "Same-location tests should show the strongest negative aftereffect."
                  : "Shifted-location tests should show reduced transfer if adaptation is retinotopically local.",
              literatureAnchor: "Retinotopically specific adaptation to launching.",
              durationMs: 700,
              leadInMs: 0,
              launcherSpeed: 2500,
              targetSpeedRatio: 1,
              launcherBehavior: "stop",
              delayMs: 0,
              gapPx: ambiguousGap,
              contextMode: "none",
              stimulusXOffset: pair.stimulusXOffset,
              stimulusYOffset: pair.stimulusYOffset,
              fps: 60
            })
          )
        ]
      };
    }

    if (kind === "featureTransfer") {
      return {
        family: "Feature-transfer plan",
        note:
          "Adapt/test clips crossing direction, speed, and color identity to separate direction tuning from speed or color transfer.",
        conditions: [
          withCondition(base, {
            label: "adapt-launch-rightward-teal-orange",
            phase: "adaptation",
            role: "feature-anchor",
            pairId: "feature-transfer",
            prediction: "Serves as the adapted feature set.",
            literatureAnchor: "Ohl & Rolfs 2024/2025 direction-tuned visual routines.",
            durationMs: 700,
            leadInMs: 0,
            launcherSpeed: 2500,
            targetSpeedRatio: 1,
            launcherBehavior: "stop",
            delayMs: 0,
            gapPx: 0,
            targetAngle: 0,
            contextMode: "none",
            launcherColor: "#80d3d0",
            targetColor: "#f3bb7b",
            fps: 60
          }),
          withCondition(base, {
            label: "test-same-direction-different-speed",
            phase: "test",
            role: "speed-transfer",
            pairId: "feature-transfer",
            prediction: "Adaptation should transfer across speed more than across direction.",
            literatureAnchor: "Ohl & Rolfs report transfer across speed.",
            durationMs: 900,
            leadInMs: 0,
            launcherSpeed: 1500,
            targetSpeedRatio: 1,
            launcherBehavior: "stop",
            delayMs: 0,
            gapPx: -base.ballRadius,
            targetAngle: 0,
            contextMode: "none",
            fps: 60
          }),
          withCondition(base, {
            label: "test-off-axis-35deg",
            phase: "test",
            role: "direction-transfer",
            pairId: "feature-transfer",
            prediction: "Off-axis tests should show weaker transfer if routines are direction tuned.",
            literatureAnchor: "Direction-dependent adaptation transfer.",
            durationMs: 700,
            leadInMs: 0,
            launcherSpeed: 2500,
            targetSpeedRatio: 1,
            launcherBehavior: "stop",
            delayMs: 0,
            gapPx: -base.ballRadius,
            targetAngle: 35,
            contextMode: "none",
            fps: 60
          }),
          withCondition(base, {
            label: "test-same-direction-color-swapped",
            phase: "test",
            role: "color-identity-transfer",
            pairId: "feature-transfer",
            prediction: "Same-direction tests should transfer despite color changes if direction is the key tuned feature.",
            literatureAnchor: "Ohl & Rolfs color-transfer result.",
            durationMs: 700,
            leadInMs: 0,
            launcherSpeed: 2500,
            targetSpeedRatio: 1,
            launcherBehavior: "stop",
            delayMs: 0,
            gapPx: -base.ballRadius,
            targetAngle: 0,
            contextMode: "none",
            launcherColor: "#f3bb7b",
            targetColor: "#80d3d0",
            fps: 60
          })
        ]
      };
    }

    if (kind === "categoryCarveup") {
      return {
        family: "Causal category carve-up",
        note:
          "Compare launching-like, triggering-like, entraining, pass/slip, and single-object controls for category-sensitive adaptation or ratings.",
        conditions: [
          withCondition(base, {
            label: "canonical-launching-category",
            role: "launching-like",
            prediction: "Baseline causal launch.",
            literatureAnchor: "Michotte; Kominsky & Scholl 2020.",
            gapPx: 0,
            launcherBehavior: "stop",
            targetSpeedRatio: 1,
            contextMode: "none",
            fps: 60
          }),
          withCondition(base, {
            label: "triggering-like-category",
            role: "launching-like-triggering",
            prediction: "Should group with launching more than entraining in adaptation transfer.",
            literatureAnchor: "Triggering transfers with launching in Kominsky & Scholl 2020.",
            gapPx: 0,
            launcherBehavior: "stop",
            targetSpeedRatio: 1.55,
            contextMode: "none",
            fps: 60
          }),
          withCondition(base, {
            label: "entraining-category",
            role: "entraining",
            prediction: "May form a distinct causal category rather than a launching-like one.",
            literatureAnchor: "Entraining dissociation in Kominsky & Scholl 2020; Kominsky & Wenig 2025.",
            gapPx: 0,
            launcherBehavior: "entrain",
            targetSpeedRatio: 1,
            contextMode: "none",
            fps: 60
          }),
          withCondition(base, {
            label: "pass-slip-control",
            role: "noncausal-pass-control",
            prediction: "Pass/slip controls should reduce causal launch reports.",
            literatureAnchor: "Launch/pass overlap continua.",
            gapPx: -base.ballRadius * 2,
            launcherBehavior: "continue",
            targetSpeedRatio: 1,
            contextMode: "none",
            fps: 60
          }),
          withCondition(base, {
            label: "single-object-motion-control",
            role: "continuous-motion-control",
            prediction: "Continuous single-object motion should not by itself produce entraining adaptation.",
            literatureAnchor: "Kominsky & Wenig 2025 single-object control.",
            gapPx: 0,
            launcherBehavior: "continue",
            targetSpeedRatio: 1,
            contextMode: "single",
            contextYOffset: 135,
            fps: 60
          })
        ]
      };
    }

    if (kind === "contextAdaptation") {
      const contexts = [
        { contextMode: "none", label: "no-context", role: "local-detector-test" },
        { contextMode: "launch", label: "launch-context", role: "capture-positive-context" },
        { contextMode: "pass", label: "pass-context", role: "capture-negative-context" }
      ];
      return {
        family: "Context after adaptation",
        note:
          "A before/after adaptation plan for testing whether causal capture survives local launch adaptation.",
        conditions: [
          withCondition(base, {
            label: "adapt-unambiguous-launch-stream-item",
            phase: "adaptation",
            role: "adapt-to-local-launch-detector",
            pairId: "context-after-adaptation",
            prediction: "Repeated local launch events should reduce launch reports for ambiguous no-context tests.",
            literatureAnchor: "Sommer, Rolfs, & Ohl 2025; Kominsky & Scholl 2020.",
            durationMs: 700,
            leadInMs: 0,
            launcherSpeed: 2500,
            targetSpeedRatio: 1,
            launcherBehavior: "stop",
            delayMs: 0,
            gapPx: 0,
            contextMode: "none",
            fps: 60
          }),
          ...["pre-adaptation", "post-adaptation"].flatMap((phase) =>
            contexts.map((context) =>
              withCondition(base, {
                label: `${phase}-${context.label}`,
                phase,
                role: context.role,
                pairId: "context-after-adaptation",
                prediction:
                  context.contextMode === "launch"
                    ? "Launch context should increase launch reports even when the local ambiguous event is adapted."
                    : context.contextMode === "pass"
                      ? "Pass context should decrease launch reports relative to no-context trials."
                      : "No-context trials should reveal the local adaptation aftereffect most directly.",
                literatureAnchor: "Causal capture and context-after-adaptation results.",
                durationMs: 700,
                leadInMs: 0,
                launcherSpeed: 2500,
                targetSpeedRatio: 1,
                launcherBehavior: "stop",
                delayMs: 0,
                gapPx: -base.ballRadius,
                contextMode: context.contextMode,
                contextOffsetMs: 0,
                fps: 60
              })
            )
          )
        ]
      };
    }

    const directions = [
      { label: "same-direction", contextDirection: "same", targetAngle: 0 },
      { label: "opposite-context", contextDirection: "opposite", targetAngle: 0 },
      { label: "off-axis-35deg", contextDirection: "same", targetAngle: 35 }
    ];
    return {
      family: "Direction transfer check",
      note: "Direction variants motivated by direction-tuned adaptation results.",
      conditions: directions.map((condition) =>
        withCondition(base, {
          ...condition,
          gapPx: -base.ballRadius,
          launcherBehavior: "stop",
          targetSpeedRatio: 1,
          delayMs: 0,
          contextMode: "launch",
          contextOffsetMs: 0,
          fps: 60
        })
      )
    };
  }

  async function exportVideo() {
    if (isExporting) {
      return;
    }

    if (typeof MediaRecorder === "undefined") {
      statusText.textContent = "MediaRecorder is unavailable in this browser.";
      return;
    }

    isExporting = true;
    exportButton.disabled = true;
    statusText.textContent = "Preparing export…";

    const state = cloneState();
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = STAGE_WIDTH * EXPORT_SCALE;
    exportCanvas.height = STAGE_HEIGHT * EXPORT_SCALE;
    const exportCtx = exportCanvas.getContext("2d");
    const stream = exportCanvas.captureStream(state.fps);
    let exportAudioContext = null;

    if (state.soundEnabled) {
      const AudioContextClass = getAudioContextClass();
      if (AudioContextClass) {
        exportAudioContext = new AudioContextClass();
        if (exportAudioContext.state === "suspended") {
          await exportAudioContext.resume().catch(() => {});
        }
        const audioDestination = exportAudioContext.createMediaStreamDestination();
        audioDestination.stream.getAudioTracks().forEach((track) => {
          stream.addTrack(track);
        });
        const geometry = getGeometry(state, getMainLaneY(state));
        scheduleImpactSound(
          exportAudioContext,
          state,
          audioDestination,
          exportAudioContext.currentTime + Math.min(geometry.stopTime, state.durationMs) / 1000
        );
      } else {
        statusText.textContent = "AudioContext is unavailable; exporting silent video.";
      }
    }

    const exportFormat = chooseExportFormat(state);
    exportFormat.width = exportCanvas.width;
    exportFormat.height = exportCanvas.height;
    const mimeType = exportFormat.mimeType;
    if (exportFormat.usedFallback) {
      statusText.textContent = "Requested format unsupported; using browser fallback.";
    }

    const recorderOptions = {
      mimeType,
      videoBitsPerSecond: Math.round(state.videoBitrate * 1000000)
    };
    if (state.soundEnabled) {
      recorderOptions.audioBitsPerSecond = 128000;
    }

    let recorder;
    try {
      recorder = new MediaRecorder(stream, recorderOptions);
    } catch (error) {
      statusText.textContent = "Selected encoder failed; retrying WebM.";
      recorder = new MediaRecorder(stream, {
        mimeType: "video/webm",
        videoBitsPerSecond: Math.round(state.videoBitrate * 1000000)
      });
      exportFormat.mimeType = "video/webm";
      exportFormat.extension = "webm";
    }
    const chunks = [];

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    const stopped = new Promise((resolve) => {
      recorder.onstop = resolve;
    });

    recorder.start();

    const frameDuration = 1000 / state.fps;
    const totalFrames = Math.ceil(state.durationMs / frameDuration);
    for (let frame = 0; frame <= totalFrames; frame += 1) {
      const time = Math.min(frame * frameDuration, state.durationMs);
      drawFrame(state, time, exportCtx);
      statusText.textContent = `Exporting frame ${frame + 1} of ${totalFrames + 1}…`;
      await new Promise((resolve) => window.setTimeout(resolve, frameDuration));
    }

    recorder.stop();
    await stopped;
    if (exportAudioContext) {
      await exportAudioContext.close().catch(() => {});
    }

    const blob = new Blob(chunks, { type: mimeType });
    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl);
    }
    currentObjectUrl = URL.createObjectURL(blob);

    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const filename = `${sanitizeLabel(state.fileLabel)}-${timestamp}.${exportFormat.extension}`;
    const metadataFilename = filename.replace(/\.(webm|mp4)$/, ".json");
    downloadLink.href = currentObjectUrl;
    downloadLink.download = filename;
    downloadLink.textContent = `Download ${filename}`;
    downloadLink.classList.remove("hidden");
    setMetadataDownload(buildMetadata(state, filename, exportFormat), metadataFilename);

    exportedVideo.src = currentObjectUrl;
    videoPanel.classList.remove("hidden");
    exportMeta.textContent = `${Math.round(state.durationMs)} ms - ${state.fps} fps - ${exportFormat.width}x${
      exportFormat.height
    } - ${
      exportFormat.extension.toUpperCase()
    } - ${mimeType}`;
    statusText.textContent = "Export finished.";

    const autoDownload = document.createElement("a");
    autoDownload.href = currentObjectUrl;
    autoDownload.download = filename;
    document.body.appendChild(autoDownload);
    autoDownload.click();
    autoDownload.remove();

    exportButton.disabled = false;
    isExporting = false;
  }

  function bindControls() {
    Object.entries(controls).forEach(([id, control]) => {
      if (!control) {
        return;
      }
      if (id === "fileLabel") {
        control.addEventListener("input", () => {
          statusText.textContent = "Ready.";
        });
        return;
      }
      if (id === "contextMode" || id === "contextDirection") {
        control.addEventListener("change", () => {
          activePresetKey = null;
          updateOutputs();
          refreshText();
          statusText.textContent = "Ready.";
          drawFrame(cloneState(), 0, ctx);
        });
        return;
      }
      if (id === "presetSelect") {
        return;
      }
      if (
        [
          "renderMode",
          "stageTheme",
          "objectStyle",
          "colorChangeMode",
          "colorChangeColor",
          "launcherColor",
          "targetColor",
          "contextColor",
          "pxPerDva",
          "fixationDva",
          "stimulusXOffset",
          "stimulusYOffset",
          "soundEnabled",
          "soundType",
          "soundVolume",
          "outputFormat",
          "fps",
          "videoBitrate"
        ].includes(id)
      ) {
        const eventName = control.type === "checkbox" || control.tagName === "SELECT" ? "change" : "input";
        control.addEventListener(eventName, () => {
          updateOutputs();
          refreshText();
          statusText.textContent = "Ready.";
          drawFrame(cloneState(), 0, ctx);
        });
        return;
      }
      const eventName = control.type === "checkbox" || control.tagName === "SELECT" ? "change" : "input";
      control.addEventListener(eventName, () => {
        activePresetKey = null;
        updateOutputs();
        refreshText();
        statusText.textContent = "Ready.";
        drawFrame(cloneState(), 0, ctx);
      });
    });

    presetSelect.addEventListener("change", () => {
      selectedPresetKey = presetSelect.value;
      const preset = getPreset(selectedPresetKey);
      presetSummary.textContent = preset.summary;
      presetNameInput.value = isCustomPresetKey(selectedPresetKey) ? preset.label : "";
      syncPresetActions();
      statusText.textContent = "Preset queued. Click Apply.";
    });

    applyPresetButton.addEventListener("click", () => {
      applyPreset(presetSelect.value);
      statusText.textContent = "Ready.";
    });

    previewButton.addEventListener("click", playPreview);
    savePresetButton.addEventListener("click", saveCurrentPreset);
    deletePresetButton.addEventListener("click", deleteSelectedPreset);
    exportButton.addEventListener("click", exportVideo);
    metadataButton.addEventListener("click", exportParameters);

    window.addEventListener("resize", () => {
      drawFrame(cloneState(), 0, ctx);
    });
  }

  function initializeRanges() {
    Object.entries({ ...controlDefaults, ...stimulusDefaults, ...presentationDefaults }).forEach(([key, value]) => {
      const control = controls[key];
      if (!control) {
        return;
      }
      if (control.type === "checkbox") {
        control.checked = Boolean(value);
      } else {
        control.value = value;
      }
    });
  }

  loadHiddenBuiltInPresets();
  loadCustomPresets();
  populatePresetMenu();
  initializeRanges();
  addParameterHelp();
  enhanceRangePrecision();
  bindControls();
  applyPreset(getVisiblePrimaryPresetKeys()[0] || customPresetKeys[0] || "canonical");
})();
