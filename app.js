(async function () {
  /*
   * Maintainer map
   * 1. DOM/control registry: every adjustable HTML control is listed in controlIds.
   * 2. Presets/defaults: built-ins are partial parameter records merged in applyPreset().
   * 3. State serialization: cloneState() is the canonical in-memory stimulus object.
   * 4. Context pairs: Context 1 uses normal controls; Context 2+ use JSON snapshots.
   * 5. Motion model: getGeometry() and event-state helpers turn parameters into positions.
   * 6. Drawing: drawFrame() is the one render entry point for preview and export.
   * 7. Export/PsychoPy: CSV/JSON schemas are the durable record of stimulus settings.
   * 8. Condition sets: buildConditionSet() exports experiment plans, not rendered videos.
   */
  const canvas = document.getElementById("stage");
  const ctx = canvas.getContext("2d");
  const STAGE_WIDTH = 960;
  const STAGE_HEIGHT = 540;
  const MAX_PREVIEW_PIXEL_RATIO = 3;
  const DEFAULT_EXPORT_HEIGHT_PX = STAGE_HEIGHT * 2;
  const MIN_EXPORT_HEIGHT_PX = 360;
  const MAX_EXPORT_HEIGHT_PX = 2160;
  const MAX_EXPORT_BASENAME_LENGTH = 180;
  const CONTEXT_PAIR_MAX = 10;
  const RAIL_MAX = 6;
  const MANUAL_GROUPING_RECT_MIN_SIZE = 24;
  const MANUAL_GROUPING_RECT_MAX = 12;
  const PHYSICS_ENGINE = {
    restitution: 0.9,
    baseRadius: 28,
    baseDamping: 260,
    massPower: 2,
    stopThreshold: 0.075
  };
  const TUNNEL_BASE_RADIUS = 28;
  const TUNNEL_HEIGHT_RATIO = 3.8;
  const TUNNEL_ROW_CLEARANCE = 8;
  const PSYCHOPY_STIMULI_FOLDER = "stimuli";
  const READY_STATUS = "Ready to export current preview.";
  const CUSTOM_PRESETS_STORAGE_KEY = "causal-launching-custom-presets-v1";
  const HIDDEN_BUILT_IN_PRESETS_STORAGE_KEY = "causal-launching-hidden-built-ins-v1";
  const SHARED_PRESETS_URL = "shared-presets.json";
  const CLASSIC_LAUNCHER_COLOR = "#ff2f2f";
  const CLASSIC_TARGET_COLOR = "#27c76f";
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
  const physicsModeButton = document.getElementById("physicsModeButton");
  const conditionSetSelect = document.getElementById("conditionSetSelect");
  const conditionJsonButton = document.getElementById("conditionJsonButton");
  const conditionCsvButton = document.getElementById("conditionCsvButton");
  const downloadLink = document.getElementById("downloadLink");
  const psychopyLink = document.getElementById("psychopyLink");
  const metadataJsonLink = document.getElementById("metadataJsonLink");
  const conditionJsonLink = document.getElementById("conditionJsonLink");
  const conditionCsvLink = document.getElementById("conditionCsvLink");
  const presetJsonLink = document.getElementById("presetJsonLink");
  const compatibilityNotice = document.getElementById("compatibilityNotice");
  const statusText = document.getElementById("statusText");
  const stageOverlay = document.querySelector(".stage-overlay");
  const scenarioBadge = document.getElementById("scenarioBadge");
  const timingBadge = document.getElementById("timingBadge");
  const previewTimerBadge = document.getElementById("previewTimerBadge");
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
  const summaryResolution = document.getElementById("summaryResolution");
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
  const feedbackToggle = document.getElementById("feedbackToggle");
  const feedbackPanel = document.getElementById("feedbackPanel");
  const feedbackMessage = document.getElementById("feedbackMessage");
  const feedbackMailLink = document.getElementById("feedbackMailLink");
  const relationMetric = document.getElementById("relationMetric");
  const categoryMetric = document.getElementById("categoryMetric");
  const captureMetric = document.getElementById("captureMetric");
  const timingMetric = document.getElementById("timingMetric");
  const contextMovementPairList = document.getElementById("contextMovementPairList");
  const contextPositionPairList = document.getElementById("contextPositionPairList");
  const contextColorPairList = document.getElementById("contextColorPairList");
  const fractureTargetList = document.getElementById("fractureTargetList");
  const groupingEnabledControl = document.getElementById("groupingEnabled");
  const addGroupingRectButton = document.getElementById("addGroupingRectButton");
  const clearGroupingRectsButton = document.getElementById("clearGroupingRectsButton");

  /*
   * Parameter propagation rule
   * A new adjustable setting normally needs: an HTML id, an entry here, a default
   * below, a cloneState() field, tooltip copy in parameterHelp, rendering or
   * export use, and CSV/metadata fields if it matters for an experiment record.
   */
  const controlIds = [
    "durationMs",
    "leadInMs",
    "launcherSpeed",
    "launcherAccel",
    "targetSpeedRatio",
    "targetAccel",
    "launcherBehavior",
    "targetAngle",
    "targetTravelMode",
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
    "contextTargetTravelMode",
    "contextLauncherVisibleMs",
    "contextTargetVisibleMs",
    "renderMode",
    "stageTheme",
    "stageColor",
    "objectStyle",
    "groupingMode",
    "manualGroupingRects",
    "contactGuideMode",
    "physicsEngineEnabled",
    "fractureEnabled",
    "contextFractureEnabled",
    "fractureTargets",
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
    "textBoxEnabled",
    "textBoxText",
    "textBoxColor",
    "textBoxSize",
    "textBoxX",
    "textBoxY",
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
    "exportHeightPx",
    "fps",
    "videoBitrate",
    "fileLabel"
  ];

  // User-facing tooltip copy. Keep it plain: what changes, not implementation detail.
  const parameterHelp = {
    presetSelect: "Changes: loads a prepared case or saved preset. Use for: starting from a known condition instead of rebuilding settings by hand.",
    presetNameInput: "Changes: the name used when saving the current settings. Browser saves are local; shared presets must be added to shared-presets.json.",
    durationMs: "Changes: total video duration for preview and export. Increase it to let moving balls travel completely offscreen.",
    leadInMs: "Changes: still time before O1 moves. Use for: giving viewers a stable start frame before motion begins.",
    launcherSpeed: "Changes: speed of O1 before contact. Use for: making the approach slower, sharper, or more forceful-looking.",
    launcherAccel: "Changes: whether O1 speeds up or slows down before contact. Positive means speeding up; negative means slowing down.",
    targetSpeedRatio: "Changes: O2 outgoing speed as a multiple of O1 impact speed. Use for: 1.00 matched launch, below 1.00 slower launch, above 1.00 trigger-like motion.",
    targetAccel: "Changes: whether O2 speeds up or slows down after it starts moving. Use for: testing post-contact motion dynamics.",
    launcherBehavior: "Changes: what O1 does after contact. Stop gives classic launching; continue gives pass/slip; entrain makes both objects move together.",
    targetAngle: "Changes: direction of O2 motion after contact. Use for: straight launch versus angled launch.",
    targetTravelMode:
      "Changes: whether O2 keeps moving until it can leave the frame, or parks at the screen edge. O2 on-screen still controls when O2 disappears.",
    launcherVisibleMs:
      "Changes: how long O1 stays visible after the video starts. Longer than Video duration means it stays visible until the clip ends or moves offscreen. Shorter than Video duration makes it disappear on screen at that time.",
    targetVisibleMs:
      "Changes: how long O2 stays visible after O2 starts moving. O2 is still visible before contact. Longer than the remaining clip means it stays visible until the clip ends or moves offscreen.",
    delayMs: "Changes: time between contact and O2 motion. Short delays look more directly causal; long delays look less like immediate launching.",
    gapPx: "Changes: center spacing at closest approach. Negative values mean overlap; 0 means the borders just touch; positive values leave a visible spatial gap.",
    markerMode:
      "Changes: optional cue drawn only when Overlap / Gap is a positive gap. Use for: testing whether a bridge or boundary marker changes responses to gap displays.",
    ballRadius: "Changes: object size. When many context pairs are shown, all pairs auto-shrink so the rows fit vertically.",
    contextBallRadius: "Changes: Context 1 object size. Added context pairs copy this size, then auto-shrink together at high pair counts.",
    occluderEnabled: "Changes: adds a tunnel over the contact region. Use for: hidden-contact or pass-behind-occluder displays.",
    occluderWidth:
      "Changes: tunnel width. The rendered tunnel scales with ball size and shrinks further when rows are close, preventing tunnel overlap.",
    contactOcclusionMode: "Changes: which object is painted on top during overlap. O2 puts O2 on top; O1 puts O1 on top.",
    contextMode:
      "Changes: whether added context pairs are shown. Nearby launch uses two objects; Single object uses one moving object. Pass-like context can be made with After contact = Continues.",
    contextPairCount:
      "Changes: how many context pairs are drawn, up to 10. New pairs copy the original pair when added; high counts shrink and space all pairs to fit vertically.",
    contextDurationMs: "Changes: how long the context event is visible. Use for: showing the full context event, or only a short duration around impact.",
    contextOffsetMs: "Changes: context timing relative to the original pair event. Use for: 0 ms means simultaneous contact; negative means context earlier; positive means context later.",
    contextDirection: "Changes: context motion direction. Same matches the original pair event; opposite mirrors it.",
    contextYOffset: "Changes: vertical distance between original pair and context rows. Use for: separating the rows or preventing box overlap.",
    contextLeadInMs: "Changes: still time before the context object moves. Use for: shifting context approach timing without changing the original pair event.",
    contextLauncherSpeed: "Changes: speed of context O1. Use for: matching the original pair event or making the context more/less forceful.",
    contextLauncherAccel: "Changes: whether context O1 speeds up or slows down before contact.",
    contextLauncherBehavior: "Changes: what context O1 does after contact. Stop is launch-like; continue is pass-like; entrain makes both context objects move together.",
    contextDelayMs: "Changes: delay between context contact and context O2 motion. Use for: strong immediate context versus weaker delayed context.",
    contextGapPx: "Changes: context-row spacing at closest approach. Negative means overlap; 0 means the context borders just touch; positive leaves a context gap.",
    contextContactOcclusionMode: "Changes: which context-row object is painted on top during overlap. O2 puts the second context object on top; O1 puts the first context object on top.",
    contextOccluderEnabled: "Changes: adds a tunnel over the context row only. Use for: hidden-contact context displays without hiding the original pair event.",
    contextOccluderWidth:
      "Changes: context tunnel width. The rendered tunnel scales with that row's ball size and row spacing, so dense context displays stay proportional.",
    contextTargetSpeedRatio: "Changes: context O2 speed as a multiple of context O1 impact speed. Use for: matching the original pair launch or making the context faster/slower.",
    contextTargetAccel: "Changes: whether context O2 speeds up or slows down after it starts moving.",
    contextTargetAngle: "Changes: direction of context O2 motion. Use for: matching or mismatching the original pair event direction.",
    contextTargetTravelMode:
      "Changes: whether context O2 keeps moving until it can leave the frame, or parks at the screen edge. Context O2 on-screen still controls when it disappears.",
    contextLauncherVisibleMs:
      "Changes: how long context O1 stays visible after the context event starts. Longer than Video duration means it stays visible until the clip ends or moves offscreen. Shorter than Video duration makes it disappear on screen at that context time.",
    contextTargetVisibleMs:
      "Changes: how long context O2 stays visible after the context event starts. Longer than Video duration means it stays visible until the clip ends or moves offscreen. Shorter than Video duration makes it disappear on screen at that context time.",
    renderMode: "Changes: what appears in preview/export. Clean stimulus is for participant videos; lab preview shows design aids; fixation adds a fixation mark.",
    stageTheme: "Changes: preset background luminance and sets the background color picker.",
    stageColor: "Changes: exact stimulus-field color. Causal-capture displays commonly use bright colored discs on a black field.",
    objectStyle: "Changes: visual rendering of the balls. Simple filled discs are the most controlled; shaded or ring styles are for display variants.",
    groupingEnabled:
      "Changes: turns visible grouping boxes on. The app automatically boxes the original pair and Context 1 if context is shown.",
    groupingMode:
      "Changes: internal grouping state kept for saved presets. New UI uses a simple on/off grouping toggle.",
    manualGroupingRects:
      "Changes: extra grouping rectangles drawn in preview and export. Use Add rectangle, then drag borders or corners in the preview.",
    contactGuideMode: "Changes: vertical contact guide lines. Use for: checking alignment while designing; turn off for final stimuli unless it is part of the condition.",
    fractureEnabled:
      "Turns the crack cue on. With context pairs, Special features shows per-object O1/O2 switches so each pair can fracture independently.",
    contextFractureEnabled: "Legacy Context 1 O2 fracture value, kept for older presets and exported records.",
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
      "Changes: shows draggable vector arrows in the preview. Drag an arrow head to set that ball's trajectory; use Angle for exact numeric entry.",
    selectedTrajectoryAngle:
      "Changes: angle of the selected trajectory vector. Dragging a preview arrow updates this value; 0 follows the default path.",
    textBoxEnabled: "Changes: adds a simple text label to preview and export.",
    textBoxText: "Changes: the text drawn in the stimulus field.",
    textBoxColor: "Changes: text and box line color.",
    textBoxSize: "Changes: text size in pixels.",
    textBoxX: "Changes: horizontal position of the text box.",
    textBoxY: "Changes: vertical position of the text box.",
    customStartEnabled: "Changes: enables drag editing in the preview. Use for: placing O1 and O2 start positions manually; exports use the positions but hide the rings.",
    customStartKeepRowsHorizontal: "Changes: keeps each event row level while dragging. Use for: O1 and O2 share one y-position within each pair.",
    customStartAlignStartsVertical: "Changes: keeps O1 starts on one vertical line when context is shown.",
    colorChangeMode: "Changes: whether a ball changes color exactly at contact. Use for: testing whether a feature change affects the launch impression.",
    colorChangeColor: "Changes: the new color used by sudden color change. Use for: setting the contact-locked feature change.",
    launcherColor: "Changes: color of original-pair O1. Default follows the common red/green research display.",
    targetColor: "Changes: color of original-pair O2. Default follows the common red/green research display.",
    contextColor: "Changes: color of context O1. Use for: matching or separating context from the original pair row.",
    contextTargetColor: "Changes: color of context O2. Use for: context object identity.",
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
    exportHeightPx:
      "Changes: exported movie height in pixels. Width is calculated from Aspect ratio, so 16:9 at 1080 px becomes 1920 x 1080.",
    fps: "Changes: the frame rate written into the exported movie and the saved PsychoPy CSV. The browser preview is close, but the exported file is the source of truth for timing checks.",
    videoBitrate: "Changes: compression quality for the exported movie. Higher values preserve cleaner disc edges and grouping lines, at the cost of larger stimulus files.",
    fileLabel: "Changes: the base filename. Exports add timing, speed, gap, context, and month/day tags automatically.",
    conditionSetSelect: "Changes: which multi-condition manifest is exported for later batch stimulus generation and PsychoPy condition-table setup."
  };

  /*
   * Presets are partial overrides, not full states.
   * applyPreset() merges these values with stimulusDefaults and
   * presentationDefaults. Shared lab presets live in shared-presets.json;
   * "Save local" writes browser-only localStorage presets.
   */
  const presets = {
    canonical: {
      label: "Clear launch (0% overlap)",
      summary:
        "Canonical Michotte launch: contact, no delay, O1 stops, and O2 leaves at matched speed.",
      note:
        "Use this as the clear-launch comparison. Slower, delayed, displaced, or gapped cases should be treated as manipulations.",
      literature:
        "Michotte's standard launching display has direct contact, no interval, the first object stopping, and the second object immediately moving in the same direction.",
      values: {
        durationMs: 1200,
        leadInMs: 200,
        launcherSpeed: 876,
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
        "Delay O2 after contact to weaken the causal impression while keeping the rest of the event canonical.",
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
        "Stop O1 short of O2. Gap displays often weaken causal appearance, though speed and wording matter.",
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
        "O2 moves faster than O1 after contact, producing a triggering-style causal event.",
      note:
        "Kominsky and Scholl treat triggering as launching-like for adaptation transfer, unlike entraining.",
      literature:
        "Triggering displays keep the contact structure but make O2 move faster than O1.",
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
        "O1 continues with O2 after contact, producing the push/entrain event family.",
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
    targetTravelMode: "continue",
    contextPairCount: 1,
    contextPairSnapshots: "[]",
    contextDurationMs: 750,
    contextLeadInMs: controlDefaults.leadInMs,
    contextBallRadius: controlDefaults.ballRadius,
    contextLauncherSpeed: controlDefaults.launcherSpeed,
    contextLauncherAccel: 0,
    contextLauncherBehavior: controlDefaults.launcherBehavior,
    contextDelayMs: controlDefaults.delayMs,
    contextGapPx: controlDefaults.gapPx,
    contextContactOcclusionMode: "target-front",
    contextOccluderEnabled: false,
    contextOccluderWidth: 150,
    contextTargetSpeedRatio: controlDefaults.targetSpeedRatio,
    contextTargetAccel: 0,
    contextTargetAngle: controlDefaults.targetAngle,
    contextTargetTravelMode: "continue",
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
    manualGroupingRects: "[]",
    contactGuideMode: "none",
    physicsEngineEnabled: false,
    fractureEnabled: false,
    contextFractureEnabled: false,
    fractureTargets: "{}",
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
    textBoxEnabled: false,
    textBoxText: "Label",
    textBoxColor: "#fffaf0",
    textBoxSize: 24,
    textBoxX: 36,
    textBoxY: 504,
    colorChangeMode: "none",
    colorChangeColor: "#e0b24a",
    launcherColor: CLASSIC_LAUNCHER_COLOR,
    targetColor: CLASSIC_TARGET_COLOR,
    contextColor: CLASSIC_LAUNCHER_COLOR,
    contextTargetColor: CLASSIC_TARGET_COLOR,
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
    exportHeightPx: DEFAULT_EXPORT_HEIGHT_PX,
    videoBitrate: 8
  };
  const controls = {};

  controlIds.forEach((id) => {
    controls[id] = document.getElementById(id);
  });
  document.querySelectorAll("[data-default-collapsed]").forEach((panel) => {
    panel.open = false;
  });
  const contextDependentControls = Array.from(document.querySelectorAll(".context-dependent-control"));
  const customStartDependentControls = Array.from(document.querySelectorAll(".custom-start-dependent-control"));
  const railDependentControls = Array.from(document.querySelectorAll(".rail-dependent-control"));
  const crosshairDependentControls = Array.from(document.querySelectorAll(".crosshair-dependent-control"));
  const trajectoryDependentControls = Array.from(document.querySelectorAll(".trajectory-dependent-control"));
  const textBoxDependentControls = Array.from(document.querySelectorAll(".text-box-dependent-control"));
  const groupingDependentControls = Array.from(document.querySelectorAll(".grouping-dependent-control"));
  const contextModeButtons = Array.from(document.querySelectorAll("[data-context-mode]"));
  const contextDirectionButtons = Array.from(document.querySelectorAll("[data-context-direction]"));
  const choiceControlButtons = Array.from(document.querySelectorAll("[data-choice-for]"));
  let activePresetKey = "canonical";
  let selectedPresetKey = "canonical";
  let currentObjectUrl = null;
  let currentPsychopyUrl = null;
  let currentMetadataJsonUrl = null;
  let currentConditionJsonUrl = null;
  let currentConditionCsvUrl = null;
  let currentPresetJsonUrl = null;
  let lastExportSignature = null;
  let previewHandle = null;
  let previewFallbackTimer = null;
  let impactSoundTimer = null;
  let sharedAudioContext = null;
  let parameterTooltip = null;
  let previewStart = 0;
  let isExporting = false;
  let startDragTarget = null;
  let specialDragTarget = null;
  let trajectoryDragTarget = null;
  let groupingRectDragTarget = null;
  let customStartPositionsInitialized = false;
  let sharedPresetKeys = [];
  let customPresetKeys = [];
  let hiddenBuiltInPresetKeys = [];
  let lastContextPairCount = 1;
  let lastGeneratedMovieFilename = null;
  let lastGeneratedExportDetails = null;

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
    return value === "launcher-front" ? value : "target-front";
  }

  function normalizeTargetTravelMode(value) {
    return value === "park" ? "park" : "continue";
  }

  function normalizeGroupingMode(value) {
    return value === "none" ? "none" : "both";
  }

  function parseManualGroupingRects(value) {
    if (!value) {
      return [];
    }
    try {
      const parsed = typeof value === "string" ? JSON.parse(value) : value;
      return Array.isArray(parsed) ? parsed.filter((rect) => rect && typeof rect === "object") : [];
    } catch {
      return [];
    }
  }

  function normalizeManualGroupingRect(rect, state = null, index = 0) {
    const fallbackColor =
      index === 0 ? state?.groupingOriginalColor || "#e0b24a" : state?.groupingContextColor || "#80a7a1";
    const rawWidth = Number(rect.width);
    const rawHeight = Number(rect.height);
    const rawX = Number(rect.x);
    const rawY = Number(rect.y);
    const width = clamp(Math.abs(Number.isFinite(rawWidth) ? rawWidth : 180), MANUAL_GROUPING_RECT_MIN_SIZE, STAGE_WIDTH);
    const height = clamp(Math.abs(Number.isFinite(rawHeight) ? rawHeight : 90), MANUAL_GROUPING_RECT_MIN_SIZE, STAGE_HEIGHT);
    return {
      x: clamp(Number.isFinite(rawX) ? rawX : 80, 0, STAGE_WIDTH - width),
      y: clamp(Number.isFinite(rawY) ? rawY : 80, 0, STAGE_HEIGHT - height),
      width,
      height,
      color: normalizeHexColor(rect.color, fallbackColor)
    };
  }

  function normalizeManualGroupingRects(rects, state = null) {
    return parseManualGroupingRects(rects)
      .slice(0, MANUAL_GROUPING_RECT_MAX)
      .map((rect, index) => normalizeManualGroupingRect(rect, state, index));
  }

  function serializeManualGroupingRects(rects) {
    return JSON.stringify(
      normalizeManualGroupingRects(rects).map((rect) => ({
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        color: rect.color
      }))
    );
  }

  /*
   * Hidden JSON controls
   * contextPairSnapshots: array of Context 2+ parameter snapshots. Context 1
   * uses the ordinary context controls, so it is not stored in this array.
   * railSegments: extra rails after Rail 1, each with start/end coordinates.
   * trajectoryOverrides: object mapping target ids to degree offsets.
   */
  function parseContextPairSnapshots(value) {
    if (!value) {
      return [];
    }
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.filter((snapshot) => snapshot && typeof snapshot === "object" && !Array.isArray(snapshot))
        : [];
    } catch {
      return [];
    }
  }

  function serializeContextPairSnapshots(snapshots) {
    return JSON.stringify(
      Array.isArray(snapshots)
        ? snapshots.filter((snapshot) => snapshot && typeof snapshot === "object" && !Array.isArray(snapshot))
        : []
    );
  }

  function parseRailSegments(value) {
    if (!value) {
      return [];
    }
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.filter((segment) => segment && typeof segment === "object" && !Array.isArray(segment))
        : [];
    } catch {
      return [];
    }
  }

  function serializeRailSegments(segments) {
    return JSON.stringify(
      Array.isArray(segments)
        ? segments.filter((segment) => segment && typeof segment === "object" && !Array.isArray(segment))
        : []
    );
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

  function parseFractureTargets(value) {
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
          .filter(([key]) => /^(original|context\d+)(Launcher|Target)$/.test(key))
          .map(([key, enabled]) => [key, Boolean(enabled)])
      );
    } catch {
      return {};
    }
  }

  function serializeFractureTargets(targets) {
    return JSON.stringify(parseFractureTargets(targets));
  }

  function getHiddenJsonControlValue(key, value) {
    if (key === "contextPairSnapshots") {
      return serializeContextPairSnapshots(typeof value === "string" ? parseContextPairSnapshots(value) : value);
    }
    if (key === "railSegments") {
      return serializeRailSegments(typeof value === "string" ? parseRailSegments(value) : value);
    }
    if (key === "trajectoryOverrides") {
      return serializeTrajectoryOverrides(value);
    }
    if (key === "fractureTargets") {
      return serializeFractureTargets(value);
    }
    if (key === "manualGroupingRects") {
      return serializeManualGroupingRects(value);
    }
    return value;
  }

  function normalizeSnapshotNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function normalizeContextPairSnapshotsForState(state) {
    const pairCount = getContextPairCount(state);
    if (pairCount <= 1) {
      return [];
    }

    const snapshots = (Array.isArray(state.contextPairSnapshots) ? state.contextPairSnapshots : []).slice(0, pairCount - 1);
    while (snapshots.length < pairCount - 1) {
      snapshots.push(makeContextPairSnapshotFromOriginal(state, snapshots.length + 1));
    }

    return snapshots.map((snapshot, index) => {
      const normalized = normalizeContextPairSnapshot(snapshot, state, index + 1);
      return {
        ...normalized,
        yOffset: normalizeSnapshotNumber(normalized.yOffset, getDefaultContextPairOffset(state, index + 1)),
        ballRadius: clamp(Math.round(normalizeSnapshotNumber(normalized.ballRadius, state.contextBallRadius)), 8, 60),
        leadInMs: Math.max(0, normalizeSnapshotNumber(normalized.leadInMs, state.contextLeadInMs)),
        launcherSpeed: Math.max(0, normalizeSnapshotNumber(normalized.launcherSpeed, state.contextLauncherSpeed)),
        launcherAccel: normalizeSnapshotNumber(normalized.launcherAccel, state.contextLauncherAccel),
        launcherBehavior: ["stop", "continue", "entrain"].includes(normalized.launcherBehavior)
          ? normalized.launcherBehavior
          : state.contextLauncherBehavior,
        delayMs: Math.max(0, normalizeSnapshotNumber(normalized.delayMs, state.contextDelayMs)),
        gapPx: normalizeSnapshotNumber(normalized.gapPx, state.contextGapPx),
        contactOcclusionMode: normalizeOcclusionMode(normalized.contactOcclusionMode),
        occluderEnabled: Boolean(normalized.occluderEnabled),
        occluderWidth: Math.max(0, normalizeSnapshotNumber(normalized.occluderWidth, state.contextOccluderWidth)),
        targetSpeedRatio: Math.max(0, normalizeSnapshotNumber(normalized.targetSpeedRatio, state.contextTargetSpeedRatio)),
        targetAccel: normalizeSnapshotNumber(normalized.targetAccel, state.contextTargetAccel),
        targetAngle: clamp(Math.round(normalizeSnapshotNumber(normalized.targetAngle, state.contextTargetAngle)), -90, 90),
        targetTravelMode: normalizeTargetTravelMode(normalized.targetTravelMode || state.contextTargetTravelMode),
        launcherVisibleMs: Math.max(0, normalizeSnapshotNumber(normalized.launcherVisibleMs, state.contextLauncherVisibleMs)),
        targetVisibleMs: Math.max(0, normalizeSnapshotNumber(normalized.targetVisibleMs, state.contextTargetVisibleMs)),
        launcherFractureEnabled: Boolean(normalized.launcherFractureEnabled),
        targetFractureEnabled: Boolean(normalized.targetFractureEnabled ?? normalized.fractureEnabled),
        fractureEnabled: Boolean(normalized.targetFractureEnabled ?? normalized.fractureEnabled)
      };
    });
  }

  // Canonical state snapshot used by preview, export, metadata, and condition sets.
  function cloneState() {
    const state = {
      durationMs: Number(controls.durationMs.value),
      leadInMs: Number(controls.leadInMs.value),
      launcherSpeed: Number(controls.launcherSpeed.value),
      launcherAccel: Number(controls.launcherAccel.value),
      targetSpeedRatio: Number(controls.targetSpeedRatio.value),
      targetAccel: Number(controls.targetAccel.value),
      launcherBehavior: controls.launcherBehavior.value,
      targetAngle: Number(controls.targetAngle.value),
      targetTravelMode: normalizeTargetTravelMode(controls.targetTravelMode.value),
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
      contextTargetTravelMode: normalizeTargetTravelMode(controls.contextTargetTravelMode.value),
      contextLauncherVisibleMs: Number(controls.contextLauncherVisibleMs.value),
      contextTargetVisibleMs: Number(controls.contextTargetVisibleMs.value),
      renderMode: controls.renderMode.value,
      stageTheme: controls.stageTheme.value,
      stageColor: controls.stageColor.value,
      objectStyle: controls.objectStyle.value,
      groupingMode: normalizeGroupingMode(controls.groupingMode.value),
      manualGroupingRects: parseManualGroupingRects(controls.manualGroupingRects.value),
      contactGuideMode: controls.contactGuideMode.value,
      physicsEngineEnabled: controls.physicsEngineEnabled.value === "true",
      fractureEnabled: controls.fractureEnabled.checked,
      contextFractureEnabled: controls.contextFractureEnabled.checked,
      fractureTargets: parseFractureTargets(controls.fractureTargets.value),
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
      textBoxEnabled: controls.textBoxEnabled.checked,
      textBoxText: controls.textBoxText.value,
      textBoxColor: controls.textBoxColor.value,
      textBoxSize: Number(controls.textBoxSize.value),
      textBoxX: Number(controls.textBoxX.value),
      textBoxY: Number(controls.textBoxY.value),
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
      exportHeightPx: Number(controls.exportHeightPx.value),
      fps: Number(controls.fps.value),
      videoBitrate: Number(controls.videoBitrate.value),
      fileLabel: controls.fileLabel.value.trim() || "causal-launching"
    };
    state.contextPairCount = getContextPairCount(state);
    state.contextPairSnapshots = normalizeContextPairSnapshotsForState(state);
    state.fractureTargets = normalizeFractureTargetsForState(state.fractureTargets, state);
    state.railSegments = state.railEnabled ? getRailSegments(state).slice(1) : [];
    state.trajectoryOverrides = parseTrajectoryOverrides(state.trajectoryOverrides);
    state.manualGroupingRects = normalizeManualGroupingRects(state.manualGroupingRects, state);
    return state.physicsEngineEnabled ? normalizePhysicsEngineState(state) : state;
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
      case "visibilityMs":
        return `${Math.round(number)} ms`;
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
      output.textContent = "";
      output.title = formatValue(input.dataset.format, input.value, input.id, input);
      syncFieldUnitLabel(input);
      const fineInput = input.dataset.fineControlId ? document.getElementById(input.dataset.fineControlId) : null;
      if (fineInput && document.activeElement !== fineInput) {
        fineInput.value = input.value;
      }
    });

    if ((currentObjectUrl || currentPsychopyUrl) && lastExportSignature) {
      const currentSignature = getExportSignature(cloneState());
      if (currentSignature !== lastExportSignature) {
        invalidateGeneratedExports();
      }
    }
  }

  function syncFieldUnitLabel(input) {
    if (!input || input.type !== "range") {
      return;
    }
    const unit = formatUnitHint(input.dataset.format, input.value);
    const field = input.closest(".field");
    const label = Array.from(field?.children || []).find((element) => element.tagName === "SPAN");
    if (!label) {
      return;
    }
    let unitBadge = label.querySelector(".unit-label");
    if (!unit) {
      unitBadge?.remove();
      return;
    }
    if (!unitBadge) {
      unitBadge = document.createElement("small");
      unitBadge.className = "unit-label";
      label.appendChild(unitBadge);
    }
    unitBadge.textContent = ` ${unit}`;
  }

  function enhanceRangePrecision() {
    document.querySelectorAll('input[type="range"]').forEach((range) => {
      syncFieldUnitLabel(range);
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
    return text.split(/\s+Use for:/)[0].replace(/^Changes:\s*/i, "");
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
      ["contextTargetTravelMode", "targetTravelMode"],
      ["contextLauncherVisibleMs", "launcherVisibleMs"],
      ["contextTargetVisibleMs", "targetVisibleMs"],
      ["contextFractureEnabled", "fractureEnabled"],
      ["contextColor", "launcherColor"],
      ["contextTargetColor", "targetColor"]
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

  function getEqualDensityDiscMass(radius) {
    const normalizedRadius = Math.max(1, Number(radius) || PHYSICS_ENGINE.baseRadius) / PHYSICS_ENGINE.baseRadius;
    return Math.pow(normalizedRadius, PHYSICS_ENGINE.massPower);
  }

  function getPhysicsCollisionValues(launcherRadius, targetRadius = launcherRadius) {
    const launcherMass = getEqualDensityDiscMass(launcherRadius);
    const targetMass = getEqualDensityDiscMass(targetRadius);
    const massSum = Math.max(0.001, launcherMass + targetMass);
    const restitution = PHYSICS_ENGINE.restitution;
    const launcherPostSpeedRatio = (launcherMass - restitution * targetMass) / massSum;
    const targetSpeedRatio = ((1 + restitution) * launcherMass) / massSum;
    const targetDamping = -clamp(PHYSICS_ENGINE.baseDamping / Math.max(0.1, targetMass), 40, 1500);

    return {
      launcherMass,
      targetMass,
      restitution,
      launcherPostSpeedRatio,
      targetSpeedRatio: clamp(targetSpeedRatio, 0.05, 2.5),
      targetAccel: Math.round(targetDamping)
    };
  }

  function getPhysicsControlValuesForRadius(radius) {
    const collision = getPhysicsCollisionValues(radius);
    return {
      launcherAccel: 0,
      targetSpeedRatio: Number(collision.targetSpeedRatio.toFixed(3)),
      targetAccel: collision.targetAccel,
      launcherBehavior: Math.abs(collision.launcherPostSpeedRatio) <= PHYSICS_ENGINE.stopThreshold ? "stop" : "continue",
      targetAngle: 0,
      targetTravelMode: "park",
      delayMs: 0,
      gapPx: 0,
      contactOcclusionMode: "target-front",
      occluderEnabled: false,
      markerMode: "none"
    };
  }

  function applyPhysicsToContextSnapshot(snapshot, baseState, durationMs, visibleMs) {
    const normalized = normalizeContextPairSnapshot(snapshot, baseState, 0);
    const physics = getPhysicsControlValuesForRadius(normalized.ballRadius || baseState.contextBallRadius || baseState.ballRadius);
    return {
      ...normalized,
      launcherSpeed: Math.max(Number(normalized.launcherSpeed) || baseState.launcherSpeed, 900),
      launcherAccel: physics.launcherAccel,
      targetSpeedRatio: physics.targetSpeedRatio,
      targetAccel: physics.targetAccel,
      targetTravelMode: physics.targetTravelMode,
      launcherBehavior: physics.launcherBehavior,
      targetAngle: physics.targetAngle,
      delayMs: physics.delayMs,
      gapPx: physics.gapPx,
      contactOcclusionMode: physics.contactOcclusionMode,
      occluderEnabled: false,
      launcherVisibleMs: Math.max(Number(normalized.launcherVisibleMs) || visibleMs, durationMs),
      targetVisibleMs: Math.max(Number(normalized.targetVisibleMs) || visibleMs, durationMs)
    };
  }

  function normalizePhysicsEngineState(state) {
    const originalPhysics = getPhysicsControlValuesForRadius(state.ballRadius);
    const contextPhysics = getPhysicsControlValuesForRadius(state.contextBallRadius || state.ballRadius);

    return {
      ...state,
      launcherAccel: originalPhysics.launcherAccel,
      targetSpeedRatio: originalPhysics.targetSpeedRatio,
      targetAccel: originalPhysics.targetAccel,
      targetTravelMode: originalPhysics.targetTravelMode,
      launcherBehavior: originalPhysics.launcherBehavior,
      targetAngle: originalPhysics.targetAngle,
      delayMs: originalPhysics.delayMs,
      gapPx: originalPhysics.gapPx,
      markerMode: "none",
      contactGuideMode: "none",
      occluderEnabled: false,
      contactOcclusionMode: originalPhysics.contactOcclusionMode,
      contextLauncherAccel: contextPhysics.launcherAccel,
      contextTargetSpeedRatio: contextPhysics.targetSpeedRatio,
      contextTargetAccel: contextPhysics.targetAccel,
      contextTargetTravelMode: contextPhysics.targetTravelMode,
      contextLauncherBehavior: contextPhysics.launcherBehavior,
      contextTargetAngle: contextPhysics.targetAngle,
      contextDelayMs: contextPhysics.delayMs,
      contextGapPx: contextPhysics.gapPx,
      contextOccluderEnabled: false,
      contextContactOcclusionMode: contextPhysics.contactOcclusionMode,
      trajectoryEditEnabled: false,
      trajectoryOverrides: {},
      colorChangeMode: "none",
      contextPairSnapshots: state.contextPairSnapshots.map((snapshot) => applyPhysicsToContextSnapshot(snapshot, state, 0, 0))
    };
  }

  function applyPhysicsMode() {
    const state = cloneState();
    const durationMs = Math.max(state.durationMs, 1800);
    const visibleMs = Math.max(state.launcherVisibleMs, state.targetVisibleMs, durationMs);
    const contextVisibleMs = Math.max(state.contextLauncherVisibleMs, state.contextTargetVisibleMs, durationMs);
    const originalPhysics = getPhysicsControlValuesForRadius(state.ballRadius);
    const contextPhysics = getPhysicsControlValuesForRadius(state.contextBallRadius || state.ballRadius);
    const physicsValues = {
      ...state,
      physicsEngineEnabled: true,
      durationMs,
      launcherSpeed: Math.max(state.launcherSpeed, 900),
      launcherAccel: originalPhysics.launcherAccel,
      targetSpeedRatio: originalPhysics.targetSpeedRatio,
      targetAccel: originalPhysics.targetAccel,
      targetTravelMode: originalPhysics.targetTravelMode,
      launcherBehavior: originalPhysics.launcherBehavior,
      targetAngle: originalPhysics.targetAngle,
      delayMs: originalPhysics.delayMs,
      gapPx: originalPhysics.gapPx,
      markerMode: "none",
      occluderEnabled: false,
      contactOcclusionMode: originalPhysics.contactOcclusionMode,
      launcherVisibleMs: visibleMs,
      targetVisibleMs: visibleMs,
      contextLauncherSpeed: Math.max(state.contextLauncherSpeed, 900),
      contextLauncherAccel: contextPhysics.launcherAccel,
      contextTargetSpeedRatio: contextPhysics.targetSpeedRatio,
      contextTargetAccel: contextPhysics.targetAccel,
      contextTargetTravelMode: contextPhysics.targetTravelMode,
      contextLauncherBehavior: contextPhysics.launcherBehavior,
      contextTargetAngle: contextPhysics.targetAngle,
      contextDelayMs: contextPhysics.delayMs,
      contextGapPx: contextPhysics.gapPx,
      contextContactOcclusionMode: contextPhysics.contactOcclusionMode,
      contextOccluderEnabled: false,
      contextLauncherVisibleMs: contextVisibleMs,
      contextTargetVisibleMs: contextVisibleMs,
      contextFractureEnabled: false,
      trajectoryEditEnabled: false,
      trajectoryOverrides: "{}",
      colorChangeMode: "none",
      contactGuideMode: "none",
      contextPairSnapshots: state.contextPairSnapshots.map((snapshot) =>
        applyPhysicsToContextSnapshot(snapshot, state, durationMs, contextVisibleMs)
      )
    };

    activePresetKey = null;
    setControls(physicsValues);
    statusText.textContent =
      "Physics engine applied. Delay, gaps, tunnels, markers, sudden color, and manual trajectories were disabled.";
  }

  function getBlinkMsControlValue() {
    return Math.max(0, Number(controls.crosshairBlinkMs.value) || Number(presentationDefaults.crosshairBlinkMs) || 0);
  }

  function getBlinkClassicLaunchDurationMs(blinkMs = getBlinkMsControlValue()) {
    return blinkMs + (Number(controlDefaults.durationMs) || 1200);
  }

  function getClassicLaunchValuesAfterBlink(state = cloneState()) {
    const blinkMs = getBlinkMsControlValue();
    return {
      ...state,
      durationMs: getBlinkClassicLaunchDurationMs(blinkMs),
      leadInMs: controlDefaults.leadInMs,
      launcherSpeed: controlDefaults.launcherSpeed,
      launcherAccel: stimulusDefaults.launcherAccel,
      targetSpeedRatio: controlDefaults.targetSpeedRatio,
      targetAccel: stimulusDefaults.targetAccel,
      launcherBehavior: controlDefaults.launcherBehavior,
      targetAngle: controlDefaults.targetAngle,
      delayMs: controlDefaults.delayMs,
      gapPx: controlDefaults.gapPx,
      markerMode: controlDefaults.markerMode,
      ballRadius: controlDefaults.ballRadius,
      occluderEnabled: false,
      occluderWidth: controlDefaults.occluderWidth,
      contactOcclusionMode: stimulusDefaults.contactOcclusionMode,
      launcherVisibleMs: stimulusDefaults.launcherVisibleMs,
      targetVisibleMs: stimulusDefaults.targetVisibleMs,
      contextMode: "none",
      contextPairCount: 1,
      contextPairSnapshots: "[]",
      contextDurationMs: controlDefaults.contextDurationMs,
      contextOffsetMs: controlDefaults.contextOffsetMs,
      contextDirection: controlDefaults.contextDirection,
      contextYOffset: controlDefaults.contextYOffset,
      contextBallRadius: controlDefaults.ballRadius,
      contextLeadInMs: controlDefaults.leadInMs,
      contextLauncherSpeed: controlDefaults.launcherSpeed,
      contextLauncherAccel: stimulusDefaults.contextLauncherAccel,
      contextLauncherBehavior: controlDefaults.launcherBehavior,
      contextDelayMs: controlDefaults.delayMs,
      contextGapPx: controlDefaults.gapPx,
      contextContactOcclusionMode: stimulusDefaults.contextContactOcclusionMode,
      contextOccluderEnabled: false,
      contextOccluderWidth: controlDefaults.occluderWidth,
      contextTargetSpeedRatio: controlDefaults.targetSpeedRatio,
      contextTargetAccel: stimulusDefaults.contextTargetAccel,
      contextTargetAngle: controlDefaults.targetAngle,
      contextLauncherVisibleMs: stimulusDefaults.contextLauncherVisibleMs,
      contextTargetVisibleMs: stimulusDefaults.contextTargetVisibleMs,
      customStartEnabled: false,
      customStartKeepRowsHorizontal: false,
      customStartAlignStartsVertical: false,
      originalLauncherStartX: presentationDefaults.originalLauncherStartX,
      originalLauncherStartY: presentationDefaults.originalLauncherStartY,
      originalTargetStartX: presentationDefaults.originalTargetStartX,
      originalTargetStartY: presentationDefaults.originalTargetStartY,
      contextLauncherStartX: presentationDefaults.contextLauncherStartX,
      contextLauncherStartY: presentationDefaults.contextLauncherStartY,
      contextTargetStartX: presentationDefaults.contextTargetStartX,
      contextTargetStartY: presentationDefaults.contextTargetStartY,
      stimulusXOffset: 0,
      stimulusYOffset: 0,
      trajectoryEditEnabled: false,
      selectedTrajectoryBall: stimulusDefaults.selectedTrajectoryBall,
      selectedTrajectoryAngle: stimulusDefaults.selectedTrajectoryAngle,
      trajectoryOverrides: stimulusDefaults.trajectoryOverrides,
      crosshairEnabled: true,
      crosshairX: presentationDefaults.crosshairX,
      crosshairY: presentationDefaults.crosshairY,
      crosshairBlinkEnabled: true,
      crosshairBlinkMs: blinkMs
    };
  }

  function applyClassicLaunchAfterBlinkEnabled() {
    activePresetKey = null;
    setControls(getClassicLaunchValuesAfterBlink());
    statusText.textContent = "Blink enabled; post-blink event reset to classic launching.";
  }

  function ensureBlinkLeavesFullClassicLaunchDuration() {
    if (!controls.crosshairBlinkEnabled.checked) {
      return;
    }
    const requiredDuration = getBlinkClassicLaunchDurationMs();
    if (Number(controls.durationMs.value) < requiredDuration) {
      controls.durationMs.value = requiredDuration;
    }
  }

  function syncContextControlVisibility() {
    const contextIsOff = controls.contextMode.value === "none";
    if (contextIsOff) {
      restoreAutoFitRadii();
    }
    syncContextChoiceButtons();
    syncAllChoiceControlButtons();
    contextDependentControls.forEach((field) => {
      field.classList.toggle("is-retracted", contextIsOff);
    });
    syncOccluderWidthVisibility();

    if (contextIsOff) {
      hideParameterTooltip();
    } else if (controls.customStartEnabled.checked && controls.customStartAlignStartsVertical.checked) {
      enforceCustomStartConstraints();
    }
  }

  function syncOccluderWidthField(enabledControl, widthControl) {
    const field = widthControl?.closest(".field");
    if (!field) {
      return;
    }
    field.classList.add("occluder-width-field");
    field.classList.toggle("is-retracted", !enabledControl?.checked);
  }

  function syncOccluderWidthVisibility() {
    syncOccluderWidthField(controls.occluderEnabled, controls.occluderWidth);
    syncOccluderWidthField(controls.contextOccluderEnabled, controls.contextOccluderWidth);

    document.querySelectorAll('[data-pair-field="occluderWidth"]').forEach((widthControl) => {
      const enabledControl = document.querySelector(
        `[data-pair-index="${widthControl.dataset.pairIndex}"][data-pair-field="occluderEnabled"]`
      );
      syncOccluderWidthField(enabledControl, widthControl);
    });
  }

  /*
   * Context pair model
   * Context 1 is controlled by the visible "Context 1" controls. Additional
   * pairs are dynamically rendered from contextPairSnapshots so each pair can
   * diverge after it is added. Rows stack downward from the original pair; radius
   * and spacing auto-fit at high counts.
   */
  function getContextPairCount(state) {
    if (state.contextMode === "none") {
      return 0;
    }
    return clamp(Math.round(Number(state.contextPairCount) || 1), 1, CONTEXT_PAIR_MAX);
  }

  function getAutoContextPairRadius(baseRadius, pairCount) {
    const requestedRadius = clamp(Math.round(Number(baseRadius) || stimulusDefaults.contextBallRadius), 8, 60);
    const visibleContextPairs = clamp(Math.round(Number(pairCount) || 1), 1, CONTEXT_PAIR_MAX);
    const totalRows = visibleContextPairs + 1;
    const desiredGap = 12;
    const verticalMargin = 40;
    const availableHeight = STAGE_HEIGHT - verticalMargin * 2;
    const fitRadius = Math.floor((availableHeight - visibleContextPairs * desiredGap) / (totalRows * 2));
    return clamp(Math.min(requestedRadius, fitRadius), 8, 60);
  }

  function getAutoContextPairSpacing(radius, pairCount, preferredSpacing = 112) {
    const visibleContextPairs = clamp(Math.round(Number(pairCount) || 1), 1, CONTEXT_PAIR_MAX);
    const verticalMargin = 40;
    const availableCenterSpan = Math.max(radius * 2, STAGE_HEIGHT - verticalMargin * 2 - radius * 2);
    const fitSpacing = availableCenterSpan / visibleContextPairs;
    const preferred = Math.abs(Number(preferredSpacing)) || 112;
    const minimumComfortSpacing = radius * 2 + 12;
    return Math.max(Math.min(preferred, fitSpacing), Math.min(minimumComfortSpacing, fitSpacing));
  }

  function getContextPairOffsetFromSpacing(pairIndex, spacing, sign = 1) {
    return (pairIndex + 1) * spacing * sign;
  }

  function shouldReplaceAutoContextRadius(value, baseRadius, previousPairCount) {
    const current = Math.round(Number(value));
    const base = Math.round(Number(baseRadius));
    const previousAuto = getAutoContextPairRadius(baseRadius, previousPairCount);
    return current === base || current === previousAuto;
  }

  function syncAutoFitRadiusControl(control, fittedRadius) {
    if (!control) {
      return;
    }
    const storedRequested = Number(control.dataset.autoFitRequestedRadius);
    const currentRadius = Number(control.value) || stimulusDefaults.contextBallRadius;

    if (Number.isFinite(storedRequested) && storedRequested <= fittedRadius) {
      control.value = storedRequested;
      delete control.dataset.autoFitRequestedRadius;
      return;
    }

    if (currentRadius > fittedRadius) {
      if (!Number.isFinite(storedRequested)) {
        control.dataset.autoFitRequestedRadius = currentRadius;
      }
      control.value = fittedRadius;
    }
  }

  function restoreAutoFitRadiusControl(control) {
    const storedRequested = Number(control?.dataset.autoFitRequestedRadius);
    if (!control || !Number.isFinite(storedRequested)) {
      return;
    }
    control.value = storedRequested;
    delete control.dataset.autoFitRequestedRadius;
  }

  function restoreAutoFitRadii() {
    restoreAutoFitRadiusControl(controls.ballRadius);
    restoreAutoFitRadiusControl(controls.contextBallRadius);
  }

  function syncAutoFitSnapshotRadius(snapshot, fittedRadius) {
    const nextSnapshot = { ...snapshot };
    const storedRequested = Number(nextSnapshot.requestedBallRadius);
    const currentRadius = Number(nextSnapshot.ballRadius) || stimulusDefaults.contextBallRadius;

    if (Number.isFinite(storedRequested) && storedRequested <= fittedRadius) {
      nextSnapshot.ballRadius = storedRequested;
      delete nextSnapshot.requestedBallRadius;
      return nextSnapshot;
    }

    if (currentRadius > fittedRadius) {
      if (!Number.isFinite(storedRequested)) {
        nextSnapshot.requestedBallRadius = currentRadius;
      }
      nextSnapshot.ballRadius = fittedRadius;
    }

    return nextSnapshot;
  }

  function applyAutoContextPairRadii(previousPairCount, nextPairCount) {
    const requestedBaseRadius =
      Number(controls.ballRadius.dataset.autoFitRequestedRadius) ||
      Number(controls.ballRadius.value) ||
      stimulusDefaults.contextBallRadius;
    const requestedContextRadius =
      Number(controls.contextBallRadius.dataset.autoFitRequestedRadius) ||
      Number(controls.contextBallRadius.value) ||
      requestedBaseRadius;
    const nextAutoRadius = getAutoContextPairRadius(requestedBaseRadius, nextPairCount);
    const nextContextAutoRadius = getAutoContextPairRadius(requestedContextRadius, nextPairCount);
    const shouldFitManyRows = nextPairCount >= 4;

    syncAutoFitRadiusControl(controls.ballRadius, nextAutoRadius);

    if (
      shouldReplaceAutoContextRadius(controls.contextBallRadius.value, requestedBaseRadius, previousPairCount) ||
      shouldFitManyRows ||
      Number.isFinite(Number(controls.contextBallRadius.dataset.autoFitRequestedRadius))
    ) {
      syncAutoFitRadiusControl(controls.contextBallRadius, nextContextAutoRadius);
    }

    const currentYOffset = Number(controls.contextYOffset.value) || 112;
    const spacingSign = currentYOffset < 0 ? -1 : 1;
    const nextAutoSpacing = getAutoContextPairSpacing(nextContextAutoRadius, nextPairCount, currentYOffset);
    if (shouldFitManyRows && Math.abs(currentYOffset) > nextAutoSpacing) {
      controls.contextYOffset.value = Math.round(nextAutoSpacing * spacingSign);
    }

    const snapshots = parseContextPairSnapshots(controls.contextPairSnapshots.value).map((snapshot, snapshotIndex) => {
      const nextSnapshot = syncAutoFitSnapshotRadius(snapshot, nextContextAutoRadius);
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

  function reflowContextPairOffsets() {
    const state = cloneState();
    const pairCount = getContextPairCount(state);
    if (pairCount <= 1) {
      return;
    }

    const spacingSign = state.contextYOffset < 0 ? -1 : 1;
    const radius = Number(state.contextBallRadius) || Number(state.ballRadius) || stimulusDefaults.contextBallRadius;
    const spacing = getAutoContextPairSpacing(radius, pairCount, state.contextYOffset);
    const snapshots = parseContextPairSnapshots(controls.contextPairSnapshots.value).map((snapshot, snapshotIndex) => ({
      ...snapshot,
      yOffset: getContextPairOffsetFromSpacing(snapshotIndex + 1, spacing, spacingSign)
    }));
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
      targetTravelMode: state.targetTravelMode,
      launcherVisibleMs: state.launcherVisibleMs,
      targetVisibleMs: state.targetVisibleMs,
      launcherFractureEnabled: isFractureTargetEnabled(state, "originalLauncher"),
      targetFractureEnabled: isFractureTargetEnabled(state, "originalTarget"),
      fractureEnabled: isFractureTargetEnabled(state, "originalTarget"),
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

  function getFracturePairDescriptors(state) {
    const descriptors = [{ key: "original", label: "Original pair", snapshot: null }];
    const pairCount = getContextPairCount(state);
    for (let pairNumber = 1; pairNumber <= pairCount; pairNumber += 1) {
      const snapshot = pairNumber > 1 ? state.contextPairSnapshots?.[pairNumber - 2] || null : null;
      descriptors.push({ key: `context${pairNumber}`, label: `Context ${pairNumber}`, snapshot });
    }
    return descriptors;
  }

  function getLegacyFractureTargetDefault(state, pairKey, objectRole, snapshot = null) {
    if (pairKey === "original") {
      return objectRole === "target";
    }
    if (pairKey === "context1") {
      return objectRole === "target" ? Boolean(state.contextFractureEnabled) : false;
    }
    if (!snapshot) {
      return false;
    }
    if (objectRole === "launcher") {
      return Boolean(snapshot.launcherFractureEnabled);
    }
    return Boolean(snapshot.targetFractureEnabled ?? snapshot.fractureEnabled);
  }

  function getFractureTargetValue(state, targetKey) {
    const explicitTargets = parseFractureTargets(state.fractureTargets);
    if (Object.prototype.hasOwnProperty.call(explicitTargets, targetKey)) {
      return explicitTargets[targetKey];
    }

    const match = targetKey.match(/^(original|context\d+)(Launcher|Target)$/);
    if (!match) {
      return false;
    }

    const [, pairKey, rawRole] = match;
    const descriptor = getFracturePairDescriptors(state).find((pair) => pair.key === pairKey);
    if (!descriptor) {
      return false;
    }
    return getLegacyFractureTargetDefault(
      state,
      pairKey,
      rawRole === "Launcher" ? "launcher" : "target",
      descriptor.snapshot
    );
  }

  function normalizeFractureTargetsForState(targets, state) {
    const explicitTargets = parseFractureTargets(targets);
    const normalized = {};
    getFracturePairDescriptors(state).forEach((pair) => {
      ["Launcher", "Target"].forEach((role) => {
        const key = `${pair.key}${role}`;
        if (Object.prototype.hasOwnProperty.call(explicitTargets, key)) {
          normalized[key] = explicitTargets[key];
        }
      });
    });
    return normalized;
  }

  function getEffectiveFractureTargets(state) {
    const targets = {};
    getFracturePairDescriptors(state).forEach((pair) => {
      targets[`${pair.key}Launcher`] = getFractureTargetValue(state, `${pair.key}Launcher`);
      targets[`${pair.key}Target`] = getFractureTargetValue(state, `${pair.key}Target`);
    });
    return targets;
  }

  function isFractureTargetEnabled(state, targetKey) {
    return Boolean(state.fractureEnabled && getFractureTargetValue(state, targetKey));
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
      const rowClass = options.length === 2 ? "two-choice-row" : "three-choice-row";
      return `<label class="${fieldClass.trim()}"><span>${label}</span><input id="${id}" data-pair-index="${pairNumber - 2}" data-pair-field="${field}" type="hidden" value="${snapshot[field]}" /><span class="choice-row ${rowClass}" role="group" aria-label="Context ${pairNumber} ${label}">${renderedButtons}</span></label>`;
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
            ${renderContextRange(pairNumber, "Movement", "launcherSpeed", "O1 speed", snapshot, "float1", 80, 6500, 1)}
            ${renderContextRange(pairNumber, "Movement", "launcherAccel", "O1 accel.", snapshot, "accel", -1500, 3000, 50)}
            ${renderContextSelect(pairNumber, "Movement", "launcherBehavior", "After contact", snapshot, [
              ["stop", "Stop"],
              ["continue", "Pass"],
              ["entrain", "Together"]
            ])}
            ${renderContextSelect(pairNumber, "Movement", "contactOcclusionMode", "Front object", snapshot, [
              ["target-front", "O2"],
              ["launcher-front", "O1"]
            ])}
            ${renderContextRange(pairNumber, "Movement", "delayMs", "Delay", snapshot, "ms", 0, 500, 5)}
            ${renderContextRange(pairNumber, "Movement", "targetSpeedRatio", "O2 speed ratio", snapshot, "float3", 0.2, 2.5, 0.001)}
            ${renderContextRange(pairNumber, "Movement", "targetAccel", "O2 accel.", snapshot, "accel", -1500, 3000, 50)}
            ${renderContextRange(pairNumber, "Movement", "targetAngle", "O2 angle", snapshot, "degrees", -90, 90, 1)}
            ${renderContextSelect(pairNumber, "Movement", "targetTravelMode", "O2 travel", snapshot, [
              ["continue", "Offscreen"],
              ["park", "Park"]
            ])}
            ${renderContextRange(pairNumber, "Movement", "launcherVisibleMs", "O1 on-screen", snapshot, "visibilityMs", 100, 12000, 50)}
            ${renderContextRange(pairNumber, "Movement", "targetVisibleMs", "O2 on-screen", snapshot, "visibilityMs", 100, 12000, 50)}
          </div>
        </div>`);

      positionCards.push(`
        <div class="control-subgroup context-pair-editor">
          <h3 class="subgroup-title">Context ${pairNumber} position</h3>
          <div class="control-subgrid">
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
            ${renderContextColor(pairNumber, "Color", "launcherColor", "O1", snapshot)}
            ${renderContextColor(pairNumber, "Color", "targetColor", "O2", snapshot)}
            ${renderContextColor(pairNumber, "Color", "groupingColor", "Grouping box", snapshot)}
          </div>
        </div>`);
    }

    contextMovementPairList.innerHTML = movementCards.join("");
    contextPositionPairList.innerHTML = positionCards.join("");
    contextColorPairList.innerHTML = colorCards.join("");
    enhanceRangePrecision();
    syncAllChoiceControlButtons();
    syncOccluderWidthVisibility();
    updateOutputs();
  }

  function syncFractureTargetsToLegacyControls(targets) {
    const state = cloneState();
    controls.contextFractureEnabled.checked = Boolean(targets.context1Target);

    const snapshots = [...state.contextPairSnapshots];
    snapshots.forEach((snapshot, snapshotIndex) => {
      const pairNumber = snapshotIndex + 2;
      snapshot.launcherFractureEnabled = Boolean(targets[`context${pairNumber}Launcher`]);
      snapshot.targetFractureEnabled = Boolean(targets[`context${pairNumber}Target`]);
      snapshot.fractureEnabled = snapshot.targetFractureEnabled;
    });
    controls.contextPairSnapshots.value = serializeContextPairSnapshots(snapshots);
  }

  function renderFractureTargetEditors() {
    if (!fractureTargetList) {
      return;
    }

    const state = cloneState();
    const pairDescriptors = getFracturePairDescriptors(state);
    const showEditor = Boolean(state.fractureEnabled && pairDescriptors.length > 1);
    fractureTargetList.classList.toggle("is-retracted", !showEditor);

    if (!showEditor) {
      fractureTargetList.replaceChildren();
      return;
    }

    const targets = getEffectiveFractureTargets(state);
    const rows = pairDescriptors
      .map((pair) => {
        const launcherKey = `${pair.key}Launcher`;
        const targetKey = `${pair.key}Target`;
        return `
          <div class="fracture-target-row">
            <strong>${pair.label}</strong>
            <span class="fracture-target-options">
              <label><input data-fracture-target="${launcherKey}" type="checkbox"${targets[launcherKey] ? " checked" : ""} /> O1</label>
              <label><input data-fracture-target="${targetKey}" type="checkbox"${targets[targetKey] ? " checked" : ""} /> O2</label>
            </span>
          </div>`;
      })
      .join("");

    fractureTargetList.innerHTML = `
      <div class="fracture-target-note">Fracture targets <small>cracks appear after contact</small></div>
      <div class="fracture-target-grid">${rows}</div>`;
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
      [field]:
        field === "contactOcclusionMode"
          ? normalizeOcclusionMode(value)
          : field === "targetTravelMode"
            ? normalizeTargetTravelMode(value)
            : value
    };
    controls.contextPairSnapshots.value = serializeContextPairSnapshots(snapshots);
    activePresetKey = null;
    syncOccluderWidthVisibility();
    updateOutputs();
    refreshText();
    statusText.textContent = `Context ${snapshotIndex + 2} updated.`;
    drawIdlePreview();
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
    const manualGroupingEnabled = Boolean(controls.groupingMode.value !== "none" && controls.manualGroupingRects.value !== "[]");
    const enabled = Boolean(controls.crosshairEnabled.checked || controls.railEnabled.checked || manualGroupingEnabled);
    const trajectoryEnabled = Boolean(controls.trajectoryEditEnabled.checked);
    canvas.classList.toggle("special-drag-enabled", enabled);
    canvas.classList.toggle("trajectory-edit-enabled", trajectoryEnabled);
    if (!enabled) {
      specialDragTarget = null;
    }
    if (!trajectoryEnabled) {
      trajectoryDragTarget = null;
    }
  }

  function syncGroupingControlsVisibility() {
    controls.groupingMode.value = normalizeGroupingMode(controls.groupingMode.value);
    const enabled = controls.groupingMode.value !== "none";
    const contextEnabled = controls.contextMode.value !== "none";
    if (groupingEnabledControl) {
      groupingEnabledControl.checked = enabled;
    }
    groupingDependentControls.forEach((field) => {
      const hiddenBecauseContextIsOff = field.classList.contains("context-dependent-control") && !contextEnabled;
      field.classList.toggle("is-retracted", !enabled || hiddenBecauseContextIsOff);
    });
    if (!enabled) {
      groupingRectDragTarget = null;
    }
    syncSpecialDragUi();
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

  function syncTextBoxControlVisibility() {
    const enabled = Boolean(controls.textBoxEnabled.checked);
    textBoxDependentControls.forEach((field) => {
      field.classList.toggle("is-retracted", !enabled);
    });
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

  function translateRailSegmentWithinStage(segment, deltaX, deltaY) {
    const minX = Math.min(segment.startX, segment.endX);
    const maxX = Math.max(segment.startX, segment.endX);
    const minY = Math.min(segment.startY, segment.endY);
    const maxY = Math.max(segment.startY, segment.endY);
    const safeDeltaX = clamp(deltaX, -minX, STAGE_WIDTH - maxX);
    const safeDeltaY = clamp(deltaY, -minY, STAGE_HEIGHT - maxY);
    return {
      startX: segment.startX + safeDeltaX,
      startY: segment.startY + safeDeltaY,
      endX: segment.endX + safeDeltaX,
      endY: segment.endY + safeDeltaY
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

  function readLocalStorageValue(key) {
    try {
      return window.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  function writeLocalStorageValue(key, value) {
    try {
      window.localStorage?.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  function readCustomPresets() {
    try {
      const stored = JSON.parse(readLocalStorageValue(CUSTOM_PRESETS_STORAGE_KEY) || "[]");
      return Array.isArray(stored) ? stored : [];
    } catch (error) {
      return [];
    }
  }

  function readHiddenBuiltInPresets() {
    try {
      const stored = JSON.parse(readLocalStorageValue(HIDDEN_BUILT_IN_PRESETS_STORAGE_KEY) || "[]");
      return Array.isArray(stored) ? stored.filter((key) => primaryPresetKeys.includes(key)) : [];
    } catch (error) {
      return [];
    }
  }

  function writeHiddenBuiltInPresets() {
    if (!writeLocalStorageValue(HIDDEN_BUILT_IN_PRESETS_STORAGE_KEY, JSON.stringify(hiddenBuiltInPresetKeys))) {
      statusText.textContent = "Preset storage unavailable.";
    }
  }

  function loadHiddenBuiltInPresets() {
    hiddenBuiltInPresetKeys = readHiddenBuiltInPresets();
  }

  function writeCustomPresets() {
    const savedPresets = customPresetKeys.map((key) => presets[key]).filter(Boolean);
    if (!writeLocalStorageValue(CUSTOM_PRESETS_STORAGE_KEY, JSON.stringify(savedPresets))) {
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

  /*
   * Main state hydrator. Use this instead of assigning many controls by hand:
   * it normalizes legacy values, syncs button facades, rebuilds dynamic context
   * editors, recalculates auto-fit rows, refreshes text, and redraws once.
   */
  function setControls(values) {
    const normalizedValues = { ...values };
    if (normalizedValues.contextMode === "pass") {
      normalizedValues.contextMode = "launch";
      normalizedValues.contextLauncherBehavior = "continue";
    }

    delete controls.ballRadius?.dataset.autoFitRequestedRadius;
    delete controls.contextBallRadius?.dataset.autoFitRequestedRadius;

    Object.entries(normalizedValues).forEach(([key, value]) => {
      const control = controls[key];
      if (!control) {
        return;
      }
      const normalizedValue =
        key === "contactOcclusionMode" || key === "contextContactOcclusionMode"
          ? normalizeOcclusionMode(value)
          : key === "targetTravelMode" || key === "contextTargetTravelMode"
            ? normalizeTargetTravelMode(value)
          : getHiddenJsonControlValue(key, value);
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
    renderFractureTargetEditors();
    lastContextPairCount = Math.max(1, getContextPairCount(cloneState()) || 1);
    syncStartDragUi();
    syncCrosshairControlVisibility();
    syncRailControlVisibility();
    syncTrajectoryControlVisibility();
    syncTextBoxControlVisibility();
    syncRailSegments();
    syncGroupingControlsVisibility();
    syncSpecialDragUi();
    enforceCustomStartConstraints();
    updateOutputs();
    refreshText();
    updateCompatibilityNotice(cloneState());
    drawIdlePreview();
  }

  // Presets can omit context-specific fields; this keeps Context 1 symmetric with the original pair.
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
      contextTargetTravelMode: values.contextTargetTravelMode ?? values.targetTravelMode ?? stimulusDefaults.contextTargetTravelMode,
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
    if (state.physicsEngineEnabled) {
      return {
        label: "Custom physics-engine display",
        summary: "A hidden equal-density collision solver is controlling post-impact motion.",
        note: "Delay, gaps, tunnels, markers, sudden color changes, and manual trajectories were reset because they break the physics-engine assumption.",
        literature:
          "Use this when you want a physically constrained comparison condition rather than a pure Michotte-style parameter manipulation."
      };
    }

    if (state.launcherBehavior === "entrain") {
      return {
        label: "Custom entraining display",
        summary: "O1 continues with O2 after contact.",
        note: "This is now an entraining event, not a standard launch.",
        literature:
          "Entraining matters because adaptation studies distinguish it from launching-like causal perception."
      };
    }

    if (state.targetSpeedRatio >= 1.25 && state.launcherBehavior === "stop") {
      return {
        label: "Custom triggering display",
        summary: "O2 leaves faster than O1 arrived.",
        note: "This is closer to triggering than to equal-speed launching.",
        literature:
          "Triggering keeps the launch structure while increasing O2's post-contact speed."
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

  // Derived labels and measurements shown in the UI and exported for audit.
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
    if (state.physicsEngineEnabled) {
      category = "physics collision";
    } else if (state.launcherBehavior === "entrain") {
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

  function hasAnyFractureEnabled(state) {
    return Boolean(state.fractureEnabled && Object.values(getEffectiveFractureTargets(state)).some(Boolean));
  }

  function getExperimentWarnings(state) {
    const warnings = [];
    const impactMovieTimeMs = getImpactMovieTimeMs(state);
    const targetMovieOnsetMs = getTargetMovieOnsetMs(state);
    if (state.renderMode === "lab") {
      warnings.push("Lab preview exports labels. Use Clean stimulus or Fixation for participant movies.");
    }
    if (state.contactGuideMode !== "none") {
      warnings.push("Contact guide is visible in export. Turn off unless it is a condition.");
    }
    if (state.colorChangeMode !== "none") {
      warnings.push("Color-change cue is visible at contact. Keep only if feature change is part of the condition.");
    }
    if (state.trajectoryEditEnabled && Object.keys(state.trajectoryOverrides || {}).length > 0) {
      warnings.push("Manual trajectory edits are active. Verify the PsychoPy CSV and metadata before reusing this condition.");
    }
    if (state.markerMode !== "none" && state.gapPx > 0) {
      warnings.push("Marker is on: the exported video will show a visible gap cue. Set Marker to None unless this cue is part of the condition.");
    }
    if (state.soundEnabled) {
      warnings.push("Audio export depends on browser encoding. Check the saved movie in PsychoPy.");
      if (!hasScheduledImpactSound(state)) {
        warnings.push("Sound is enabled, but contact occurs outside the video or volume is zero. Export will be silent.");
      }
    }
    if (getPreBallBlinkMs(state) >= state.durationMs) {
      warnings.push("Blink time is at least as long as the video. Increase Video duration if the balls should appear.");
    }
    if (impactMovieTimeMs >= state.durationMs) {
      warnings.push("Contact occurs after the video ends. Increase Video duration if the launch should be visible.");
    } else if (targetMovieOnsetMs >= state.durationMs) {
      warnings.push("O2 starts after the video ends. Increase Video duration if the launched motion should be visible.");
    }
    return warnings;
  }

  function renderExperimentWarnings(state) {
    if (!validationList) {
      return;
    }
    validationList.replaceChildren();
    validationList.classList.add("hidden");
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
      summaryAfter.textContent = state.physicsEngineEnabled ? "physics engine" : describeLauncherBehavior(state.launcherBehavior);
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
    if (summaryResolution) {
      const exportSize = getExportCanvasSize(state);
      summaryResolution.textContent = `${exportSize.width} x ${exportSize.height}`;
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

  function isLauncherVisibleAt(eventTimeMs, visibleMs) {
    return isObjectVisibleAt(eventTimeMs, visibleMs);
  }

  function isTargetVisibleAt(eventTimeMs, geometry, visibleMs) {
    if (eventTimeMs < geometry.targetStartTime) {
      return true;
    }
    return isObjectVisibleAt(eventTimeMs - geometry.targetStartTime, visibleMs);
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
    const launcher = normalizeHexColor(state.launcherColor, CLASSIC_LAUNCHER_COLOR);
    const target = normalizeHexColor(state.targetColor, CLASSIC_TARGET_COLOR);
    const context = normalizeHexColor(state.contextColor, CLASSIC_LAUNCHER_COLOR);
    const contextTarget = normalizeHexColor(state.contextTargetColor, CLASSIC_TARGET_COLOR);
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

  /*
   * Motion model contract
   * Units are px, ms, px/s, and px/s^2. gapPx < 0 means overlap, gapPx = 0
   * means borders just touch, and gapPx > 0 means a visible spatial gap.
   * solveTravelMs() finds the contact time from distance/speed/acceleration.
   * A 20 px/s floor prevents negative acceleration from reversing direction.
   */
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

  function freeDisplacementAt(elapsedMs, initialVelocity, acceleration) {
    const t = Math.max(0, elapsedMs) / 1000;
    const velocity = Math.max(0, Number(initialVelocity) || 0);
    const a = Number(acceleration) || 0;
    if (Math.abs(a) < 0.001) {
      return velocity * t;
    }
    if (a < 0) {
      const stopTime = velocity > 0 ? velocity / Math.abs(a) : 0;
      const activeTime = Math.min(t, stopTime);
      return Math.max(0, velocity * activeTime + 0.5 * a * activeTime * activeTime);
    }
    return Math.max(0, velocity * t + 0.5 * a * t * t);
  }

  function signedDisplacementAt(elapsedMs, initialVelocity, acceleration = 0) {
    const t = Math.max(0, elapsedMs) / 1000;
    return (Number(initialVelocity) || 0) * t + 0.5 * (Number(acceleration) || 0) * t * t;
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

  function getParkDistanceToStageEdge(x, y, unitX, unitY, radius) {
    const candidates = [];
    if (unitX > 0.001) {
      candidates.push((STAGE_WIDTH - radius - x) / unitX);
    } else if (unitX < -0.001) {
      candidates.push((radius - x) / unitX);
    }
    if (unitY > 0.001) {
      candidates.push((STAGE_HEIGHT - radius - y) / unitY);
    } else if (unitY < -0.001) {
      candidates.push((radius - y) / unitY);
    }
    const positiveDistances = candidates.filter((distance) => Number.isFinite(distance) && distance >= 0);
    return positiveDistances.length > 0 ? Math.max(0, Math.min(...positiveDistances)) : Infinity;
  }

  function getTargetMoveDistance(state, geometry, elapsedMs) {
    const travelMode = normalizeTargetTravelMode(state.targetTravelMode);
    const rawDistance =
      travelMode === "park"
        ? freeDisplacementAt(elapsedMs, geometry.targetSpeed, geometry.targetAccel)
        : displacementAt(elapsedMs, geometry.targetSpeed, geometry.targetAccel);
    return travelMode === "park" ? Math.min(rawDistance, geometry.targetParkDistance) : rawDistance;
  }

  function getInsideStrokeRadius(radius, lineWidth) {
    return Math.max(0.1, radius - lineWidth / 2);
  }

  function drawBall(drawCtx, x, y, radius, fill, outline) {
    const lineWidth = 1.5;
    const visibleRadius = getInsideStrokeRadius(radius, lineWidth);
    const gradient = drawCtx.createRadialGradient(
      x - visibleRadius * 0.36,
      y - visibleRadius * 0.36,
      visibleRadius * 0.18,
      x,
      y,
      visibleRadius
    );
    gradient.addColorStop(0, "rgba(255,255,255,0.9)");
    gradient.addColorStop(0.14, fill);
    gradient.addColorStop(1, outline);

    drawCtx.beginPath();
    drawCtx.arc(x, y, visibleRadius, 0, Math.PI * 2);
    drawCtx.fillStyle = gradient;
    drawCtx.fill();
    drawCtx.lineWidth = lineWidth;
    drawCtx.strokeStyle = "rgba(255,255,255,0.22)";
    drawCtx.stroke();
  }

  function drawObject(drawCtx, state, x, y, radius, fill, outline) {
    if (state.objectStyle === "shaded") {
      drawBall(drawCtx, x, y, radius, fill, outline);
      return;
    }

    if (state.objectStyle === "outline") {
      const lineWidth = Math.max(2, radius * 0.08);
      drawCtx.beginPath();
      drawCtx.arc(x, y, getInsideStrokeRadius(radius, lineWidth), 0, Math.PI * 2);
      drawCtx.fillStyle = "rgba(0, 0, 0, 0)";
      drawCtx.fill();
      drawCtx.lineWidth = lineWidth;
      drawCtx.strokeStyle = fill;
      drawCtx.stroke();
      return;
    }

    if (state.objectStyle === "ring") {
      const outerLineWidth = Math.max(2.5, radius * 0.12);
      const outerRadius = getInsideStrokeRadius(radius, outerLineWidth);
      drawCtx.beginPath();
      drawCtx.arc(x, y, outerRadius, 0, Math.PI * 2);
      drawCtx.fillStyle = fill;
      drawCtx.fill();
      drawCtx.lineWidth = outerLineWidth;
      drawCtx.strokeStyle = outline;
      drawCtx.stroke();
      const innerLineWidth = Math.max(1.5, radius * 0.06);
      drawCtx.beginPath();
      drawCtx.arc(x, y, Math.max(0.1, outerRadius * 0.56), 0, Math.PI * 2);
      drawCtx.fillStyle = getStageThemeColors(state)[0];
      drawCtx.fill();
      drawCtx.lineWidth = innerLineWidth;
      drawCtx.strokeStyle = outline;
      drawCtx.stroke();
      return;
    }

    const lineWidth = 2;
    drawCtx.beginPath();
    drawCtx.arc(x, y, getInsideStrokeRadius(radius, lineWidth), 0, Math.PI * 2);
    drawCtx.fillStyle = fill;
    drawCtx.fill();
    drawCtx.lineWidth = lineWidth;
    drawCtx.strokeStyle = outline;
    drawCtx.stroke();
  }

  function shouldDrawFracture(state, eventState, targetKey) {
    return Boolean(isFractureTargetEnabled(state, targetKey) && eventState?.time >= eventState?.geometry?.targetStartTime);
  }

  function drawFracture(drawCtx, state, x, y, radius) {
    const crackColor = state.stageTheme === "light" ? "rgba(31, 28, 24, 0.82)" : "rgba(255, 248, 234, 0.84)";
    const shadowColor = state.stageTheme === "light" ? "rgba(255, 248, 234, 0.42)" : "rgba(7, 15, 14, 0.64)";
    const hairlineColor = state.stageTheme === "light" ? "rgba(12, 10, 8, 0.28)" : "rgba(255, 248, 234, 0.28)";
    const cracks = [
      [[0.75, -0.68], [0.43, -0.38], [0.2, -0.14], [0.02, 0.06], [-0.15, 0.4], [-0.3, 0.92]],
      [[0.02, 0.06], [-0.27, -0.08], [-0.63, -0.25]],
      [[0.02, 0.06], [0.32, 0.2], [0.74, 0.4]],
      [[0.2, -0.14], [0.39, 0.02], [0.5, 0.24]]
    ];

    drawCtx.save();
    drawCtx.beginPath();
    drawCtx.arc(x, y, Math.max(0.1, radius - Math.max(2, radius * 0.07)), 0, Math.PI * 2);
    drawCtx.clip();
    [
      [shadowColor, Math.max(2.2, radius * 0.09)],
      [crackColor, Math.max(1.25, radius * 0.045)],
      [hairlineColor, Math.max(0.7, radius * 0.022)]
    ].forEach(([strokeStyle, lineWidth]) => {
      drawCtx.strokeStyle = strokeStyle;
      drawCtx.lineWidth = lineWidth;
      drawCtx.lineCap = "round";
      drawCtx.lineJoin = "round";
      cracks.forEach((crack) => {
        drawCtx.beginPath();
        crack.forEach(([px, py], pointIndex) => {
          const pointX = x + px * radius;
          const pointY = y + py * radius;
          if (pointIndex === 0) {
            drawCtx.moveTo(pointX, pointY);
          } else {
            drawCtx.lineTo(pointX, pointY);
          }
        });
        drawCtx.stroke();
      });
    });
    drawCtx.restore();
  }

  function drawRenderedObject(drawCtx, state, object, radius) {
    drawObject(drawCtx, state, object.x, object.y, radius, object.fill, object.outline);
    if (object.cracked) {
      drawFracture(drawCtx, state, object.x, object.y, radius);
    }
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

  function drawManualGroupingRects(drawCtx, state, showHandles = false) {
    const rects = state.manualGroupingRects || [];
    if (state.groupingMode === "none" || rects.length === 0) {
      return;
    }

    drawCtx.save();
    rects.forEach((rect, index) => {
      const fallback = index === 0 ? "#e0b24a" : "#80a7a1";
      const strokeColor = hexToRgba(rect.color, state.stageTheme === "light" ? 0.86 : 0.9, fallback);
      const fillColor = hexToRgba(rect.color, state.stageTheme === "light" ? 0.06 : 0.04, fallback);
      drawCtx.strokeStyle = strokeColor;
      drawCtx.fillStyle = fillColor;
      drawCtx.lineWidth = 2.3;
      drawCtx.setLineDash([]);
      drawCtx.beginPath();
      drawCtx.roundRect(rect.x, rect.y, rect.width, rect.height, clamp(Math.min(rect.width, rect.height) * 0.08, 4, 14));
      drawCtx.fill();
      drawCtx.stroke();

      if (showHandles) {
        const handleSize = 10;
        const half = handleSize / 2;
        drawCtx.fillStyle = strokeColor;
        [
          [rect.x, rect.y],
          [rect.x + rect.width, rect.y],
          [rect.x, rect.y + rect.height],
          [rect.x + rect.width, rect.y + rect.height]
        ].forEach(([x, y]) => {
          drawCtx.fillRect(x - half, y - half, handleSize, handleSize);
        });
      }
    });
    drawCtx.restore();
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
          const snapshotState = getContextPairSnapshotState(snapshot, state, laneY, eventState.geometry.contextDirectionSign);
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

    const getGeometryRowBounds = (geometry) => {
      const radius = Math.max(2, Number(geometry.radius) || state.ballRadius || stimulusDefaults.ballRadius);
      const horizontalPad = Math.max(18, radius * 1.45);
      const verticalPad = Math.max(14, radius * 1.35);
      const xs = [geometry.launcherStartX, geometry.targetBaseX, geometry.launcherStopX].filter(Number.isFinite);
      const ys = [geometry.launcherStartY, geometry.targetBaseY, geometry.launcherStopY].filter(Number.isFinite);
      return {
        left: Math.min(...xs) - horizontalPad,
        right: Math.max(...xs) + horizontalPad,
        top: Math.min(...ys) - verticalPad,
        bottom: Math.max(...ys) + verticalPad,
        radius
      };
    };

    const getBoxBounds = (geometries) => {
      const rowBounds = geometries.map(getGeometryRowBounds);
      const left = Math.max(
        20,
        Math.min(...rowBounds.map((bounds) => bounds.left))
      );
      const right = Math.min(
        STAGE_WIDTH - 20,
        Math.max(...rowBounds.map((bounds) => bounds.right))
      );
      const top = Math.max(
        20,
        Math.min(...rowBounds.map((bounds) => bounds.top))
      );
      const bottom = Math.min(
        STAGE_HEIGHT - 20,
        Math.max(...rowBounds.map((bounds) => bounds.bottom))
      );
      const minRadius = Math.min(...rowBounds.map((bounds) => bounds.radius));
      return { left, right, top, bottom, minRadius };
    };

    const drawBox = (label, geometries, color, fallback) => {
      const safeGeometries = Array.isArray(geometries) ? geometries.filter(Boolean) : [geometries].filter(Boolean);
      if (safeGeometries.length === 0) {
        return;
      }
      const { left, right, top, bottom, minRadius } = getBoxBounds(safeGeometries);
      const height = Math.max(12, bottom - top);
      const cornerRadius = clamp(minRadius * 0.65, 5, 16);
      const strokeColor = hexToRgba(color, state.stageTheme === "light" ? 0.86 : 0.9, fallback);
      const fillColor = hexToRgba(color, state.stageTheme === "light" ? 0.07 : 0.045, fallback);

      drawCtx.save();
      drawCtx.strokeStyle = strokeColor;
      drawCtx.fillStyle = fillColor;
      drawCtx.lineWidth = 2.5;
      drawCtx.setLineDash([]);
      drawCtx.beginPath();
      drawCtx.roundRect(left, top, right - left, height, cornerRadius);
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
      drawManualGroupingRects(drawCtx, state, drawCtx === ctx);
      return;
    }

    if (state.groupingMode === "each") {
      contextGeometries.forEach((geometry, index) => {
        drawBox(`Context ${index + 1}`, geometry, state.groupingContextColor, "#80a7a1");
      });
      drawManualGroupingRects(drawCtx, state, drawCtx === ctx);
      return;
    }

    if (["context", "both", "original-contexts"].includes(state.groupingMode)) {
      const grouped = state.groupingMode === "both" ? contextGeometries.slice(0, 1) : contextGeometries;
      drawBox("Context set", grouped, state.groupingContextColor, "#80a7a1");
    }
    drawManualGroupingRects(drawCtx, state, drawCtx === ctx);
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

  /*
   * Geometry contract
   * This is the main adaptation point for labs changing the physical layout.
   * It computes start points, closest approach, contact time, O2 onset
   * (stopTime + delayMs), outgoing direction, and context mirroring. remainingMs
   * reserves 240 ms so the launched object has a short visible post-contact run.
   */
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
    const baseApproachUnitX = approachUnitX;
    const baseApproachUnitY = approachUnitY;
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
    const physicsCollision = state.physicsEngineEnabled ? getPhysicsCollisionValues(radius) : null;
    const effectiveDelayMs = physicsCollision ? 0 : state.delayMs;
    const effectiveTargetSpeedRatio = physicsCollision ? physicsCollision.targetSpeedRatio : state.targetSpeedRatio;
    const effectiveTargetAccel = physicsCollision ? physicsCollision.targetAccel : state.targetAccel;
    const travelMs = solveTravelMs(launcherDistance, state.launcherSpeed, state.launcherAccel);
    const stopTime = state.leadInMs + travelMs;
    const targetStartTime = stopTime + effectiveDelayMs;
    const remainingMs = Math.max(state.durationMs - targetStartTime - 240, 80);
    const launcherImpactSpeed = velocityAt(travelMs, state.launcherSpeed, state.launcherAccel);
    const targetSpeed = launcherImpactSpeed * effectiveTargetSpeedRatio;
    const launcherPostSpeed = physicsCollision ? launcherImpactSpeed * physicsCollision.launcherPostSpeedRatio : launcherImpactSpeed;
    const targetAngleOverride = getTrajectoryOverrideAngle(state, `${trajectoryScope}Target`);
    const effectiveTargetAngle = Number.isFinite(targetAngleOverride) ? targetAngleOverride : state.targetAngle;
    const angleRad = (effectiveTargetAngle * Math.PI) / 180;
    const customTargetUnit = rotateVector(approachUnitX, approachUnitY, angleRad);
    const targetUnitX = usesCustomStarts ? customTargetUnit.x : directionSign * Math.cos(angleRad);
    const targetUnitY = usesCustomStarts ? customTargetUnit.y : Math.sin(angleRad);
    const targetParkDistance = getParkDistanceToStageEdge(targetBase.x, targetBase.y, targetUnitX, targetUnitY, radius);
    const targetDistance = getTargetMoveDistance(
      { ...state, targetTravelMode: normalizeTargetTravelMode(state.targetTravelMode) },
      {
        targetSpeed,
        targetAccel: effectiveTargetAccel,
        targetParkDistance
      },
      remainingMs
    );
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
      baseApproachUnitX,
      baseApproachUnitY,
      approachUnitX,
      approachUnitY,
      targetUnitX,
      targetUnitY,
      travelMs,
      stopTime,
      targetStartTime,
      remainingMs,
      launcherImpactSpeed,
      launcherPostSpeed,
      targetSpeed,
      targetAccel: effectiveTargetAccel,
      targetTravelMode: normalizeTargetTravelMode(state.targetTravelMode),
      targetParkDistance,
      physicsCollision,
      angleRad,
      targetDistance,
      contextDirectionSign,
      directionSign,
      usesCustomStarts
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
    if ((state.physicsEngineEnabled || state.launcherBehavior !== "continue") && t >= geometry.targetStartTime) {
      const targetElapsed = t - geometry.targetStartTime;
      const moveDistance = getTargetMoveDistance(state, geometry, targetElapsed);
      targetX += geometry.targetUnitX * moveDistance;
      targetY += geometry.targetUnitY * moveDistance;
    }

    if (state.physicsEngineEnabled && t >= geometry.targetStartTime) {
      const elapsed = t - geometry.targetStartTime;
      const moveDistance = signedDisplacementAt(elapsed, geometry.launcherPostSpeed);
      launcherX = geometry.launcherStopX + geometry.approachUnitX * moveDistance;
      launcherY = geometry.launcherStopY + geometry.approachUnitY * moveDistance;
    } else if (state.launcherBehavior === "continue" && t >= geometry.stopTime) {
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
      targetTravelMode: state.contextTargetTravelMode,
      contactOcclusionMode: state.contextContactOcclusionMode,
      fractureEnabled: state.contextFractureEnabled,
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

    if ((eventState.physicsEngineEnabled || eventState.launcherBehavior !== "continue") && t >= geometry.targetStartTime) {
      const targetElapsed = t - geometry.targetStartTime;
      const moveDistance = getTargetMoveDistance(eventState, geometry, targetElapsed);
      targetX += geometry.targetUnitX * moveDistance;
      targetY += geometry.targetUnitY * moveDistance;
    }

    if (eventState.physicsEngineEnabled && t >= geometry.targetStartTime) {
      const elapsed = t - geometry.targetStartTime;
      const moveDistance = signedDisplacementAt(elapsed, geometry.launcherPostSpeed);
      launcherX = geometry.launcherStopX + geometry.approachUnitX * moveDistance;
      launcherY = geometry.launcherStopY + geometry.approachUnitY * moveDistance;
    } else if (eventState.launcherBehavior === "continue" && t >= geometry.stopTime) {
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

  // Converts a Context 2+ snapshot into a normal event state so drawing code stays shared.
  function getContextPairSnapshotState(snapshot, baseState, laneY, directionSign = 1) {
    const sourceLaneY = Number(snapshot.laneY) || getMainLaneY(baseState);
    const yShift = laneY - sourceLaneY;
    const readSnapshotCoordinate = (value, fallback) => {
      const number = Number(value);
      return Number.isFinite(number) ? number : fallback;
    };
    const orientX = (value, fallback) => {
      const x = readSnapshotCoordinate(value, fallback);
      return directionSign === -1 ? STAGE_WIDTH - x : x;
    };
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
      targetTravelMode: normalizeTargetTravelMode(snapshot.targetTravelMode || baseState.targetTravelMode),
      launcherFractureEnabled: Boolean(snapshot.launcherFractureEnabled),
      targetFractureEnabled: Boolean(snapshot.targetFractureEnabled ?? snapshot.fractureEnabled),
      fractureEnabled: Boolean(snapshot.fractureEnabled),
      launcherVisibleMs: Number(snapshot.launcherVisibleMs) || baseState.launcherVisibleMs,
      targetVisibleMs: Number(snapshot.targetVisibleMs) || baseState.targetVisibleMs,
      originalLauncherStartX: orientX(snapshot.launcherStartX, baseState.originalLauncherStartX),
      originalLauncherStartY: readSnapshotCoordinate(snapshot.launcherStartY, baseState.originalLauncherStartY) + yShift,
      originalTargetStartX: orientX(snapshot.targetStartX, baseState.originalTargetStartX),
      originalTargetStartY: readSnapshotCoordinate(snapshot.targetStartY, baseState.originalTargetStartY) + yShift,
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
      originalLauncher: "O1 approach",
      originalTarget: "O2 after contact",
      contextLauncher: "Context 1 O1 approach",
      contextTarget: "Context 1 O2 after contact"
    };
    if (fixedLabels[id]) {
      return fixedLabels[id];
    }
    const match = /^context(\d+)(Launcher|Target)$/.exec(id || "");
    if (!match) {
      return "Select in preview";
    }
    const pairNumber = match[1];
    const role = match[2] === "Launcher" ? "O1 approach" : "O2 after contact";
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

  function normalizeVector(dx, dy) {
    const length = Math.hypot(dx, dy);
    if (length < 0.001) {
      return null;
    }
    return {
      x: dx / length,
      y: dy / length
    };
  }

  function signedScreenAngleDegrees(referenceUnit, desiredUnit) {
    const cross = referenceUnit.x * desiredUnit.y - referenceUnit.y * desiredUnit.x;
    const dot = referenceUnit.x * desiredUnit.x + referenceUnit.y * desiredUnit.y;
    return (Math.atan2(cross, dot) * 180) / Math.PI;
  }

  function getTrajectoryAngleFromPoint(state, target, point) {
    const desiredUnit = normalizeVector(point.x - target.start.x, point.y - target.start.y);
    if (!desiredUnit) {
      return getTrajectoryEffectiveAngle(state, target.id);
    }

    if (target.role === "launcher" || target.usesCustomStarts) {
      return clamp(Math.round(signedScreenAngleDegrees(target.referenceUnit, desiredUnit)), -90, 90);
    }

    const signedX = (target.directionSign || 1) * desiredUnit.x;
    return clamp(Math.round((Math.atan2(desiredUnit.y, signedX) * 180) / Math.PI), -90, 90);
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
      radius: geometry.radius,
      referenceUnit: isLauncher
        ? { x: geometry.baseApproachUnitX, y: geometry.baseApproachUnitY }
        : { x: geometry.approachUnitX, y: geometry.approachUnitY },
      directionSign: geometry.directionSign,
      usesCustomStarts: geometry.usesCustomStarts
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
      const snapshotState = getContextPairSnapshotState(snapshot, state, contextLaneY, directionSign);
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

  function beginTrajectoryDrag(target, state) {
    selectTrajectoryTarget(target, state);
    trajectoryDragTarget = {
      id: target.id,
      role: target.role,
      start: { ...target.start },
      referenceUnit: { ...target.referenceUnit },
      directionSign: target.directionSign,
      usesCustomStarts: target.usesCustomStarts
    };
  }

  function updateDraggedTrajectory(event) {
    if (!trajectoryDragTarget) {
      return;
    }
    const state = cloneState();
    const angle = getTrajectoryAngleFromPoint(state, trajectoryDragTarget, getStagePoint(event));
    activePresetKey = null;
    controls.selectedTrajectoryBall.value = trajectoryDragTarget.id;
    controls.selectedTrajectoryAngle.value = angle;
    writeTrajectoryOverride(trajectoryDragTarget.id, angle);
    updateOutputs();
    refreshText();
    statusText.textContent = `${getTrajectoryTargetLabel(trajectoryDragTarget.id)} vector updated.`;
    drawIdlePreview();
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
      drawCtx.beginPath();
      drawCtx.arc(target.start.x, target.start.y, selected ? 4.5 : 3, 0, Math.PI * 2);
      drawCtx.fill();
      drawCtx.beginPath();
      drawCtx.arc(target.end.x, target.end.y, selected ? 8 : 6, 0, Math.PI * 2);
      drawCtx.fill();
      drawCtx.strokeStyle = state.stageTheme === "light" ? "rgba(31, 28, 24, 0.72)" : "rgba(7, 15, 14, 0.85)";
      drawCtx.lineWidth = 1.25;
      drawCtx.stroke();
      if (selected) {
        drawCtx.fillText(getTrajectoryTargetLabel(target.id), target.end.x + 8, target.end.y);
      }
    });
    drawCtx.restore();
  }

  function drawContextPair(
    drawCtx,
    state,
    eventState,
    t,
    laneY,
    directionSign,
    colors,
    scope = "context",
    trajectoryScope = scope,
    tunnelLaneYs = []
  ) {
    if (state.contextMode === "single") {
      const singleEvent = getDirectedSingleEventState(eventState, t, laneY, directionSign, scope, trajectoryScope);
      const singlePalette = t < singleEvent.geometry.stopTime ? colors.launcher : colors.target;
      const radius = singleEvent.geometry.radius;
      const contextOccluderBounds = drawTunnelOccluder(
        drawCtx,
        laneY,
        radius,
        eventState.occluderEnabled,
        eventState.occluderWidth,
        tunnelLaneYs
      );
      if (
        isLauncherVisibleAt(t, eventState.launcherVisibleMs) &&
        (!eventState.occluderEnabled || isObjectOutsideOccluder(singleEvent.singleX, radius, contextOccluderBounds))
      ) {
        drawRenderedObject(
          drawCtx,
          state,
          {
            x: singleEvent.singleX,
            y: singleEvent.singleY,
            fill: singlePalette.fill,
            outline: singlePalette.outline,
            cracked: shouldDrawFracture(state, singleEvent, `${trajectoryScope === "context" ? "context1" : trajectoryScope}Launcher`)
          },
          radius
        );
      }
      return;
    }

    const contextEvent = getDirectedEventState(eventState, t, laneY, directionSign, scope, trajectoryScope);
    const pairKey = trajectoryScope === "context" ? "context1" : trajectoryScope;
    const launcher = {
      x: contextEvent.launcherX,
      y: contextEvent.launcherY,
      fill: colors.launcher.fill,
      outline: colors.launcher.outline,
      visible: isLauncherVisibleAt(t, eventState.launcherVisibleMs),
      cracked: shouldDrawFracture(state, contextEvent, `${pairKey}Launcher`)
    };
    const target = {
      x: contextEvent.targetX,
      y: contextEvent.targetY,
      fill: colors.target.fill,
      outline: colors.target.outline,
      visible: isTargetVisibleAt(t, contextEvent.geometry, eventState.targetVisibleMs),
      cracked: shouldDrawFracture(state, contextEvent, `${pairKey}Target`)
    };
    const contextOccluderBounds = drawTunnelOccluder(
      drawCtx,
      laneY,
      contextEvent.geometry.radius,
      eventState.occluderEnabled,
      eventState.occluderWidth,
      tunnelLaneYs
    );
    const radius = contextEvent.geometry.radius;

    if (eventState.occluderEnabled) {
      drawOccludedObjectPair(drawCtx, state, launcher, target, radius, contextOccluderBounds);
      return;
    }

    drawObjectPair(drawCtx, state, contextEvent, launcher, target, radius, eventState.contactOcclusionMode);
  }

  function getVisibleContextLaneYs(state, mainEvent, t) {
    if (!isContextEventVisible(state, t, mainEvent.geometry)) {
      return [];
    }

    const pairCount = getContextPairCount(state);
    const snapshots = state.contextPairSnapshots || [];
    const laneYs = [];

    for (let pairIndex = 0; pairIndex < pairCount; pairIndex += 1) {
      const snapshot = pairIndex > 0 ? snapshots[pairIndex - 1] || makeContextPairSnapshotFromOriginal(state, pairIndex) : null;
      const laneY = getContextLaneY(state, mainEvent.geometry.laneY, pairIndex, snapshot);
      laneYs.push(laneY);
    }

    return laneYs;
  }

  function getVisibleEventLaneYs(state, mainEvent, t) {
    return [mainEvent.geometry.laneY, ...getVisibleContextLaneYs(state, mainEvent, t)];
  }

  function getTunnelMaxHeightForLane(laneY, laneYs) {
    const distances = (Array.isArray(laneYs) ? laneYs : [])
      .map((otherLaneY) => Math.abs(Number(otherLaneY) - laneY))
      .filter((distance) => Number.isFinite(distance) && distance > 0.5);

    if (distances.length === 0) {
      return Infinity;
    }

    return Math.max(4, Math.min(...distances) - TUNNEL_ROW_CLEARANCE);
  }

  function drawContextEvent(drawCtx, state, t, mainEvent, tunnelLaneYs = getVisibleEventLaneYs(state, mainEvent, t)) {
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
          "context",
          tunnelLaneYs
        );
        continue;
      }

      const snapshotState = getContextPairSnapshotState(snapshot, state, laneY, directionSign);
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
        `context${pairIndex + 1}`,
        tunnelLaneYs
      );
    }
  }

  function getTunnelDimensions(width, radius, maxHeight = Infinity) {
    const safeRadius = Math.max(2, Number(radius) || TUNNEL_BASE_RADIUS);
    const numericWidth = Number(width);
    const requestedWidth = Number.isFinite(numericWidth) ? Math.max(0, numericWidth) : stimulusDefaults.contextOccluderWidth;
    const desiredHeight = safeRadius * TUNNEL_HEIGHT_RATIO;
    const heightCap = Number.isFinite(maxHeight) ? Math.max(4, maxHeight) : desiredHeight;
    const height = Math.min(desiredHeight, heightCap);
    const rowScale = height / desiredHeight;
    const desiredWidth = requestedWidth * (safeRadius / TUNNEL_BASE_RADIUS);
    const widthMin = Math.min(safeRadius * 2.1, STAGE_WIDTH - 40);
    const scaledWidth = clamp(desiredWidth * rowScale, widthMin, STAGE_WIDTH - 40);
    return { width: scaledWidth, height, safeRadius };
  }

  function drawTunnelOccluder(drawCtx, laneY, radius, enabled, width, laneYs = []) {
    if (!enabled) {
      return {
        left: 0,
        right: 0
      };
    }

    const maxHeight = getTunnelMaxHeightForLane(laneY, laneYs);
    const { width: scaledWidth, height, safeRadius } = getTunnelDimensions(width, radius, maxHeight);
    const left = STAGE_WIDTH / 2 - scaledWidth / 2;
    const top = laneY - height / 2;
    const right = left + scaledWidth;
    const cornerRadius = clamp(safeRadius * 0.65, 5, 18);
    const insetX = Math.min(scaledWidth * 0.12, safeRadius * 0.65);
    const insetY = Math.min(height * 0.18, safeRadius * 0.55);

    drawCtx.fillStyle = "rgba(235, 233, 223, 0.88)";
    drawCtx.strokeStyle = "rgba(17, 34, 33, 0.16)";
    drawCtx.lineWidth = clamp(safeRadius * 0.08, 1.2, 2);
    drawCtx.beginPath();
    drawCtx.roundRect(left, top, scaledWidth, height, cornerRadius);
    drawCtx.fill();
    drawCtx.stroke();

    drawCtx.fillStyle = "rgba(17, 34, 33, 0.07)";
    drawCtx.fillRect(left + insetX, top + insetY, scaledWidth - insetX * 2, height - insetY * 2);

    return { left, right };
  }

  function drawOccluder(drawCtx, state, laneY, laneYs = []) {
    return drawTunnelOccluder(drawCtx, laneY, state.ballRadius, state.occluderEnabled, state.occluderWidth, laneYs);
  }

  function drawContextOccluder(drawCtx, state, laneY, laneYs = []) {
    return drawTunnelOccluder(
      drawCtx,
      laneY,
      state.contextBallRadius,
      state.contextOccluderEnabled,
      state.contextOccluderWidth,
      laneYs
    );
  }

  function isObjectOutsideOccluder(x, radius, occluderBounds) {
    return x + radius < occluderBounds.left || x - radius > occluderBounds.right;
  }

  function drawOccludedObjectPair(drawCtx, state, launcher, target, radius, occluderBounds) {
    [launcher, target].forEach((object) => {
      if (object.visible !== false && isObjectOutsideOccluder(object.x, radius, occluderBounds)) {
        drawRenderedObject(drawCtx, state, object, radius);
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
      }
    }

    return drawOrder;
  }

  function drawObjectPair(drawCtx, state, eventState, launcher, target, radius, occlusionMode) {
    getOverlapDrawOrder(eventState, launcher, target, radius, occlusionMode).forEach((object) => {
      drawRenderedObject(drawCtx, state, object, radius);
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
      visible: isLauncherVisibleAt(eventState.time, state.launcherVisibleMs),
      cracked: shouldDrawFracture(state, eventState, "originalLauncher")
    };
    const target = {
      x: eventState.targetX,
      y: eventState.targetY,
      fill: palette.target.fill,
      outline: palette.target.outline,
      visible: isTargetVisibleAt(eventState.time, eventState.geometry, state.targetVisibleMs),
      cracked: shouldDrawFracture(state, eventState, "originalTarget")
    };
    drawObjectPair(drawCtx, state, eventState, launcher, target, radius, state.contactOcclusionMode);
  }

  function drawOccludedEvent(drawCtx, state, eventState, occluderBounds) {
    const radius = state.ballRadius;
    const palette = getPaletteAtTime(state, eventState);
    const launcher = {
      x: eventState.launcherX,
      y: eventState.launcherY,
      fill: palette.launcher.fill,
      outline: palette.launcher.outline,
      visible: isLauncherVisibleAt(eventState.time, state.launcherVisibleMs),
      cracked: shouldDrawFracture(state, eventState, "originalLauncher")
    };
    const target = {
      x: eventState.targetX,
      y: eventState.targetY,
      fill: palette.target.fill,
      outline: palette.target.outline,
      visible: isTargetVisibleAt(eventState.time, eventState.geometry, state.targetVisibleMs),
      cracked: shouldDrawFracture(state, eventState, "originalTarget")
    };
    drawOccludedObjectPair(drawCtx, state, launcher, target, radius, occluderBounds);
  }

  function drawLegend(drawCtx, state) {
    const palette = getPalette(state);
    drawCtx.save();
    drawCtx.font = '600 14px "Avenir Next", "Segoe UI", sans-serif';
    drawCtx.fillStyle = "rgba(240, 245, 245, 0.92)";
    drawCtx.fillText("O1", 80, 32);
    drawCtx.fillText("O2", 192, 32);
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

  function drawTextBoxFeature(drawCtx, state) {
    if (!state.textBoxEnabled) {
      return;
    }
    const text = String(state.textBoxText || "").trim();
    if (!text) {
      return;
    }
    const fontSize = clamp(Number(state.textBoxSize) || 24, 10, 64);
    const x = clamp(Number(state.textBoxX) || 0, 0, STAGE_WIDTH);
    const y = clamp(Number(state.textBoxY) || 0, 0, STAGE_HEIGHT);
    const color = normalizeHexColor(state.textBoxColor, "#fffaf0");

    drawCtx.save();
    drawCtx.font = `700 ${fontSize}px Helvetica Neue, Helvetica, Arial, sans-serif`;
    drawCtx.textBaseline = "alphabetic";
    const metrics = drawCtx.measureText(text);
    const paddingX = Math.max(8, fontSize * 0.4);
    const paddingY = Math.max(5, fontSize * 0.25);
    const boxWidth = metrics.width + paddingX * 2;
    const boxHeight = fontSize + paddingY * 2;
    const boxX = clamp(x, 0, Math.max(0, STAGE_WIDTH - boxWidth));
    const boxY = clamp(y - boxHeight, 0, Math.max(0, STAGE_HEIGHT - boxHeight));

    drawCtx.fillStyle = state.stageTheme === "light" ? "rgba(255, 250, 240, 0.72)" : "rgba(17, 21, 20, 0.68)";
    drawCtx.strokeStyle = hexToRgba(color, 0.92, color);
    drawCtx.lineWidth = 1.5;
    drawCtx.fillRect(boxX, boxY, boxWidth, boxHeight);
    drawCtx.strokeRect(boxX, boxY, boxWidth, boxHeight);
    drawCtx.fillStyle = color;
    drawCtx.fillText(text, boxX + paddingX, boxY + boxHeight - paddingY - fontSize * 0.14);
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

  // Single render entry point. Preview and export both call this, so timing cues stay aligned.
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
    const tunnelLaneYs = getVisibleEventLaneYs(state, eventState, stimulusT);
    drawGroupingBoxes(drawCtx, state, eventState);
    drawContactGuides(drawCtx, state, eventState);
    drawContextEvent(drawCtx, state, stimulusT, eventState, tunnelLaneYs);
    drawSpatialMarker(drawCtx, state, eventState);
    const occluderBounds = drawOccluder(drawCtx, state, laneY, tunnelLaneYs);

    if (state.occluderEnabled) {
      drawOccludedEvent(drawCtx, state, eventState, occluderBounds);
    } else {
      drawOpenEvent(drawCtx, state, eventState);
    }

    drawFixation(drawCtx, state);
    drawCrosshairFeature(drawCtx, state, 1);
    drawTextBoxFeature(drawCtx, state);

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

  function getIdlePreviewTime(state = cloneState()) {
    const blinkMs = getPreBallBlinkMs(state);
    const needsVisibleEditHandles = Boolean(state.railEnabled || state.trajectoryEditEnabled || state.customStartEnabled);
    return blinkMs > 0 && needsVisibleEditHandles ? blinkMs + 1 : 0;
  }

  function drawIdlePreview(state = cloneState()) {
    const idleTime = getIdlePreviewTime(state);
    drawFrame(state, idleTime, ctx);
    updatePreviewTimer(idleTime, state);
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

  function writeManualGroupingRects(rects) {
    controls.manualGroupingRects.value = serializeManualGroupingRects(rects);
  }

  function addManualGroupingRect() {
    const state = cloneState();
    const rects = state.manualGroupingRects || [];
    if (rects.length >= MANUAL_GROUPING_RECT_MAX) {
      statusText.textContent = "Maximum manual rectangles reached.";
      return;
    }

    const offset = Math.min(rects.length * 18, 90);
    const nextRect = normalizeManualGroupingRect(
      {
        x: STAGE_WIDTH / 2 - 150 + offset,
        y: STAGE_HEIGHT / 2 - 70 + offset,
        width: 300,
        height: 140,
        color: state.groupingContextColor
      },
      state,
      rects.length
    );
    writeManualGroupingRects([...rects, nextRect]);
    activePresetKey = null;
    syncGroupingControlsVisibility();
    updateOutputs();
    refreshText();
    statusText.textContent = "Manual grouping rectangle added. Drag its border or corners in the preview.";
    drawIdlePreview();
  }

  function clearManualGroupingRects() {
    writeManualGroupingRects([]);
    groupingRectDragTarget = null;
    activePresetKey = null;
    syncGroupingControlsVisibility();
    updateOutputs();
    refreshText();
    statusText.textContent = "Manual grouping rectangles cleared.";
    drawIdlePreview();
  }

  function findManualGroupingRectTarget(state, point) {
    if (state.groupingMode === "none") {
      return null;
    }

    const rects = state.manualGroupingRects || [];
    const handleRadius = 13;
    const edgeRadius = 9;
    for (let index = rects.length - 1; index >= 0; index -= 1) {
      const rect = rects[index];
      const corners = [
        { corner: "nw", x: rect.x, y: rect.y },
        { corner: "ne", x: rect.x + rect.width, y: rect.y },
        { corner: "sw", x: rect.x, y: rect.y + rect.height },
        { corner: "se", x: rect.x + rect.width, y: rect.y + rect.height }
      ];
      const cornerHit = corners.find((corner) => Math.hypot(point.x - corner.x, point.y - corner.y) <= handleRadius);
      if (cornerHit) {
        return { type: "groupingRectResize", rectIndex: index, corner: cornerHit.corner };
      }

      const insideX = point.x >= rect.x && point.x <= rect.x + rect.width;
      const insideY = point.y >= rect.y && point.y <= rect.y + rect.height;
      const nearLeft = Math.abs(point.x - rect.x) <= edgeRadius && insideY;
      const nearRight = Math.abs(point.x - (rect.x + rect.width)) <= edgeRadius && insideY;
      const nearTop = Math.abs(point.y - rect.y) <= edgeRadius && insideX;
      const nearBottom = Math.abs(point.y - (rect.y + rect.height)) <= edgeRadius && insideX;
      if (nearLeft || nearRight || nearTop || nearBottom) {
        return {
          type: "groupingRectMove",
          rectIndex: index,
          offset: { x: rect.x - point.x, y: rect.y - point.y }
        };
      }
    }
    return null;
  }

  function writeDraggedGroupingRect(target, point) {
    const state = cloneState();
    const rects = [...(state.manualGroupingRects || [])];
    const rect = rects[target.rectIndex];
    if (!rect) {
      return;
    }

    if (target.type === "groupingRectMove") {
      rects[target.rectIndex] = normalizeManualGroupingRect(
        {
          ...rect,
          x: point.x + target.offset.x,
          y: point.y + target.offset.y
        },
        state,
        target.rectIndex
      );
    } else if (target.type === "groupingRectResize") {
      let left = rect.x;
      let right = rect.x + rect.width;
      let top = rect.y;
      let bottom = rect.y + rect.height;
      if (target.corner.includes("w")) {
        left = clamp(point.x, 0, right - MANUAL_GROUPING_RECT_MIN_SIZE);
      }
      if (target.corner.includes("e")) {
        right = clamp(point.x, left + MANUAL_GROUPING_RECT_MIN_SIZE, STAGE_WIDTH);
      }
      if (target.corner.includes("n")) {
        top = clamp(point.y, 0, bottom - MANUAL_GROUPING_RECT_MIN_SIZE);
      }
      if (target.corner.includes("s")) {
        bottom = clamp(point.y, top + MANUAL_GROUPING_RECT_MIN_SIZE, STAGE_HEIGHT);
      }
      rects[target.rectIndex] = normalizeManualGroupingRect(
        {
          ...rect,
          x: left,
          y: top,
          width: right - left,
          height: bottom - top
        },
        state,
        target.rectIndex
      );
    }

    writeManualGroupingRects(rects);
  }

  function updateDraggedGroupingRect(event) {
    if (!groupingRectDragTarget) {
      return;
    }
    writeDraggedGroupingRect(groupingRectDragTarget, getStagePoint(event));
    activePresetKey = null;
    updateOutputs();
    refreshText();
    statusText.textContent = "Grouping rectangle updated.";
    drawIdlePreview();
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
      const segment = getRailSegments(cloneState())[target.railIndex] || getDefaultRailSegment(cloneState(), target.railIndex);
      const desiredStartX = point.x + target.startOffset.x;
      const desiredStartY = point.y + target.startOffset.y;
      writeRailSegment(
        target.railIndex,
        translateRailSegmentWithinStage(segment, desiredStartX - segment.startX, desiredStartY - segment.startY)
      );
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
    drawIdlePreview();
  }

  function getStartDragHandles(state) {
    const laneY = getMainLaneY(state);
    const originalGeometry = getGeometry(state, laneY, { scope: "original", directionSign: 1 });
    const handles = [
      {
        id: "originalLauncher",
        label: "O1",
        x: originalGeometry.launcherStartX,
        y: originalGeometry.launcherStartY,
        radius: originalGeometry.radius,
        xControl: "originalLauncherStartX",
        yControl: "originalLauncherStartY"
      },
      {
        id: "originalTarget",
        label: "O2",
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
          label: "O1",
          x: contextGeometry.launcherStartX,
          y: contextGeometry.launcherStartY,
          radius: contextGeometry.radius,
          xControl: "contextLauncherStartX",
          yControl: "contextLauncherStartY"
        },
        {
          id: "contextTarget",
          label: "O2",
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
    drawIdlePreview();
  }

  function bindStartDragging() {
    canvas.addEventListener("pointerdown", (event) => {
      const state = cloneState();
      const point = getStagePoint(event);

      if (state.customStartEnabled) {
        initializeCustomStartPositions();
        const handle = findStartDragHandle(cloneState(), point);
        if (handle) {
          stopPreview();
          startDragTarget = handle;
          canvas.setPointerCapture?.(event.pointerId);
          event.preventDefault();
          return;
        }
      }

      const groupingTarget = findManualGroupingRectTarget(state, point);
      if (groupingTarget) {
        stopPreview();
        groupingRectDragTarget = groupingTarget;
        canvas.setPointerCapture?.(event.pointerId);
        event.preventDefault();
        return;
      }

      const specialTarget = findSpecialDragTarget(state, point);
      if (specialTarget && specialTarget.type !== "railLine") {
        stopPreview();
        specialDragTarget = specialTarget;
        canvas.setPointerCapture?.(event.pointerId);
        event.preventDefault();
        return;
      }

      const trajectoryTarget = findTrajectoryTarget(state, point);
      if (trajectoryTarget) {
        stopPreview();
        beginTrajectoryDrag(trajectoryTarget, state);
        drawIdlePreview();
        canvas.setPointerCapture?.(event.pointerId);
        event.preventDefault();
        return;
      }

      if (!specialTarget) {
        return;
      }

      stopPreview();
      specialDragTarget = specialTarget;
      canvas.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    });

    canvas.addEventListener("pointermove", (event) => {
      if (groupingRectDragTarget) {
        updateDraggedGroupingRect(event);
        return;
      }
      if (trajectoryDragTarget) {
        updateDraggedTrajectory(event);
        return;
      }
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
      if (groupingRectDragTarget) {
        updateDraggedGroupingRect(event);
        canvas.releasePointerCapture?.(event.pointerId);
        groupingRectDragTarget = null;
        return;
      }
      if (trajectoryDragTarget) {
        updateDraggedTrajectory(event);
        canvas.releasePointerCapture?.(event.pointerId);
        trajectoryDragTarget = null;
        return;
      }
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

  function bindFractureTargetEditors() {
    if (!fractureTargetList) {
      return;
    }

    fractureTargetList.addEventListener("change", (event) => {
      const control = event.target.closest("[data-fracture-target]");
      if (!control || !fractureTargetList.contains(control)) {
        return;
      }

      const state = cloneState();
      const targets = getEffectiveFractureTargets(state);
      targets[control.dataset.fractureTarget] = control.checked;
      controls.fractureTargets.value = serializeFractureTargets(targets);
      syncFractureTargetsToLegacyControls(targets);
      activePresetKey = null;
      updateOutputs();
      refreshText();
      statusText.textContent = "Fracture targets updated.";
      drawIdlePreview();
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
    const originalRadius = Number(state.ballRadius) || stimulusDefaults.ballRadius;
    const contextRadius = Number(state.contextBallRadius) || originalRadius;
    const layoutRadius = Math.max(originalRadius, contextRadius);
    const spacing = getAutoContextPairSpacing(layoutRadius, visibleContextPairs, state.contextYOffset);
    const spacingSign = state.contextYOffset < 0 ? -1 : 1;
    const stackCenterY = STAGE_HEIGHT / 2 + state.stimulusYOffset;
    const originalLaneY = stackCenterY - (spacingSign * spacing * visibleContextPairs) / 2;
    return clamp(originalLaneY, 40 + layoutRadius, STAGE_HEIGHT - 40 - layoutRadius);
  }

  function stopPreview() {
    if (previewHandle !== null) {
      cancelAnimationFrame(previewHandle);
      previewHandle = null;
    }
    if (previewFallbackTimer !== null) {
      window.clearTimeout(previewFallbackTimer);
      previewFallbackTimer = null;
    }
    previewStart = 0;
    updatePreviewTimer(0, cloneState());
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

  function formatPreviewTime(ms) {
    return `${(Math.max(0, ms) / 1000).toFixed(2)} s`;
  }

  function updatePreviewTimer(elapsedMs, state) {
    if (!previewTimerBadge) {
      return;
    }
    const clampedElapsed = clamp(elapsedMs, 0, state.durationMs);
    previewTimerBadge.textContent = `${formatPreviewTime(clampedElapsed)} / ${formatPreviewTime(state.durationMs)}`;
  }

  function tickPreview(now) {
    const state = cloneState();
    if (previewStart === 0) {
      previewStart = now;
    }
    const elapsed = now - previewStart;
    const frameTime = getPreviewFrameTime(elapsed, state);
    drawFrame(state, frameTime, ctx);
    updatePreviewTimer(frameTime, state);

    if (elapsed < state.durationMs) {
      previewHandle = requestAnimationFrame(tickPreview);
      if (previewFallbackTimer !== null) {
        window.clearTimeout(previewFallbackTimer);
        previewFallbackTimer = null;
      }
    } else {
      previewHandle = null;
      previewStart = 0;
      if (previewFallbackTimer !== null) {
        window.clearTimeout(previewFallbackTimer);
        previewFallbackTimer = null;
      }
      updatePreviewTimer(state.durationMs, state);
    }
  }

  function tickPreviewFallback() {
    if (previewHandle === null || previewStart === 0) {
      return;
    }
    const state = cloneState();
    const elapsed = performance.now() - previewStart;
    const frameTime = getPreviewFrameTime(elapsed, state);
    drawFrame(state, frameTime, ctx);
    updatePreviewTimer(frameTime, state);
    if (elapsed < state.durationMs) {
      previewFallbackTimer = window.setTimeout(tickPreviewFallback, Math.max(16, 1000 / Math.max(1, state.fps || 60)));
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
    previewFallbackTimer = window.setTimeout(() => {
      if (previewHandle !== null && previewStart === 0) {
        previewStart = performance.now();
      }
      tickPreviewFallback();
    }, 120);
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

  function hashLabel(value) {
    let hash = 2166136261;
    const text = String(value);
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  function capFilenameBase(base, maxLength = MAX_EXPORT_BASENAME_LENGTH) {
    const cleanBase = sanitizeLabel(base);
    if (cleanBase.length <= maxLength) {
      return cleanBase;
    }
    const suffix = hashLabel(cleanBase);
    const prefixLength = Math.max(12, maxLength - suffix.length - 1);
    return `${cleanBase.slice(0, prefixLength).replace(/-+$/g, "")}-${suffix}`;
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
    const exportSize = getExportCanvasSize(state);
    const parts = [
      sanitizeLabel(state.fileLabel),
      `dur${compactNumber(state.durationMs)}ms`,
      `fps${compactNumber(state.fps)}`,
      `res${exportSize.width}x${exportSize.height}`,
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
    if (state.physicsEngineEnabled) {
      parts.push("physdisc");
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
    if (hasAnyFractureEnabled(state)) {
      parts.push("fracture");
    }
    return capFilenameBase(parts.join("-"));
  }

  function getExportMovieFilename(state, extension, date = new Date()) {
    return `${getExportFilenameBase(state)}-${getMonthDayTimestamp(date)}.${extension}`;
  }

  function copyExportDetails(exportDetails = {}) {
    return {
      ...exportDetails,
      width: exportDetails.width,
      height: exportDetails.height
    };
  }

  function rememberGeneratedMovie(state, filename, exportDetails) {
    lastExportSignature = getExportSignature(state);
    lastGeneratedMovieFilename = filename;
    lastGeneratedExportDetails = copyExportDetails(exportDetails);
  }

  function getReusableMovieFilename(state, extension) {
    const signature = getExportSignature(state);
    if (lastExportSignature === signature && lastGeneratedMovieFilename?.toLowerCase().endsWith(`.${extension}`)) {
      return lastGeneratedMovieFilename;
    }
    return getExportMovieFilename(state, extension);
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

  function hasCanvasCaptureStream(canvasElement = canvas) {
    return Boolean(canvasElement && typeof canvasElement.captureStream === "function");
  }

  function hasDownloadAttributeSupport() {
    return typeof HTMLAnchorElement !== "undefined" && "download" in HTMLAnchorElement.prototype;
  }

  function hasMediaRecorderSupport() {
    return typeof MediaRecorder !== "undefined";
  }

  function isTouchDevice() {
    return Boolean(navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
  }

  function isSmallViewport() {
    return typeof window.matchMedia === "function" && window.matchMedia("(max-width: 820px)").matches;
  }

  function isMobileLikeDevice() {
    return isTouchDevice() && isSmallViewport();
  }

  function getBrowserExportIssues(state = cloneState()) {
    const issues = [];
    if (!hasMediaRecorderSupport()) {
      issues.push("Video export needs MediaRecorder. Preview and CSV/JSON still work in this browser.");
    }
    if (!hasCanvasCaptureStream()) {
      issues.push("Video export needs canvas recording. Preview and CSV/JSON still work in this browser.");
    }
    if (state.outputFormat === "mp4" && hasMediaRecorderSupport() && typeof MediaRecorder.isTypeSupported === "function") {
      const supportsMp4 = getMimeCandidates({ ...state, outputFormat: "mp4" }).some(
        (candidate) => candidate.includes("mp4") && MediaRecorder.isTypeSupported(candidate)
      );
      if (!supportsMp4) {
        issues.push("MP4 is not available in this browser; export will try WebM instead.");
      }
    }
    if (!hasDownloadAttributeSupport()) {
      issues.push("Downloads may open in a viewer. Use Save/Share if the file does not save automatically.");
    }
    if (isMobileLikeDevice()) {
      issues.push("Mobile export can be slow. Use lower resolution first, then verify the exported movie.");
    }
    return issues;
  }

  function canExportVideoInThisBrowser() {
    return hasMediaRecorderSupport() && hasCanvasCaptureStream();
  }

  function updateCompatibilityNotice(state = cloneState()) {
    if (!compatibilityNotice) {
      return;
    }
    const issues = getBrowserExportIssues(state);
    compatibilityNotice.textContent = issues.join(" ");
    compatibilityNotice.classList.toggle("hidden", issues.length === 0);
    exportButton.disabled = isExporting || !canExportVideoInThisBrowser();
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

  function getMimeExtension(mimeType) {
    return String(mimeType || "").includes("mp4") ? "mp4" : "webm";
  }

  function getRecorderFallbackCandidates(state, preferredMimeType) {
    return [...new Set([preferredMimeType, ...getMimeCandidates(state), ""].filter((candidate) => candidate !== undefined))];
  }

  function createMediaRecorderWithFallback(stream, state, preferredFormat) {
    const canCheckSupport = hasMediaRecorderSupport() && typeof MediaRecorder.isTypeSupported === "function";
    const candidates = getRecorderFallbackCandidates(state, preferredFormat.mimeType);
    const baseOptions = {
      videoBitsPerSecond: Math.round(state.videoBitrate * 1000000)
    };
    if (state.soundEnabled) {
      baseOptions.audioBitsPerSecond = 128000;
    }

    for (const candidate of candidates) {
      if (candidate && canCheckSupport && !MediaRecorder.isTypeSupported(candidate)) {
        continue;
      }
      try {
        const options = candidate ? { ...baseOptions, mimeType: candidate } : baseOptions;
        const recorder = new MediaRecorder(stream, options);
        const actualMimeType = recorder.mimeType || candidate || preferredFormat.mimeType || "video/webm";
        return {
          recorder,
          mimeType: actualMimeType,
          extension: getMimeExtension(actualMimeType),
          usedFallback: actualMimeType !== preferredFormat.mimeType
        };
      } catch {
        // Try the next browser-supported MIME candidate.
      }
    }

    return null;
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

  function toEvenDimension(value) {
    return Math.max(2, Math.round(Number(value) / 2) * 2);
  }

  function getExportHeightPx(state) {
    return toEvenDimension(
      clamp(
        Math.round(Number(state.exportHeightPx) || DEFAULT_EXPORT_HEIGHT_PX),
        MIN_EXPORT_HEIGHT_PX,
        MAX_EXPORT_HEIGHT_PX
      )
    );
  }

  function getExportCanvasSize(state) {
    const [ratioWidth, ratioHeight] = getAspectRatioParts(state.aspectRatio);
    const targetHeight = getExportHeightPx(state);
    const width = toEvenDimension((targetHeight * ratioWidth) / ratioHeight);
    return {
      width,
      height: targetHeight
    };
  }

  function getStageExportCanvasSize(state) {
    const targetHeight = getExportHeightPx(state);
    return {
      width: toEvenDimension((targetHeight * STAGE_WIDTH) / STAGE_HEIGHT),
      height: targetHeight
    };
  }

  function getEncodedDimensions(exportDetails = {}) {
    return {
      width: exportDetails.width || STAGE_WIDTH * 2,
      height: exportDetails.height || DEFAULT_EXPORT_HEIGHT_PX
    };
  }

  function drawExportFrame(state, time, exportCtx, exportCanvas, scratchCanvas = null) {
    if ((state.aspectRatio || "16:9") === "16:9") {
      drawFrame(state, time, exportCtx);
      return;
    }

    const stageCanvas = scratchCanvas || document.createElement("canvas");
    const stageSize = getStageExportCanvasSize(state);
    stageCanvas.width = stageSize.width;
    stageCanvas.height = stageSize.height;
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

  function getImpactMovieTimeMs(state) {
    const geometry = getGeometry(state, getMainLaneY(state));
    return getPreBallBlinkMs(state) + geometry.stopTime;
  }

  function getTargetMovieOnsetMs(state) {
    const geometry = getGeometry(state, getMainLaneY(state));
    return getPreBallBlinkMs(state) + geometry.targetStartTime;
  }

  const MAX_CACHED_EXPORT_FRAMES = 720;
  const MAX_CACHED_EXPORT_PIXELS = 520_000_000;

  function shouldCacheExportFrames(state, exportCanvas) {
    const frameCount = getExportFrameCount(state);
    return (
      frameCount <= MAX_CACHED_EXPORT_FRAMES &&
      frameCount * exportCanvas.width * exportCanvas.height <= MAX_CACHED_EXPORT_PIXELS
    );
  }

  async function buildExportFrameCache(state, exportCanvas, aspectScratchCanvas, statusCallback = null) {
    if (!shouldCacheExportFrames(state, exportCanvas)) {
      return null;
    }

    const frameDuration = 1000 / state.fps;
    const totalFrames = getExportFrameCount(state);
    const frames = [];
    for (let frame = 0; frame < totalFrames; frame += 1) {
      const frameCanvas = document.createElement("canvas");
      frameCanvas.width = exportCanvas.width;
      frameCanvas.height = exportCanvas.height;
      const frameCtx = frameCanvas.getContext("2d");
      drawExportFrame(state, Math.min(frame * frameDuration, state.durationMs), frameCtx, frameCanvas, aspectScratchCanvas);
      frames.push(typeof createImageBitmap === "function" ? await createImageBitmap(frameCanvas) : frameCanvas);
      if (statusCallback) {
        statusCallback(frame + 1, totalFrames);
      }
    }
    return frames;
  }

  function drawCachedExportFrame(exportCtx, exportCanvas, frameImage) {
    exportCtx.setTransform(1, 0, 0, 1, 0, 0);
    exportCtx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);
    exportCtx.drawImage(frameImage, 0, 0, exportCanvas.width, exportCanvas.height);
  }

  function disposeExportFrameCache(frames) {
    (frames || []).forEach((frame) => {
      if (typeof frame.close === "function") {
        frame.close();
      }
    });
  }

  function hasScheduledImpactSound(state) {
    return Boolean(state.soundEnabled && state.soundVolume > 0 && getImpactMovieTimeMs(state) < state.durationMs);
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

  function getMetadataJsonName(filename) {
    return filename.replace(/\.(webm|mp4)$/i, "-metadata.json");
  }

  /*
   * Export schema invariant
   * The movie filename is a readable label, but the CSV and metadata JSON are
   * the durable parameter records. Keep these functions synchronized when a
   * parameter changes: buildPsychopyMetadata(), buildPsychopyCsv(),
   * withCondition(), stateFromConditionParameters(), and buildConditionSetCsv().
   */
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
        noAudio: !hasScheduledImpactSound(state),
        syncTimingWithScreenRefresh: true
      },
      coder: {
        className: "psychopy.visual.MovieStim",
        filename: movieFile,
        units: "pix",
        size: [encoded.width, encoded.height],
        pos: [0, 0],
        loop: false,
        noAudio: !hasScheduledImpactSound(state)
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
      resolution: {
        widthPx: encoded.width,
        heightPx: encoded.height
      },
      stageColor: state.stageColor,
      contextPairSnapshots: state.contextPairSnapshots,
      manualGroupingRects: state.manualGroupingRects,
      trajectoryOverrides: state.trajectoryOverrides,
      fractureEnabled: state.fractureEnabled,
      contextFractureEnabled: state.contextFractureEnabled,
      fractureTargets: state.fractureTargets,
      parameters: state,
      metadataEmbeddingNote:
        "Browser MediaRecorder exports do not reliably support embedded custom MP4/WebM metadata. Keep this JSON sidecar with the movie file.",
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
      resolutionPx: `${encoded.width}x${encoded.height}`,
      aspectRatio: state.aspectRatio,
      exportHeightPx: getExportHeightPx(state),
      units: "pix",
      positionXPix: 0,
      positionYPix: 0,
      forceEndRoutine: "true",
      loopPlayback: "false",
      noAudio: String(!hasScheduledImpactSound(state)),
      durationMs: state.durationMs,
      leadInMs: state.leadInMs,
      launcherSpeedPxPerSec: state.launcherSpeed,
      launcherAccelerationPxPerSec2: state.launcherAccel,
      launcherBehavior: state.launcherBehavior,
      targetSpeedRatio: state.targetSpeedRatio,
      targetAccelerationPxPerSec2: state.targetAccel,
      physicsEngineEnabled: state.physicsEngineEnabled,
      physicsMassModel: state.physicsEngineEnabled ? `equal-density visible discs, mass proportional to radius^${PHYSICS_ENGINE.massPower}` : "",
      physicsRestitution: state.physicsEngineEnabled ? PHYSICS_ENGINE.restitution : "",
      targetAngleDegrees: state.targetAngle,
      targetTravelMode: state.targetTravelMode,
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
      contextPairSnapshots: JSON.stringify(state.contextPairSnapshots),
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
      manualGroupingRects: JSON.stringify(state.manualGroupingRects),
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
      fractureEnabled: state.fractureEnabled,
      contextFractureEnabled: state.contextFractureEnabled,
      fractureTargets: JSON.stringify(state.fractureTargets),
      trajectoryEditEnabled: state.trajectoryEditEnabled,
      selectedTrajectoryBall: state.selectedTrajectoryBall,
      selectedTrajectoryAngle: state.selectedTrajectoryAngle,
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

  function setMetadataDownload(metadata, preferredName) {
    if (!metadataJsonLink) {
      return;
    }
    const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: "application/json" });
    if (currentMetadataJsonUrl) {
      URL.revokeObjectURL(currentMetadataJsonUrl);
    }
    currentMetadataJsonUrl = URL.createObjectURL(blob);
    metadataJsonLink.href = currentMetadataJsonUrl;
    metadataJsonLink.download = preferredName;
    metadataJsonLink.textContent = "Download metadata JSON";
    metadataJsonLink.classList.remove("hidden");
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

  function getExportSignature(state) {
    return JSON.stringify(state);
  }

  function clearGeneratedLink(link) {
    if (!link) {
      return;
    }
    link.removeAttribute("href");
    link.removeAttribute("download");
    link.classList.add("hidden");
  }

  function invalidateGeneratedExports() {
    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl);
      currentObjectUrl = null;
    }
    if (currentPsychopyUrl) {
      URL.revokeObjectURL(currentPsychopyUrl);
      currentPsychopyUrl = null;
    }
    if (currentMetadataJsonUrl) {
      URL.revokeObjectURL(currentMetadataJsonUrl);
      currentMetadataJsonUrl = null;
    }

    clearGeneratedLink(downloadLink);
    clearGeneratedLink(psychopyLink);
    clearGeneratedLink(metadataJsonLink);
    if (exportedVideo) {
      exportedVideo.removeAttribute("src");
      exportedVideo.load();
    }
    videoPanel?.classList.add("hidden");
    artifactChecklist?.classList.add("hidden");
    if (exportMeta) {
      exportMeta.textContent = "";
    }
    if (artifactFilename) {
      artifactFilename.textContent = "not exported";
    }
    if (artifactCsvStatus) {
      artifactCsvStatus.textContent = "pending";
    }
    if (artifactWarnings) {
      artifactWarnings.textContent = "no notes";
    }
    lastExportSignature = null;
    lastGeneratedMovieFilename = null;
    lastGeneratedExportDetails = null;
  }

  function readConditionParameter(parameters, key, fallback) {
    return Object.prototype.hasOwnProperty.call(parameters, key) && parameters[key] !== undefined
      ? parameters[key]
      : fallback;
  }

  function stateFromConditionParameters(baseState, parameters) {
    return {
      ...baseState,
      durationMs: readConditionParameter(parameters, "durationMs", baseState.durationMs),
      leadInMs: readConditionParameter(parameters, "leadInMs", baseState.leadInMs),
      launcherSpeed: readConditionParameter(parameters, "launcherSpeedPxPerSec", baseState.launcherSpeed),
      launcherAccel: readConditionParameter(parameters, "launcherAccelerationPxPerSec2", baseState.launcherAccel),
      targetSpeedRatio: readConditionParameter(parameters, "targetSpeedRatio", baseState.targetSpeedRatio),
      targetAccel: readConditionParameter(parameters, "targetAccelerationPxPerSec2", baseState.targetAccel),
      physicsEngineEnabled: readConditionParameter(parameters, "physicsEngineEnabled", baseState.physicsEngineEnabled),
      launcherBehavior: readConditionParameter(parameters, "launcherBehavior", baseState.launcherBehavior),
      targetAngle: readConditionParameter(parameters, "targetAngleDegrees", baseState.targetAngle),
      targetTravelMode: readConditionParameter(parameters, "targetTravelMode", baseState.targetTravelMode),
      launcherVisibleMs: readConditionParameter(parameters, "launcherVisibleMs", baseState.launcherVisibleMs),
      targetVisibleMs: readConditionParameter(parameters, "targetVisibleMs", baseState.targetVisibleMs),
      delayMs: readConditionParameter(parameters, "contactDelayMs", baseState.delayMs),
      gapPx: readConditionParameter(parameters, "gapPx", baseState.gapPx),
      markerMode: readConditionParameter(parameters, "markerMode", baseState.markerMode),
      ballRadius: readConditionParameter(parameters, "ballRadiusPx", baseState.ballRadius),
      occluderEnabled: readConditionParameter(parameters, "occluderEnabled", baseState.occluderEnabled),
      occluderWidth: readConditionParameter(parameters, "occluderWidthPx", baseState.occluderWidth),
      contactOcclusionMode: readConditionParameter(parameters, "contactOcclusionMode", baseState.contactOcclusionMode),
      contextMode: readConditionParameter(parameters, "contextMode", baseState.contextMode),
      contextPairCount: readConditionParameter(parameters, "contextPairCount", baseState.contextPairCount),
      contextPairSnapshots: readConditionParameter(parameters, "contextPairSnapshots", baseState.contextPairSnapshots),
      contextDurationMs: readConditionParameter(parameters, "contextDurationMs", baseState.contextDurationMs),
      contextOffsetMs: readConditionParameter(parameters, "contextOffsetMs", baseState.contextOffsetMs),
      contextDirection: readConditionParameter(parameters, "contextDirection", baseState.contextDirection),
      contextYOffset: readConditionParameter(parameters, "contextYOffsetPx", baseState.contextYOffset),
      contextBallRadius: readConditionParameter(
        parameters,
        "contextBallRadiusPx",
        readConditionParameter(parameters, "ballRadiusPx", baseState.contextBallRadius)
      ),
      contextLeadInMs: readConditionParameter(parameters, "contextLeadInMs", baseState.contextLeadInMs),
      contextLauncherSpeed: readConditionParameter(parameters, "contextLauncherSpeedPxPerSec", baseState.contextLauncherSpeed),
      contextLauncherAccel: readConditionParameter(
        parameters,
        "contextLauncherAccelerationPxPerSec2",
        baseState.contextLauncherAccel
      ),
      contextLauncherBehavior: readConditionParameter(parameters, "contextLauncherBehavior", baseState.contextLauncherBehavior),
      contextDelayMs: readConditionParameter(parameters, "contextDelayMs", baseState.contextDelayMs),
      contextGapPx: readConditionParameter(parameters, "contextGapPx", baseState.contextGapPx),
      contextContactOcclusionMode: readConditionParameter(
        parameters,
        "contextContactOcclusionMode",
        baseState.contextContactOcclusionMode
      ),
      contextOccluderEnabled: readConditionParameter(parameters, "contextOccluderEnabled", baseState.contextOccluderEnabled),
      contextOccluderWidth: readConditionParameter(parameters, "contextOccluderWidthPx", baseState.contextOccluderWidth),
      contextTargetSpeedRatio: readConditionParameter(parameters, "contextTargetSpeedRatio", baseState.contextTargetSpeedRatio),
      contextTargetAccel: readConditionParameter(
        parameters,
        "contextTargetAccelerationPxPerSec2",
        baseState.contextTargetAccel
      ),
      contextTargetAngle: readConditionParameter(parameters, "contextTargetAngleDegrees", baseState.contextTargetAngle),
      contextLauncherVisibleMs: readConditionParameter(
        parameters,
        "contextLauncherVisibleMs",
        baseState.contextLauncherVisibleMs
      ),
      contextTargetVisibleMs: readConditionParameter(parameters, "contextTargetVisibleMs", baseState.contextTargetVisibleMs),
      renderMode: readConditionParameter(parameters, "renderMode", baseState.renderMode),
      stageTheme: readConditionParameter(parameters, "stageTheme", baseState.stageTheme),
      stageColor: readConditionParameter(parameters, "stageColor", baseState.stageColor),
      objectStyle: readConditionParameter(parameters, "objectStyle", baseState.objectStyle),
      groupingMode: readConditionParameter(parameters, "groupingMode", baseState.groupingMode),
      manualGroupingRects: parseManualGroupingRects(
        readConditionParameter(parameters, "manualGroupingRects", baseState.manualGroupingRects)
      ),
      contactGuideMode: readConditionParameter(parameters, "contactGuideMode", baseState.contactGuideMode),
      fractureEnabled: readConditionParameter(parameters, "fractureEnabled", baseState.fractureEnabled),
      contextFractureEnabled: readConditionParameter(parameters, "contextFractureEnabled", baseState.contextFractureEnabled),
      fractureTargets: parseFractureTargets(readConditionParameter(parameters, "fractureTargets", baseState.fractureTargets)),
      crosshairEnabled: readConditionParameter(parameters, "crosshairEnabled", baseState.crosshairEnabled),
      crosshairX: readConditionParameter(parameters, "crosshairX", baseState.crosshairX),
      crosshairY: readConditionParameter(parameters, "crosshairY", baseState.crosshairY),
      crosshairColor: readConditionParameter(parameters, "crosshairColor", baseState.crosshairColor),
      railEnabled: readConditionParameter(parameters, "railEnabled", baseState.railEnabled),
      railCount: readConditionParameter(parameters, "railCount", baseState.railCount),
      railLength: readConditionParameter(parameters, "railLengthPx", baseState.railLength),
      railStartX: readConditionParameter(parameters, "railStartX", baseState.railStartX),
      railStartY: readConditionParameter(parameters, "railStartY", baseState.railStartY),
      railEndX: readConditionParameter(parameters, "railEndX", baseState.railEndX),
      railEndY: readConditionParameter(parameters, "railEndY", baseState.railEndY),
      railSegments: readConditionParameter(parameters, "railSegments", baseState.railSegments),
      crosshairBlinkEnabled: readConditionParameter(parameters, "crosshairBlinkEnabled", baseState.crosshairBlinkEnabled),
      crosshairBlinkMs: readConditionParameter(parameters, "crosshairBlinkMs", baseState.crosshairBlinkMs),
      trajectoryEditEnabled: readConditionParameter(parameters, "trajectoryEditEnabled", baseState.trajectoryEditEnabled),
      selectedTrajectoryBall: readConditionParameter(parameters, "selectedTrajectoryBall", baseState.selectedTrajectoryBall),
      selectedTrajectoryAngle: readConditionParameter(parameters, "selectedTrajectoryAngle", baseState.selectedTrajectoryAngle),
      trajectoryOverrides: readConditionParameter(parameters, "trajectoryOverrides", baseState.trajectoryOverrides),
      customStartEnabled: readConditionParameter(parameters, "customStartEnabled", baseState.customStartEnabled),
      customStartKeepRowsHorizontal: readConditionParameter(
        parameters,
        "customStartKeepRowsHorizontal",
        baseState.customStartKeepRowsHorizontal
      ),
      customStartAlignStartsVertical: readConditionParameter(
        parameters,
        "customStartAlignStartsVertical",
        baseState.customStartAlignStartsVertical
      ),
      originalLauncherStartX: readConditionParameter(parameters, "originalLauncherStartX", baseState.originalLauncherStartX),
      originalLauncherStartY: readConditionParameter(parameters, "originalLauncherStartY", baseState.originalLauncherStartY),
      originalTargetStartX: readConditionParameter(parameters, "originalTargetStartX", baseState.originalTargetStartX),
      originalTargetStartY: readConditionParameter(parameters, "originalTargetStartY", baseState.originalTargetStartY),
      contextLauncherStartX: readConditionParameter(parameters, "contextLauncherStartX", baseState.contextLauncherStartX),
      contextLauncherStartY: readConditionParameter(parameters, "contextLauncherStartY", baseState.contextLauncherStartY),
      contextTargetStartX: readConditionParameter(parameters, "contextTargetStartX", baseState.contextTargetStartX),
      contextTargetStartY: readConditionParameter(parameters, "contextTargetStartY", baseState.contextTargetStartY),
      colorChangeMode: readConditionParameter(parameters, "colorChangeMode", baseState.colorChangeMode),
      colorChangeColor: readConditionParameter(parameters, "colorChangeColor", baseState.colorChangeColor),
      launcherColor: readConditionParameter(parameters, "launcherColor", baseState.launcherColor),
      targetColor: readConditionParameter(parameters, "targetColor", baseState.targetColor),
      contextColor: readConditionParameter(parameters, "contextColor", baseState.contextColor),
      contextTargetColor: readConditionParameter(parameters, "contextTargetColor", baseState.contextTargetColor),
      groupingOriginalColor: readConditionParameter(parameters, "groupingOriginalColor", baseState.groupingOriginalColor),
      groupingContextColor: readConditionParameter(parameters, "groupingContextColor", baseState.groupingContextColor),
      pxPerDva: readConditionParameter(parameters, "pxPerDva", baseState.pxPerDva),
      fixationDva: readConditionParameter(parameters, "fixationDva", baseState.fixationDva),
      stimulusXOffset: readConditionParameter(parameters, "stimulusXOffsetPx", baseState.stimulusXOffset),
      stimulusYOffset: readConditionParameter(parameters, "stimulusYOffsetPx", baseState.stimulusYOffset),
      soundEnabled: readConditionParameter(parameters, "soundEnabled", baseState.soundEnabled),
      soundType: readConditionParameter(parameters, "soundType", baseState.soundType),
      soundVolume: readConditionParameter(parameters, "soundVolume", baseState.soundVolume),
      outputFormat: readConditionParameter(parameters, "outputFormat", baseState.outputFormat),
      aspectRatio: readConditionParameter(parameters, "aspectRatio", baseState.aspectRatio),
      exportHeightPx: readConditionParameter(parameters, "exportHeightPx", baseState.exportHeightPx),
      videoBitrate: readConditionParameter(parameters, "videoBitrateMbps", baseState.videoBitrate),
      fps: readConditionParameter(parameters, "fps", baseState.fps)
    };
  }

  function getConditionMovieName(baseName, condition, index, extension) {
    const order = String(index + 1).padStart(2, "0");
    return `${capFilenameBase(`${baseName}-${order}-${sanitizeLabel(condition.label || "condition")}`)}.${extension}`;
  }

  function buildConditionManifest(kind, baseState, exportFormat = chooseExportFormat(baseState)) {
    const rawSet = buildConditionSet(kind, baseState);
    const baseName = capFilenameBase(`${sanitizeLabel(baseState.fileLabel)}-${sanitizeLabel(rawSet.family)}`, 150);
    const encoded = getEncodedDimensions(exportFormat.width ? exportFormat : getExportCanvasSize(baseState));
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
        resolutionPx: `${encoded.width}x${encoded.height}`,
        noAudio: !hasScheduledImpactSound(conditionState),
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
      resolutionPx: `${encoded.width}x${encoded.height}`,
      widthPx: encoded.width,
      heightPx: encoded.height,
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
      resolutionPx: condition.resolutionPx,
      exportHeightPx: condition.parameters.exportHeightPx,
      units: "pix",
      positionXPix: 0,
      positionYPix: 0,
      forceEndRoutine: "true",
      loopPlayback: "false",
      noAudio: String(condition.noAudio),
      durationMs: condition.parameters.durationMs,
      leadInMs: condition.parameters.leadInMs,
      launcherSpeedPxPerSec: condition.parameters.launcherSpeedPxPerSec,
      launcherAccelerationPxPerSec2: condition.parameters.launcherAccelerationPxPerSec2,
      launcherBehavior: condition.parameters.launcherBehavior,
      targetSpeedRatio: condition.parameters.targetSpeedRatio,
      targetAccelerationPxPerSec2: condition.parameters.targetAccelerationPxPerSec2,
      physicsEngineEnabled: condition.parameters.physicsEngineEnabled,
      physicsMassModel: condition.parameters.physicsMassModel,
      physicsRestitution: condition.parameters.physicsRestitution,
      targetAngleDegrees: condition.parameters.targetAngleDegrees,
      targetTravelMode: condition.parameters.targetTravelMode,
      launcherVisibleMs: condition.parameters.launcherVisibleMs,
      targetVisibleMs: condition.parameters.targetVisibleMs,
      contactDelayMs: condition.parameters.contactDelayMs,
      gapPx: condition.parameters.gapPx,
      markerMode: condition.parameters.markerMode,
      ballRadiusPx: condition.parameters.ballRadiusPx,
      occluderEnabled: condition.parameters.occluderEnabled,
      occluderWidthPx: condition.parameters.occluderWidthPx,
      contactOcclusionMode: condition.parameters.contactOcclusionMode,
      overlapPercent: condition.standards.overlapPercent,
      impactMs: condition.standards.impactMs,
      targetOnsetMs: condition.standards.targetOnsetMs,
      contextMode: condition.parameters.contextMode,
      contextPairCount: condition.parameters.contextPairCount,
      contextPairSnapshots: JSON.stringify(condition.parameters.contextPairSnapshots || []),
      contextDurationMs: condition.parameters.contextDurationMs,
      contextOffsetMs: condition.parameters.contextOffsetMs,
      contextDirection: condition.parameters.contextDirection,
      contextSeparationPx: condition.parameters.contextYOffsetPx,
      contextBallRadiusPx: condition.parameters.contextBallRadiusPx,
      contextLeadInMs: condition.parameters.contextLeadInMs,
      contextLauncherSpeedPxPerSec: condition.parameters.contextLauncherSpeedPxPerSec,
      contextLauncherAccelerationPxPerSec2: condition.parameters.contextLauncherAccelerationPxPerSec2,
      contextLauncherBehavior: condition.parameters.contextLauncherBehavior,
      contextDelayMs: condition.parameters.contextDelayMs,
      contextGapPx: condition.parameters.contextGapPx,
      contextContactOcclusionMode: condition.parameters.contextContactOcclusionMode,
      contextOccluderEnabled: condition.parameters.contextOccluderEnabled,
      contextOccluderWidthPx: condition.parameters.contextOccluderWidthPx,
      contextTargetSpeedRatio: condition.parameters.contextTargetSpeedRatio,
      contextTargetAccelerationPxPerSec2: condition.parameters.contextTargetAccelerationPxPerSec2,
      contextTargetAngleDegrees: condition.parameters.contextTargetAngleDegrees,
      contextLauncherVisibleMs: condition.parameters.contextLauncherVisibleMs,
      contextTargetVisibleMs: condition.parameters.contextTargetVisibleMs,
      renderMode: condition.parameters.renderMode,
      stageTheme: condition.parameters.stageTheme,
      stageColor: condition.parameters.stageColor,
      objectStyle: condition.parameters.objectStyle,
      groupingMode: condition.parameters.groupingMode,
      manualGroupingRects: JSON.stringify(condition.parameters.manualGroupingRects || []),
      contactGuideMode: condition.parameters.contactGuideMode,
      crosshairEnabled: condition.parameters.crosshairEnabled,
      crosshairX: condition.parameters.crosshairX,
      crosshairY: condition.parameters.crosshairY,
      crosshairColor: condition.parameters.crosshairColor,
      railEnabled: condition.parameters.railEnabled,
      railCount: condition.parameters.railCount,
      railLengthPx: condition.parameters.railLengthPx,
      railStartX: condition.parameters.railStartX,
      railStartY: condition.parameters.railStartY,
      railEndX: condition.parameters.railEndX,
      railEndY: condition.parameters.railEndY,
      railSegments: JSON.stringify(condition.parameters.railSegments || []),
      crosshairBlinkEnabled: condition.parameters.crosshairBlinkEnabled,
      crosshairBlinkMs: condition.parameters.crosshairBlinkMs,
      fractureEnabled: condition.parameters.fractureEnabled,
      contextFractureEnabled: condition.parameters.contextFractureEnabled,
      fractureTargets: JSON.stringify(condition.parameters.fractureTargets || {}),
      trajectoryEditEnabled: condition.parameters.trajectoryEditEnabled,
      selectedTrajectoryBall: condition.parameters.selectedTrajectoryBall,
      selectedTrajectoryAngle: condition.parameters.selectedTrajectoryAngle,
      trajectoryOverrides: JSON.stringify(condition.parameters.trajectoryOverrides || {}),
      customStartEnabled: condition.parameters.customStartEnabled,
      customStartKeepRowsHorizontal: condition.parameters.customStartKeepRowsHorizontal,
      customStartAlignStartsVertical: condition.parameters.customStartAlignStartsVertical,
      originalLauncherStartX: condition.parameters.originalLauncherStartX,
      originalLauncherStartY: condition.parameters.originalLauncherStartY,
      originalTargetStartX: condition.parameters.originalTargetStartX,
      originalTargetStartY: condition.parameters.originalTargetStartY,
      contextLauncherStartX: condition.parameters.contextLauncherStartX,
      contextLauncherStartY: condition.parameters.contextLauncherStartY,
      contextTargetStartX: condition.parameters.contextTargetStartX,
      contextTargetStartY: condition.parameters.contextTargetStartY,
      colorChangeMode: condition.parameters.colorChangeMode,
      colorChangeColor: condition.parameters.colorChangeColor,
      launcherColor: condition.parameters.launcherColor,
      targetColor: condition.parameters.targetColor,
      contextColor: condition.parameters.contextColor,
      contextTargetColor: condition.parameters.contextTargetColor,
      groupingOriginalColor: condition.parameters.groupingOriginalColor,
      groupingContextColor: condition.parameters.groupingContextColor,
      pxPerDva: condition.parameters.pxPerDva,
      fixationDva: condition.parameters.fixationDva,
      stimulusXOffsetPx: condition.parameters.stimulusXOffsetPx,
      stimulusYOffsetPx: condition.parameters.stimulusYOffsetPx,
      soundEnabled: condition.parameters.soundEnabled,
      soundType: condition.parameters.soundType,
      soundVolume: condition.parameters.soundVolume,
      outputFormat: condition.parameters.outputFormat,
      aspectRatio: condition.parameters.aspectRatio,
      videoBitrateMbps: condition.parameters.videoBitrateMbps,
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
    const exportSize = getExportCanvasSize(state);
    const exportFormat = chooseExportFormat(state);
    exportFormat.width = exportSize.width;
    exportFormat.height = exportSize.height;
    const filename = getReusableMovieFilename(state, exportFormat.extension);
    const signature = getExportSignature(state);
    const exportDetails =
      lastExportSignature === signature && lastGeneratedMovieFilename === filename && lastGeneratedExportDetails
        ? lastGeneratedExportDetails
        : exportFormat;
    setPsychopyDownload(buildPsychopyCsv(state, filename, exportDetails), getPsychopyCsvName(filename));
    setMetadataDownload(buildPsychopyMetadata(state, filename, exportDetails), getMetadataJsonName(filename));
    updateArtifactChecklist(state, filename, exportDetails);
    rememberGeneratedMovie(state, filename, exportDetails);
    statusText.textContent = "PsychoPy CSV and metadata ready.";
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
        physicsEngineEnabled: condition.physicsEngineEnabled,
        physicsMassModel: condition.physicsEngineEnabled
          ? `equal-density visible discs, mass proportional to radius^${PHYSICS_ENGINE.massPower}`
          : "",
        physicsRestitution: condition.physicsEngineEnabled ? PHYSICS_ENGINE.restitution : "",
        launcherBehavior: condition.launcherBehavior,
        targetAngleDegrees: condition.targetAngle,
        targetTravelMode: condition.targetTravelMode,
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
        contextPairCount: getContextPairCount(condition),
        contextPairSnapshots: condition.contextPairSnapshots,
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
        manualGroupingRects: condition.manualGroupingRects || [],
        contactGuideMode: condition.contactGuideMode,
        fractureEnabled: condition.fractureEnabled,
        contextFractureEnabled: condition.contextFractureEnabled,
        fractureTargets: condition.fractureTargets || {},
        crosshairEnabled: condition.crosshairEnabled,
        crosshairX: condition.crosshairX,
        crosshairY: condition.crosshairY,
        crosshairColor: condition.crosshairColor,
        railEnabled: condition.railEnabled,
        railCount: condition.railCount,
        railLengthPx: condition.railLength,
        railStartX: condition.railStartX,
        railStartY: condition.railStartY,
        railEndX: condition.railEndX,
        railEndY: condition.railEndY,
        railSegments: condition.railSegments,
        crosshairBlinkEnabled: condition.crosshairBlinkEnabled,
        crosshairBlinkMs: condition.crosshairBlinkMs,
        trajectoryEditEnabled: condition.trajectoryEditEnabled,
        selectedTrajectoryBall: condition.selectedTrajectoryBall,
        selectedTrajectoryAngle: condition.selectedTrajectoryAngle,
        trajectoryOverrides: condition.trajectoryOverrides,
        customStartEnabled: condition.customStartEnabled,
        customStartKeepRowsHorizontal: condition.customStartKeepRowsHorizontal,
        customStartAlignStartsVertical: condition.customStartAlignStartsVertical,
        originalLauncherStartX: condition.originalLauncherStartX,
        originalLauncherStartY: condition.originalLauncherStartY,
        originalTargetStartX: condition.originalTargetStartX,
        originalTargetStartY: condition.originalTargetStartY,
        contextLauncherStartX: condition.contextLauncherStartX,
        contextLauncherStartY: condition.contextLauncherStartY,
        contextTargetStartX: condition.contextTargetStartX,
        contextTargetStartY: condition.contextTargetStartY,
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
        aspectRatio: condition.aspectRatio,
        exportHeightPx: getExportHeightPx(condition),
        videoBitrateMbps: condition.videoBitrate,
        fps: condition.fps
      }
    };
  }

  /*
   * Condition sets are experiment plans. They export rows and expected movie
   * filenames for PsychoPy loops; they do not render every movie automatically.
   * The option values in index.html's conditionSetSelect must match these kinds.
   */
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

    // Psychometric grid: vary only overlap and delay while holding visual format fixed.
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

    // Overlap continuum: seven equal steps matching Ohl/Rolfs-style boundary tests.
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

    // Finer overlap continuum: nine steps for launch/pass response curves.
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

    // Causal capture: compare no context, mere motion, launch context, and pass-like context.
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

    // Context duration: keep context synchronized, vary how much context is visible.
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

    // Context timing: keep the test event fixed, shift the context earlier.
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

    // Direction phase: test whether capture depends on same/opposite motion direction.
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

    // Adaptation transfer: compare ambiguous tests at same and shifted screen locations.
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

    // Feature transfer: cross direction, speed, and color while preserving launch structure.
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

    // Category carve-up: build exemplars for launching, triggering, entraining, and controls.
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

    // Context after adaptation: before/after rows test whether context still shifts judgments.
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

    // Fallback direction-transfer family used when no more specific kind is matched.
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

  /*
   * Browser export path
   * MediaRecorder writes the movie. Custom MP4/WebM metadata cannot be embedded
   * reliably in a browser-only app, so exportVideo() also prepares CSV and JSON
   * sidecars that record the exact parameters.
   */
  async function exportVideo() {
    if (isExporting) {
      return;
    }

    if (!canExportVideoInThisBrowser()) {
      updateCompatibilityNotice(cloneState());
      statusText.textContent = "Video export is unavailable in this browser; CSV and JSON export still work.";
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
    const frameDuration = 1000 / state.fps;
    const totalFrames = getExportFrameCount(state);
    const cachedFrames = await buildExportFrameCache(state, exportCanvas, aspectScratchCanvas, (frame, count) => {
      statusText.textContent = `Rendering frame ${frame} of ${count}…`;
    });
    const stream = exportCanvas.captureStream(state.fps);
    let exportAudioContext = null;
    let exportAudioDestination = null;
    let pendingImpactSoundMs = null;

    if (state.soundEnabled) {
      const AudioContextClass = getAudioContextClass();
      if (AudioContextClass && typeof AudioContextClass.prototype.createMediaStreamDestination === "function") {
        exportAudioContext = new AudioContextClass();
        if (exportAudioContext.state === "suspended") {
          await exportAudioContext.resume().catch(() => {});
        }
        exportAudioDestination = exportAudioContext.createMediaStreamDestination();
        exportAudioDestination.stream.getAudioTracks().forEach((track) => {
          stream.addTrack(track);
        });
        const geometry = getGeometry(state, getMainLaneY(state));
        const impactTime = getPreBallBlinkMs(state) + geometry.stopTime;
        if (impactTime < state.durationMs) {
          pendingImpactSoundMs = impactTime;
        }
      } else {
        statusText.textContent = "AudioContext is unavailable; exporting silent video.";
      }
    }

    const exportFormat = chooseExportFormat(state);
    exportFormat.width = exportCanvas.width;
    exportFormat.height = exportCanvas.height;
    if (exportFormat.usedFallback) {
      statusText.textContent = "Requested format unsupported; using browser fallback.";
    }

    const recorderResult = createMediaRecorderWithFallback(stream, state, exportFormat);
    if (!recorderResult) {
      disposeExportFrameCache(cachedFrames);
      if (exportAudioContext) {
        await exportAudioContext.close().catch(() => {});
      }
      statusText.textContent = "Video encoder unavailable in this browser.";
      exportButton.disabled = false;
      isExporting = false;
      updateCompatibilityNotice(state);
      return;
    }
    const recorder = recorderResult.recorder;
    const mimeType = recorderResult.mimeType;
    exportFormat.mimeType = mimeType;
    exportFormat.extension = recorderResult.extension;
    exportFormat.usedFallback = exportFormat.usedFallback || recorderResult.usedFallback;
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
    if (exportAudioContext && exportAudioDestination && pendingImpactSoundMs !== null) {
      scheduleImpactSound(
        exportAudioContext,
        state,
        exportAudioDestination,
        exportAudioContext.currentTime + pendingImpactSoundMs / 1000
      );
    }

    const exportStartTime = performance.now();
    for (let frame = 0; frame < totalFrames; frame += 1) {
      const time = Math.min(frame * frameDuration, state.durationMs);
      if (cachedFrames) {
        drawCachedExportFrame(exportCtx, exportCanvas, cachedFrames[frame]);
      } else {
        drawExportFrame(state, time, exportCtx, exportCanvas, aspectScratchCanvas);
      }
      statusText.textContent = `Exporting frame ${frame + 1} of ${totalFrames}…`;
      const nextFrameTime = exportStartTime + (frame + 1) * frameDuration;
      await new Promise((resolve) => window.setTimeout(resolve, Math.max(0, nextFrameTime - performance.now())));
    }

    const finalFrameHoldUntil = exportStartTime + state.durationMs + frameDuration;
    await new Promise((resolve) => window.setTimeout(resolve, Math.max(0, finalFrameHoldUntil - performance.now())));
    disposeExportFrameCache(cachedFrames);
    recorder.stop();
    await stopped;
    if (exportAudioContext) {
      await exportAudioContext.close().catch(() => {});
    }

    const blob = new Blob(chunks, { type: mimeType });
    if (blob.size === 0) {
      statusText.textContent = "Export produced an empty file in this browser. Try a different format or browser.";
      exportButton.disabled = false;
      isExporting = false;
      updateCompatibilityNotice(state);
      return;
    }
    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl);
    }
    currentObjectUrl = URL.createObjectURL(blob);

    const filename = getReusableMovieFilename(state, exportFormat.extension);
    const psychopyFilename = getPsychopyCsvName(filename);
    downloadLink.href = currentObjectUrl;
    downloadLink.download = filename;
    downloadLink.textContent = "Download video";
    downloadLink.title = filename;
    downloadLink.classList.remove("hidden");
    setPsychopyDownload(buildPsychopyCsv(state, filename, exportFormat), psychopyFilename);
    setMetadataDownload(buildPsychopyMetadata(state, filename, exportFormat), getMetadataJsonName(filename));
    updateArtifactChecklist(state, filename, exportFormat);
    rememberGeneratedMovie(state, filename, exportFormat);

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
    try {
      autoDownload.click();
    } catch {
      statusText.textContent = "Export ready. Use the Download video link to save the file.";
    }
    autoDownload.remove();

    exportButton.disabled = false;
    isExporting = false;
    updateCompatibilityNotice(state);
  }

  function getFeedbackMailto() {
    const message = (feedbackMessage?.value || "").trim();
    const body = [
      "Comment:",
      message || "",
      "",
      "Page:",
      document.title,
      window.location.href,
      "",
      "If this concerns a parameter set, attach the exported metadata JSON or PsychoPy CSV."
    ].join("\n");
    return `mailto:rfan6@illinois.edu?subject=${encodeURIComponent(
      "Launching Video Maker feedback"
    )}&body=${encodeURIComponent(body)}`;
  }

  function updateFeedbackMailLink() {
    if (!feedbackMailLink) {
      return;
    }
    feedbackMailLink.href = getFeedbackMailto();
  }

  function setFeedbackPanelOpen(isOpen) {
    if (!feedbackToggle || !feedbackPanel) {
      return;
    }
    feedbackPanel.classList.toggle("hidden", !isOpen);
    feedbackToggle.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) {
      updateFeedbackMailLink();
      feedbackMessage?.focus();
    }
  }

  function bindFeedbackForm() {
    if (!feedbackToggle || !feedbackPanel || !feedbackMessage || !feedbackMailLink) {
      return;
    }

    updateFeedbackMailLink();
    feedbackToggle.addEventListener("click", () => {
      setFeedbackPanelOpen(feedbackPanel.classList.contains("hidden"));
    });
    feedbackMessage.addEventListener("input", updateFeedbackMailLink);
    feedbackMailLink.addEventListener("click", () => {
      updateFeedbackMailLink();
      statusText.textContent = "Email draft opened.";
    });
  }

  function bindControls() {
    groupingEnabledControl?.addEventListener("change", () => {
      activePresetKey = null;
      controls.groupingMode.value = groupingEnabledControl.checked ? "both" : "none";
      syncGroupingControlsVisibility();
      updateOutputs();
      refreshText();
      statusText.textContent = groupingEnabledControl.checked
        ? "Grouping on. Original pair and Context 1 are boxed automatically."
        : READY_STATUS;
      drawIdlePreview();
    });
    addGroupingRectButton?.addEventListener("click", addManualGroupingRect);
    clearGroupingRectsButton?.addEventListener("click", clearManualGroupingRects);

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
          updateOutputs();
          statusText.textContent = READY_STATUS;
        });
        return;
      }
      if (id === "contextMode" || id === "contextDirection") {
        control.addEventListener("change", () => {
          activePresetKey = null;
          syncContextControlVisibility();
          syncContextPairSnapshots();
          renderContextPairEditors();
          renderFractureTargetEditors();
          lastContextPairCount = Math.max(1, getContextPairCount(cloneState()) || 1);
          syncTrajectoryControlVisibility();
          syncGroupingControlsVisibility();
          enforceCustomStartConstraints();
          updateOutputs();
          refreshText();
          updateCompatibilityNotice(cloneState());
          statusText.textContent = READY_STATUS;
          drawIdlePreview();
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
          renderFractureTargetEditors();
          lastContextPairCount = nextPairCount;
          syncTrajectoryControlVisibility();
          updateOutputs();
          refreshText();
          statusText.textContent = "Context pair count updated.";
          drawIdlePreview();
        });
        return;
      }
      if (id === "contextYOffset") {
        control.addEventListener("input", () => {
          activePresetKey = null;
          reflowContextPairOffsets();
          updateOutputs();
          refreshText();
          statusText.textContent = "Context spacing updated.";
          drawIdlePreview();
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
          statusText.textContent = READY_STATUS;
          drawIdlePreview();
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
          drawIdlePreview();
        });
        return;
      }
      if (id === "crosshairEnabled") {
        control.addEventListener("change", () => {
          activePresetKey = null;
          if (!control.checked && controls.crosshairBlinkEnabled.checked) {
            controls.crosshairBlinkEnabled.checked = false;
          }
          syncCrosshairControlVisibility();
          syncSpecialDragUi();
          updateOutputs();
          refreshText();
          statusText.textContent = READY_STATUS;
          drawIdlePreview();
        });
        return;
      }
      if (id === "crosshairBlinkEnabled") {
        control.addEventListener("change", () => {
          activePresetKey = null;
          if (control.checked) {
            applyClassicLaunchAfterBlinkEnabled();
            return;
          }
          syncCrosshairControlVisibility();
          syncSpecialDragUi();
          updateOutputs();
          refreshText();
          statusText.textContent = READY_STATUS;
          drawIdlePreview();
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
          statusText.textContent = control.checked ? "Drag a trajectory vector in the preview." : READY_STATUS;
          drawIdlePreview();
        });
        return;
      }
      if (id === "textBoxEnabled") {
        control.addEventListener("change", () => {
          activePresetKey = null;
          syncTextBoxControlVisibility();
          updateOutputs();
          refreshText();
          statusText.textContent = control.checked ? "Text box on." : READY_STATUS;
          drawIdlePreview();
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
          drawIdlePreview();
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
          statusText.textContent = control.checked ? "Drag start positions on." : READY_STATUS;
          drawIdlePreview();
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
          statusText.textContent = READY_STATUS;
          drawIdlePreview();
        });
        return;
      }
      if (
        id.endsWith("StartX") ||
        id.endsWith("StartY") ||
        id === "contextPairSnapshots" ||
        id === "fractureTargets" ||
        id === "manualGroupingRects" ||
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
          "textBoxText",
          "textBoxColor",
          "textBoxSize",
          "textBoxX",
          "textBoxY",
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
          "exportHeightPx",
          "fps",
          "videoBitrate"
        ].includes(id)
      ) {
        const eventName = control.type === "checkbox" || control.tagName === "SELECT" ? "change" : "input";
        control.addEventListener(eventName, () => {
          if (id === "crosshairBlinkMs") {
            ensureBlinkLeavesFullClassicLaunchDuration();
          }
          updateOutputs();
          refreshText();
          statusText.textContent = READY_STATUS;
          drawIdlePreview();
        });
        return;
      }
      const eventName = control.type === "checkbox" || control.tagName === "SELECT" ? "change" : "input";
      control.addEventListener(eventName, () => {
        activePresetKey = null;
        if (id === "occluderEnabled" || id === "contextOccluderEnabled") {
          syncOccluderWidthVisibility();
        }
        if (id === "fractureEnabled") {
          renderFractureTargetEditors();
        }
        updateOutputs();
        refreshText();
        updateCompatibilityNotice(cloneState());
        statusText.textContent = READY_STATUS;
        drawIdlePreview();
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
      statusText.textContent = READY_STATUS;
    });

    previewButton.addEventListener("click", playPreview);
    physicsModeButton?.addEventListener("click", applyPhysicsMode);
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
      drawIdlePreview();
      updateCompatibilityNotice(cloneState());
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

  // Boot order matters: load preset sources, seed controls, bind events, then draw the first preset.
  loadHiddenBuiltInPresets();
  await loadSharedPresets();
  loadCustomPresets();
  populatePresetMenu();
  initializeRanges();
  enhanceRangePrecision();
  bindParameterHelp();
  bindControls();
  bindFeedbackForm();
  bindContextPairEditors();
  bindFractureTargetEditors();
  bindStartDragging();
  applyPreset(getVisiblePrimaryPresetKeys()[0] || customPresetKeys[0] || "canonical");
})();
