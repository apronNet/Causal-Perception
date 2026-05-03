# Launching Video Maker Developer Notes

This is a browser-only, single-page stimulus generator. There is no build step.

- `index.html` defines the visible controls and export buttons.
- `styles.css` controls layout and the Swiss-style interface.
- `app.js` holds presets, parameter defaults, state, rendering, preview playback, PsychoPy export, and condition-set export.
- `shared-presets.json` is the committed source for presets that should load for everyone.
- `UTILITY_BENCHMARKS.md` records the current utility-site benchmarks used for interface decisions.
- `FORKING_GUIDE.md` is the code-orientation guide for labs adapting the app for a new experiment.

## Main Code Path

1. HTML controls are registered in `controlIds`.
2. Defaults come from `stimulusDefaults` and `presentationDefaults`.
3. `cloneState()` reads the current controls into the canonical stimulus object.
4. `getGeometry()` turns that state into contact time, object positions, and launch direction.
5. `drawFrame()` renders both preview and exported frames.
6. `exportVideo()` writes the movie and prepares PsychoPy CSV plus metadata JSON sidecars.
7. `buildFrameLogCsv()` exports per-frame object coordinates for measurement checks.

For a diagrammed version of this pipeline, including context-pair state and condition-set export, see `FORKING_GUIDE.md`.

## Add A New Adjustable Parameter

Touch every relevant point below. Missing one is the usual source of silent bugs.

1. Add the control in `index.html`.
2. Add its id to `controlIds` in `app.js`.
3. Add a default in `stimulusDefaults` or `presentationDefaults`.
4. Add short hover copy in `parameterHelp`.
5. Read it in `cloneState()`.
6. If it needs a visible value, update `formatValue()` and `formatUnitHint()`.
7. If it should appear in the preview summary, update `refreshSummary()` and possibly `getStandards()`.
8. If it creates a participant-visible cue, update `getExperimentWarnings()`.
9. Use it in the relevant motion or drawing helper.
10. If it should be reproducible, update `getExportFilenameBase()`, `buildPsychopyMetadata()`, and `buildPsychopyCsv()`.
11. If condition sets need it, update `withCondition()`, `stateFromConditionParameters()`, `buildConditionSetCsv()`, and the relevant `buildConditionSet()` family.
12. Update documentation. Use `README.md` for user-facing workflow, `FORKING_GUIDE.md` for internal pipeline or control-ownership changes, and this file for maintainer checklist changes. If the feature is visual, add or refresh a small guide image in `docs/screenshots/`.

## Context Pairs

Context 1 uses the normal context controls. Context 2 and later are stored as JSON in `contextPairSnapshots` and rendered dynamically. When a new context pair is added, it copies the current original pair; later edits to the original pair do not automatically change that copied pair.

Many context rows auto-shrink and re-space so up to 10 pairs fit vertically. If a lab changes the stage size, check `getAutoContextPairRadius()` and `getAutoContextPairSpacing()`.

## Motion Conventions

- Position units are pixels.
- Time units are milliseconds.
- Speed uses px/s.
- Acceleration uses px/s^2.
- `gapPx < 0` means overlap.
- `gapPx = 0` means the borders just touch.
- `gapPx > 0` means a visible gap.
- `contextOffsetMs < 0` means the context event happens earlier than the original pair.

Main-event motion is computed by `getMainEventState()`. Context-event motion is computed by `getContextMotionState()` plus `getDirectedEventState()`, so context rows can have their own speed, acceleration, delay, overlap, target ratio, angle, travel time after collision, occlusion, and visible duration.

`targetTravelMs` controls how long O2 keeps moving after collision. `targetVisibleMs` is separate: it controls whether O2 disappears while still on screen.

Billiard mode keeps the normal contact geometry up to impact. After impact, it uses ball size as mass, applies table friction, and reflects balls off stage bounds. Clean head-on hits should stay straight: do not add synthetic cut, spin, or bank steering unless the visible setup actually creates that geometry. If table friction stops a ball before the next wall, the ball stops there; do not force a wall contact.

## PsychoPy Export

For one stimulus, export the movie and the PsychoPy CSV. Put the movie file in a `stimuli/` folder, use the CSV as a loop conditions file, and set the Builder MovieStim filename field to `$movieFile`.

Condition sets are batch plans, not rendered movies. `buildConditionSet()` creates rows and expected filenames; the lab still needs matching movie files for those rows.

Browser MediaRecorder cannot reliably embed custom MP4/WebM metadata. The app therefore exports a metadata JSON sidecar. Treat the CSV and JSON as the durable parameter record.

The one-row PsychoPy CSV and metadata JSON include event-frame records for contact and O2 onset. The frame-log CSV is separate: it records one row per exported frame and object with x/y position, visibility, and stage-bound status.

Clip sequences are one movie made from several saved clip states. `sequenceClips` stores full `cloneState()` snapshots in memory. Current-clip preview draws only the active state; sequence preview/export uses playback-plan helpers so timing, sound cues, metadata JSON, PsychoPy CSV, and frame-log CSV all use the same clip order and total duration. Keep export settings sequence-level: one FPS, aspect ratio, resolution, bitrate, format, and filename for the whole movie.

For timing, visibility, contact-geometry, or Billiard changes, run `node tools/export-pixel-probe.mjs`. It exports real videos in Chrome and measures decoded pixels without `ffmpeg`.

## README / GitHub Page

The GitHub page is part of the tool. Keep it current whenever the app gains a new parameter, special feature, export behavior, or PsychoPy workflow.

- Add short user guidance to `README.md`.
- Add practical PsychoPy consequences when a feature changes export or CSV behavior.
- Add a guide image in `docs/screenshots/` when a feature is easier to understand visually.
- Keep images simple enough that they stay useful even if the interface layout changes.

## Documentation Maintenance Rule

Keep the documentation updated with every project adjustment, including changes made in nearby work sessions. Documentation is not only a user manual; it is the confidence layer for labs that want to fork or repurpose the app.

- If a control moves sections, update `README.md` and `FORKING_GUIDE.md` so control ownership stays current.
- If an internal value remains hidden for compatibility, mention that in `FORKING_GUIDE.md` when it could confuse a fork maintainer.
- If export artifacts change, update `README.md`, `FORKING_GUIDE.md`, and the PsychoPy/export notes above.
- If a code path changes, update the relevant checklist in this file.
- If a feature changes what participants see or hear, include its experimental meaning, not only its UI label.

Current ownership reminder: **Individual trajectories** belongs to Movement. **Move start points** belongs to Position. Whole-stimulus x/y offsets are internal hidden fields unless a specific experiment needs them exposed.

## Utility Interface Benchmarks

Use `UTILITY_BENCHMARKS.md` before making layout changes. The current benchmark set is McMaster-Carr, Digi-Key, Mouser, Grainger, MISUMI, Octopart, and Thomasnet.

Current app-level rule: the preview panel must expose the working stimulus facts without forcing users to open a details drawer. Keep relation, category, context, timing, output, and filename visible near the canvas. These facts are the equivalent of catalog specifications, availability, and CAD/download state in industrial tools.
