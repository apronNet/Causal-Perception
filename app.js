(async function () {
  const canvas = document.getElementById("stage");
  const ctx = canvas.getContext("2d");
  const STAGE_WIDTH = 960;
  const STAGE_HEIGHT = 540;
  const MAX_PREVIEW_PIXEL_RATIO = 3;
  const EXPORT_SCALE = 2;
  const CONTEXT_PAIR_MAX = 10;
  const RAIL_MAX = 6;
  const PSYCHOPY_STIMULI_FOLDER = "stimuli";
  const CUSTOM_PRESETS_STORAGE_KEY = "causal-launching-custom-presets-v1";
  const HIDDEN_BUILT_IN_PRESETS_STORAGE_KEY = "causal-launching-hidden-built-ins-v1";
  const SHARED_PRESETS_URL = "shared-presets.json";
  const CLASSIC_DISC_COLOR = "#f4f1e6";
  const CLASSIC_BACKGROUND_COLOR = "#111514";
  const BACKGROUND_THEME_COLORS = {
    dark: CLASSIC_BACKGROUND_COLOR,
    midgray: "#80786d",
    light: "#f6efe1"
  };

  const presetSelect = document.getElementById("presetSelect");
  const applyPresetButton = document.getElementById("applyPresetButton");
  const presetNameInput = document.getElementById("presetNameInput");
  const savePresetButton = document.getElementById("savePresetButton");
  const deletePresetButton = document.getElementById("deletePresetButton");
  const exportPresetButton = document.getElementById("exportPresetButton");
  const previewButton = document.getElementById("previewButton");
  const exportButton = document.getElementById("exportButton");
  const psychopyButton = document.getElementById("psychopyButton");
  const conditionSetSelect = document.getElementById("conditionSetSelect");
  const conditionJsonButton = document.getElementById("conditionJsonButton");
  const conditionCsvButton = document.getElementById("conditionCsvButton");
  const downloadLink = document.getElementById("downloadLink");
  const psychopyLink = document.getElementById("psychopyLink");
  const conditionJsonLink = document.getElementById("conditionJsonLink");
  const conditionCsvLink = document.getElementById("conditionCsvLink");
  const presetJsonLink = document.getElementById("presetJsonLink");
  const statusText = document.getElementById("statusText");
  const stageOverlay = document.querySelector(".stage-overlay");
  const scenarioBadge = document.getElementById("scenarioBadge");
  const timingBadge = document.getElementById("timingBadge");
  const summaryPreset = document.getElementById("summaryPreset");
  const summaryCompact = document.getElementById("summaryCompact");
  const summaryCategory = document.getElementById("summaryCategory");
  const summaryDuration = document.getElementById("summaryDuration");
  const summaryFps = document.getElementById("summaryFps");
  const summaryLeadIn = document.getElementById("summaryLeadIn");
  const summaryImpact = document.getElementById("summaryImpact");
  const summaryTargetOnset = document.getElementById("summaryTargetOnset");
  const summaryDelay = document.getElementById("summaryDelay");
  const summaryRelation = document.getElementById("summaryRelation");
  const summaryOverlap = document.getElementById("summaryOverlap");
  const summarySpeed = document.getElementById("summarySpeed");
  const summaryTargetRatio = document.getElementById("summaryTargetRatio");
  const summaryLauncherAccel = document.getElementById("summaryLauncherAccel");
  const summaryTargetAccel = document.getElementById("summaryTargetAccel");
  const summaryTargetAngle = document.getElementById("summaryTargetAngle");
  const summaryRadius = document.getElementById("summaryRadius");
  const summaryAfter = document.getElementById("summaryAfter");
  const summaryLauncherVisible = document.getElementById("summaryLauncherVisible");
  const summaryTargetVisible = document.getElementById("summaryTargetVisible");
  const summaryContext = document.getElementById("summaryContext");
  const summaryContextWindow = document.getElementById("summaryContextWindow");
  const summaryContextOffset = document.getElementById("summaryContextOffset");
  const summaryContextDirection = document.getElementById("summaryContextDirection");
  const summaryContextPairs = document.getElementById("summaryContextPairs");
  const summaryMode = document.getElementById("summaryMode");
  const summaryBackground = document.getElementById("summaryBackground");
  const summaryStyle = document.getElementById("summaryStyle");
  const summarySound = document.getElementById("summarySound");
  const summaryFormat = document.getElementById("summaryFormat");
  const summaryAspect = document.getElementById("summaryAspect");
  const summaryBitrate = document.getElementById("summaryBitrate");
  const validationList = document.getElementById("validationList");
  const literatureBlurb = document.getElementById("literatureBlurb");
  const presetSummary = document.getElementById("presetSummary");
  const presetNote = document.getElementById("presetNote");
  const videoPanel = document.getElementById("videoPanel");
  const exportMeta = document.getElementById("exportMeta");
  const exportedVideo = document.getElementById("exportedVideo");
  const artifactChecklist = document.getElementById("artifactChecklist");
  const artifactFilename = document.getElementById("artifactFilename");
  const artifactCsvStatus = document.getElementById("artifactCsvStatus");
  const artifactWarnings = document.getElementById("artifactWarnings");
  const relationMetric = document.getElementById("relationMetric");
  const categoryMetric = document.getElementById("categoryMetric");
  const captureMetric = document.getElementById("captureMetric");
  const timingMetric = document.getElementById("timingMetric");
  const contextMovementPairList = document.getElementById("contextMovementPairList");
  const contextPositionPairList = document.getElementById("contextPositionPairList");
  const contextColorPairList = document.getElementById("contextColorPairList");

  const controlIds = [
    "durationMs",
    "leadInMs",
    "launcherSpeed",
    "launcherAccel",
    "targetSpeedRatio",
    "targetAccel",
    "launcherBehavior",
    "targetAngle",
    "launcherVisibleMs",
    "targetVisibleMs",
    "delayMs",
    "gapPx",
    "markerMode",
    "ballRadius",
    "occluderEnabled",
    "occluderWidth",
    "contactOcclusionMode",
    "contextMode",
    "contextPairCount",
    "contextPairSnapshots",
    "contextDurationMs",
    "contextOffsetMs",
    "contextDirection",
    "contextYOffset",
    "contextBallRadius",
    "contextLeadInMs",
    "contextLauncherSpeed",
    "contextLauncherAccel",
    "contextLauncherBehavior",
    "contextDelayMs",
    "contextGapPx",
    "contextContactOcclusionMode",
    "contextOccluderEnabled",
    "contextOccluderWidth",
    "contextTargetSpeedRatio",
    "contextTargetAccel",
    "contextTargetAngle",
    "contextLauncherVisibleMs",
    "contextTargetVisibleMs",
    "renderMode",
    "stageTheme",
    "stageColor",
    "objectStyle",
    "groupingMode",
    "contactGuideMode",
    "crosshairEnabled",
    "crosshairX",
    "crosshairY",
    "crosshairColor",
    "railEnabled",
    "railCount",
    "railLength",
    "railStartX",
    "railStartY",
    "railEndX",
    "railEndY",
    "railSegments",
    "crosshairBlinkEnabled",
    "crosshairBlinkMs",
    "trajectoryEditEnabled",
    "selectedTrajectoryBall",
    "selectedTrajectoryAngle",
    "trajectoryOverrides",
    "customStartEnabled",
    "customStartKeepRowsHorizontal",
    "customStartAlignStartsVertical",
    "originalLauncherStartX",
    "originalLauncherStartY",
    "originalTargetStartX",
    "originalTargetStartY",
    "contextLauncherStartX",
    "contextLauncherStartY",
    "contextTargetStartX",
    "contextTargetStartY",
    "colorChangeMode",
    "colorChangeColor",
    "launcherColor",
    "targetColor",
    "contextColor",
    "contextTargetColor",
    "groupingOriginalColor",
    "groupingContextColor",
    "pxPerDva",
    "fixationDva",
    "stimulusXOffset",
    "stimulusYOffset",
    "soundEnabled",
    "soundType",
    "soundVolume",
    "outputFormat",
    "aspectRatio",
    "fps",
    "videoBitrate",
    "fileLabel"
  ];

  const parameterHelp = {
    presetSelect: "Changes: loads a prepared case or saved preset. Use for: starting from a known condition instead of rebuilding settings by hand.",
    presetNameInput: "Changes: the name used when saving the current settings. Browser saves are local; shared presets must be added to shared-presets.json.",
    durationMs: "Changes: total video duration for preview and export. Use for: making sure approach, contact, launched motion, and any context are not cut off.",
    leadInMs: "Changes: still time before the first object moves. Use for: giving viewers a stable start frame before motion begins.",
    launcherSpeed: "Changes: speed of the first object before contact. Use for: making the approach slower, sharper, or more forceful-looking.",
    launcherAccel: "Changes: whether the first object speeds up or slows down before contact. Positive means speeding up; negative means slowing down.",
    targetSpeedRatio: "Changes: second-object outgoing speed as a multiple of first-object impact speed. Use for: 1.00 matched launch, below 1.00 slower launch, above 1.00 trigger-like motion.",
    targetAccel: "Changes: whether the second object speeds up or slows down after it starts moving. Use for: testing post-contact motion dynamics.",
    launcherBehavior: "Changes: what the first object does after contact. Stop gives classic launching; continue gives pass/slip; entrain makes both objects move together.",
    targetAngle: "Changes: direction of the second object's motion after contact. Use for: straight launch versus angled launch.",
    launcherVisibleMs:
      "Changes: how long the launcher stays visible after the video starts. Longer than Video duration means it stays visible until the clip ends or moves offscreen. Shorter than Video duration makes it disappear on screen at that time.",
    targetVisibleMs:
      "Changes: how long the launchee stays visible after the video starts. Longer than Video duration means it stays visible until the clip ends or moves offscreen. Shorter than Video duration makes it disappear on screen at that time.",
    delayMs: "Changes: time between contact and second-object motion. Short delays look more directly causal; long delays look less like immediate launching.",
    gapPx: "Changes: center spacing at closest approach. Negative values mean overlap; 0 means the borders just touch; positive values leave a visible spatial gap.",
    markerMode:
      "Changes: optional cue drawn only when Overlap / Gap is a positive gap. Use for: testing whether a bridge or boundary marker changes responses to gap displays.",
    ballRadius: "Changes: object size. When many context pairs are shown, all pairs auto-shrink so the rows fit vertically.",
    contextBallRadius: "Changes: Context 1 object size. Added context pairs copy this size, then auto-shrink together at high pair counts.",
    occluderEnabled: "Changes: adds a tunnel over the contact region. Use for: hidden-contact or pass-behind-occluder displays.",
    occluderWidth: "Changes: width of the tunnel. Wider tunnels hide more of the contact region.",
    contactOcclusionMode: "Changes: which original-pair object is painted on top during overlap. Use for: First object front puts the launcher on top; Second object front puts the target on top; Alternate switches the top object.",
    contextMode:
      "Changes: whether added context pairs are shown. Nearby launch uses two objects; Single object uses one moving object. Pass-like context can be made with After contact = Continues.",
    contextPairCount:
      "Changes: how many context pairs are drawn, up to 10. New pairs copy the original pair when added; high counts shrink and space all pairs to fit vertically.",
    contextDurationMs: "Changes: how long the context event is visible. Use for: showing the full context event, or only a short window around impact.",
    contextOffsetMs: "Changes: context timing relative to the original pair event. Use for: 0 ms means simultaneous contact; negative means context earlier; positive means context later.",
    contextDirection: "Changes: context motion direction. Same matches the original pair event; opposite mirrors it.",
    contextYOffset: "Changes: vertical distance between original pair and context rows. Use for: separating the rows or preventing box overlap.",
    contextLeadInMs: "Changes: still time before the context object moves. Use for: shifting context approach timing without changing the original pair event.",
    contextLauncherSpeed: "Changes: speed of the context first object. Use for: matching the original pair event or making the context more/less forceful.",
    contextLauncherAccel: "Changes: whether the context first object speeds up or slows down before contact.",
    contextLauncherBehavior: "Changes: what the context first object does after contact. Stop is launch-like; continue is pass-like; entrain makes both context objects move together.",
    contextDelayMs: "Changes: delay between context contact and context target motion. Use for: strong immediate context versus weaker delayed context.",
    contextGapPx: "Changes: context-row spacing at closest approach. Negative means overlap; 0 means the context borders just touch; positive leaves a context gap.",
    contextContactOcclusionMode: "Changes: which context-row object is painted on top during overlap. Use for: setting context occlusion independently from the original-pair front-object setting.",
    contextOccluderEnabled: "Changes: adds a tunnel over the context row only. Use for: hidden-contact context displays without hiding the original pair event.",
    contextOccluderWidth: "Changes: context tunnel width. Wider context tunnels hide more of the context contact region.",
    contextTargetSpeedRatio: "Changes: context second-object speed as a multiple of context first-object impact speed. Use for: matching the original pair launch or making the context faster/slower.",
    contextTargetAccel: "Changes: whether the context second object speeds up or slows down after it starts moving.",
    contextTargetAngle: "Changes: direction of context second-object motion. Use for: matching or mismatching the original pair event direction.",
    contextLauncherVisibleMs:
      "Changes: how long the context launcher stays visible after the context event starts. Longer than Video duration means it stays visible until the clip ends or moves offscreen. Shorter than Video duration makes it disappear on screen at that context time.",
    contextTargetVisibleMs:
      "Changes: how long the context launchee stays visible after the context event starts. Longer than Video duration means it stays visible until the clip ends or moves offscreen. Shorter than Video duration makes it disappear on screen at that context time.",
    renderMode: "Changes: what appears in preview/export. Clean stimulus is for participant videos; lab preview shows design aids; fixation adds a fixation mark.",
    stageTheme: "Changes: preset background luminance and sets the background color picker.",
    stageColor: "Changes: exact stimulus-field color. Classic launching studies usually use high-contrast neutral discs rather than colored objects.",
    objectStyle: "Changes: visual rendering of the balls. Simple filled discs are the most controlled; shaded or ring styles are for display variants.",
    groupingMode: "Changes: solid boxes that group one pair, every pair separately, or all context pairs together. Use for: testing perceptual grouping.",
    contactGuideMode: "Changes: vertical contact guide lines. Use for: checking alignment while designing; turn off for final stimuli unless it is part of the condition.",
    crosshairEnabled: "Changes: adds a draggable crosshair to the stimulus. Drag the crosshair center in the preview.",
    crosshairColor: "Changes: crosshair line color in preview and export.",
    railEnabled: "Changes: adds one or more draggable rail lines. Rail 1 starts by connecting the original pair centers before motion starts.",
    railCount:
      "Changes: number of rail lines drawn. Extra rails start parallel to Rail 1 and can then be dragged independently in the preview.",
    railLength:
      "Changes: rail length in pixels. Use for: making rails shorter or longer while preserving each rail's center and angle.",
    crosshairBlinkEnabled:
      "Changes: makes the crosshair blink before balls appear. During this pre-ball window the event clock has not started.",
    crosshairBlinkMs:
      "Changes: duration of the pre-ball crosshair blink. If this is long, increase Video duration so the launch still has time to play after the blink.",
    trajectoryEditEnabled:
      "Changes: enables preview selection of individual ball trajectories. Click a ball or guide line in the preview, then adjust Angle for that selected ball only.",
    selectedTrajectoryAngle:
      "Changes: relative angle for the selected ball trajectory. 0 follows the default path; positive and negative values bend that selected ball in opposite vertical directions.",
    customStartEnabled: "Changes: enables drag editing in the preview. Use for: placing launcher and launchee start positions manually; exports use the positions but hide the rings.",
    customStartKeepRowsHorizontal: "Changes: keeps each event row level while dragging. Use for: launcher and launchee share one y-position within each pair.",
    customStartAlignStartsVertical: "Changes: keeps launchers on one vertical line when context is shown.",
    colorChangeMode: "Changes: whether a ball changes color exactly at contact. Use for: testing whether a feature change affects the launch impression.",
    colorChangeColor: "Changes: the new color used by sudden color change. Use for: setting the contact-locked feature change.",
    launcherColor: "Changes: color of the original-pair first object. Use for: object identity or fixed stimulus colors.",
    targetColor: "Changes: color of the original-pair second object. Match colors for similarity; contrast colors for distinct objects.",
    contextColor: "Changes: color of the context first object. Use for: matching or separating context from the original pair row.",
    contextTargetColor: "Changes: color of the context second object. Use for: context object identity.",
    groupingOriginalColor: "Changes: line color of the original-pair grouping box. Use a visible color that does not dominate the balls.",
    groupingContextColor: "Changes: line color of the context-row grouping box. Match box colors to group rows, or separate colors to distinguish rows.",
    pxPerDva: "Changes: pixels per visual degree saved in metadata. Use for: PsychoPy reporting when monitor size and viewing distance are known.",
    fixationDva: "Changes: fixation mark size in degrees. Only applies in fixation mode.",
    stimulusXOffset: "Changes: horizontal shift of the whole stimulus. Use for: aligning the movie in a PsychoPy window.",
    stimulusYOffset: "Changes: vertical shift of the whole stimulus. Use for: moving the event set without changing row separation.",
    soundEnabled: "Changes: adds a brief sound at contact if the browser supports audio export. Use only when sound is part of the design.",
    soundType: "Changes: contact sound shape. Click is sharp; thud is softer; tone is less impact-like.",
    soundVolume: "Changes: contact sound level. Keep fixed unless sound strength is a condition.",
    outputFormat: "Changes: requested movie container and codec preference for the exported file. PsychoPy usually accepts MP4/H.264 most easily, but Safari may provide MP4 while other browsers may fall back to WebM.",
    aspectRatio:
      "Changes: exported movie frame shape. The stimulus is centered without stretching the balls; non-16:9 exports add background padding.",
    fps: "Changes: the frame rate written into the exported movie and the saved PsychoPy CSV. The browser preview is close, but the exported file is the source of truth for timing checks.",
    videoBitrate: "Changes: compression quality for the exported movie. Higher values preserve cleaner disc edges and grouping lines, at the cost of larger stimulus files.",
    fileLabel: "Changes: the base filename. Exports add timing, speed, gap, context, and month/day tags automatically.",
    conditionSetSelect: "Changes: which multi-condition manifest is exported for later batch stimulus generation and PsychoPy condition-table setup."
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
        launcherSpeed: 876,
        targetSpeedRatio: 1 / 3.4,
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
        ballRadius: 28,
        occluderEnabled: false,
        occluderWidth: 150,
        contextMode: "launch",
        contextDurationMs: 750,
        contextOffsetMs: 0,
        contextDirection: "same",
        contextYOffset: 120,
        renderMode: "stimulus",
        stageTheme: "dark",
        groupingMode: "none",
        contactGuideMode: "none",
        groupingOriginalColor: "#c45f45",
        groupingContextColor: "#3f746f",
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
    launcherVisibleMs: 9000,
    targetVisibleMs: 9000,
    contextPairCount: 1,
    contextPairSnapshots: "[]",
    contextDurationMs: 750,
    contextLeadInMs: 200,
    contextBallRadius: 28,
    contextLauncherSpeed: 860,
    contextLauncherAccel: 0,
    contextLauncherBehavior: "stop",
    contextDelayMs: 0,
    contextGapPx: 0,
    contextContactOcclusionMode: "target-front",
    contextOccluderEnabled: false,
    contextOccluderWidth: 150,
    contextTargetSpeedRatio: 1,
    contextTargetAccel: 0,
    contextTargetAngle: 0,
    contextLauncherVisibleMs: 9000,
    contextTargetVisibleMs: 9000,
    contactOcclusionMode: "target-front",
    trajectoryEditEnabled: false,
    selectedTrajectoryBall: "originalTarget",
    selectedTrajectoryAngle: 0,
    trajectoryOverrides: "{}"
  };
  const presentationDefaults = {
    renderMode: "stimulus",
    stageTheme: "dark",
    stageColor: CLASSIC_BACKGROUND_COLOR,
    objectStyle: "flat",
    groupingMode: "none",
    contactGuideMode: "none",
    crosshairEnabled: false,
    crosshairX: STAGE_WIDTH / 2,
    crosshairY: STAGE_HEIGHT / 2,
    crosshairColor: "#fff8ea",
    railEnabled: false,
    railCount: 1,
    railLength: 465,
    railStartX: 92,
    railStartY: STAGE_HEIGHT / 2,
    railEndX: STAGE_WIDTH * 0.58,
    railEndY: STAGE_HEIGHT / 2,
    railSegments: "[]",
    crosshairBlinkEnabled: false,
    crosshairBlinkMs: 600,
    trajectoryEditEnabled: false,
    selectedTrajectoryBall: "originalTarget",
    selectedTrajectoryAngle: 0,
    trajectoryOverrides: "{}",
    colorChangeMode: "none",
    colorChangeColor: "#e0b24a",
    launcherColor: CLASSIC_DISC_COLOR,
    targetColor: CLASSIC_DISC_COLOR,
    contextColor: CLASSIC_DISC_COLOR,
    contextTargetColor: CLASSIC_DISC_COLOR,
    groupingOriginalColor: "#e0b24a",
    groupingContextColor: "#80a7a1",
    customStartEnabled: false,
    customStartKeepRowsHorizontal: false,
    customStartAlignStartsVertical: false,
    originalLauncherStartX: 92,
    originalLauncherStartY: STAGE_HEIGHT / 2,
    originalTargetStartX: STAGE_WIDTH * 0.58,
    originalTargetStartY: STAGE_HEIGHT / 2,
    contextLauncherStartX: 92,
    contextLauncherStartY: STAGE_HEIGHT / 2 + 120,
    contextTargetStartX: STAGE_WIDTH * 0.58,
    contextTargetStartY: STAGE_HEIGHT / 2 + 120,
    pxPerDva: 40,
    fixationDva: 0.3,
    stimulusXOffset: 0,
    stimulusYOffset: 0,
    soundEnabled: false,
    soundType: "click",
    soundVolume: 0.35,
    outputFormat: "lab",
    aspectRatio: "16:9",
    videoBitrate: 8
  };
  const controls = {};

  controlIds.forEach((id) => {
    controls[id] = document.getElementById(id);
  });
  const contextDependentControls = Array.from(document.querySelectorAll(".context-dependent-control"));
  const customStartDependentControls = Array.from(document.querySelectorAll(".custom-start-dependent-control"));
  const railDependentControls = Array.from(document.querySelectorAll(".rail-dependent-control"));
  const crosshairDependentControls = Array.from(document.querySelectorAll(".crosshair-dependent-control"));
  const trajectoryDependentControls = Array.from(document.querySelectorAll(".trajectory-dependent-control"));
  const contextModeButtons = Array.from(document.querySelectorAll("[data-context-mode]"));
  const contextDirectionButtons = Array.from(document.querySelectorAll("[data-context-direction]"));
  const choiceControlButtons = Array.from(document.querySelectorAll("[data-choice-for]"));
  let activePresetKey = "canonical";
  let selectedPresetKey = "canonical";
  let currentObjectUrl = null;
  let currentPsychopyUrl = null;
  let currentConditionJsonUrl = null;
  let currentConditionCsvUrl = null;
  let currentPresetJsonUrl = null;
  let previewHandle = null;
  let impactSoundTimer = null;
  let sharedAudioContext = null;
  let parameterTooltip = null;
  let previewStart = 0;
  let isExporting = false;
  let startDragTarget = null;
  let specialDragTarget = null;
  let customStartPositionsInitialized = false;
  let sharedPresetKeys = [];
  let customPresetKeys = [];
  let hiddenBuiltInPresetKeys = [];
  let lastContextPairCount = 1;

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

  function normalizeOcclusionMode(value) {
    return value === "launcher-front" || value === "alternate" ? value : "target-front";
  }

  function parseContextPairSnapshots(value) {
    if (!value) {
      return [];
    }
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [];
    }
  }

  function serializeContextPairSnapshots(snapshots) {
    return JSON.stringify(Array.isArray(snapshots) ? snapshots : []);
  }

  function parseRailSegments(value) {
    if (!value) {
      return [];
    }
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [];
    }
  }

  function serializeRailSegments(segments) {
    return JSON.stringify(Array.isArray(segments) ? segments : []);
  }

  function parseTrajectoryOverrides(value) {
    if (!value) {
      return {};
    }
    try {
      const parsed = typeof value === "string" ? JSON.parse(value) : value;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return {};
      }
      return Object.fromEntries(
        Object.entries(parsed)
          .map(([key, angle]) => [key, clamp(Math.round(Number(angle)), -90, 90)])
          .filter(([, angle]) => Number.isFinite(angle))
      );
    } catch {
      return {};
    }
  }

  function serializeTrajectoryOverrides(overrides) {
    return JSON.stringify(parseTrajectoryOverrides(overrides));
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
      launcherVisibleMs: Number(controls.launcherVisibleMs.value),
      targetVisibleMs: Number(controls.targetVisibleMs.value),
      delayMs: Number(controls.delayMs.value),
      gapPx: Number(controls.gapPx.value),
      markerMode: controls.markerMode.value,
      ballRadius: Number(controls.ballRadius.value),
      occluderEnabled: controls.occluderEnabled.checked,
      occluderWidth: Number(controls.occluderWidth.value),
      contactOcclusionMode: normalizeOcclusionMode(controls.contactOcclusionMode.value),
      contextMode: controls.contextMode.value,
      contextPairCount: Number(controls.contextPairCount.value),
      contextPairSnapshots: parseContextPairSnapshots(controls.contextPairSnapshots.value),
      contextDurationMs: Number(controls.contextDurationMs.value),
      contextOffsetMs: Number(controls.contextOffsetMs.value),
      contextDirection: controls.contextDirection.value,
      contextYOffset: Number(controls.contextYOffset.value),
      contextBallRadius: Number(controls.contextBallRadius.value),
      contextLeadInMs: Number(controls.contextLeadInMs.value),
      contextLauncherSpeed: Number(controls.contextLauncherSpeed.value),
      contextLauncherAccel: Number(controls.contextLauncherAccel.value),
      contextLauncherBehavior: controls.contextLauncherBehavior.value,
      contextDelayMs: Number(controls.contextDelayMs.value),
      contextGapPx: Number(controls.contextGapPx.value),
      contextContactOcclusionMode: normalizeOcclusionMode(controls.contextContactOcclusionMode.value),
      contextOccluderEnabled: controls.contextOccluderEnabled.checked,
      contextOccluderWidth: Number(controls.contextOccluderWidth.value),
      contextTargetSpeedRatio: Number(controls.contextTargetSpeedRatio.value),
      contextTargetAccel: Number(controls.contextTargetAccel.value),
      contextTargetAngle: Number(controls.contextTargetAngle.value),
      contextLauncherVisibleMs: Number(controls.contextLauncherVisibleMs.value),
      contextTargetVisibleMs: Number(controls.contextTargetVisibleMs.value),
      renderMode: controls.renderMode.value,
      stageTheme: controls.stageTheme.value,
      stageColor: controls.stageColor.value,
      objectStyle: controls.objectStyle.value,
      groupingMode: controls.groupingMode.value,
      contactGuideMode: controls.contactGuideMode.value,
      crosshairEnabled: controls.crosshairEnabled.checked,
      crosshairX: Number(controls.crosshairX.value),
      crosshairY: Number(controls.crosshairY.value),
      crosshairColor: controls.crosshairColor.value,
      railEnabled: controls.railEnabled.checked,
      railCount: Number(controls.railCount.value),
      railLength: Number(controls.railLength.value),
      railStartX: Number(controls.railStartX.value),
      railStartY: Number(controls.railStartY.value),
      railEndX: Number(controls.railEndX.value),
      railEndY: Number(controls.railEndY.value),
      railSegments: parseRailSegments(controls.railSegments.value),
      crosshairBlinkEnabled: controls.crosshairBlinkEnabled.checked,
      crosshairBlinkMs: Number(controls.crosshairBlinkMs.value),
      trajectoryEditEnabled: controls.trajectoryEditEnabled.checked,
      selectedTrajectoryBall: controls.selectedTrajectoryBall.value,
      selectedTrajectoryAngle: Number(controls.selectedTrajectoryAngle.value),
      trajectoryOverrides: parseTrajectoryOverrides(controls.trajectoryOverrides.value),
      customStartEnabled: controls.customStartEnabled.checked,
      customStartKeepRowsHorizontal: controls.customStartKeepRowsHorizontal.checked,
      customStartAlignStartsVertical: controls.customStartAlignStartsVertical.checked,
      originalLauncherStartX: Number(controls.originalLauncherStartX.value),
      originalLauncherStartY: Number(controls.originalLauncherStartY.value),
      originalTargetStartX: Number(controls.originalTargetStartX.value),
      originalTargetStartY: Number(controls.originalTargetStartY.value),
      contextLauncherStartX: Number(controls.contextLauncherStartX.value),
      contextLauncherStartY: Number(controls.contextLauncherStartY.value),
      contextTargetStartX: Number(controls.contextTargetStartX.value),
      contextTargetStartY: Number(controls.contextTargetStartY.value),
      colorChangeMode: controls.colorChangeMode.value,
      colorChangeColor: controls.colorChangeColor.value,
      launcherColor: controls.launcherColor.value,
      targetColor: controls.targetColor.value,
      contextColor: controls.contextColor.value,
      contextTargetColor: controls.contextTargetColor.value,
      groupingOriginalColor: controls.groupingOriginalColor.value,
      groupingContextColor: controls.groupingContextColor.value,
      pxPerDva: Number(controls.pxPerDva.value),
      fixationDva: Number(controls.fixationDva.value),
      stimulusXOffset: Number(controls.stimulusXOffset.value),
      stimulusYOffset: Number(controls.stimulusYOffset.value),
      soundEnabled: controls.soundEnabled.checked,
      soundType: controls.soundType.value,
      soundVolume: Number(controls.soundVolume.value),
      outputFormat: controls.outputFormat.value,
      aspectRatio: controls.aspectRatio.value,
      fps: Number(controls.fps.value),
      videoBitrate: Number(controls.videoBitrate.value),
      fileLabel: controls.fileLabel.value.trim() || "causal-launching"
    };
  }

  function formatValue(format, value, inputId = "", input = null) {
    const number = Number(value);
    switch (format) {
      case "int":
        return `${Math.round(number)} ms`;
      case "float1":
        return `${number.toFixed(1)} px/s`;
      case "float2":
        return `${number.toFixed(2)} ×`;
      case "float3":
        return `${number.toFixed(3)} ×`;
      case "accel":
        return `${number >= 0 ? "+" : ""}${Math.round(number)} px/s^2`;
      case "degrees":
        return `${number >= 0 ? "+" : ""}${Math.round(number)}°`;
      case "ms":
        return `${Math.round(number)} ms`;
      case "count":
        return `${Math.round(number)} ${Math.round(number) === 1 ? "pair" : "pairs"}`;
      case "railCount":
        return `${Math.round(number)} ${Math.round(number) === 1 ? "rail" : "rails"}`;
      case "trajectoryTarget":
        return getTrajectoryTargetLabel(value);
      case "visibilityMs": {
        const videoDuration = controls.durationMs ? Number(controls.durationMs.value) : 0;
        const suffix = number > videoDuration ? " until end" : "";
        return `${Math.round(number)} ms${suffix}`;
      }
      case "signedMs":
        return `${number >= 0 ? "+" : ""}${Math.round(number)} ms`;
      case "signedPx":
        return `${number >= 0 ? "+" : ""}${Math.round(number)} px`;
      case "overlap": {
        const pairIndex = input?.dataset?.pairIndex;
        const snapshots = parseContextPairSnapshots(controls.contextPairSnapshots?.value);
        const dynamicRadius =
          pairIndex !== undefined && snapshots[Number(pairIndex)] ? Number(snapshots[Number(pairIndex)].ballRadius) : null;
        const radiusControl = inputId === "contextGapPx" ? controls.contextBallRadius : controls.ballRadius;
        const fallbackRadius = radiusControl ? Number(radiusControl.value) : 28;
        const radius = Number.isFinite(dynamicRadius) ? dynamicRadius : fallbackRadius;
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

  function formatUnitHint(format, value) {
    switch (format) {
      case "int":
      case "ms":
      case "signedMs":
      case "visibilityMs":
        return "ms";
      case "float1":
        return "px/s";
      case "float2":
      case "float3":
        return "x";
      case "accel":
        return "px/s^2";
      case "degrees":
        return "deg";
      case "count":
        return Number(value) === 1 ? "pair" : "pairs";
      case "railCount":
        return Number(value) === 1 ? "rail" : "rails";
      case "overlap":
      case "intPx":
      case "signedPx":
        return "px";
      case "fps":
        return "fps";
      case "percent":
        return "%";
      case "mbps":
        return "Mbps";
      case "pxPerDva":
        return "px/deg";
      case "dva":
        return "deg";
      case "trajectoryTarget":
        return getTrajectoryTargetLabel(value);
      default:
        return "";
    }
  }

  function updateOutputs() {
    document.querySelectorAll("output[data-for]").forEach((output) => {
      const input = document.getElementById(output.dataset.for);
      if (!input) {
        return;
      }
      output.textContent = formatUnitHint(input.dataset.format, input.value);
      output.title = formatValue(input.dataset.format, input.value, input.id, input);
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

  function getParameterTooltip() {
    if (!parameterTooltip) {
      parameterTooltip = document.createElement("div");
      parameterTooltip.className = "parameter-tooltip hidden";
      parameterTooltip.setAttribute("role", "status");
      document.body.appendChild(parameterTooltip);
    }
    return parameterTooltip;
  }

  function hideParameterTooltip() {
    if (parameterTooltip) {
      parameterTooltip.classList.add("hidden");
    }
  }

  function formatParameterTooltipText(text) {
    return text.split(/\s+Use for:/)[0];
  }

  function showParameterTooltip(anchor, text) {
    const tooltip = getParameterTooltip();
    const margin = 12;
    tooltip.textContent = formatParameterTooltipText(text);
    tooltip.classList.remove("hidden");

    const fieldRect = anchor.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const left = clamp(fieldRect.left, margin, window.innerWidth - tooltipRect.width - margin);
    const below = fieldRect.bottom + 6;
    const top =
      below + tooltipRect.height <= window.innerHeight - margin
        ? below
        : Math.max(margin, fieldRect.top - tooltipRect.height - 6);

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  function bindParameterHelp() {
    Object.entries(parameterHelp).forEach(([id, text]) => {
      const control = document.getElementById(id);
      const field = control?.closest(".field");
      if (!field || field.dataset.helpBound === "true") {
        return;
      }
      const label = field.querySelector("span");
      if (!label) {
        return;
      }

      field.classList.add("help-field");
      field.dataset.helpBound = "true";
      const helpText = field.closest(".psychopy-panel")
        ? `${formatParameterTooltipText(text)} See GitHub README for PsychoPy details.`
        : text;
      field.dataset.helpText = helpText;
      label.addEventListener("pointerenter", () => showParameterTooltip(label, helpText));
      label.addEventListener("pointerleave", hideParameterTooltip);
      label.addEventListener("click", () => showParameterTooltip(label, helpText));
      label.setAttribute("tabindex", "0");
      label.addEventListener("focus", () => showParameterTooltip(label, helpText));
      label.addEventListener("blur", hideParameterTooltip);
    });

    window.addEventListener("scroll", hideParameterTooltip, true);
    window.addEventListener("resize", hideParameterTooltip);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        hideParameterTooltip();
      }
    });
  }

  function syncChoiceButtons(buttons, attribute, value) {
    buttons.forEach((button) => {
      const isActive = button.dataset[attribute] === value;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function getChoiceControlButtons(controlId) {
    return Array.from(document.querySelectorAll(`[data-choice-for="${controlId}"]`));
  }

  function syncChoiceControlButtons(controlId, value) {
    getChoiceControlButtons(controlId).forEach((button) => {
      const isActive = button.dataset.choiceValue === value;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function syncAllChoiceControlButtons() {
    const synced = new Set();
    document.querySelectorAll("[data-choice-for]").forEach((button) => {
      const controlId = button.dataset.choiceFor;
      if (!controlId || synced.has(controlId)) {
        return;
      }
      const control = document.getElementById(controlId);
      if (control) {
        syncChoiceControlButtons(controlId, control.value);
        synced.add(controlId);
      }
    });
  }

  function syncContextChoiceButtons() {
    syncChoiceButtons(contextModeButtons, "contextMode", controls.contextMode.value);
    syncChoiceButtons(contextDirectionButtons, "contextDirection", controls.contextDirection.value);
  }

  function setControlValue(control, value) {
    if (!control) {
      return;
    }
    if (control.type === "checkbox") {
      control.checked = Boolean(value);
    } else {
      control.value = value;
      syncChoiceControlButtons(control.id, String(control.value));
    }
  }

  function copyOriginalToContextControls() {
    const pairs = [
      ["contextLeadInMs", "leadInMs"],
      ["contextBallRadius", "ballRadius"],
      ["contextLauncherSpeed", "launcherSpeed"],
      ["contextLauncherAccel", "launcherAccel"],
      ["contextLauncherBehavior", "launcherBehavior"],
      ["contextDelayMs", "delayMs"],
      ["contextGapPx", "gapPx"],
      ["contextContactOcclusionMode", "contactOcclusionMode"],
      ["contextOccluderEnabled", "occluderEnabled"],
      ["contextOccluderWidth", "occluderWidth"],
      ["contextTargetSpeedRatio", "targetSpeedRatio"],
      ["contextTargetAccel", "targetAccel"],
      ["contextTargetAngle", "targetAngle"],
      ["contextLauncherVisibleMs", "launcherVisibleMs"],
      ["contextTargetVisibleMs", "targetVisibleMs"],
      ["contextColor", "launcherColor"],
      ["contextTargetColor", "targetColor"],
      ["groupingContextColor", "groupingOriginalColor"]
    ];

    pairs.forEach(([contextId, originalId]) => {
      setControlValue(controls[contextId], controls[originalId]?.type === "checkbox" ? controls[originalId].checked : controls[originalId]?.value);
    });

    controls.contextPairCount.value = 1;
    controls.contextPairSnapshots.value = "[]";
    updateOutputs();
  }

  function applyContextChoice(control, value) {
    if (!control || control.value === value) {
      return;
    }

    const previousValue = control.value;
    control.value = value;
    if (control.id === "contextMode" && previousValue === "none" && value !== "none") {
      copyOriginalToContextControls();
    }
    control.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function applyChoiceControl(control, value) {
    if (!control || control.value === value) {
      return;
    }

    control.value = value;
    if (control.id === "stageTheme" && controls.stageColor) {
      controls.stageColor.value = BACKGROUND_THEME_COLORS[value] || CLASSIC_BACKGROUND_COLOR;
    }
    syncChoiceControlButtons(control.id, value);
    control.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function syncContextControlVisibility() {
    const contextIsOff = controls.contextMode.value === "none";
    syncContextChoiceButtons();
    syncAllChoiceControlButtons();
    contextDependentControls.forEach((field) => {
      field.classList.toggle("is-retracted", contextIsOff);
    });

    if (contextIsOff) {
      hideParameterTooltip();
    } else if (controls.customStartEnabled.checked && controls.customStartAlignStartsVertical.checked) {
      enforceCustomStartConstraints();
    }
  }

  function getContextPairCount(state) {
    if (state.contextMode === "none") {
      return 0;
    }
    return clamp(Math.round(Number(state.contextPairCount) || 1), 1, CONTEXT_PAIR_MAX);
  }

  function getAutoContextPairRadius(baseRadius, pairCount) {
    const requestedRadius = clamp(Math.round(Number(baseRadius) || stimulusDefaults.contextBallRadius), 8, 60);
    const visibleContextPairs = clamp(Math.round(Number(pairCount) || 1), 1, CONTEXT_PAIR_MAX);
    const stepCount = Math.max(1, Math.ceil(visibleContextPairs / 2));
    const desiredGap = 12;
    const halfAvailable = STAGE_HEIGHT / 2 - 38;
    const fitRadius = Math.floor((halfAvailable - stepCount * desiredGap) / (stepCount * 2 + 1));
    return clamp(Math.min(requestedRadius, fitRadius), 8, 60);
  }

  function getAutoContextPairSpacing(radius, pairCount, preferredSpacing = 112) {
    const visibleContextPairs = clamp(Math.round(Number(pairCount) || 1), 1, CONTEXT_PAIR_MAX);
    const visibleHalfSpan = Math.max(80, STAGE_HEIGHT / 2 - radius - 44);
    const stepCount = Math.max(1, Math.ceil(visibleContextPairs / 2));
    const fitSpacing = visibleHalfSpan / stepCount;
    const preferred = Math.abs(Number(preferredSpacing)) || 112;
    const minimumComfortSpacing = radius * 2 + 12;
    return Math.max(Math.min(preferred, fitSpacing), Math.min(minimumComfortSpacing, fitSpacing));
  }

  function getContextPairOffsetFromSpacing(pairIndex, spacing, sign = 1) {
    const offsetMagnitude = Math.floor(pairIndex / 2) + 1;
    const side = pairIndex % 2 === 0 ? 1 : -1;
    return offsetMagnitude * spacing * side * sign;
  }

  function shouldReplaceAutoContextRadius(value, baseRadius, previousPairCount) {
    const current = Math.round(Number(value));
    const base = Math.round(Number(baseRadius));
    const previousAuto = getAutoContextPairRadius(baseRadius, previousPairCount);
    return current === base || current === previousAuto;
  }

  function applyAutoContextPairRadii(previousPairCount, nextPairCount) {
    const baseRadius = Number(controls.ballRadius.value) || stimulusDefaults.contextBallRadius;
    const nextAutoRadius = getAutoContextPairRadius(baseRadius, nextPairCount);
    const shouldFitManyRows = nextPairCount >= 4;

    if (shouldFitManyRows && Number(controls.ballRadius.value) > nextAutoRadius) {
      controls.ballRadius.value = nextAutoRadius;
    }

    if (
      shouldReplaceAutoContextRadius(controls.contextBallRadius.value, baseRadius, previousPairCount) ||
      (shouldFitManyRows && Number(controls.contextBallRadius.value) > nextAutoRadius)
    ) {
      controls.contextBallRadius.value = nextAutoRadius;
    }

    const currentYOffset = Number(controls.contextYOffset.value) || 112;
    const spacingSign = currentYOffset < 0 ? -1 : 1;
    const nextAutoSpacing = getAutoContextPairSpacing(nextAutoRadius, nextPairCount, currentYOffset);
    if (shouldFitManyRows && Math.abs(currentYOffset) > nextAutoSpacing) {
      controls.contextYOffset.value = Math.round(nextAutoSpacing * spacingSign);
    }

    const snapshots = parseContextPairSnapshots(controls.contextPairSnapshots.value).map((snapshot, snapshotIndex) => {
      const nextSnapshot = { ...snapshot };
      if (
        shouldReplaceAutoContextRadius(snapshot.ballRadius, baseRadius, previousPairCount) ||
        (shouldFitManyRows && Number(snapshot.ballRadius) > nextAutoRadius)
      ) {
        nextSnapshot.ballRadius = nextAutoRadius;
      }
      if (shouldFitManyRows) {
        nextSnapshot.yOffset = getContextPairOffsetFromSpacing(
          snapshotIndex + 1,
          nextAutoSpacing,
          spacingSign
        );
      }
      return nextSnapshot;
    });
    controls.contextPairSnapshots.value = serializeContextPairSnapshots(snapshots);
  }

  function getDefaultContextPairOffset(state, pairIndex) {
    const sign = state.contextYOffset < 0 ? -1 : 1;
    const pairCount = Math.max(getContextPairCount(state) || Math.round(Number(state.contextPairCount) || 1), pairIndex + 1, 1);
    const radius = Number(state.contextBallRadius) || Number(state.ballRadius) || stimulusDefaults.contextBallRadius;
    const preferredSpacing = Math.abs(state.contextYOffset) || 112;
    const spacing = getAutoContextPairSpacing(radius, pairCount, preferredSpacing);
    return getContextPairOffsetFromSpacing(pairIndex, spacing, sign);
  }

  function makeContextPairSnapshotFromOriginal(state, pairIndex = 1) {
    const laneY = getMainLaneY(state);
    const geometry = getGeometry(state, laneY, { scope: "original", directionSign: 1 });
    return {
      laneY,
      yOffset: getDefaultContextPairOffset(state, pairIndex),
      ballRadius: getAutoContextPairRadius(state.contextBallRadius || state.ballRadius, getContextPairCount(state) || state.contextPairCount || 1),
      leadInMs: state.leadInMs,
      launcherSpeed: state.launcherSpeed,
      launcherAccel: state.launcherAccel,
      launcherBehavior: state.launcherBehavior,
      delayMs: state.delayMs,
      gapPx: state.gapPx,
      contactOcclusionMode: state.contactOcclusionMode,
      occluderEnabled: state.occluderEnabled,
      occluderWidth: state.occluderWidth,
      targetSpeedRatio: state.targetSpeedRatio,
      targetAccel: state.targetAccel,
      targetAngle: state.targetAngle,
      launcherVisibleMs: state.launcherVisibleMs,
      targetVisibleMs: state.targetVisibleMs,
      launcherColor: state.launcherColor,
      targetColor: state.targetColor,
      groupingColor: state.groupingOriginalColor,
      launcherStartX: geometry.launcherStartX,
      launcherStartY: geometry.launcherStartY,
      targetStartX: geometry.targetBaseX,
      targetStartY: geometry.targetBaseY
    };
  }

  function syncContextPairSnapshots() {
    const state = cloneState();
    const pairCount = getContextPairCount(state);
    const neededSnapshots = Math.max(0, pairCount - 1);
    const snapshots = [...state.contextPairSnapshots].slice(0, neededSnapshots);

    while (snapshots.length < neededSnapshots) {
      snapshots.push(
        makeContextPairSnapshotFromOriginal(
          { ...state, customStartEnabled: Boolean(state.customStartEnabled) },
          snapshots.length + 1
        )
      );
    }

    controls.contextPairSnapshots.value = serializeContextPairSnapshots(snapshots);
  }

  function normalizeContextPairSnapshot(snapshot, state, pairIndex) {
    return {
      ...makeContextPairSnapshotFromOriginal(state, pairIndex),
      ...(snapshot || {})
    };
  }

  function getContextLaneY(state, mainLaneY, pairIndex, snapshot = null) {
    const storedOffset = pairIndex === 0 ? state.contextYOffset : Number(snapshot?.yOffset);
    const offset = Number.isFinite(storedOffset) ? storedOffset : getDefaultContextPairOffset(state, pairIndex);
    return clamp(mainLaneY + offset, 44, STAGE_HEIGHT - 44);
  }

  function contextPairFieldId(pairNumber, group, field) {
    return `context${pairNumber}${group}${field.charAt(0).toUpperCase()}${field.slice(1)}`;
  }

  function renderContextRange(pairNumber, group, field, label, snapshot, format, min, max, step, extra = "") {
    const id = contextPairFieldId(pairNumber, group, field);
    const value = snapshot[field];
    return `<label class="field"><span>${label}</span><input id="${id}" data-pair-index="${pairNumber - 2}" data-pair-field="${field}" data-format="${format}" ${extra} min="${min}" max="${max}" step="${step}" type="range" value="${value}" /><output data-for="${id}"></output></label>`;
  }

  function renderContextSelect(pairNumber, group, field, label, snapshot, options) {
    const id = contextPairFieldId(pairNumber, group, field);
    if (options.length <= 3) {
      const renderedButtons = options
        .map(
          ([value, text]) =>
            `<button class="choice-button" data-choice-for="${id}" data-choice-value="${value}" type="button">${text}</button>`
        )
        .join("");
      const fieldClass = field === "contactOcclusionMode" ? " field wide-choice-field" : " field";
      return `<label class="${fieldClass.trim()}"><span>${label}</span><input id="${id}" data-pair-index="${pairNumber - 2}" data-pair-field="${field}" type="hidden" value="${snapshot[field]}" /><span class="choice-row three-choice-row" role="group" aria-label="Context ${pairNumber} ${label}">${renderedButtons}</span></label>`;
    }

    const renderedOptions = options
      .map(
        ([value, text]) =>
          `<option value="${value}"${snapshot[field] === value ? " selected" : ""}>${text}</option>`
      )
      .join("");
    return `<label class="field"><span>${label}</span><select id="${id}" data-pair-index="${pairNumber - 2}" data-pair-field="${field}">${renderedOptions}</select></label>`;
  }

  function renderContextCheckbox(pairNumber, group, field, label, snapshot) {
    const id = contextPairFieldId(pairNumber, group, field);
    const fieldClass = field === "occluderEnabled" ? " checkbox-field tunnel-checkbox-field" : " checkbox-field";
    return `<label class="field${fieldClass}"><input id="${id}" data-pair-index="${pairNumber - 2}" data-pair-field="${field}" type="checkbox"${snapshot[field] ? " checked" : ""} /><span>${label}</span></label>`;
  }

  function renderContextColor(pairNumber, group, field, label, snapshot) {
    const id = contextPairFieldId(pairNumber, group, field);
    return `<label class="field color-field"><span>${label}</span><input id="${id}" data-pair-index="${pairNumber - 2}" data-pair-field="${field}" type="color" value="${snapshot[field]}" /></label>`;
  }

  function renderContextPairEditors() {
    const containers = [contextMovementPairList, contextPositionPairList, contextColorPairList];
    if (containers.some((container) => !container)) {
      return;
    }

    const state = cloneState();
    const pairCount = getContextPairCount(state);
    if (pairCount <= 1) {
      containers.forEach((container) => {
        container.replaceChildren();
      });
      return;
    }

    const snapshots = state.contextPairSnapshots || [];
    const movementCards = [];
    const positionCards = [];
    const colorCards = [];

    for (let pairNumber = 2; pairNumber <= pairCount; pairNumber += 1) {
      const snapshot = normalizeContextPairSnapshot(snapshots[pairNumber - 2], state, pairNumber - 1);
      movementCards.push(`
        <div class="control-subgroup context-pair-editor">
          <h3 class="subgroup-title">Context ${pairNumber} movement</h3>
          <div class="control-subgrid">
            ${renderContextRange(pairNumber, "Movement", "leadInMs", "Lead-in", snapshot, "int", 0, 1800, 10)}
            ${renderContextRange(pairNumber, "Movement", "launcherSpeed", "Speed", snapshot, "float1", 80, 6500, 1)}
            ${renderContextRange(pairNumber, "Movement", "launcherAccel", "Acceleration", snapshot, "accel", -1500, 3000, 50)}
            ${renderContextSelect(pairNumber, "Movement", "launcherBehavior", "After contact", snapshot, [
              ["stop", "Stop"],
              ["continue", "Pass"],
              ["entrain", "Both"]
            ])}
            ${renderContextSelect(pairNumber, "Movement", "contactOcclusionMode", "Front object", snapshot, [
              ["target-front", "Launchee"],
              ["launcher-front", "Launcher"],
              ["alternate", "Alt"]
            ])}
            ${renderContextRange(pairNumber, "Movement", "delayMs", "Delay", snapshot, "ms", 0, 500, 5)}
            ${renderContextRange(pairNumber, "Movement", "targetSpeedRatio", "Target ratio", snapshot, "float3", 0.2, 2.5, 0.001)}
            ${renderContextRange(pairNumber, "Movement", "targetAccel", "Target accel.", snapshot, "accel", -1500, 3000, 50)}
            ${renderContextRange(pairNumber, "Movement", "targetAngle", "Target angle", snapshot, "degrees", -90, 90, 1)}
            ${renderContextRange(pairNumber, "Movement", "launcherVisibleMs", "Launcher on-screen", snapshot, "visibilityMs", 25, 9000, 25)}
            ${renderContextRange(pairNumber, "Movement", "targetVisibleMs", "Launchee on-screen", snapshot, "visibilityMs", 25, 9000, 25)}
          </div>
        </div>`);

      positionCards.push(`
        <div class="control-subgroup context-pair-editor">
          <h3 class="subgroup-title">Context ${pairNumber} position</h3>
          <div class="control-subgrid">
            ${renderContextRange(pairNumber, "Position", "yOffset", "Vertical distance", snapshot, "signedPx", -320, 320, 1)}
            ${renderContextRange(pairNumber, "Position", "ballRadius", "Radius", snapshot, "intPx", 8, 60, 1)}
            ${renderContextRange(pairNumber, "Position", "gapPx", "Overlap / gap", snapshot, "overlap", -120, 160, 1)}
            ${renderContextCheckbox(pairNumber, "Position", "occluderEnabled", "Tunnel occluder", snapshot)}
            ${renderContextRange(pairNumber, "Position", "occluderWidth", "Tunnel width", snapshot, "intPx", 40, 360, 5)}
          </div>
        </div>`);

      colorCards.push(`
        <div class="control-subgroup context-pair-editor">
          <h3 class="subgroup-title">Context ${pairNumber} color</h3>
          <div class="control-subgrid">
            ${renderContextColor(pairNumber, "Color", "launcherColor", "Launcher", snapshot)}
            ${renderContextColor(pairNumber, "Color", "targetColor", "Target", snapshot)}
            ${renderContextColor(pairNumber, "Color", "groupingColor", "Grouping box", snapshot)}
          </div>
        </div>`);
    }

    contextMovementPairList.innerHTML = movementCards.join("");
    contextPositionPairList.innerHTML = positionCards.join("");
    contextColorPairList.innerHTML = colorCards.join("");
    enhanceRangePrecision();
    syncAllChoiceControlButtons();
    updateOutputs();
  }

  function updateContextPairSnapshotFromControl(control) {
    const snapshotIndex = Number(control.dataset.pairIndex);
    const field = control.dataset.pairField;
    if (!Number.isInteger(snapshotIndex) || !field) {
      return;
    }

    const state = cloneState();
    const snapshots = [...state.contextPairSnapshots];
    while (snapshots.length <= snapshotIndex) {
      snapshots.push(makeContextPairSnapshotFromOriginal(state, snapshots.length + 1));
    }

    let value = control.value;
    if (control.type === "checkbox") {
      value = control.checked;
    } else if (control.type === "range" || control.type === "number") {
      value = Number(control.value);
    }

    snapshots[snapshotIndex] = {
      ...normalizeContextPairSnapshot(snapshots[snapshotIndex], state, snapshotIndex + 1),
      [field]: field === "contactOcclusionMode" ? normalizeOcclusionMode(value) : value
    };
    controls.contextPairSnapshots.value = serializeContextPairSnapshots(snapshots);
    activePresetKey = null;
    updateOutputs();
    refreshText();
    statusText.textContent = `Context ${snapshotIndex + 2} updated.`;
    drawFrame(cloneState(), 0, ctx);
  }

  function writeCoordinateControl(xId, yId, x, y) {
    controls[xId].value = Number(clamp(x, 0, STAGE_WIDTH).toFixed(1));
    controls[yId].value = Number(clamp(y, 0, STAGE_HEIGHT).toFixed(1));
  }

  function getCoordinateControlValue(id) {
    return Number(controls[id].value);
  }

  function getAutomaticStartPositions(state) {
    const automaticState = { ...state, customStartEnabled: false };
    const laneY = getMainLaneY(automaticState);
    const originalGeometry = getGeometry(automaticState, laneY, { scope: "original", directionSign: 1 });
    const contextState = getContextMotionState(automaticState);
    const contextGeometry = getGeometry(contextState, getContextLaneY(automaticState, laneY, 0), {
      scope: "context",
      directionSign: originalGeometry.contextDirectionSign
    });

    return {
      originalLauncher: { x: originalGeometry.launcherStartX, y: originalGeometry.launcherStartY },
      originalTarget: { x: originalGeometry.targetBaseX, y: originalGeometry.targetBaseY },
      contextLauncher: { x: contextGeometry.launcherStartX, y: contextGeometry.launcherStartY },
      contextTarget: { x: contextGeometry.targetBaseX, y: contextGeometry.targetBaseY }
    };
  }

  function initializeCustomStartPositions(force = false) {
    if (customStartPositionsInitialized && !force) {
      return;
    }

    const positions = getAutomaticStartPositions(cloneState());
    writeCoordinateControl(
      "originalLauncherStartX",
      "originalLauncherStartY",
      positions.originalLauncher.x,
      positions.originalLauncher.y
    );
    writeCoordinateControl("originalTargetStartX", "originalTargetStartY", positions.originalTarget.x, positions.originalTarget.y);
    writeCoordinateControl(
      "contextLauncherStartX",
      "contextLauncherStartY",
      positions.contextLauncher.x,
      positions.contextLauncher.y
    );
    writeCoordinateControl("contextTargetStartX", "contextTargetStartY", positions.contextTarget.x, positions.contextTarget.y);
    customStartPositionsInitialized = true;
  }

  function resetCustomStartPositionsToAutomatic() {
    const positions = getAutomaticStartPositions({ ...cloneState(), customStartEnabled: false });
    writeCoordinateControl(
      "originalLauncherStartX",
      "originalLauncherStartY",
      positions.originalLauncher.x,
      positions.originalLauncher.y
    );
    writeCoordinateControl("originalTargetStartX", "originalTargetStartY", positions.originalTarget.x, positions.originalTarget.y);
    writeCoordinateControl(
      "contextLauncherStartX",
      "contextLauncherStartY",
      positions.contextLauncher.x,
      positions.contextLauncher.y
    );
    writeCoordinateControl("contextTargetStartX", "contextTargetStartY", positions.contextTarget.x, positions.contextTarget.y);
    customStartPositionsInitialized = false;
  }

  function syncStartDragUi() {
    const enabled = Boolean(controls.customStartEnabled.checked);
    canvas.classList.toggle("start-drag-enabled", enabled);
    customStartDependentControls.forEach((field) => {
      field.classList.toggle("is-retracted", !enabled);
    });
    if (!enabled) {
      startDragTarget = null;
      hideParameterTooltip();
    }
  }

  function syncSpecialDragUi() {
    const enabled = Boolean(controls.crosshairEnabled.checked || controls.railEnabled.checked);
    const trajectoryEnabled = Boolean(controls.trajectoryEditEnabled.checked);
    canvas.classList.toggle("special-drag-enabled", enabled);
    canvas.classList.toggle("trajectory-edit-enabled", trajectoryEnabled);
    if (!enabled) {
      specialDragTarget = null;
    }
  }

  function syncCrosshairControlVisibility() {
    const enabled = Boolean(controls.crosshairEnabled.checked);
    crosshairDependentControls.forEach((field) => {
      field.classList.toggle("is-retracted", !enabled);
    });
  }

  function syncRailControlVisibility() {
    const enabled = Boolean(controls.railEnabled.checked);
    railDependentControls.forEach((field) => {
      field.classList.toggle("is-retracted", !enabled);
    });
  }

  function syncTrajectoryControlVisibility() {
    const state = cloneState();
    const enabled = Boolean(state.trajectoryEditEnabled);
    trajectoryDependentControls.forEach((field) => {
      field.classList.toggle("is-retracted", !enabled);
    });
    if (!enabled) {
      return;
    }
    ensureSelectedTrajectoryTarget(state);
  }

  function getRailCount(state) {
    if (!state.railEnabled) {
      return 0;
    }
    return clamp(Math.round(Number(state.railCount) || 1), 1, RAIL_MAX);
  }

  function getDefaultRailEndpoints(state = cloneState()) {
    const laneY = getMainLaneY({ ...state, customStartEnabled: false });
    const geometry = getGeometry({ ...state, customStartEnabled: false }, laneY, { scope: "original", directionSign: 1 });
    return {
      start: { x: geometry.launcherStartX, y: geometry.launcherStartY },
      end: { x: geometry.targetBaseX, y: geometry.targetBaseY }
    };
  }

  function getDefaultRailOffset(railIndex) {
    const offsets = [0, 42, -42, 84, -84, 126];
    return offsets[railIndex] ?? railIndex * 42;
  }

  function getDefaultRailSegment(state = cloneState(), railIndex = 0) {
    const endpoints = getDefaultRailEndpoints(state);
    const yOffset = getDefaultRailOffset(railIndex);
    return {
      startX: endpoints.start.x,
      startY: clamp(endpoints.start.y + yOffset, 0, STAGE_HEIGHT),
      endX: endpoints.end.x,
      endY: clamp(endpoints.end.y + yOffset, 0, STAGE_HEIGHT)
    };
  }

  function normalizeRailSegment(segment, fallback) {
    const source = segment || {};
    const fallbackSegment = fallback || getDefaultRailSegment(cloneState(), 0);
    return {
      startX: clamp(getFeatureCoordinate(source.startX, fallbackSegment.startX), 0, STAGE_WIDTH),
      startY: clamp(getFeatureCoordinate(source.startY, fallbackSegment.startY), 0, STAGE_HEIGHT),
      endX: clamp(getFeatureCoordinate(source.endX, fallbackSegment.endX), 0, STAGE_WIDTH),
      endY: clamp(getFeatureCoordinate(source.endY, fallbackSegment.endY), 0, STAGE_HEIGHT)
    };
  }

  function getRailSegmentLength(segment) {
    return Math.hypot(segment.endX - segment.startX, segment.endY - segment.startY);
  }

  function getRailLength(state, fallbackSegment) {
    const fallbackLength = getRailSegmentLength(fallbackSegment || getDefaultRailSegment(state, 0));
    const length = Number(state.railLength);
    return clamp(Number.isFinite(length) && length > 0 ? length : fallbackLength, 40, 1100);
  }

  function resizeRailSegment(segment, length) {
    const currentLength = getRailSegmentLength(segment);
    const centerX = (segment.startX + segment.endX) / 2;
    const centerY = (segment.startY + segment.endY) / 2;
    const unitX = currentLength > 0.001 ? (segment.endX - segment.startX) / currentLength : 1;
    const unitY = currentLength > 0.001 ? (segment.endY - segment.startY) / currentLength : 0;
    const halfLength = length / 2;

    return {
      startX: clamp(centerX - unitX * halfLength, 0, STAGE_WIDTH),
      startY: clamp(centerY - unitY * halfLength, 0, STAGE_HEIGHT),
      endX: clamp(centerX + unitX * halfLength, 0, STAGE_WIDTH),
      endY: clamp(centerY + unitY * halfLength, 0, STAGE_HEIGHT)
    };
  }

  function updateRailLengthFromSegment(segment) {
    if (!controls.railLength) {
      return;
    }
    const min = Number(controls.railLength.min) || 40;
    const max = Number(controls.railLength.max) || 1100;
    controls.railLength.value = Math.round(clamp(getRailSegmentLength(segment), min, max) / 5) * 5;
  }

  function getRailSegments(state) {
    const count = getRailCount(state);
    if (!count) {
      return [];
    }

    const firstFallback = getDefaultRailSegment(state, 0);
    const railLength = getRailLength(state, firstFallback);
    const segments = [
      resizeRailSegment(
        normalizeRailSegment(
          {
            startX: state.railStartX,
            startY: state.railStartY,
            endX: state.railEndX,
            endY: state.railEndY
          },
          firstFallback
        ),
        railLength
      )
    ];
    const storedSegments = Array.isArray(state.railSegments) ? state.railSegments : [];
    for (let railIndex = 1; railIndex < count; railIndex += 1) {
      segments.push(resizeRailSegment(normalizeRailSegment(storedSegments[railIndex - 1], getDefaultRailSegment(state, railIndex)), railLength));
    }
    return segments;
  }

  function writeRailSegment(railIndex, segment) {
    const normalizedSegment = normalizeRailSegment(segment, getDefaultRailSegment(cloneState(), railIndex));
    if (railIndex === 0) {
      writeCoordinateControl("railStartX", "railStartY", normalizedSegment.startX, normalizedSegment.startY);
      writeCoordinateControl("railEndX", "railEndY", normalizedSegment.endX, normalizedSegment.endY);
      return;
    }

    const state = cloneState();
    const count = getRailCount(state);
    const segments = [...state.railSegments].slice(0, Math.max(0, count - 1));
    while (segments.length < railIndex) {
      segments.push(getDefaultRailSegment(state, segments.length + 1));
    }
    segments[railIndex - 1] = normalizedSegment;
    controls.railSegments.value = serializeRailSegments(segments);
  }

  function syncRailSegments() {
    const state = cloneState();
    const count = getRailCount(state);
    if (!count) {
      return;
    }

    const segments = getRailSegments(state).slice(1);
    controls.railSegments.value = serializeRailSegments(segments);
  }

  function initializeRailEndpoints(force = false) {
    const hasStart = controls.railStartX.value !== "" && Number.isFinite(Number(controls.railStartX.value));
    const hasEnd = controls.railEndX.value !== "" && Number.isFinite(Number(controls.railEndX.value));
    if (!force && hasStart && hasEnd) {
      return;
    }

    const defaultSegment = getDefaultRailSegment();
    updateRailLengthFromSegment(defaultSegment);
    writeRailSegment(0, defaultSegment);
  }

  function getPreset(presetKey) {
    return presets[presetKey] || presets.canonical;
  }

  function isCustomPresetKey(presetKey) {
    return customPresetKeys.includes(presetKey);
  }

  function isSharedPresetKey(presetKey) {
    return sharedPresetKeys.includes(presetKey);
  }

  function isPrimaryPresetKey(presetKey) {
    return primaryPresetKeys.includes(presetKey);
  }

  function getVisiblePrimaryPresetKeys() {
    return primaryPresetKeys.filter((key) => presets[key] && !hiddenBuiltInPresetKeys.includes(key));
  }

  function syncPresetActions() {
    deletePresetButton.disabled = !selectedPresetKey || isSharedPresetKey(selectedPresetKey);
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
    if (visiblePrimaryKeys.length === 0 && sharedPresetKeys.length === 0 && customPresetKeys.length === 0) {
      hiddenBuiltInPresetKeys = [];
      writeHiddenBuiltInPresets();
      visiblePrimaryKeys = getVisiblePrimaryPresetKeys();
    }

    if (visiblePrimaryKeys.length > 0) {
      const standardGroup = document.createElement("optgroup");
      standardGroup.label = "Standard";
      visiblePrimaryKeys.forEach((key) => {
        const preset = presets[key];
        standardGroup.appendChild(makePresetOption(key, preset));
      });
      presetSelect.appendChild(standardGroup);
    }

    if (sharedPresetKeys.length > 0) {
      const sharedGroup = document.createElement("optgroup");
      sharedGroup.label = "Shared across visitors";
      sharedPresetKeys.forEach((key) => {
        const preset = getPreset(key);
        if (preset) {
          sharedGroup.appendChild(makePresetOption(key, preset));
        }
      });
      presetSelect.appendChild(sharedGroup);
    }

    if (customPresetKeys.length > 0) {
      const savedGroup = document.createElement("optgroup");
      savedGroup.label = "Saved in this browser";
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

  function getUniquePresetKey(baseKey, existingKeys = []) {
    let key = baseKey;
    let suffix = 2;
    while (presets[key] || existingKeys.includes(key)) {
      key = `${baseKey}-${suffix}`;
      suffix += 1;
    }
    return key;
  }

  function normalizeSharedPreset(rawPreset) {
    if (!rawPreset || !rawPreset.label || !rawPreset.values) {
      return null;
    }
    const rawKey = sanitizeLabel(rawPreset.key || rawPreset.label);
    const baseKey = rawKey.startsWith("shared-") ? rawKey : `shared-${rawKey}`;
    const key = getUniquePresetKey(baseKey, sharedPresetKeys);
    return {
      key,
      label: rawPreset.label,
      summary: rawPreset.summary || "Shared preset loaded with the web app.",
      note: rawPreset.note || "Loaded from shared-presets.json for every visitor.",
      literature: rawPreset.literature || "Shared lab preset.",
      values: rawPreset.values
    };
  }

  async function loadSharedPresets() {
    try {
      const response = await fetch(SHARED_PRESETS_URL, { cache: "no-store" });
      if (!response.ok) {
        return;
      }
      const payload = await response.json();
      const sharedPresets = Array.isArray(payload) ? payload : Array.isArray(payload.presets) ? payload.presets : [];
      sharedPresets.forEach((rawPreset) => {
        const preset = normalizeSharedPreset(rawPreset);
        if (!preset) {
          return;
        }
        presets[preset.key] = preset;
        sharedPresetKeys.push(preset.key);
      });
    } catch (error) {
      // The app still works without the shared file, e.g. when opened directly from disk.
    }
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
      note: "Saved in this browser. Export preset JSON to add it to shared-presets.json.",
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
    if (presetSummary) {
      presetSummary.textContent = preset.summary;
    }
    if (presetNote) {
      presetNote.textContent = preset.note;
    }
    if (literatureBlurb) {
      literatureBlurb.textContent = preset.literature;
    }
    if (scenarioBadge) {
      scenarioBadge.textContent = preset.label;
    }
    statusText.textContent = "Local preset saved.";
    syncPresetActions();
  }

  function buildPresetExportRecord() {
    const state = cloneState();
    const label = (presetNameInput.value || state.fileLabel || getConditionName() || "Custom preset").trim();
    return {
      key: sanitizeLabel(label),
      label,
      summary: "Shared preset.",
      note: "Add this object to shared-presets.json to make it visible for every visitor.",
      literature: "Shared lab preset exported from the current controls.",
      values: state
    };
  }

  function exportCurrentPresetJson() {
    if (!presetJsonLink) {
      return;
    }
    const preset = buildPresetExportRecord();
    const payload = `${JSON.stringify(preset, null, 2)}\n`;
    const blob = new Blob([payload], { type: "application/json" });
    if (currentPresetJsonUrl) {
      URL.revokeObjectURL(currentPresetJsonUrl);
    }
    const objectUrl = URL.createObjectURL(blob);
    currentPresetJsonUrl = objectUrl;
    presetJsonLink.href = objectUrl;
    presetJsonLink.download = `${sanitizeLabel(preset.label)}-shared-preset.json`;
    presetJsonLink.textContent = "Download preset JSON";
    presetJsonLink.classList.remove("hidden");
    statusText.textContent = "Preset JSON ready.";
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
      statusText.textContent = isSharedPresetKey(selectedPresetKey) ? "Shared presets live in shared-presets.json." : "Preset unavailable.";
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
    const normalizedValues = { ...values };
    if (normalizedValues.contextMode === "pass") {
      normalizedValues.contextMode = "launch";
      normalizedValues.contextLauncherBehavior = "continue";
    }

    Object.entries(normalizedValues).forEach(([key, value]) => {
      const control = controls[key];
      if (!control) {
        return;
      }
      const normalizedValue =
        key === "contactOcclusionMode" || key === "contextContactOcclusionMode"
          ? normalizeOcclusionMode(value)
          : key === "contextPairSnapshots" && Array.isArray(value)
            ? serializeContextPairSnapshots(value)
            : key === "railSegments" && Array.isArray(value)
              ? serializeRailSegments(value)
              : key === "trajectoryOverrides" && value && typeof value === "object"
                ? serializeTrajectoryOverrides(value)
                : value;
      if (control.type === "checkbox") {
        control.checked = Boolean(normalizedValue);
      } else {
        control.value = normalizedValue;
      }
    });
    syncAllChoiceControlButtons();
    customStartPositionsInitialized = Boolean(controls.customStartEnabled.checked);
    syncContextControlVisibility();
    syncContextPairSnapshots();
    renderContextPairEditors();
    lastContextPairCount = Math.max(1, getContextPairCount(cloneState()) || 1);
    syncStartDragUi();
    syncCrosshairControlVisibility();
    syncRailControlVisibility();
    syncTrajectoryControlVisibility();
    syncRailSegments();
    syncSpecialDragUi();
    enforceCustomStartConstraints();
    updateOutputs();
    refreshText();
    drawFrame(cloneState(), 0, ctx);
  }

  function withContextMotionDefaults(values) {
    return {
      ...values,
      contextLeadInMs: values.contextLeadInMs ?? values.leadInMs ?? stimulusDefaults.contextLeadInMs,
      contextBallRadius: values.contextBallRadius ?? values.ballRadius ?? stimulusDefaults.contextBallRadius,
      contextLauncherSpeed: values.contextLauncherSpeed ?? values.launcherSpeed ?? stimulusDefaults.contextLauncherSpeed,
      contextLauncherAccel: values.contextLauncherAccel ?? values.launcherAccel ?? stimulusDefaults.contextLauncherAccel,
      contextLauncherBehavior: values.contextLauncherBehavior ?? stimulusDefaults.contextLauncherBehavior,
      contextDelayMs: values.contextDelayMs ?? stimulusDefaults.contextDelayMs,
      contextGapPx: values.contextGapPx ?? stimulusDefaults.contextGapPx,
      contextContactOcclusionMode:
        values.contextContactOcclusionMode ?? values.contactOcclusionMode ?? stimulusDefaults.contextContactOcclusionMode,
      contextOccluderEnabled: values.contextOccluderEnabled ?? stimulusDefaults.contextOccluderEnabled,
      contextOccluderWidth: values.contextOccluderWidth ?? values.occluderWidth ?? stimulusDefaults.contextOccluderWidth,
      contextTargetSpeedRatio: values.contextTargetSpeedRatio ?? values.targetSpeedRatio ?? stimulusDefaults.contextTargetSpeedRatio,
      contextTargetAccel: values.contextTargetAccel ?? values.targetAccel ?? stimulusDefaults.contextTargetAccel,
      contextTargetAngle: values.contextTargetAngle ?? values.targetAngle ?? stimulusDefaults.contextTargetAngle,
      contextLauncherVisibleMs:
        values.contextLauncherVisibleMs ?? values.launcherVisibleMs ?? stimulusDefaults.contextLauncherVisibleMs,
      contextTargetVisibleMs: values.contextTargetVisibleMs ?? values.targetVisibleMs ?? stimulusDefaults.contextTargetVisibleMs
    };
  }

  function applyPreset(presetKey) {
    const preset = getPreset(presetKey);
    activePresetKey = presetKey;
    selectedPresetKey = presetKey;
    presetSelect.value = presetKey;
    presetNameInput.value = isCustomPresetKey(presetKey) ? preset.label : "";
    syncPresetActions();
    const nextValues = { ...stimulusDefaults, ...presentationDefaults, ...withContextMotionDefaults(preset.values) };
    if (!Object.prototype.hasOwnProperty.call(preset.values, "stageColor")) {
      nextValues.stageColor = BACKGROUND_THEME_COLORS[nextValues.stageTheme] || CLASSIC_BACKGROUND_COLOR;
    }
    setControls(nextValues);
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
        state.contextMode === "launch" ? "launch context" : state.contextMode === "single" ? "single context" : "context";
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
      if (getContextPairCount(state) > 1) {
        capture += `, ${getContextPairCount(state)} pairs`;
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
    const contextBallRadius = Number.isFinite(state.contextBallRadius) ? state.contextBallRadius : state.ballRadius;
    const contextBallDiameterDva = (contextBallRadius * 2) / pxPerDva;
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
      contextBallDiameterDva: Number(contextBallDiameterDva.toFixed(2)),
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

  function updateStandards(state, standards = getStandards(state)) {
    if (!relationMetric || !categoryMetric || !captureMetric || !timingMetric) {
      return;
    }

    relationMetric.textContent = standards.relation;
    categoryMetric.textContent = standards.category;
    captureMetric.textContent = standards.capture;
    timingMetric.textContent = standards.timing;
  }

  function describeContext(state) {
    if (state.contextMode === "none") {
      return "none";
    }
    const labels = {
      launch: "nearby launch",
      single: "single object",
      pass: "continuous context"
    };
    const timing =
      state.contextOffsetMs === 0
        ? "sync"
        : `${Math.abs(state.contextOffsetMs)} ms ${state.contextOffsetMs < 0 ? "early" : "late"}`;
    const pairCount = getContextPairCount(state);
    const pairText = pairCount > 1 ? `, ${pairCount} pairs` : "";
    return `${labels[state.contextMode] || state.contextMode}, ${timing}${pairText}`;
  }

  function describeOutputFormat(value) {
    const labels = {
      lab: "MP4 preferred",
      mp4: "MP4",
      "webm-vp9": "WebM VP9",
      "webm-vp8": "WebM VP8",
      webm: "WebM"
    };
    return labels[value] || value;
  }

  function describeLauncherBehavior(value) {
    const labels = {
      stop: "stops",
      continue: "passes",
      entrain: "entrains"
    };
    return labels[value] || value;
  }

  function describeRenderMode(value) {
    const labels = {
      stimulus: "clean",
      clean: "clean",
      fixation: "fixation",
      lab: "lab"
    };
    return labels[value] || value;
  }

  function describeObjectStyle(value) {
    const labels = {
      flat: "simple filled discs",
      outline: "outline discs",
      ring: "ring discs",
      shaded: "3D shaded"
    };
    return labels[value] || value;
  }

  function describeStageTheme(state) {
    const labels = {
      dark: "dark",
      midgray: "mid-gray",
      light: "light"
    };
    const themeLabel = labels[state.stageTheme] || state.stageTheme;
    return `${themeLabel}, ${state.stageColor}`;
  }

  function describeSignedMs(value) {
    const rounded = Math.round(Number(value) || 0);
    if (rounded === 0) {
      return "0 ms";
    }
    return `${Math.abs(rounded)} ms ${rounded < 0 ? "early" : "late"}`;
  }

  function describeSound(state) {
    if (!state.soundEnabled || state.soundVolume <= 0) {
      return "off";
    }
    return `${state.soundType}, ${Math.round(state.soundVolume * 100)}%`;
  }

  function describeSummaryRelation(state, standards) {
    if (state.gapPx > 0) {
      return `gap ${Math.round(state.gapPx)} px`;
    }
    if (state.gapPx < 0) {
      return `${standards.overlapPercent}% overlap`;
    }
    return "contact";
  }

  function getExperimentWarnings(state) {
    const warnings = [];
    if (state.renderMode === "lab") {
      warnings.push("Lab preview exports labels. Use Clean stimulus or Fixation for participant movies.");
    }
    if (state.contactGuideMode !== "none") {
      warnings.push("Contact guide is visible in export. Turn off unless it is a condition.");
    }
    if (state.groupingMode !== "none") {
      warnings.push("Grouping boxes are visible to participants. Keep only if grouping is tested.");
    }
    if (state.markerMode !== "none" && state.gapPx > 0) {
      warnings.push("Marker is on: the exported video will show a visible gap cue. Set Marker to None unless this cue is part of the condition.");
    }
    if (state.soundEnabled) {
      warnings.push("Audio export depends on browser encoding. Check the saved movie in PsychoPy.");
    }
    if (getPreBallBlinkMs(state) >= state.durationMs) {
      warnings.push("Blink time is at least as long as the video. Increase Video duration if the balls should appear.");
    }
    return warnings;
  }

  function renderExperimentWarnings(state) {
    if (!validationList) {
      return;
    }
    const warnings = getExperimentWarnings(state);
    validationList.replaceChildren();
    validationList.classList.toggle("hidden", warnings.length === 0);
    warnings.forEach((warning) => {
      const item = document.createElement("li");
      item.textContent = warning;
      validationList.appendChild(item);
    });
  }

  function refreshSummary(state, copy, standards) {
    const relationText = describeSummaryRelation(state, standards);
    const contextText = describeContext(state);
    const contextPairCount = getContextPairCount(state);
    const contextIsOff = state.contextMode === "none";
    if (summaryCompact) {
      summaryCompact.textContent = `${copy.label}, ${relationText}, ${Math.round(state.durationMs)} ms`;
    }
    if (summaryPreset) {
      summaryPreset.textContent = copy.label;
    }
    if (summaryCategory) {
      summaryCategory.textContent = standards.category;
    }
    if (summaryDuration) {
      summaryDuration.textContent = `${Math.round(state.durationMs)} ms`;
    }
    if (summaryFps) {
      summaryFps.textContent = `${Math.round(state.fps)}`;
    }
    if (summaryLeadIn) {
      summaryLeadIn.textContent = `${Math.round(state.leadInMs)} ms`;
    }
    if (summaryImpact) {
      summaryImpact.textContent = `${standards.impactMs} ms`;
    }
    if (summaryTargetOnset) {
      summaryTargetOnset.textContent = `${standards.targetOnsetMs} ms`;
    }
    if (summaryDelay) {
      summaryDelay.textContent = `${Math.round(state.delayMs)} ms`;
    }
    if (summaryRelation) {
      summaryRelation.textContent = standards.relation;
    }
    if (summaryOverlap) {
      summaryOverlap.textContent =
        state.gapPx > 0
          ? `${Math.round(state.gapPx)} px gap, ${standards.gapDva} deg`
          : `${standards.overlapPercent}% overlap`;
    }
    if (summarySpeed) {
      summarySpeed.textContent = `${Math.round(state.launcherSpeed)} px/s`;
    }
    if (summaryTargetRatio) {
      summaryTargetRatio.textContent = `${Number(state.targetSpeedRatio).toFixed(3)} x`;
    }
    if (summaryLauncherAccel) {
      summaryLauncherAccel.textContent = `${Math.round(state.launcherAccel)} px/s^2`;
    }
    if (summaryTargetAccel) {
      summaryTargetAccel.textContent = `${Math.round(state.targetAccel)} px/s^2`;
    }
    if (summaryTargetAngle) {
      summaryTargetAngle.textContent = `${Math.round(state.targetAngle)} deg`;
    }
    if (summaryRadius) {
      summaryRadius.textContent =
        state.contextMode === "none"
          ? `${Math.round(state.ballRadius)} px`
          : `main ${Math.round(state.ballRadius)} px / context ${Math.round(state.contextBallRadius)} px`;
    }
    if (summaryAfter) {
      summaryAfter.textContent = describeLauncherBehavior(state.launcherBehavior);
    }
    if (summaryLauncherVisible) {
      summaryLauncherVisible.textContent = formatValue("visibilityMs", state.launcherVisibleMs);
    }
    if (summaryTargetVisible) {
      summaryTargetVisible.textContent = formatValue("visibilityMs", state.targetVisibleMs);
    }
    if (summaryContext) {
      summaryContext.textContent = contextText;
    }
    if (summaryContextWindow) {
      summaryContextWindow.textContent = contextIsOff ? "off" : `${Math.round(state.contextDurationMs)} ms`;
    }
    if (summaryContextOffset) {
      summaryContextOffset.textContent = contextIsOff ? "off" : describeSignedMs(state.contextOffsetMs);
    }
    if (summaryContextDirection) {
      summaryContextDirection.textContent = contextIsOff ? "off" : state.contextDirection;
    }
    if (summaryContextPairs) {
      summaryContextPairs.textContent = String(contextPairCount);
    }
    if (summaryMode) {
      summaryMode.textContent = describeRenderMode(state.renderMode);
    }
    if (summaryBackground) {
      summaryBackground.textContent = describeStageTheme(state);
    }
    if (summaryStyle) {
      summaryStyle.textContent = describeObjectStyle(state.objectStyle);
    }
    if (summarySound) {
      summarySound.textContent = describeSound(state);
    }
    if (summaryFormat) {
      summaryFormat.textContent = describeOutputFormat(state.outputFormat);
    }
    if (summaryAspect) {
      summaryAspect.textContent = state.aspectRatio;
    }
    if (summaryBitrate) {
      summaryBitrate.textContent = `${Number(state.videoBitrate).toFixed(1)} Mbps`;
    }
  }

  function refreshText() {
    const state = cloneState();
    const copy = activePresetKey ? getPreset(activePresetKey) : getDynamicCopy(state);
    const queuedPreset = getPreset(selectedPresetKey);
    if (presetSummary) {
      presetSummary.textContent = queuedPreset.summary;
    }
    if (presetNote) {
      presetNote.textContent = copy.note;
    }
    if (literatureBlurb) {
      literatureBlurb.textContent = copy.literature;
    }
    if (scenarioBadge) {
      scenarioBadge.textContent = copy.label;
    }
    if (stageOverlay) {
      stageOverlay.classList.toggle("hidden", state.renderMode !== "lab");
    }

    const standards = getStandards(state);
    const spatialTag =
      state.gapPx > 6
        ? `gap ${Math.round(state.gapPx)} px`
        : state.gapPx < -6
          ? `${standards.overlapPercent}% overlap`
          : "contact";
    const occlusionTag = state.occluderEnabled ? " + tunnel occluder" : "";
    if (timingBadge) {
      timingBadge.textContent = `${spatialTag} + ${Math.round(state.delayMs)} ms delay${occlusionTag}`;
    }
    refreshSummary(state, copy, standards);
    renderExperimentWarnings(state);
    updateStandards(state, standards);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function isObjectVisibleAt(localTimeMs, visibleMs) {
    const limit = Number(visibleMs);
    return !Number.isFinite(limit) || localTimeMs <= limit;
  }

  function normalizeHexColor(value, fallback) {
    return /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
  }

  function shadeHexColor(hex, amount) {
    const safeHex = normalizeHexColor(hex, "#3f746f").slice(1);
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

  function hexToRgba(hex, alpha, fallback = "#e0b24a") {
    const safeHex = normalizeHexColor(hex, fallback).slice(1);
    const r = parseInt(safeHex.slice(0, 2), 16);
    const g = parseInt(safeHex.slice(2, 4), 16);
    const b = parseInt(safeHex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`;
  }

  function getObjectPalette(color, fallback = "#3f746f") {
    const fill = normalizeHexColor(color, fallback);
    return {
      fill,
      outline: shadeHexColor(fill, -0.48)
    };
  }

  function getPalette(state) {
    const launcher = normalizeHexColor(state.launcherColor, CLASSIC_DISC_COLOR);
    const target = normalizeHexColor(state.targetColor, CLASSIC_DISC_COLOR);
    const context = normalizeHexColor(state.contextColor, CLASSIC_DISC_COLOR);
    const contextTarget = normalizeHexColor(state.contextTargetColor, CLASSIC_DISC_COLOR);
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
      },
      contextTarget: {
        fill: contextTarget,
        outline: shadeHexColor(contextTarget, -0.46)
      }
    };
  }

  function getPaletteAtTime(state, eventState) {
    const palette = getPalette(state);
    if (state.colorChangeMode === "none" || eventState.time < eventState.geometry.targetStartTime) {
      return palette;
    }

    const changed = normalizeHexColor(state.colorChangeColor, "#e0b24a");
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

    if (state.objectStyle === "outline") {
      drawCtx.beginPath();
      drawCtx.arc(x, y, radius, 0, Math.PI * 2);
      drawCtx.fillStyle = "rgba(0, 0, 0, 0)";
      drawCtx.fill();
      drawCtx.lineWidth = Math.max(2, radius * 0.08);
      drawCtx.strokeStyle = fill;
      drawCtx.stroke();
      return;
    }

    if (state.objectStyle === "ring") {
      drawCtx.beginPath();
      drawCtx.arc(x, y, radius, 0, Math.PI * 2);
      drawCtx.fillStyle = fill;
      drawCtx.fill();
      drawCtx.lineWidth = Math.max(2.5, radius * 0.12);
      drawCtx.strokeStyle = outline;
      drawCtx.stroke();
      drawCtx.beginPath();
      drawCtx.arc(x, y, radius * 0.56, 0, Math.PI * 2);
      drawCtx.fillStyle = getStageThemeColors(state)[0];
      drawCtx.fill();
      drawCtx.lineWidth = Math.max(1.5, radius * 0.06);
      drawCtx.strokeStyle = outline;
      drawCtx.stroke();
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

  function getStageThemeColors(state) {
    const background = normalizeHexColor(state.stageColor, BACKGROUND_THEME_COLORS[state.stageTheme] || CLASSIC_BACKGROUND_COLOR);
    const themes = {
      dark: [background, "rgba(196, 95, 69, 0.11)", "rgba(255, 248, 234, 0.16)"],
      midgray: [background, "rgba(255, 248, 234, 0.11)", "rgba(255, 248, 234, 0.19)"],
      light: [background, "rgba(196, 95, 69, 0.07)", "rgba(39, 34, 28, 0.15)"]
    };
    return themes[state.stageTheme] || themes.dark;
  }

  function drawStageBackground(drawCtx, state) {
    const theme = getStageThemeColors(state);
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

    const { radius, launcherStopX, launcherStopY, targetBaseX, targetBaseY, approachUnitX, approachUnitY } = eventState.geometry;
    const stopEdge = {
      x: launcherStopX + approachUnitX * radius,
      y: launcherStopY + approachUnitY * radius
    };
    const startEdge = {
      x: targetBaseX - approachUnitX * radius,
      y: targetBaseY - approachUnitY * radius
    };
    const perpendicular = {
      x: -approachUnitY,
      y: approachUnitX
    };
    const markerHalfLength = radius * 1.7;

    drawCtx.save();
    drawCtx.strokeStyle = "rgba(245, 224, 137, 0.92)";
    drawCtx.fillStyle = "rgba(245, 224, 137, 0.2)";
    drawCtx.lineWidth = 3;

    if (state.markerMode === "bridge") {
      drawCtx.beginPath();
      drawCtx.moveTo(stopEdge.x, stopEdge.y);
      drawCtx.lineTo(startEdge.x, startEdge.y);
      drawCtx.stroke();
    }

    if (state.markerMode === "stop" || state.markerMode === "both") {
      drawCtx.setLineDash([8, 6]);
      drawCtx.beginPath();
      drawCtx.moveTo(stopEdge.x - perpendicular.x * markerHalfLength, stopEdge.y - perpendicular.y * markerHalfLength);
      drawCtx.lineTo(stopEdge.x + perpendicular.x * markerHalfLength, stopEdge.y + perpendicular.y * markerHalfLength);
      drawCtx.stroke();
    }

    if (state.markerMode === "start" || state.markerMode === "both") {
      drawCtx.setLineDash([8, 6]);
      drawCtx.beginPath();
      drawCtx.moveTo(startEdge.x - perpendicular.x * markerHalfLength, startEdge.y - perpendicular.y * markerHalfLength);
      drawCtx.lineTo(startEdge.x + perpendicular.x * markerHalfLength, startEdge.y + perpendicular.y * markerHalfLength);
      drawCtx.stroke();
    }

    drawCtx.restore();
  }

  function isContextEventVisible(state, time, mainGeometry) {
    if (state.contextMode === "none") {
      return false;
    }

    const adjustedTime = time - state.contextOffsetMs;
    const contextWindowMs = Number(state.contextDurationMs) || 750;
    const contextGeometry = getGeometry(getContextMotionState(state), getContextLaneY(state, mainGeometry.laneY, 0), {
      scope: "context",
      directionSign: mainGeometry.contextDirectionSign
    });
    return contextWindowMs >= 740 || Math.abs(adjustedTime - contextGeometry.stopTime) <= contextWindowMs / 2;
  }

  function drawGroupingBoxes(drawCtx, state, eventState) {
    if (state.groupingMode === "none") {
      return;
    }

    const contextVisible = isContextEventVisible(state, eventState.time, eventState.geometry);
    const contextGeometries = [];
    if (contextVisible) {
      const pairCount = getContextPairCount(state);
      const contextState = getContextMotionState(state);
      const snapshots = state.contextPairSnapshots || [];
      for (let pairIndex = 0; pairIndex < pairCount; pairIndex += 1) {
        const snapshot = pairIndex > 0 ? snapshots[pairIndex - 1] || makeContextPairSnapshotFromOriginal(state, pairIndex) : null;
        const laneY = getContextLaneY(state, eventState.geometry.laneY, pairIndex, snapshot);
        if (pairIndex === 0) {
          contextGeometries.push(
            getGeometry(contextState, laneY, {
              scope: "context",
              directionSign: eventState.geometry.contextDirectionSign,
              trajectoryScope: "context"
            })
          );
        } else {
          const snapshotState = getContextPairSnapshotState(snapshot, state, laneY);
          contextGeometries.push(
            getGeometry(snapshotState, laneY, {
              scope: "original",
              directionSign: eventState.geometry.contextDirectionSign,
              trajectoryScope: `context${pairIndex + 1}`
            })
          );
        }
      }
    }

    const getBoxBounds = (geometries) => {
      const left = Math.max(
        20,
        Math.min(...geometries.map((geometry) => Math.min(geometry.launcherStartX, geometry.targetBaseX, geometry.launcherStopX) - geometry.radius * 1.8))
      );
      const right = Math.min(
        STAGE_WIDTH - 20,
        Math.max(...geometries.map((geometry) => Math.max(geometry.launcherStartX, geometry.targetBaseX, geometry.launcherStopX) + geometry.radius * 7.2))
      );
      const top = Math.max(
        20,
        Math.min(...geometries.map((geometry) => Math.min(geometry.launcherStartY, geometry.targetBaseY, geometry.launcherStopY) - geometry.radius * 2.3))
      );
      const bottom = Math.min(
        STAGE_HEIGHT - 20,
        Math.max(...geometries.map((geometry) => Math.max(geometry.launcherStartY, geometry.targetBaseY, geometry.launcherStopY) + geometry.radius * 2.3))
      );
      return { left, right, top, bottom };
    };

    const drawBox = (label, geometries, color, fallback) => {
      const safeGeometries = Array.isArray(geometries) ? geometries.filter(Boolean) : [geometries].filter(Boolean);
      if (safeGeometries.length === 0) {
        return;
      }
      const { left, right, top, bottom } = getBoxBounds(safeGeometries);
      const height = Math.max(12, bottom - top);
      const strokeColor = hexToRgba(color, state.stageTheme === "light" ? 0.86 : 0.9, fallback);
      const fillColor = hexToRgba(color, state.stageTheme === "light" ? 0.07 : 0.045, fallback);

      drawCtx.save();
      drawCtx.strokeStyle = strokeColor;
      drawCtx.fillStyle = fillColor;
      drawCtx.lineWidth = 2.5;
      drawCtx.setLineDash([]);
      drawCtx.beginPath();
      drawCtx.roundRect(left, top, right - left, height, 16);
      drawCtx.fill();
      drawCtx.stroke();
      if (state.renderMode === "lab") {
        drawCtx.setLineDash([]);
        drawCtx.font = '700 12px "Avenir Next", "Segoe UI", sans-serif';
        drawCtx.fillStyle = strokeColor;
        drawCtx.fillText(label, left + 12, top + 18);
      }
      drawCtx.restore();
    };

    const drawOriginal = ["original", "both", "each", "original-contexts"].includes(state.groupingMode);
    if (drawOriginal) {
      drawBox("Original pair", eventState.geometry, state.groupingOriginalColor, "#e0b24a");
    }

    if (!contextVisible || contextGeometries.length === 0) {
      return;
    }

    if (state.groupingMode === "each") {
      contextGeometries.forEach((geometry, index) => {
        drawBox(`Context ${index + 1}`, geometry, state.groupingContextColor, "#80a7a1");
      });
      return;
    }

    if (["context", "both", "original-contexts"].includes(state.groupingMode)) {
      const grouped = state.groupingMode === "both" ? contextGeometries.slice(0, 1) : contextGeometries;
      drawBox("Context set", grouped, state.groupingContextColor, "#80a7a1");
    }
  }

  function drawContactGuides(drawCtx, state, eventState) {
    if (state.contactGuideMode === "none") {
      return;
    }

    const contextVisible = isContextEventVisible(state, eventState.time, eventState.geometry);
    const lanes = [];
    if (state.contactGuideMode === "original" || state.contactGuideMode === "both") {
      lanes.push({
        laneY: eventState.geometry.targetBaseY,
        x: eventState.geometry.targetBaseX,
        radius: eventState.geometry.radius,
        color: state.groupingOriginalColor,
        fallback: "#c45f45"
      });
    }
    if (contextVisible && (state.contactGuideMode === "context" || state.contactGuideMode === "both")) {
      const contextState = getContextMotionState(state);
      const contextGeometry = getGeometry(contextState, getContextLaneY(state, eventState.geometry.laneY, 0), {
        scope: "context",
        directionSign: eventState.geometry.contextDirectionSign
      });
      lanes.push({
        laneY: contextGeometry.targetBaseY,
        x: contextGeometry.targetBaseX,
        radius: contextGeometry.radius,
        color: state.groupingContextColor,
        fallback: "#3f746f"
      });
    }

    drawCtx.save();
    drawCtx.lineWidth = 1.6;
    drawCtx.setLineDash([]);
    lanes.forEach((lane) => {
      drawCtx.strokeStyle = hexToRgba(lane.color, state.stageTheme === "light" ? 0.62 : 0.72, lane.fallback);
      drawCtx.beginPath();
      drawCtx.moveTo(lane.x, lane.laneY - lane.radius * 2.9);
      drawCtx.lineTo(lane.x, lane.laneY + lane.radius * 2.9);
      drawCtx.stroke();
    });
    drawCtx.restore();
  }

  function rotateVector(x, y, radians) {
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    return {
      x: x * cos - y * sin,
      y: x * sin + y * cos
    };
  }

  function readCoordinate(value, fallback, min, max) {
    const number = Number(value);
    return Number.isFinite(number) ? clamp(number, min, max) : fallback;
  }

  function getStartPoint(state, scope, role, fallbackX, fallbackY) {
    const prefix = `${scope}${role}`;
    const radius = state.ballRadius;
    return {
      x: readCoordinate(state[`${prefix}StartX`], fallbackX, radius, STAGE_WIDTH - radius),
      y: readCoordinate(state[`${prefix}StartY`], fallbackY, radius, STAGE_HEIGHT - radius)
    };
  }

  function getGeometry(state, laneY, options = {}) {
    const radius = state.ballRadius;
    const scope = options.scope || "original";
    const trajectoryScope = options.trajectoryScope || scope;
    const directionSign = options.directionSign || 1;
    const defaultTargetX = (state.occluderEnabled ? STAGE_WIDTH * 0.62 : STAGE_WIDTH * 0.58) + state.stimulusXOffset;
    const orientedTargetX = directionSign === 1 ? defaultTargetX : STAGE_WIDTH - defaultTargetX;
    const orientedLauncherX = directionSign === 1 ? 92 + state.stimulusXOffset : STAGE_WIDTH - (92 + state.stimulusXOffset);
    const usesCustomStarts = Boolean(state.customStartEnabled);
    let launcherStart = usesCustomStarts
      ? getStartPoint(state, scope, "Launcher", orientedLauncherX, laneY)
      : { x: orientedLauncherX, y: laneY };
    const targetBase = usesCustomStarts
      ? getStartPoint(state, scope, "Target", orientedTargetX, laneY)
      : { x: orientedTargetX, y: laneY };
    const approachDx = targetBase.x - launcherStart.x;
    const approachDy = targetBase.y - launcherStart.y;
    const approachLength = Math.hypot(approachDx, approachDy);
    const fallbackUnitX = directionSign;
    const fallbackUnitY = 0;
    let approachUnitX = approachLength > 0.001 ? approachDx / approachLength : fallbackUnitX;
    let approachUnitY = approachLength > 0.001 ? approachDy / approachLength : fallbackUnitY;
    const contactDistance = Math.max(0, radius * 2 + state.gapPx);
    let launcherStopX = targetBase.x - approachUnitX * contactDistance;
    let launcherStopY = targetBase.y - approachUnitY * contactDistance;
    let launcherDistance = Math.max(Math.hypot(launcherStopX - launcherStart.x, launcherStopY - launcherStart.y), 1);
    const launcherAngleOverride = getTrajectoryOverrideAngle(state, `${trajectoryScope}Launcher`);
    if (Number.isFinite(launcherAngleOverride)) {
      const rotatedApproach = rotateVector(approachUnitX, approachUnitY, (launcherAngleOverride * Math.PI) / 180);
      approachUnitX = rotatedApproach.x;
      approachUnitY = rotatedApproach.y;
      launcherStopX = targetBase.x - approachUnitX * contactDistance;
      launcherStopY = targetBase.y - approachUnitY * contactDistance;
      launcherStart = {
        x: launcherStopX - approachUnitX * launcherDistance,
        y: launcherStopY - approachUnitY * launcherDistance
      };
    }
    const travelMs = solveTravelMs(launcherDistance, state.launcherSpeed, state.launcherAccel);
    const stopTime = state.leadInMs + travelMs;
    const targetStartTime = stopTime + state.delayMs;
    const remainingMs = Math.max(state.durationMs - targetStartTime - 240, 80);
    const launcherImpactSpeed = velocityAt(travelMs, state.launcherSpeed, state.launcherAccel);
    const targetSpeed = launcherImpactSpeed * state.targetSpeedRatio;
    const targetAngleOverride = getTrajectoryOverrideAngle(state, `${trajectoryScope}Target`);
    const effectiveTargetAngle = Number.isFinite(targetAngleOverride) ? targetAngleOverride : state.targetAngle;
    const angleRad = (effectiveTargetAngle * Math.PI) / 180;
    const customTargetUnit = rotateVector(approachUnitX, approachUnitY, angleRad);
    const targetUnitX = usesCustomStarts ? customTargetUnit.x : directionSign * Math.cos(angleRad);
    const targetUnitY = usesCustomStarts ? customTargetUnit.y : Math.sin(angleRad);
    const targetDistance = displacementAt(remainingMs, targetSpeed, state.targetAccel);
    const contextDirectionSign = state.contextDirection === "same" ? 1 : -1;

    return {
      radius,
      laneY,
      launcherStartX: launcherStart.x,
      launcherStartY: launcherStart.y,
      targetBaseX: targetBase.x,
      targetBaseY: targetBase.y,
      launcherStopX,
      launcherStopY,
      launcherDistance,
      approachUnitX,
      approachUnitY,
      targetUnitX,
      targetUnitY,
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
    const geometry = getGeometry(state, laneY, { scope: "original", directionSign: 1 });
    const approachElapsed = clamp(t - state.leadInMs, 0, geometry.travelMs);
    const approachDistance = Math.min(
      geometry.launcherDistance,
      displacementAt(approachElapsed, state.launcherSpeed, state.launcherAccel)
    );
    let launcherX = geometry.launcherStartX + geometry.approachUnitX * approachDistance;
    let launcherY = geometry.launcherStartY + geometry.approachUnitY * approachDistance;

    let targetX = geometry.targetBaseX;
    let targetY = geometry.targetBaseY;
    if (state.launcherBehavior !== "continue" && t >= geometry.targetStartTime) {
      const targetElapsed = t - geometry.targetStartTime;
      const moveDistance = displacementAt(targetElapsed, geometry.targetSpeed, state.targetAccel);
      targetX += geometry.targetUnitX * moveDistance;
      targetY += geometry.targetUnitY * moveDistance;
    }

    if (state.launcherBehavior === "continue" && t >= geometry.stopTime) {
      const elapsed = t - geometry.stopTime;
      const moveDistance = displacementAt(elapsed, geometry.launcherImpactSpeed, state.launcherAccel);
      launcherX = geometry.launcherStopX + geometry.targetUnitX * moveDistance;
      launcherY = geometry.launcherStopY + geometry.targetUnitY * moveDistance;
    }

    if (state.launcherBehavior === "entrain" && t >= geometry.targetStartTime) {
      const separation = geometry.radius * 2;
      launcherX = targetX - geometry.targetUnitX * separation;
      launcherY = targetY - geometry.targetUnitY * separation;
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

  function getContextMotionState(state) {
    return {
      ...state,
      ballRadius: Number.isFinite(state.contextBallRadius) ? state.contextBallRadius : state.ballRadius,
      leadInMs: state.contextLeadInMs,
      launcherSpeed: state.contextLauncherSpeed,
      launcherAccel: state.contextLauncherAccel,
      launcherBehavior: state.contextLauncherBehavior,
      delayMs: state.contextDelayMs,
      gapPx: state.contextGapPx,
      occluderEnabled: state.contextOccluderEnabled,
      occluderWidth: state.contextOccluderWidth,
      targetSpeedRatio: state.contextTargetSpeedRatio,
      targetAccel: state.contextTargetAccel,
      targetAngle: state.contextTargetAngle,
      contactOcclusionMode: state.contextContactOcclusionMode,
      launcherVisibleMs: state.contextLauncherVisibleMs,
      targetVisibleMs: state.contextTargetVisibleMs
    };
  }

  function getDirectedEventState(eventState, t, laneY, directionSign, scope = "context", trajectoryScope = scope) {
    const geometry = getGeometry(eventState, laneY, { scope, directionSign, trajectoryScope });
    const approachElapsed = clamp(t - eventState.leadInMs, 0, geometry.travelMs);
    const approachDistance = Math.min(
      geometry.launcherDistance,
      displacementAt(approachElapsed, eventState.launcherSpeed, eventState.launcherAccel)
    );
    let launcherX = geometry.launcherStartX + geometry.approachUnitX * approachDistance;
    let launcherY = geometry.launcherStartY + geometry.approachUnitY * approachDistance;
    let targetX = geometry.targetBaseX;
    let targetY = geometry.targetBaseY;

    if (eventState.launcherBehavior !== "continue" && t >= geometry.targetStartTime) {
      const targetElapsed = t - geometry.targetStartTime;
      const moveDistance = displacementAt(targetElapsed, geometry.targetSpeed, eventState.targetAccel);
      targetX += geometry.targetUnitX * moveDistance;
      targetY += geometry.targetUnitY * moveDistance;
    }

    if (eventState.launcherBehavior === "continue" && t >= geometry.stopTime) {
      const elapsed = t - geometry.stopTime;
      const moveDistance = displacementAt(elapsed, geometry.launcherImpactSpeed, eventState.launcherAccel);
      launcherX = geometry.launcherStopX + geometry.targetUnitX * moveDistance;
      launcherY = geometry.launcherStopY + geometry.targetUnitY * moveDistance;
    }

    if (eventState.launcherBehavior === "entrain" && t >= geometry.targetStartTime) {
      const separation = geometry.radius * 2;
      launcherX = targetX - geometry.targetUnitX * separation;
      launcherY = targetY - geometry.targetUnitY * separation;
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

  function getDirectedSingleEventState(eventState, t, laneY, directionSign, scope = "context", trajectoryScope = scope) {
    const geometry = getGeometry(eventState, laneY, { scope, directionSign, trajectoryScope });
    const approachElapsed = clamp(t - eventState.leadInMs, 0, geometry.travelMs);
    const approachDistance = Math.min(
      geometry.launcherDistance,
      displacementAt(approachElapsed, eventState.launcherSpeed, eventState.launcherAccel)
    );
    let singleX = geometry.launcherStartX + geometry.approachUnitX * approachDistance;
    let singleY = geometry.launcherStartY + geometry.approachUnitY * approachDistance;

    if (t > geometry.stopTime) {
      const elapsed = t - geometry.stopTime;
      const moveDistance = displacementAt(elapsed, geometry.launcherImpactSpeed, eventState.launcherAccel);
      singleX = geometry.launcherStopX + geometry.targetUnitX * moveDistance;
      singleY = geometry.launcherStopY + geometry.targetUnitY * moveDistance;
    }

    return {
      geometry,
      time: t,
      singleX,
      singleY
    };
  }

  function getContextPairSnapshotState(snapshot, baseState, laneY) {
    const sourceLaneY = Number(snapshot.laneY) || getMainLaneY(baseState);
    const yShift = laneY - sourceLaneY;
    return {
      ...baseState,
      ballRadius: Number(snapshot.ballRadius) || baseState.ballRadius,
      leadInMs: Number(snapshot.leadInMs) || 0,
      launcherSpeed: Number(snapshot.launcherSpeed) || baseState.launcherSpeed,
      launcherAccel: Number(snapshot.launcherAccel) || 0,
      launcherBehavior: snapshot.launcherBehavior || baseState.launcherBehavior,
      delayMs: Number(snapshot.delayMs) || 0,
      gapPx: Number(snapshot.gapPx) || 0,
      contactOcclusionMode: normalizeOcclusionMode(snapshot.contactOcclusionMode),
      occluderEnabled: Boolean(snapshot.occluderEnabled),
      occluderWidth: Number(snapshot.occluderWidth) || baseState.occluderWidth,
      targetSpeedRatio: Number(snapshot.targetSpeedRatio) || baseState.targetSpeedRatio,
      targetAccel: Number(snapshot.targetAccel) || 0,
      targetAngle: Number(snapshot.targetAngle) || 0,
      launcherVisibleMs: Number(snapshot.launcherVisibleMs) || baseState.launcherVisibleMs,
      targetVisibleMs: Number(snapshot.targetVisibleMs) || baseState.targetVisibleMs,
      originalLauncherStartX: Number(snapshot.launcherStartX) || baseState.originalLauncherStartX,
      originalLauncherStartY: (Number(snapshot.launcherStartY) || baseState.originalLauncherStartY) + yShift,
      originalTargetStartX: Number(snapshot.targetStartX) || baseState.originalTargetStartX,
      originalTargetStartY: (Number(snapshot.targetStartY) || baseState.originalTargetStartY) + yShift,
      customStartEnabled: true
    };
  }

  function getTrajectoryOverrideAngle(state, id) {
    const overrides = parseTrajectoryOverrides(state.trajectoryOverrides);
    const angle = Number(overrides[id]);
    return Number.isFinite(angle) ? clamp(Math.round(angle), -90, 90) : null;
  }

  function getTrajectoryTargetLabel(id) {
    const fixedLabels = {
      originalLauncher: "Launcher approach",
      originalTarget: "Launchee after contact",
      contextLauncher: "Context 1 launcher approach",
      contextTarget: "Context 1 launchee after contact"
    };
    if (fixedLabels[id]) {
      return fixedLabels[id];
    }
    const match = /^context(\d+)(Launcher|Target)$/.exec(id || "");
    if (!match) {
      return "Select in preview";
    }
    const pairNumber = match[1];
    const role = match[2] === "Launcher" ? "launcher approach" : "launchee after contact";
    return `Context ${pairNumber} ${role}`;
  }

  function getTrajectoryDefaultAngle(state, id) {
    if (id === "originalTarget") {
      return Number(state.targetAngle) || 0;
    }
    if (id === "contextTarget") {
      return Number(state.contextTargetAngle) || 0;
    }
    const match = /^context(\d+)Target$/.exec(id || "");
    if (match) {
      const snapshot = state.contextPairSnapshots[Number(match[1]) - 2];
      return Number(snapshot?.targetAngle) || 0;
    }
    return 0;
  }

  function getTrajectoryEffectiveAngle(state, id) {
    const override = getTrajectoryOverrideAngle(state, id);
    return Number.isFinite(override) ? override : getTrajectoryDefaultAngle(state, id);
  }

  function writeTrajectoryOverride(id, angle) {
    const overrides = parseTrajectoryOverrides(controls.trajectoryOverrides.value);
    overrides[id] = clamp(Math.round(Number(angle) || 0), -90, 90);
    controls.trajectoryOverrides.value = serializeTrajectoryOverrides(overrides);
  }

  function getTrajectoryGuideEnd(start, unit, length) {
    return {
      x: start.x + unit.x * length,
      y: start.y + unit.y * length
    };
  }

  function makeTrajectoryTarget(id, label, role, geometry) {
    const isLauncher = role === "launcher";
    const start = isLauncher
      ? { x: geometry.launcherStartX, y: geometry.launcherStartY }
      : { x: geometry.targetBaseX, y: geometry.targetBaseY };
    const end = isLauncher
      ? { x: geometry.launcherStopX, y: geometry.launcherStopY }
      : getTrajectoryGuideEnd(
          start,
          { x: geometry.targetUnitX, y: geometry.targetUnitY },
          Math.max(150, Math.min(260, geometry.targetDistance || 180))
        );
    return {
      id,
      label,
      start,
      end,
      role,
      radius: geometry.radius
    };
  }

  function getEventTrajectoryTargets(eventState, geometry, trajectoryScope, pairLabel) {
    return [
      makeTrajectoryTarget(
        `${trajectoryScope}Launcher`,
        `${pairLabel} first object`,
        "launcher",
        geometry
      ),
      makeTrajectoryTarget(
        `${trajectoryScope}Target`,
        `${pairLabel} second object`,
        "target",
        geometry
      )
    ];
  }

  function getTrajectoryTargets(state) {
    const laneY = getMainLaneY(state);
    const mainEvent = getMainEventState(state, 0, laneY);
    const targets = getEventTrajectoryTargets(state, mainEvent.geometry, "original", "Original pair");

    if (state.contextMode === "none") {
      return targets;
    }

    const pairCount = getContextPairCount(state);
    const directionSign = mainEvent.geometry.contextDirectionSign;
    const contextState = getContextMotionState(state);
    const snapshots = state.contextPairSnapshots || [];
    for (let pairIndex = 0; pairIndex < pairCount; pairIndex += 1) {
      const snapshot = pairIndex > 0 ? snapshots[pairIndex - 1] || makeContextPairSnapshotFromOriginal(state, pairIndex) : null;
      const contextLaneY = getContextLaneY(state, mainEvent.geometry.laneY, pairIndex, snapshot);
      if (pairIndex === 0) {
        const contextGeometry = getGeometry(contextState, contextLaneY, {
          scope: "context",
          directionSign,
          trajectoryScope: "context"
        });
        targets.push(...getEventTrajectoryTargets(contextState, contextGeometry, "context", "Context 1"));
        continue;
      }
      const snapshotState = getContextPairSnapshotState(snapshot, state, contextLaneY);
      const trajectoryScope = `context${pairIndex + 1}`;
      const snapshotGeometry = getGeometry(snapshotState, contextLaneY, {
        scope: "original",
        directionSign,
        trajectoryScope
      });
      targets.push(...getEventTrajectoryTargets(snapshotState, snapshotGeometry, trajectoryScope, `Context ${pairIndex + 1}`));
    }
    return targets;
  }

  function ensureSelectedTrajectoryTarget(state = cloneState()) {
    const targets = getTrajectoryTargets(state);
    if (targets.length === 0) {
      return;
    }
    const selectedId = targets.some((target) => target.id === controls.selectedTrajectoryBall.value)
      ? controls.selectedTrajectoryBall.value
      : targets[0].id;
    controls.selectedTrajectoryBall.value = selectedId;
    controls.selectedTrajectoryAngle.value = getTrajectoryEffectiveAngle(state, selectedId);
    updateOutputs();
  }

  function selectTrajectoryTarget(target, state = cloneState()) {
    controls.selectedTrajectoryBall.value = target.id;
    controls.selectedTrajectoryAngle.value = getTrajectoryEffectiveAngle(state, target.id);
    updateOutputs();
    statusText.textContent = `${getTrajectoryTargetLabel(target.id)} selected.`;
  }

  function findTrajectoryTarget(state, point) {
    if (!state.trajectoryEditEnabled) {
      return null;
    }
    let bestTarget = null;
    let bestDistance = Infinity;
    getTrajectoryTargets(state).forEach((target) => {
      const distance = Math.min(
        distanceToSegment(point, target.start, target.end),
        Math.hypot(point.x - target.start.x, point.y - target.start.y),
        Math.hypot(point.x - target.end.x, point.y - target.end.y)
      );
      if (distance < bestDistance) {
        bestDistance = distance;
        bestTarget = target;
      }
    });
    return bestDistance <= 22 ? bestTarget : null;
  }

  function drawTrajectoryGuides(drawCtx, state) {
    if (!state.trajectoryEditEnabled) {
      return;
    }
    const selectedId = state.selectedTrajectoryBall;
    drawCtx.save();
    drawCtx.lineCap = "round";
    drawCtx.font = '800 11px "Avenir Next", "Segoe UI", sans-serif';
    drawCtx.textBaseline = "middle";
    getTrajectoryTargets(state).forEach((target) => {
      const selected = target.id === selectedId;
      drawCtx.strokeStyle = selected ? "rgba(224, 178, 74, 0.95)" : "rgba(255, 248, 234, 0.38)";
      drawCtx.fillStyle = selected ? "rgba(224, 178, 74, 0.95)" : "rgba(255, 248, 234, 0.72)";
      drawCtx.lineWidth = selected ? 3 : 1.5;
      drawCtx.beginPath();
      drawCtx.moveTo(target.start.x, target.start.y);
      drawCtx.lineTo(target.end.x, target.end.y);
      drawCtx.stroke();
      const angle = Math.atan2(target.end.y - target.start.y, target.end.x - target.start.x);
      const arrowSize = selected ? 10 : 7;
      drawCtx.beginPath();
      drawCtx.moveTo(target.end.x, target.end.y);
      drawCtx.lineTo(target.end.x - Math.cos(angle - 0.45) * arrowSize, target.end.y - Math.sin(angle - 0.45) * arrowSize);
      drawCtx.lineTo(target.end.x - Math.cos(angle + 0.45) * arrowSize, target.end.y - Math.sin(angle + 0.45) * arrowSize);
      drawCtx.closePath();
      drawCtx.fill();
      if (selected) {
        drawCtx.fillText(getTrajectoryTargetLabel(target.id), target.end.x + 8, target.end.y);
      }
    });
    drawCtx.restore();
  }

  function drawContextPair(drawCtx, state, eventState, t, laneY, directionSign, colors, scope = "context", trajectoryScope = scope) {
    if (state.contextMode === "single") {
      const singleEvent = getDirectedSingleEventState(eventState, t, laneY, directionSign, scope, trajectoryScope);
      const singlePalette = t < singleEvent.geometry.stopTime ? colors.launcher : colors.target;
      const radius = singleEvent.geometry.radius;
      const contextOccluderBounds = drawTunnelOccluder(
        drawCtx,
        laneY,
        radius,
        eventState.occluderEnabled,
        eventState.occluderWidth
      );
      if (
        isObjectVisibleAt(t, eventState.launcherVisibleMs) &&
        (!eventState.occluderEnabled || isObjectOutsideOccluder(singleEvent.singleX, radius, contextOccluderBounds))
      ) {
        drawObject(drawCtx, state, singleEvent.singleX, singleEvent.singleY, radius, singlePalette.fill, singlePalette.outline);
      }
      return;
    }

    const contextEvent = getDirectedEventState(eventState, t, laneY, directionSign, scope, trajectoryScope);
    const launcher = {
      x: contextEvent.launcherX,
      y: contextEvent.launcherY,
      fill: colors.launcher.fill,
      outline: colors.launcher.outline,
      visible: isObjectVisibleAt(t, eventState.launcherVisibleMs)
    };
    const target = {
      x: contextEvent.targetX,
      y: contextEvent.targetY,
      fill: colors.target.fill,
      outline: colors.target.outline,
      visible: isObjectVisibleAt(t, eventState.targetVisibleMs)
    };
    const contextOccluderBounds = drawTunnelOccluder(
      drawCtx,
      laneY,
      contextEvent.geometry.radius,
      eventState.occluderEnabled,
      eventState.occluderWidth
    );
    const radius = contextEvent.geometry.radius;

    if (eventState.occluderEnabled) {
      drawOccludedObjectPair(drawCtx, state, launcher, target, radius, contextOccluderBounds);
      return;
    }

    drawObjectPair(drawCtx, state, contextEvent, launcher, target, radius, eventState.contactOcclusionMode);
  }

  function drawContextEvent(drawCtx, state, t, mainEvent) {
    if (!isContextEventVisible(state, t, mainEvent.geometry)) {
      return;
    }

    const palette = getPalette(state);
    const pairCount = getContextPairCount(state);
    const directionSign = mainEvent.geometry.contextDirectionSign;
    const adjustedTime = t - state.contextOffsetMs;
    const contextState = getContextMotionState(state);
    const snapshots = state.contextPairSnapshots || [];

    for (let pairIndex = 0; pairIndex < pairCount; pairIndex += 1) {
      const snapshot = pairIndex > 0 ? snapshots[pairIndex - 1] || makeContextPairSnapshotFromOriginal(state, pairIndex) : null;
      const laneY = getContextLaneY(state, mainEvent.geometry.laneY, pairIndex, snapshot);
      if (pairIndex === 0) {
        drawContextPair(
          drawCtx,
          state,
          contextState,
          adjustedTime,
          laneY,
          directionSign,
          {
            launcher: palette.context,
            target: palette.contextTarget
          },
          "context",
          "context"
        );
        continue;
      }

      const snapshotState = getContextPairSnapshotState(snapshot, state, laneY);
      drawContextPair(
        drawCtx,
        state,
        snapshotState,
        adjustedTime,
        laneY,
        directionSign,
        {
          launcher: getObjectPalette(snapshot.launcherColor || state.launcherColor, state.launcherColor),
          target: getObjectPalette(snapshot.targetColor || state.targetColor, state.targetColor)
        },
        "original",
        `context${pairIndex + 1}`
      );
    }
  }

  function drawTunnelOccluder(drawCtx, laneY, radius, enabled, width) {
    if (!enabled) {
      return {
        left: 0,
        right: 0
      };
    }

    const left = STAGE_WIDTH / 2 - width / 2;
    const top = laneY - radius * 1.9;
    const height = radius * 3.8;
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

  function drawOccluder(drawCtx, state, laneY) {
    return drawTunnelOccluder(drawCtx, laneY, state.ballRadius, state.occluderEnabled, state.occluderWidth);
  }

  function drawContextOccluder(drawCtx, state, laneY) {
    return drawTunnelOccluder(drawCtx, laneY, state.contextBallRadius, state.contextOccluderEnabled, state.contextOccluderWidth);
  }

  function isObjectOutsideOccluder(x, radius, occluderBounds) {
    return x + radius < occluderBounds.left || x - radius > occluderBounds.right;
  }

  function drawOccludedObjectPair(drawCtx, state, launcher, target, radius, occluderBounds) {
    [launcher, target].forEach((object) => {
      if (object.visible !== false && isObjectOutsideOccluder(object.x, radius, occluderBounds)) {
        drawObject(drawCtx, state, object.x, object.y, radius, object.fill, object.outline);
      }
    });
  }

  function getOverlapDrawOrder(eventState, launcher, target, radius, occlusionMode) {
    const visibleObjects = [launcher, target].filter((object) => object.visible !== false);
    if (visibleObjects.length < 2) {
      return visibleObjects;
    }

    const overlapDistance = Math.hypot(target.x - launcher.x, target.y - launcher.y);
    const isOverlapping = overlapDistance < radius * 2;
    let drawOrder = visibleObjects;

    if (isOverlapping) {
      if (occlusionMode === "launcher-front") {
        drawOrder = [target, launcher];
      } else if (occlusionMode === "alternate") {
        const phase = Math.floor(Math.max(0, eventState.time - eventState.geometry.targetStartTime) / 80);
        drawOrder = phase % 2 === 0 ? [target, launcher] : [launcher, target];
      }
    }

    return drawOrder;
  }

  function drawObjectPair(drawCtx, state, eventState, launcher, target, radius, occlusionMode) {
    getOverlapDrawOrder(eventState, launcher, target, radius, occlusionMode).forEach((object) => {
      drawObject(drawCtx, state, object.x, object.y, radius, object.fill, object.outline);
    });
  }

  function drawOpenEvent(drawCtx, state, eventState) {
    const palette = getPaletteAtTime(state, eventState);
    const radius = state.ballRadius;
    const launcher = {
      x: eventState.launcherX,
      y: eventState.launcherY,
      fill: palette.launcher.fill,
      outline: palette.launcher.outline,
      visible: isObjectVisibleAt(eventState.time, state.launcherVisibleMs)
    };
    const target = {
      x: eventState.targetX,
      y: eventState.targetY,
      fill: palette.target.fill,
      outline: palette.target.outline,
      visible: isObjectVisibleAt(eventState.time, state.targetVisibleMs)
    };
    drawObjectPair(drawCtx, state, eventState, launcher, target, radius, state.contactOcclusionMode);
  }

  function drawOccludedEvent(drawCtx, state, eventState, occluderBounds) {
    const radius = state.ballRadius;
    const palette = getPaletteAtTime(state, eventState);

    if (isObjectVisibleAt(eventState.time, state.launcherVisibleMs) && eventState.launcherX + radius < occluderBounds.left) {
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

    if (
      isObjectVisibleAt(eventState.time, state.targetVisibleMs) &&
      eventState.targetX - radius > occluderBounds.right &&
      eventState.targetX < STAGE_WIDTH + radius
    ) {
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

  function getFeatureCoordinate(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function drawRailFeature(drawCtx, state) {
    if (!state.railEnabled) {
      return;
    }

    const segments = getRailSegments(state);

    drawCtx.save();
    drawCtx.strokeStyle = state.stageTheme === "light" ? "rgba(20, 20, 18, 0.72)" : "rgba(245, 244, 235, 0.78)";
    drawCtx.lineWidth = 2.4;
    drawCtx.setLineDash([]);
    drawCtx.lineCap = "round";
    segments.forEach((segment) => {
      drawCtx.beginPath();
      drawCtx.moveTo(segment.startX, segment.startY);
      drawCtx.lineTo(segment.endX, segment.endY);
      drawCtx.stroke();
    });
    drawCtx.restore();
  }

  function drawCrosshairFeature(drawCtx, state, alpha = 1) {
    if (!state.crosshairEnabled) {
      return;
    }

    const x = getFeatureCoordinate(state.crosshairX, STAGE_WIDTH / 2);
    const y = getFeatureCoordinate(state.crosshairY, STAGE_HEIGHT / 2);
    const arm = 24;
    const gap = 5;
    const fallback = state.stageTheme === "light" ? "#11110f" : "#f5f4eb";
    const color = hexToRgba(state.crosshairColor, (state.stageTheme === "light" ? 0.74 : 0.84) * alpha, fallback);

    drawCtx.save();
    drawCtx.strokeStyle = color;
    drawCtx.lineWidth = 2;
    drawCtx.setLineDash([]);
    drawCtx.lineCap = "square";
    drawCtx.beginPath();
    drawCtx.moveTo(x - arm, y);
    drawCtx.lineTo(x - gap, y);
    drawCtx.moveTo(x + gap, y);
    drawCtx.lineTo(x + arm, y);
    drawCtx.moveTo(x, y - arm);
    drawCtx.lineTo(x, y - gap);
    drawCtx.moveTo(x, y + gap);
    drawCtx.lineTo(x, y + arm);
    drawCtx.stroke();
    drawCtx.restore();
  }

  function isCrosshairBlinkWindow(state, t) {
    return getPreBallBlinkMs(state) > 0 && t < getPreBallBlinkMs(state);
  }

  function getPreBallBlinkMs(state) {
    if (!state.crosshairBlinkEnabled || !state.crosshairEnabled) {
      return 0;
    }
    return Math.max(0, Number(state.crosshairBlinkMs) || 0);
  }

  function shouldShowBlinkCrosshair(t) {
    return Math.floor(t / 120) % 2 === 0;
  }

  function drawFrame(state, t, drawCtx) {
    if (drawCtx === ctx) {
      resizePreviewCanvas();
    }
    prepareFrameContext(drawCtx);
    drawCtx.clearRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
    drawStageBackground(drawCtx, state);

    if (isCrosshairBlinkWindow(state, t)) {
      if (shouldShowBlinkCrosshair(t)) {
        drawCrosshairFeature(drawCtx, state, 1);
      }
      return;
    }

    const stimulusT = Math.max(0, t - getPreBallBlinkMs(state));
    drawRailFeature(drawCtx, state);

    const laneY = getMainLaneY(state);

    const eventState = getMainEventState(state, stimulusT, laneY);
    drawGroupingBoxes(drawCtx, state, eventState);
    drawContactGuides(drawCtx, state, eventState);
    drawContextEvent(drawCtx, state, stimulusT, eventState);
    drawSpatialMarker(drawCtx, state, eventState);
    const occluderBounds = drawOccluder(drawCtx, state, laneY);

    if (state.occluderEnabled) {
      drawOccludedEvent(drawCtx, state, eventState, occluderBounds);
    } else {
      drawOpenEvent(drawCtx, state, eventState);
    }

    drawFixation(drawCtx, state);
    drawCrosshairFeature(drawCtx, state, 1);

    if (drawCtx === ctx) {
      drawTrajectoryGuides(drawCtx, state);
      drawStartDragHandles(drawCtx, state);
    }

    if (state.renderMode === "lab") {
      drawLegend(drawCtx, state);

      drawCtx.save();
      drawCtx.font = '500 14px "Avenir Next", "Segoe UI", sans-serif';
      drawCtx.fillStyle = "rgba(240, 245, 245, 0.7)";
      drawCtx.fillText(`t = ${Math.round(stimulusT)} ms`, STAGE_WIDTH - 116, STAGE_HEIGHT - 28);
      drawCtx.restore();
    }
  }

  function getStagePoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: clamp(((event.clientX - rect.left) / rect.width) * STAGE_WIDTH, 0, STAGE_WIDTH),
      y: clamp(((event.clientY - rect.top) / rect.height) * STAGE_HEIGHT, 0, STAGE_HEIGHT)
    };
  }

  function distanceToSegment(point, start, end) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const lengthSq = dx * dx + dy * dy;
    if (lengthSq <= 0.001) {
      return Math.hypot(point.x - start.x, point.y - start.y);
    }
    const t = clamp(((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSq, 0, 1);
    const projectionX = start.x + t * dx;
    const projectionY = start.y + t * dy;
    return Math.hypot(point.x - projectionX, point.y - projectionY);
  }

  function findSpecialDragTarget(state, point) {
    if (state.crosshairEnabled) {
      const crosshair = {
        x: getFeatureCoordinate(state.crosshairX, STAGE_WIDTH / 2),
        y: getFeatureCoordinate(state.crosshairY, STAGE_HEIGHT / 2)
      };
      if (Math.hypot(point.x - crosshair.x, point.y - crosshair.y) <= 22) {
        return { type: "crosshair" };
      }
    }

    if (state.railEnabled) {
      const railSegments = getRailSegments(state);
      for (let railIndex = 0; railIndex < railSegments.length; railIndex += 1) {
        const segment = railSegments[railIndex];
        const start = { x: segment.startX, y: segment.startY };
        const end = { x: segment.endX, y: segment.endY };
        if (Math.hypot(point.x - start.x, point.y - start.y) <= 18) {
          return { type: "railStart", railIndex };
        }
        if (Math.hypot(point.x - end.x, point.y - end.y) <= 18) {
          return { type: "railEnd", railIndex };
        }
        if (distanceToSegment(point, start, end) <= 12) {
          return {
            type: "railLine",
            railIndex,
            startOffset: { x: start.x - point.x, y: start.y - point.y },
            endOffset: { x: end.x - point.x, y: end.y - point.y }
          };
        }
      }
    }

    return null;
  }

  function writeDraggedSpecialFeature(target, point) {
    if (target.type === "crosshair") {
      writeCoordinateControl("crosshairX", "crosshairY", point.x, point.y);
    } else if (target.type === "railStart") {
      const segment = getRailSegments(cloneState())[target.railIndex] || getDefaultRailSegment(cloneState(), target.railIndex);
      const nextSegment = { ...segment, startX: point.x, startY: point.y };
      updateRailLengthFromSegment(nextSegment);
      writeRailSegment(target.railIndex, nextSegment);
    } else if (target.type === "railEnd") {
      const segment = getRailSegments(cloneState())[target.railIndex] || getDefaultRailSegment(cloneState(), target.railIndex);
      const nextSegment = { ...segment, endX: point.x, endY: point.y };
      updateRailLengthFromSegment(nextSegment);
      writeRailSegment(target.railIndex, nextSegment);
    } else if (target.type === "railLine") {
      writeRailSegment(target.railIndex, {
        startX: point.x + target.startOffset.x,
        startY: point.y + target.startOffset.y,
        endX: point.x + target.endOffset.x,
        endY: point.y + target.endOffset.y
      });
    }
  }

  function updateDraggedSpecialFeature(event) {
    if (!specialDragTarget) {
      return;
    }
    writeDraggedSpecialFeature(specialDragTarget, getStagePoint(event));
    activePresetKey = null;
    updateOutputs();
    refreshText();
    statusText.textContent = "Special feature moved.";
    drawFrame(cloneState(), 0, ctx);
  }

  function getStartDragHandles(state) {
    const laneY = getMainLaneY(state);
    const originalGeometry = getGeometry(state, laneY, { scope: "original", directionSign: 1 });
    const handles = [
      {
        id: "originalLauncher",
        label: "Launcher",
        x: originalGeometry.launcherStartX,
        y: originalGeometry.launcherStartY,
        radius: originalGeometry.radius,
        xControl: "originalLauncherStartX",
        yControl: "originalLauncherStartY"
      },
      {
        id: "originalTarget",
        label: "Launchee",
        x: originalGeometry.targetBaseX,
        y: originalGeometry.targetBaseY,
        radius: originalGeometry.radius,
        xControl: "originalTargetStartX",
        yControl: "originalTargetStartY"
      }
    ];

    if (state.contextMode !== "none") {
      const contextGeometry = getGeometry(getContextMotionState(state), getContextLaneY(state, laneY, 0), {
        scope: "context",
        directionSign: originalGeometry.contextDirectionSign
      });
      handles.push(
        {
          id: "contextLauncher",
          label: "Launcher",
          x: contextGeometry.launcherStartX,
          y: contextGeometry.launcherStartY,
          radius: contextGeometry.radius,
          xControl: "contextLauncherStartX",
          yControl: "contextLauncherStartY"
        },
        {
          id: "contextTarget",
          label: "Launchee",
          x: contextGeometry.targetBaseX,
          y: contextGeometry.targetBaseY,
          radius: contextGeometry.radius,
          xControl: "contextTargetStartX",
          yControl: "contextTargetStartY"
        }
      );
    }

    return handles;
  }

  function findStartDragHandle(state, point) {
    return (
      getStartDragHandles(state).find((handle) => Math.hypot(point.x - handle.x, point.y - handle.y) <= handle.radius + 12) ||
      null
    );
  }

  function drawStartDragHandles(drawCtx, state) {
    if (!state.customStartEnabled) {
      return;
    }

    drawCtx.save();
    drawCtx.font = '800 12px "Avenir Next", "Segoe UI", sans-serif';
    drawCtx.textAlign = "center";
    drawCtx.textBaseline = "middle";
    getStartDragHandles(state).forEach((handle) => {
      drawCtx.beginPath();
      drawCtx.arc(handle.x, handle.y, handle.radius + 7, 0, Math.PI * 2);
      drawCtx.strokeStyle = "rgba(255, 255, 255, 0.94)";
      drawCtx.lineWidth = 2.5;
      drawCtx.stroke();
      drawCtx.beginPath();
      drawCtx.arc(handle.x, handle.y, handle.radius + 12, 0, Math.PI * 2);
      drawCtx.strokeStyle = "rgba(196, 95, 69, 0.84)";
      drawCtx.lineWidth = 2;
      drawCtx.stroke();
      drawCtx.fillStyle = "rgba(251, 250, 241, 0.92)";
      drawCtx.fillText(handle.label, handle.x, handle.y - handle.radius - 20);
    });
    drawCtx.restore();
  }

  function getHorizontalPartnerForStartHandle(handleId) {
    const partners = {
      originalLauncher: {
        xControl: "originalTargetStartX",
        yControl: "originalTargetStartY"
      },
      originalTarget: {
        xControl: "originalLauncherStartX",
        yControl: "originalLauncherStartY"
      },
      contextLauncher: {
        xControl: "contextTargetStartX",
        yControl: "contextTargetStartY"
      },
      contextTarget: {
        xControl: "contextLauncherStartX",
        yControl: "contextLauncherStartY"
      }
    };
    return partners[handleId] || null;
  }

  function writeDraggedStartPosition(handle, point, state) {
    writeCoordinateControl(handle.xControl, handle.yControl, point.x, point.y);

    if (state.customStartKeepRowsHorizontal) {
      const partner = getHorizontalPartnerForStartHandle(handle.id);
      if (partner) {
        writeCoordinateControl(partner.xControl, partner.yControl, getCoordinateControlValue(partner.xControl), point.y);
      }
    }

    if (state.customStartAlignStartsVertical && state.contextMode !== "none") {
      if (handle.id === "originalLauncher") {
        writeCoordinateControl(
          "contextLauncherStartX",
          "contextLauncherStartY",
          point.x,
          getCoordinateControlValue("contextLauncherStartY")
        );
      } else if (handle.id === "contextLauncher") {
        writeCoordinateControl(
          "originalLauncherStartX",
          "originalLauncherStartY",
          point.x,
          getCoordinateControlValue("originalLauncherStartY")
        );
      }
    }
  }

  function enforceCustomStartConstraints() {
    if (!controls.customStartEnabled.checked) {
      return;
    }

    if (controls.customStartKeepRowsHorizontal.checked) {
      writeCoordinateControl(
        "originalTargetStartX",
        "originalTargetStartY",
        getCoordinateControlValue("originalTargetStartX"),
        getCoordinateControlValue("originalLauncherStartY")
      );

      if (controls.contextMode.value !== "none") {
        writeCoordinateControl(
          "contextTargetStartX",
          "contextTargetStartY",
          getCoordinateControlValue("contextTargetStartX"),
          getCoordinateControlValue("contextLauncherStartY")
        );
      }
    }

    if (controls.customStartAlignStartsVertical.checked && controls.contextMode.value !== "none") {
      writeCoordinateControl(
        "contextLauncherStartX",
        "contextLauncherStartY",
        getCoordinateControlValue("originalLauncherStartX"),
        getCoordinateControlValue("contextLauncherStartY")
      );
    }
  }

  function updateDraggedStartPosition(event) {
    if (!startDragTarget) {
      return;
    }

    const state = cloneState();
    const handle = getStartDragHandles(state).find((candidate) => candidate.id === startDragTarget.id);
    if (!handle) {
      return;
    }

    const point = getStagePoint(event);
    writeDraggedStartPosition(handle, point, state);
    activePresetKey = null;
    updateOutputs();
    refreshText();
    statusText.textContent = "Start position updated.";
    drawFrame(cloneState(), 0, ctx);
  }

  function bindStartDragging() {
    canvas.addEventListener("pointerdown", (event) => {
      const state = cloneState();
      const point = getStagePoint(event);
      const specialTarget = findSpecialDragTarget(state, point);
      if (specialTarget) {
        stopPreview();
        specialDragTarget = specialTarget;
        canvas.setPointerCapture?.(event.pointerId);
        event.preventDefault();
        return;
      }

      const trajectoryTarget = findTrajectoryTarget(state, point);
      if (trajectoryTarget) {
        stopPreview();
        selectTrajectoryTarget(trajectoryTarget, state);
        drawFrame(cloneState(), 0, ctx);
        event.preventDefault();
        return;
      }

      if (!state.customStartEnabled) {
        return;
      }

      initializeCustomStartPositions();
      const handle = findStartDragHandle(cloneState(), point);
      if (!handle) {
        return;
      }

      stopPreview();
      startDragTarget = handle;
      canvas.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    });

    canvas.addEventListener("pointermove", (event) => {
      if (specialDragTarget) {
        updateDraggedSpecialFeature(event);
        return;
      }
      if (!startDragTarget) {
        return;
      }
      updateDraggedStartPosition(event);
    });

    const endDrag = (event) => {
      if (specialDragTarget) {
        updateDraggedSpecialFeature(event);
        canvas.releasePointerCapture?.(event.pointerId);
        specialDragTarget = null;
        return;
      }
      if (!startDragTarget) {
        return;
      }
      updateDraggedStartPosition(event);
      canvas.releasePointerCapture?.(event.pointerId);
      startDragTarget = null;
    };

    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);
  }

  function bindContextPairEditors() {
    [contextMovementPairList, contextPositionPairList, contextColorPairList].forEach((container) => {
      if (!container) {
        return;
      }
      container.addEventListener("click", (event) => {
        const button = event.target.closest("[data-choice-for][data-choice-value]");
        if (!button || !container.contains(button)) {
          return;
        }
        const control = document.getElementById(button.dataset.choiceFor);
        applyChoiceControl(control, button.dataset.choiceValue);
      });

      const handleEdit = (event) => {
        const control = event.target.closest("[data-pair-field]");
        if (!control || !container.contains(control)) {
          return;
        }
        updateContextPairSnapshotFromControl(control);
      };
      container.addEventListener("input", handleEdit);
      container.addEventListener("change", handleEdit);
    });
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
    if (state.contextMode === "none") {
      return STAGE_HEIGHT / 2 + state.stimulusYOffset;
    }

    const visibleContextPairs = Math.max(1, getContextPairCount(state) || 1);
    const contextShift = Math.max(0, 52 - (visibleContextPairs - 1) * 18);
    return STAGE_HEIGHT / 2 - contextShift + state.stimulusYOffset;
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

  function getPreviewFrameTime(elapsed, state) {
    const fps = Math.max(1, Math.round(Number(state.fps) || 60));
    const frameDuration = 1000 / fps;
    if (elapsed >= state.durationMs) {
      return state.durationMs;
    }
    return Math.min(Math.floor(elapsed / frameDuration) * frameDuration, state.durationMs);
  }

  function tickPreview(now) {
    const state = cloneState();
    if (previewStart === 0) {
      previewStart = now;
    }
    const elapsed = now - previewStart;
    drawFrame(state, getPreviewFrameTime(elapsed, state), ctx);

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
      const impactTime = getPreBallBlinkMs(state) + geometry.stopTime;
      if (impactTime < state.durationMs) {
        impactSoundTimer = window.setTimeout(() => {
          playImpactSound(state);
          impactSoundTimer = null;
        }, Math.max(0, impactTime));
      }
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

  function pad2(value) {
    return String(value).padStart(2, "0");
  }

  function getMonthDayTimestamp(date = new Date()) {
    return `${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}-${pad2(date.getHours())}${pad2(
      date.getMinutes()
    )}${pad2(date.getSeconds())}`;
  }

  function compactNumber(value, decimals = 0) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return "0";
    }
    return Number(number.toFixed(decimals)).toString().replace("-", "m").replace(".", "p");
  }

  function getGapFilenamePartFrom(gapPx, radius) {
    if (gapPx < 0) {
      const overlap = clamp((-gapPx / Math.max(1, radius * 2)) * 100, 0, 100);
      return `ov${compactNumber(overlap)}pct`;
    }
    if (gapPx > 0) {
      return `gap${compactNumber(gapPx)}px`;
    }
    return "contact";
  }

  function getGapFilenamePart(state) {
    return getGapFilenamePartFrom(state.gapPx, state.ballRadius);
  }

  function getContextFilenamePart(state) {
    if (state.contextMode === "none") {
      return "ctxnone";
    }
    const timing =
      state.contextOffsetMs === 0
        ? "sync"
        : state.contextOffsetMs < 0
          ? `early${compactNumber(Math.abs(state.contextOffsetMs))}ms`
          : `late${compactNumber(state.contextOffsetMs)}ms`;
    const extraTags = [];
    if (state.contextDurationMs !== 750) {
      extraTags.push(`win${compactNumber(state.contextDurationMs)}ms`);
    }
    if (getContextPairCount(state) > 1) {
      extraTags.push(`pairs${getContextPairCount(state)}`);
    }
    if (state.contextLauncherVisibleMs < state.durationMs || state.contextTargetVisibleMs < state.durationMs) {
      extraTags.push(`cvis${compactNumber(state.contextLauncherVisibleMs)}-${compactNumber(state.contextTargetVisibleMs)}ms`);
    }
    const base = [
      `ctx${sanitizeLabel(state.contextMode)}`,
      timing,
      `cv${compactNumber(state.contextLauncherSpeed)}pxs`,
      `cdelay${compactNumber(state.contextDelayMs)}ms`,
      `c${getGapFilenamePartFrom(state.contextGapPx, state.contextBallRadius)}`,
      `cr${compactNumber(state.contextBallRadius)}px`,
      `cratio${compactNumber(state.contextTargetSpeedRatio * 100)}pct`
    ].join("-");
    return extraTags.length > 0 ? `${base}-${extraTags.join("-")}` : base;
  }

  function getExportFilenameBase(state) {
    const parts = [
      sanitizeLabel(state.fileLabel),
      `dur${compactNumber(state.durationMs)}ms`,
      `fps${compactNumber(state.fps)}`,
      `v${compactNumber(state.launcherSpeed)}pxs`,
      `delay${compactNumber(state.delayMs)}ms`,
      getGapFilenamePart(state),
      `r${compactNumber(state.ballRadius)}px`,
      `ratio${compactNumber(state.targetSpeedRatio * 100)}pct`,
      `after${sanitizeLabel(state.launcherBehavior)}`,
      getContextFilenamePart(state)
    ];
    if (state.launcherAccel !== 0 || state.targetAccel !== 0) {
      parts.push(`accel${compactNumber(state.launcherAccel)}-${compactNumber(state.targetAccel)}`);
    }
    if (state.launcherVisibleMs < state.durationMs || state.targetVisibleMs < state.durationMs) {
      parts.push(`vis${compactNumber(state.launcherVisibleMs)}-${compactNumber(state.targetVisibleMs)}ms`);
    }
    if (state.occluderEnabled) {
      parts.push(`occ${compactNumber(state.occluderWidth)}px`);
    }
    if ((state.aspectRatio || "16:9") !== "16:9") {
      parts.push(`ar${sanitizeLabel(state.aspectRatio)}`);
    }
    if (state.crosshairEnabled) {
      parts.push(`cross${compactNumber(state.crosshairX)}x${compactNumber(state.crosshairY)}`);
    }
    if (state.railEnabled) {
      const railCount = getRailCount(state);
      parts.push(`${railCount > 1 ? `rails${railCount}` : "rail"}${compactNumber(state.railLength)}px`);
    }
    return sanitizeLabel(parts.join("-"));
  }

  function getExportMovieFilename(state, extension, date = new Date()) {
    return `${getExportFilenameBase(state)}-${getMonthDayTimestamp(date)}.${extension}`;
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
    const canCheckSupport = typeof MediaRecorder !== "undefined" && typeof MediaRecorder.isTypeSupported === "function";
    const mimeType = canCheckSupport
      ? candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate)) || "video/webm"
      : candidates[0] || "video/webm";
    const extension = mimeType.includes("mp4") ? "mp4" : "webm";
    const usedFallback =
      canCheckSupport && state.outputFormat === "mp4" && !mimeType.includes("mp4")
        ? true
        : canCheckSupport && state.outputFormat.startsWith("webm") && !mimeType.includes("webm");
    return {
      mimeType,
      extension,
      usedFallback
    };
  }

  function getAspectRatioParts(value) {
    const ratios = {
      "16:9": [16, 9],
      "4:3": [4, 3],
      "1:1": [1, 1],
      "3:4": [3, 4],
      "9:16": [9, 16]
    };
    return ratios[value] || ratios["16:9"];
  }

  function getExportCanvasSize(state) {
    const [ratioWidth, ratioHeight] = getAspectRatioParts(state.aspectRatio);
    const targetHeight = STAGE_HEIGHT * EXPORT_SCALE;
    const width = Math.max(320, Math.round((targetHeight * ratioWidth) / ratioHeight));
    return {
      width,
      height: targetHeight
    };
  }

  function getEncodedDimensions(exportDetails = {}) {
    return {
      width: exportDetails.width || STAGE_WIDTH * EXPORT_SCALE,
      height: exportDetails.height || STAGE_HEIGHT * EXPORT_SCALE
    };
  }

  function drawExportFrame(state, time, exportCtx, exportCanvas, scratchCanvas = null) {
    if ((state.aspectRatio || "16:9") === "16:9") {
      drawFrame(state, time, exportCtx);
      return;
    }

    const stageCanvas = scratchCanvas || document.createElement("canvas");
    stageCanvas.width = STAGE_WIDTH * EXPORT_SCALE;
    stageCanvas.height = STAGE_HEIGHT * EXPORT_SCALE;
    const stageCtx = stageCanvas.getContext("2d");
    drawFrame(state, time, stageCtx);

    exportCtx.setTransform(1, 0, 0, 1, 0, 0);
    exportCtx.imageSmoothingEnabled = true;
    exportCtx.imageSmoothingQuality = "high";
    exportCtx.fillStyle = getStageThemeColors(state)[0];
    exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    const scale = Math.min(exportCanvas.width / stageCanvas.width, exportCanvas.height / stageCanvas.height);
    const drawWidth = stageCanvas.width * scale;
    const drawHeight = stageCanvas.height * scale;
    const x = (exportCanvas.width - drawWidth) / 2;
    const y = (exportCanvas.height - drawHeight) / 2;
    exportCtx.drawImage(stageCanvas, x, y, drawWidth, drawHeight);
  }

  function getExportFrameCount(state) {
    return Math.max(1, Math.ceil(state.durationMs / (1000 / state.fps)));
  }

  function getExportDurationSec(state) {
    return Number((getExportFrameCount(state) / state.fps).toFixed(3));
  }

  function getIntendedDurationSec(state) {
    return Number((state.durationMs / 1000).toFixed(3));
  }

  function getConditionName() {
    const preset = activePresetKey ? getPreset(activePresetKey) : null;
    return preset ? preset.label : "Custom stimulus";
  }

  function getPsychopyMoviePath(filename) {
    return `${PSYCHOPY_STIMULI_FOLDER}/${filename}`;
  }

  function getPsychopyCsvName(filename) {
    return filename.replace(/\.(webm|mp4)$/i, "-psychopy.csv");
  }

  function buildPsychopyMetadata(state, filename, exportDetails = {}) {
    const standards = getStandards(state);
    const encoded = getEncodedDimensions(exportDetails.width ? exportDetails : getExportCanvasSize(state));
    const durationSec = getExportDurationSec(state);
    const movieFile = getPsychopyMoviePath(filename);

    return {
      movieFile,
      conditionsFile: getPsychopyCsvName(filename),
      builder: {
        loopConditionsFile: getPsychopyCsvName(filename),
        movieComponentMovieFile: "$movieFile",
        spatialUnits: "pix",
        sizePix: [encoded.width, encoded.height],
        positionPix: [0, 0],
        startType: "time (s)",
        startSec: 0,
        stopType: "duration (s)",
        durationSec,
        intendedDurationSec: getIntendedDurationSec(state),
        forceEndRoutine: true,
        loopPlayback: false,
        noAudio: !state.soundEnabled,
        syncTimingWithScreenRefresh: true
      },
      coder: {
        className: "psychopy.visual.MovieStim",
        filename: movieFile,
        units: "pix",
        size: [encoded.width, encoded.height],
        pos: [0, 0],
        loop: false,
        noAudio: !state.soundEnabled
      },
      timing: {
        nativeMovieFps: state.fps,
        frameCount: getExportFrameCount(state),
        encodedDurationSec: durationSec,
        intendedDurationSec: getIntendedDurationSec(state),
        impactSec: Number((standards.impactMs / 1000).toFixed(3)),
        targetOnsetSec: Number((standards.targetOnsetMs / 1000).toFixed(3)),
        objectVisibleSec: {
          launcher: Number((state.launcherVisibleMs / 1000).toFixed(3)),
          target: Number((state.targetVisibleMs / 1000).toFixed(3)),
          contextLauncher: Number((state.contextLauncherVisibleMs / 1000).toFixed(3)),
          contextTarget: Number((state.contextTargetVisibleMs / 1000).toFixed(3))
        }
      },
      aspectRatio: state.aspectRatio,
      stageColor: state.stageColor,
      trajectoryOverrides: state.trajectoryOverrides,
      placement: `Put the movie in ${PSYCHOPY_STIMULI_FOLDER}/ next to the PsychoPy experiment and use the CSV as the loop conditions file.`
    };
  }

  function csvCell(value) {
    const text = value === null || value === undefined ? "" : String(value);
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  function buildPsychopyCsv(state, filename, exportDetails = {}) {
    const standards = getStandards(state);
    const encoded = getEncodedDimensions(exportDetails.width ? exportDetails : getExportCanvasSize(state));
    const row = {
      movieFile: getPsychopyMoviePath(filename),
      conditionName: getConditionName(),
      movieDurationSec: getExportDurationSec(state),
      intendedDurationSec: getIntendedDurationSec(state),
      movieFPS: state.fps,
      frameCount: getExportFrameCount(state),
      widthPx: encoded.width,
      heightPx: encoded.height,
      aspectRatio: state.aspectRatio,
      units: "pix",
      positionXPix: 0,
      positionYPix: 0,
      forceEndRoutine: "true",
      loopPlayback: "false",
      noAudio: String(!state.soundEnabled),
      durationMs: state.durationMs,
      leadInMs: state.leadInMs,
      launcherSpeedPxPerSec: state.launcherSpeed,
      launcherAccelerationPxPerSec2: state.launcherAccel,
      launcherBehavior: state.launcherBehavior,
      targetSpeedRatio: state.targetSpeedRatio,
      targetAccelerationPxPerSec2: state.targetAccel,
      targetAngleDegrees: state.targetAngle,
      launcherVisibleMs: state.launcherVisibleMs,
      targetVisibleMs: state.targetVisibleMs,
      contactDelayMs: state.delayMs,
      gapPx: state.gapPx,
      spatialGapPx: standards.gapPx,
      overlapPercent: standards.overlapPercent,
      markerMode: state.markerMode,
      ballRadiusPx: state.ballRadius,
      occluderEnabled: state.occluderEnabled,
      occluderWidthPx: state.occluderWidth,
      impactMs: standards.impactMs,
      targetOnsetMs: standards.targetOnsetMs,
      contactOcclusionMode: state.contactOcclusionMode,
      contextMode: state.contextMode,
      contextPairCount: getContextPairCount(state),
      contextDurationMs: state.contextDurationMs,
      contextOffsetMs: state.contextOffsetMs,
      contextDirection: state.contextDirection,
      contextSeparationPx: state.contextYOffset,
      contextBallRadiusPx: state.contextBallRadius,
      contextLeadInMs: state.contextLeadInMs,
      contextLauncherSpeedPxPerSec: state.contextLauncherSpeed,
      contextLauncherAccelerationPxPerSec2: state.contextLauncherAccel,
      contextLauncherBehavior: state.contextLauncherBehavior,
      contextDelayMs: state.contextDelayMs,
      contextGapPx: state.contextGapPx,
      contextContactOcclusionMode: state.contextContactOcclusionMode,
      contextOccluderEnabled: state.contextOccluderEnabled,
      contextOccluderWidthPx: state.contextOccluderWidth,
      contextTargetSpeedRatio: state.contextTargetSpeedRatio,
      contextTargetAccelerationPxPerSec2: state.contextTargetAccel,
      contextTargetAngleDegrees: state.contextTargetAngle,
      contextLauncherVisibleMs: state.contextLauncherVisibleMs,
      contextTargetVisibleMs: state.contextTargetVisibleMs,
      groupingMode: state.groupingMode,
      contactGuideMode: state.contactGuideMode,
      crosshairEnabled: state.crosshairEnabled,
      crosshairX: state.crosshairX,
      crosshairY: state.crosshairY,
      crosshairColor: state.crosshairColor,
      railEnabled: state.railEnabled,
      railCount: getRailCount(state),
      railLengthPx: state.railLength,
      railStartX: state.railStartX,
      railStartY: state.railStartY,
      railEndX: state.railEndX,
      railEndY: state.railEndY,
      railSegments: JSON.stringify(getRailSegments(state).slice(1)),
      crosshairBlinkEnabled: state.crosshairBlinkEnabled,
      crosshairBlinkMs: state.crosshairBlinkMs,
      trajectoryEditEnabled: state.trajectoryEditEnabled,
      selectedTrajectoryBall: state.selectedTrajectoryBall,
      trajectoryOverrides: JSON.stringify(state.trajectoryOverrides),
      customStartEnabled: state.customStartEnabled,
      customStartKeepRowsHorizontal: state.customStartKeepRowsHorizontal,
      customStartAlignStartsVertical: state.customStartAlignStartsVertical,
      originalLauncherStartX: state.originalLauncherStartX,
      originalLauncherStartY: state.originalLauncherStartY,
      originalTargetStartX: state.originalTargetStartX,
      originalTargetStartY: state.originalTargetStartY,
      contextLauncherStartX: state.contextLauncherStartX,
      contextLauncherStartY: state.contextLauncherStartY,
      contextTargetStartX: state.contextTargetStartX,
      contextTargetStartY: state.contextTargetStartY,
      colorChangeMode: state.colorChangeMode,
      launcherColor: state.launcherColor,
      targetColor: state.targetColor,
      contextColor: state.contextColor,
      contextTargetColor: state.contextTargetColor,
      groupingOriginalColor: state.groupingOriginalColor,
      groupingContextColor: state.groupingContextColor,
      renderMode: state.renderMode,
      stageTheme: state.stageTheme,
      stageColor: state.stageColor,
      objectStyle: state.objectStyle,
      colorChangeColor: state.colorChangeColor,
      pxPerDva: state.pxPerDva,
      ballDiameterDva: standards.ballDiameterDva,
      contextBallDiameterDva: standards.contextBallDiameterDva,
      gapDva: standards.gapDva,
      contextSeparationDva: standards.contextSeparationDva,
      fixationDva: state.fixationDva,
      stimulusXOffsetPx: state.stimulusXOffset,
      stimulusYOffsetPx: state.stimulusYOffset,
      soundEnabled: state.soundEnabled,
      soundType: state.soundType,
      soundVolume: state.soundVolume,
      outputFormat: state.outputFormat,
      videoBitrateMbps: state.videoBitrate,
      validationWarnings: getExperimentWarnings(state).join(" | ")
    };
    const columns = Object.keys(row);
    return `${columns.join(",")}\n${columns.map((column) => csvCell(row[column])).join(",")}\n`;
  }

  function setPsychopyDownload(csv, preferredName) {
    const blob = new Blob([csv], { type: "text/csv" });
    if (currentPsychopyUrl) {
      URL.revokeObjectURL(currentPsychopyUrl);
    }
    currentPsychopyUrl = URL.createObjectURL(blob);
    psychopyLink.href = currentPsychopyUrl;
    psychopyLink.download = preferredName;
    psychopyLink.textContent = `Download ${preferredName}`;
    psychopyLink.classList.remove("hidden");
  }

  function setConditionJsonDownload(manifest, preferredName) {
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
    if (currentConditionJsonUrl) {
      URL.revokeObjectURL(currentConditionJsonUrl);
    }
    currentConditionJsonUrl = URL.createObjectURL(blob);
    conditionJsonLink.href = currentConditionJsonUrl;
    conditionJsonLink.download = preferredName;
    conditionJsonLink.textContent = `Download ${preferredName}`;
    conditionJsonLink.classList.remove("hidden");
  }

  function setConditionCsvDownload(csv, preferredName) {
    const blob = new Blob([csv], { type: "text/csv" });
    if (currentConditionCsvUrl) {
      URL.revokeObjectURL(currentConditionCsvUrl);
    }
    currentConditionCsvUrl = URL.createObjectURL(blob);
    conditionCsvLink.href = currentConditionCsvUrl;
    conditionCsvLink.download = preferredName;
    conditionCsvLink.textContent = `Download ${preferredName}`;
    conditionCsvLink.classList.remove("hidden");
  }

  function stateFromConditionParameters(baseState, parameters) {
    return {
      ...baseState,
      durationMs: parameters.durationMs,
      leadInMs: parameters.leadInMs,
      launcherSpeed: parameters.launcherSpeedPxPerSec,
      launcherAccel: parameters.launcherAccelerationPxPerSec2,
      targetSpeedRatio: parameters.targetSpeedRatio,
      targetAccel: parameters.targetAccelerationPxPerSec2,
      launcherBehavior: parameters.launcherBehavior,
      targetAngle: parameters.targetAngleDegrees,
      launcherVisibleMs: parameters.launcherVisibleMs ?? baseState.launcherVisibleMs,
      targetVisibleMs: parameters.targetVisibleMs ?? baseState.targetVisibleMs,
      delayMs: parameters.contactDelayMs,
      gapPx: parameters.gapPx,
      markerMode: parameters.markerMode,
      ballRadius: parameters.ballRadiusPx,
      occluderEnabled: parameters.occluderEnabled,
      occluderWidth: parameters.occluderWidthPx,
      contactOcclusionMode: parameters.contactOcclusionMode,
      contextMode: parameters.contextMode,
      contextDurationMs: parameters.contextDurationMs,
      contextOffsetMs: parameters.contextOffsetMs,
      contextDirection: parameters.contextDirection,
      contextYOffset: parameters.contextYOffsetPx,
      contextBallRadius: parameters.contextBallRadiusPx ?? parameters.ballRadiusPx ?? baseState.contextBallRadius,
      contextLeadInMs: parameters.contextLeadInMs,
      contextLauncherSpeed: parameters.contextLauncherSpeedPxPerSec,
      contextLauncherAccel: parameters.contextLauncherAccelerationPxPerSec2,
      contextLauncherBehavior: parameters.contextLauncherBehavior,
      contextDelayMs: parameters.contextDelayMs,
      contextGapPx: parameters.contextGapPx,
      contextContactOcclusionMode: parameters.contextContactOcclusionMode,
      contextOccluderEnabled: parameters.contextOccluderEnabled ?? baseState.contextOccluderEnabled,
      contextOccluderWidth: parameters.contextOccluderWidthPx ?? baseState.contextOccluderWidth,
      contextTargetSpeedRatio: parameters.contextTargetSpeedRatio,
      contextTargetAccel: parameters.contextTargetAccelerationPxPerSec2,
      contextTargetAngle: parameters.contextTargetAngleDegrees,
      contextLauncherVisibleMs: parameters.contextLauncherVisibleMs ?? baseState.contextLauncherVisibleMs,
      contextTargetVisibleMs: parameters.contextTargetVisibleMs ?? baseState.contextTargetVisibleMs,
      renderMode: parameters.renderMode,
      stageTheme: parameters.stageTheme,
      stageColor: parameters.stageColor ?? baseState.stageColor,
      objectStyle: parameters.objectStyle,
      groupingMode: parameters.groupingMode,
      contactGuideMode: parameters.contactGuideMode,
      trajectoryEditEnabled: parameters.trajectoryEditEnabled ?? baseState.trajectoryEditEnabled,
      selectedTrajectoryBall: parameters.selectedTrajectoryBall ?? baseState.selectedTrajectoryBall,
      trajectoryOverrides: parameters.trajectoryOverrides ?? baseState.trajectoryOverrides,
      colorChangeMode: parameters.colorChangeMode,
      colorChangeColor: parameters.colorChangeColor,
      launcherColor: parameters.launcherColor,
      targetColor: parameters.targetColor,
      contextColor: parameters.contextColor,
      contextTargetColor: parameters.contextTargetColor,
      groupingOriginalColor: parameters.groupingOriginalColor,
      groupingContextColor: parameters.groupingContextColor,
      pxPerDva: parameters.pxPerDva,
      fixationDva: parameters.fixationDva,
      stimulusXOffset: parameters.stimulusXOffsetPx,
      stimulusYOffset: parameters.stimulusYOffsetPx,
      soundEnabled: parameters.soundEnabled,
      soundType: parameters.soundType,
      soundVolume: parameters.soundVolume,
      outputFormat: parameters.outputFormat,
      videoBitrate: parameters.videoBitrateMbps,
      fps: parameters.fps
    };
  }

  function getConditionMovieName(baseName, condition, index, extension) {
    const order = String(index + 1).padStart(2, "0");
    return `${baseName}-${order}-${sanitizeLabel(condition.label || "condition")}.${extension}`;
  }

  function buildConditionManifest(kind, baseState, exportFormat = chooseExportFormat(baseState)) {
    const rawSet = buildConditionSet(kind, baseState);
    const baseName = `${sanitizeLabel(baseState.fileLabel)}-${sanitizeLabel(rawSet.family)}`;
    const encoded = getEncodedDimensions(exportFormat);
    const conditions = rawSet.conditions.map((condition, index) => {
      const filename = getConditionMovieName(baseName, condition, index, exportFormat.extension);
      const conditionState = stateFromConditionParameters(baseState, condition.parameters);
      const frameCount = getExportFrameCount(conditionState);
      return {
        index: index + 1,
        family: rawSet.family,
        label: condition.label,
        phase: condition.phase,
        role: condition.role,
        pairId: condition.pairId,
        prediction: condition.prediction,
        literatureAnchor: condition.literatureAnchor,
        movieFilename: filename,
        movieFile: getPsychopyMoviePath(filename),
        psychopyCsv: `${baseName}-psychopy.csv`,
        intendedDurationSec: getIntendedDurationSec(conditionState),
        movieDurationSec: Number((frameCount / conditionState.fps).toFixed(3)),
        frameCount,
        widthPx: encoded.width,
        heightPx: encoded.height,
        validationWarnings: getExperimentWarnings(conditionState),
        standards: condition.standards,
        parameters: condition.parameters
      };
    });
    return {
      generatedAt: new Date().toISOString(),
      family: rawSet.family,
      note: rawSet.note,
      sourcePreset: getConditionName(),
      requestedFormat: baseState.outputFormat,
      actualMimeType: exportFormat.mimeType,
      extension: exportFormat.extension,
      movieFolder: PSYCHOPY_STIMULI_FOLDER,
      psychopyCsv: `${baseName}-psychopy.csv`,
      instructions: "Render each listed movie, place it in stimuli/, and use the CSV as a PsychoPy loop conditions file.",
      conditions
    };
  }

  function buildConditionSetCsv(manifest) {
    const rows = manifest.conditions.map((condition) => ({
      movieFile: condition.movieFile,
      conditionIndex: condition.index,
      conditionFamily: condition.family,
      conditionLabel: condition.label,
      phase: condition.phase,
      role: condition.role,
      pairId: condition.pairId,
      prediction: condition.prediction,
      literatureAnchor: condition.literatureAnchor,
      intendedDurationSec: condition.intendedDurationSec,
      movieDurationSec: condition.movieDurationSec,
      movieFPS: condition.parameters.fps,
      frameCount: condition.frameCount,
      widthPx: condition.widthPx,
      heightPx: condition.heightPx,
      units: "pix",
      positionXPix: 0,
      positionYPix: 0,
      forceEndRoutine: "true",
      loopPlayback: "false",
      noAudio: String(!condition.parameters.soundEnabled),
      durationMs: condition.parameters.durationMs,
      leadInMs: condition.parameters.leadInMs,
      launcherSpeedPxPerSec: condition.parameters.launcherSpeedPxPerSec,
      launcherAccelerationPxPerSec2: condition.parameters.launcherAccelerationPxPerSec2,
      launcherBehavior: condition.parameters.launcherBehavior,
      targetSpeedRatio: condition.parameters.targetSpeedRatio,
      targetAccelerationPxPerSec2: condition.parameters.targetAccelerationPxPerSec2,
      targetAngleDegrees: condition.parameters.targetAngleDegrees,
      launcherVisibleMs: condition.parameters.launcherVisibleMs,
      targetVisibleMs: condition.parameters.targetVisibleMs,
      contactDelayMs: condition.parameters.contactDelayMs,
      gapPx: condition.parameters.gapPx,
      ballRadiusPx: condition.parameters.ballRadiusPx,
      overlapPercent: condition.standards.overlapPercent,
      impactMs: condition.standards.impactMs,
      targetOnsetMs: condition.standards.targetOnsetMs,
      contextMode: condition.parameters.contextMode,
      contextDurationMs: condition.parameters.contextDurationMs,
      contextOffsetMs: condition.parameters.contextOffsetMs,
      contextDirection: condition.parameters.contextDirection,
      contextSeparationPx: condition.parameters.contextYOffsetPx,
      contextBallRadiusPx: condition.parameters.contextBallRadiusPx,
      contextLauncherBehavior: condition.parameters.contextLauncherBehavior,
      contextGapPx: condition.parameters.contextGapPx,
      contextOccluderEnabled: condition.parameters.contextOccluderEnabled,
      contextOccluderWidthPx: condition.parameters.contextOccluderWidthPx,
      contextLauncherVisibleMs: condition.parameters.contextLauncherVisibleMs,
      contextTargetVisibleMs: condition.parameters.contextTargetVisibleMs,
      renderMode: condition.parameters.renderMode,
      stageTheme: condition.parameters.stageTheme,
      stageColor: condition.parameters.stageColor,
      groupingMode: condition.parameters.groupingMode,
      contactGuideMode: condition.parameters.contactGuideMode,
      validationWarnings: condition.validationWarnings.join(" | ")
    }));
    if (rows.length === 0) {
      return "";
    }
    const columns = Object.keys(rows[0]);
    return `${columns.join(",")}\n${rows
      .map((row) => columns.map((column) => csvCell(row[column])).join(","))
      .join("\n")}\n`;
  }

  function exportConditionSetJson() {
    const state = cloneState();
    const exportFormat = chooseExportFormat(state);
    const manifest = buildConditionManifest(conditionSetSelect.value, state, exportFormat);
    setConditionJsonDownload(manifest, `${sanitizeLabel(manifest.family)}-condition-set.json`);
    setConditionCsvDownload(buildConditionSetCsv(manifest), manifest.psychopyCsv);
    statusText.textContent = `${manifest.conditions.length} condition records ready.`;
  }

  function exportConditionSetCsv() {
    const state = cloneState();
    const exportFormat = chooseExportFormat(state);
    const manifest = buildConditionManifest(conditionSetSelect.value, state, exportFormat);
    setConditionCsvDownload(buildConditionSetCsv(manifest), manifest.psychopyCsv);
    setConditionJsonDownload(manifest, `${sanitizeLabel(manifest.family)}-condition-set.json`);
    statusText.textContent = `${manifest.conditions.length} PsychoPy rows ready.`;
  }

  function describeExportReview(warnings, exportFormat) {
    const notes = [];
    if (warnings.length > 0) {
      notes.push(warnings.length === 1 ? "read note above" : `read ${warnings.length} notes above`);
    }
    if (exportFormat.usedFallback) {
      notes.push("format changed");
    }
    return notes.length === 0 ? "no notes" : notes.join("; ");
  }

  function updateArtifactChecklist(state, filename, exportFormat) {
    if (!artifactChecklist) {
      return;
    }
    const warnings = getExperimentWarnings(state);
    artifactChecklist.classList.remove("hidden");
    if (artifactFilename) {
      artifactFilename.textContent = filename;
    }
    if (artifactCsvStatus) {
      artifactCsvStatus.textContent = "ready";
    }
    if (artifactWarnings) {
      artifactWarnings.textContent = describeExportReview(warnings, exportFormat);
    }
  }

  function exportPsychopyCsv() {
    const state = cloneState();
    const exportFormat = chooseExportFormat(state);
    const filename = getExportMovieFilename(state, exportFormat.extension);
    setPsychopyDownload(buildPsychopyCsv(state, filename, exportFormat), getPsychopyCsvName(filename));
    statusText.textContent = "PsychoPy CSV ready.";
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
        launcherVisibleMs: condition.launcherVisibleMs,
        targetVisibleMs: condition.targetVisibleMs,
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
        contextBallRadiusPx: condition.contextBallRadius,
        contextLeadInMs: condition.contextLeadInMs,
        contextLauncherSpeedPxPerSec: condition.contextLauncherSpeed,
        contextLauncherAccelerationPxPerSec2: condition.contextLauncherAccel,
        contextLauncherBehavior: condition.contextLauncherBehavior,
        contextDelayMs: condition.contextDelayMs,
        contextGapPx: condition.contextGapPx,
        contextContactOcclusionMode: condition.contextContactOcclusionMode,
        contextOccluderEnabled: condition.contextOccluderEnabled,
        contextOccluderWidthPx: condition.contextOccluderWidth,
        contextTargetSpeedRatio: condition.contextTargetSpeedRatio,
        contextTargetAccelerationPxPerSec2: condition.contextTargetAccel,
        contextTargetAngleDegrees: condition.contextTargetAngle,
        contextLauncherVisibleMs: condition.contextLauncherVisibleMs,
        contextTargetVisibleMs: condition.contextTargetVisibleMs,
        renderMode: condition.renderMode,
        stageTheme: condition.stageTheme,
        stageColor: condition.stageColor,
        objectStyle: condition.objectStyle,
        groupingMode: condition.groupingMode,
        contactGuideMode: condition.contactGuideMode,
        trajectoryEditEnabled: condition.trajectoryEditEnabled,
        selectedTrajectoryBall: condition.selectedTrajectoryBall,
        trajectoryOverrides: condition.trajectoryOverrides,
        customStartEnabled: condition.customStartEnabled,
        customStartKeepRowsHorizontal: condition.customStartKeepRowsHorizontal,
        customStartAlignStartsVertical: condition.customStartAlignStartsVertical,
        colorChangeMode: condition.colorChangeMode,
        colorChangeColor: condition.colorChangeColor,
        launcherColor: condition.launcherColor,
        targetColor: condition.targetColor,
        contextColor: condition.contextColor,
        contextTargetColor: condition.contextTargetColor,
        groupingOriginalColor: condition.groupingOriginalColor,
        groupingContextColor: condition.groupingContextColor,
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
      stageColor: baseState.stageColor,
      contextDurationMs: 750,
      contextOffsetMs: 0,
      contextDirection: "same",
      contextBallRadius: baseState.contextBallRadius ?? baseState.ballRadius,
      markerMode: "none",
      occluderEnabled: false,
      contextOccluderEnabled: false,
      launcherAccel: 0,
      targetAccel: 0,
      contactOcclusionMode: "target-front",
      contextContactOcclusionMode: "target-front",
      customStartEnabled: false,
      customStartKeepRowsHorizontal: false,
      customStartAlignStartsVertical: false,
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
      const contexts = [
        { contextMode: "none", label: "no-context" },
        { contextMode: "single", label: "single-object-context" },
        { contextMode: "launch", label: "launch-context" },
        { contextMode: "launch", contextLauncherBehavior: "continue", label: "continuous-context" }
      ];
      return {
        family: "Scholl/Nakayama context types",
        note: "Full-overlap test event paired with no context, single-object motion, continuous two-object motion, or a synchronized launch context.",
        conditions: contexts.map((context) =>
          withCondition(base, {
            label: `full-overlap-${context.label}`,
            gapPx: -base.ballRadius * 2,
            launcherBehavior: "stop",
            targetSpeedRatio: 1,
            delayMs: 0,
            contextMode: context.contextMode,
            contextLauncherBehavior: context.contextLauncherBehavior || base.contextLauncherBehavior,
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
        {
          contextMode: "launch",
          contextLauncherBehavior: "continue",
          label: "continuous-context",
          role: "capture-negative-context"
        }
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
                  context.contextLauncherBehavior === "continue"
                    ? "Continuous context should decrease launch reports relative to no-context trials."
                    : context.contextMode === "launch"
                    ? "Launch context should increase launch reports even when the local ambiguous event is adapted."
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
                contextLauncherBehavior: context.contextLauncherBehavior || base.contextLauncherBehavior,
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
    const exportSize = getExportCanvasSize(state);
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = exportSize.width;
    exportCanvas.height = exportSize.height;
    const exportCtx = exportCanvas.getContext("2d");
    const aspectScratchCanvas = state.aspectRatio === "16:9" ? null : document.createElement("canvas");
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
        const impactTime = getPreBallBlinkMs(state) + geometry.stopTime;
        if (impactTime < state.durationMs) {
          scheduleImpactSound(
            exportAudioContext,
            state,
            audioDestination,
            exportAudioContext.currentTime + impactTime / 1000
          );
        }
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
    const totalFrames = getExportFrameCount(state);
    const exportStartTime = performance.now();
    for (let frame = 0; frame < totalFrames; frame += 1) {
      const time = Math.min(frame * frameDuration, state.durationMs);
      drawExportFrame(state, time, exportCtx, exportCanvas, aspectScratchCanvas);
      statusText.textContent = `Exporting frame ${frame + 1} of ${totalFrames}…`;
      const nextFrameTime = exportStartTime + (frame + 1) * frameDuration;
      await new Promise((resolve) => window.setTimeout(resolve, Math.max(0, nextFrameTime - performance.now())));
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

    const filename = getExportMovieFilename(state, exportFormat.extension);
    const psychopyFilename = getPsychopyCsvName(filename);
    downloadLink.href = currentObjectUrl;
    downloadLink.download = filename;
    downloadLink.textContent = "Download video";
    downloadLink.title = filename;
    downloadLink.classList.remove("hidden");
    setPsychopyDownload(buildPsychopyCsv(state, filename, exportFormat), psychopyFilename);
    updateArtifactChecklist(state, filename, exportFormat);

    exportedVideo.src = currentObjectUrl;
    videoPanel.classList.remove("hidden");
    exportMeta.textContent = `${Math.round(getExportDurationSec(state) * 1000)} ms - ${state.fps} fps - ${
      exportFormat.width
    }x${exportFormat.height} - ${
      exportFormat.extension.toUpperCase()
    } - ${mimeType}`;
    statusText.textContent = "Export ready.";

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
    choiceControlButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const control = document.getElementById(button.dataset.choiceFor);
        applyChoiceControl(control, button.dataset.choiceValue);
      });
    });
    contextModeButtons.forEach((button) => {
      button.addEventListener("click", () => applyContextChoice(controls.contextMode, button.dataset.contextMode));
    });
    contextDirectionButtons.forEach((button) => {
      button.addEventListener("click", () => applyContextChoice(controls.contextDirection, button.dataset.contextDirection));
    });

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
          syncContextControlVisibility();
          syncContextPairSnapshots();
          renderContextPairEditors();
          lastContextPairCount = Math.max(1, getContextPairCount(cloneState()) || 1);
          syncTrajectoryControlVisibility();
          enforceCustomStartConstraints();
          updateOutputs();
          refreshText();
          statusText.textContent = "Ready.";
          drawFrame(cloneState(), 0, ctx);
        });
        return;
      }
      if (id === "contextPairCount") {
        control.addEventListener("input", () => {
          activePresetKey = null;
          const nextPairCount = Math.max(1, getContextPairCount(cloneState()) || 1);
          applyAutoContextPairRadii(lastContextPairCount, nextPairCount);
          syncContextPairSnapshots();
          renderContextPairEditors();
          lastContextPairCount = nextPairCount;
          syncTrajectoryControlVisibility();
          updateOutputs();
          refreshText();
          statusText.textContent = "Context pair count updated.";
          drawFrame(cloneState(), 0, ctx);
        });
        return;
      }
      if (id === "railEnabled") {
        control.addEventListener("change", () => {
          activePresetKey = null;
          if (control.checked) {
            initializeRailEndpoints(true);
            syncRailSegments();
          }
          syncRailControlVisibility();
          syncSpecialDragUi();
          updateOutputs();
          refreshText();
          statusText.textContent = "Ready.";
          drawFrame(cloneState(), 0, ctx);
        });
        return;
      }
      if (id === "railCount") {
        control.addEventListener("input", () => {
          activePresetKey = null;
          syncRailSegments();
          updateOutputs();
          refreshText();
          statusText.textContent = "Rail count updated.";
          drawFrame(cloneState(), 0, ctx);
        });
        return;
      }
      if (id === "crosshairEnabled") {
        control.addEventListener("change", () => {
          activePresetKey = null;
          syncCrosshairControlVisibility();
          syncSpecialDragUi();
          updateOutputs();
          refreshText();
          statusText.textContent = "Ready.";
          drawFrame(cloneState(), 0, ctx);
        });
        return;
      }
      if (id === "crosshairBlinkEnabled") {
        control.addEventListener("change", () => {
          activePresetKey = null;
          if (control.checked) {
            controls.crosshairEnabled.checked = true;
          }
          syncCrosshairControlVisibility();
          syncSpecialDragUi();
          updateOutputs();
          refreshText();
          statusText.textContent = "Ready.";
          drawFrame(cloneState(), 0, ctx);
        });
        return;
      }
      if (id === "trajectoryEditEnabled") {
        control.addEventListener("change", () => {
          activePresetKey = null;
          syncTrajectoryControlVisibility();
          syncSpecialDragUi();
          updateOutputs();
          refreshText();
          statusText.textContent = control.checked ? "Click a ball or trajectory in the preview." : "Ready.";
          drawFrame(cloneState(), 0, ctx);
        });
        return;
      }
      if (id === "selectedTrajectoryAngle") {
        control.addEventListener("input", () => {
          activePresetKey = null;
          const state = cloneState();
          if (!getTrajectoryTargets(state).some((target) => target.id === controls.selectedTrajectoryBall.value)) {
            ensureSelectedTrajectoryTarget(state);
          }
          writeTrajectoryOverride(controls.selectedTrajectoryBall.value, control.value);
          updateOutputs();
          refreshText();
          statusText.textContent = `${getTrajectoryTargetLabel(controls.selectedTrajectoryBall.value)} trajectory updated.`;
          drawFrame(cloneState(), 0, ctx);
        });
        return;
      }
      if (id === "customStartEnabled") {
        control.addEventListener("change", () => {
          activePresetKey = null;
          if (control.checked) {
            controls.customStartKeepRowsHorizontal.checked = true;
            controls.customStartAlignStartsVertical.checked = true;
            initializeCustomStartPositions();
            enforceCustomStartConstraints();
          } else {
            resetCustomStartPositionsToAutomatic();
          }
          syncStartDragUi();
          updateOutputs();
          refreshText();
          statusText.textContent = control.checked ? "Drag start positions on." : "Ready.";
          drawFrame(cloneState(), 0, ctx);
        });
        return;
      }
      if (id === "customStartKeepRowsHorizontal" || id === "customStartAlignStartsVertical") {
        control.addEventListener("change", () => {
          activePresetKey = null;
          if (controls.customStartEnabled.checked) {
            initializeCustomStartPositions();
            enforceCustomStartConstraints();
          }
          updateOutputs();
          refreshText();
          statusText.textContent = "Ready.";
          drawFrame(cloneState(), 0, ctx);
        });
        return;
      }
      if (
        id.endsWith("StartX") ||
        id.endsWith("StartY") ||
        id === "contextPairSnapshots" ||
        id === "selectedTrajectoryBall" ||
        id === "trajectoryOverrides" ||
        ["crosshairX", "crosshairY", "railStartX", "railStartY", "railEndX", "railEndY", "railSegments"].includes(id)
      ) {
        return;
      }
      if (id === "presetSelect") {
        return;
      }
      if (
        [
          "renderMode",
          "stageTheme",
          "stageColor",
          "objectStyle",
          "groupingMode",
          "contactGuideMode",
          "crosshairBlinkMs",
          "crosshairColor",
          "colorChangeMode",
          "colorChangeColor",
          "launcherColor",
          "targetColor",
          "contextColor",
          "contextTargetColor",
          "groupingOriginalColor",
          "groupingContextColor",
          "pxPerDva",
          "fixationDva",
          "stimulusXOffset",
          "stimulusYOffset",
          "soundEnabled",
          "soundType",
          "soundVolume",
          "outputFormat",
          "aspectRatio",
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
      if (presetSummary) {
        presetSummary.textContent = preset.summary;
      }
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
    exportPresetButton?.addEventListener("click", exportCurrentPresetJson);
    exportButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      exportVideo();
    });
    downloadLink.addEventListener("click", (event) => {
      event.stopPropagation();
    });
    psychopyButton.addEventListener("click", exportPsychopyCsv);
    conditionJsonButton?.addEventListener("click", exportConditionSetJson);
    conditionCsvButton?.addEventListener("click", exportConditionSetCsv);

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
    syncAllChoiceControlButtons();
  }

  loadHiddenBuiltInPresets();
  await loadSharedPresets();
  loadCustomPresets();
  populatePresetMenu();
  initializeRanges();
  enhanceRangePrecision();
  bindParameterHelp();
  bindControls();
  bindContextPairEditors();
  bindStartDragging();
  applyPreset(getVisiblePrimaryPresetKeys()[0] || customPresetKeys[0] || "canonical");
})();
