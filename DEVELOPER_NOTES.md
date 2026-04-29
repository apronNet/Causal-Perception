# Launching Video Maker Code Notes

This app is a single-page stimulus generator.

- `index.html` defines the visible controls and export buttons.
- `styles.css` controls layout and the Swiss-style interface.
- `app.js` holds presets, parameter defaults, rendering, preview playback, and export.

To add a new adjustable parameter:

1. Add the control in `index.html`.
2. Add its id to `controlIds` in `app.js`.
3. Add a default in `stimulusDefaults` or `presentationDefaults`.
4. Read it in `cloneState()`.
5. Use it in the relevant drawing helper.
6. Add it to `buildMetadata()` and `buildPsychopyCsv()` if it should be saved for PsychoPy.

Main-event motion is computed by `getMainEventState()`.
Context-event motion is computed by `getContextMotionState()` plus `getDirectedEventState()`, so the context row can have its own speed, acceleration, delay, overlap, target ratio, and angle.

For PsychoPy, export the movie and the PsychoPy CSV. Put the movie file in a `stimuli/` folder, use the CSV as a loop conditions file, and set the Builder MovieStim filename field to `$movieFile`.
