# Launching Video Maker

[Open Launching Video Maker](https://apronnet.github.io/Causal-Perception/)

No installation is needed.

## PsychoPy

For one stimulus, adjust the display, click **Export video**, then click **Export PsychoPy CSV**. Put the movie in a PsychoPy `stimuli/` folder and use the CSV as the loop conditions file. In Builder, set the Movie field to `$movieFile`.

**Condition set** is not a display parameter. It makes a batch plan for an experiment. Choose a family such as **Delay x overlap grid** or **Capture: context duration**, then click **Set CSV**. Each CSV row is one planned trial condition, with movie filename, duration, overlap, delay, context type, FPS, and warnings.

**Set CSV** exports the condition set as a PsychoPy-ready table. **Set JSON** exports the same condition set with fuller parameter records.

Condition sets do not automatically render every video. They create the table and expected filenames; you still need matching movie files for those rows.
