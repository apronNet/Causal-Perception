# Causal Launching Studio

This is a small local app for building and exporting causal-perception stimuli in the classic "one ball hits another ball" family. The current version is narrowed around Scholl and Nakayama's causal-capture displays and the launch/pass and launch/push contrasts used in recent COGS-style adaptation work.

## Open the app

Use the hosted web app:

[Open Causal Launching Studio](https://apronnet.github.io/Causal-Perception/)

No installation is needed. The app runs entirely in the browser, and generated videos/JSON files stay on the visitor's computer unless they choose to share them.

## Visitor path

1. Open the hosted app.
2. Pick `Causal capture scenario` and press `Apply`.
3. Press `Play` to inspect the clip.
4. Switch to `Clean stimulus` or `Clean stimulus with fixation` before exporting participant-facing clips.
5. Press `Export` for a video and `Export JSON` for the parameter record.

## What the app does

- previews launching clips in a browser canvas
- exposes the spatiotemporal parameters that matter for these papers: overlap, stop/continue/entrain behavior, delay, context type, context duration, context timing, direction, and separation
- includes literature-grounded presets for the 0% launch reference, 100% pass baseline, a visitor-facing causal capture scenario, synchronized causal capture, single-object control, 50 ms context window, 200 ms asynchronous control, opposite-direction capture, COGS 50% overlap, and COGS entraining
- reports overlap percentage, event category, capture-window status, and approach/onset timing for the current stimulus
- supports lab-preview, clean-stimulus, and clean-stimulus-with-fixation rendering modes
- adds exact numeric entry beside each slider, so pilot values can be typed rather than approximated by dragging
- records stimulus metadata: overlap, timing, context, display mode, frame rate, bitrate, and the computed standards cards
- generates downloadable condition matrices for Scholl/Nakayama context type, context duration, temporal asynchrony, direction phase, and Kominsky/Scholl nine-step overlap continua
- exports the configured stimulus as MP4/H.264 when the browser supports it, otherwise WebM, with frame rate, bitrate, and a sidecar `.json` parameter file

## Deployment process

This repository is ready for GitHub Pages without a build step because the app is plain `index.html`, `app.js`, and `styles.css` at the repository root.

To activate the public link:

1. In GitHub, open `Settings` -> `Pages`.
2. Set `Source` to `Deploy from a branch`.
3. Select the `main` branch and the repository root folder.
4. Press `Save`.
5. Give visitors this link:

[https://apronnet.github.io/Causal-Perception/](https://apronnet.github.io/Causal-Perception/)

If the hosted link is not enabled yet, run it locally from this directory:

```bash
python3 serve.py
```

Then open [http://127.0.0.1:8000](http://127.0.0.1:8000).

## How to use it

1. Start from the closest preset. Use S&N 100% pass for the isolated full-overlap baseline and S&N capture for the synchronized launch-context condition.
2. Tune event-structure variables first: speed, delay, overlap, and whether the launcher stops, continues, or entrains the target.
3. Add context only when it is part of the hypothesis: nearby launch, single moving object, context window, timing, direction, and vertical separation.
4. Check the standards cards after each change. They summarize spatial relation, event category, capture timing, and approach/onset timing for the current stimulus.
5. Switch to clean stimulus or fixation mode before exporting participant-facing videos. Keep lab preview for piloting and debugging.
6. Export both the video and the JSON sidecar. The JSON records the exact stimulus parameters, format, bitrate, and frame rate.
7. Use Build JSON in the Matrix panel when you need a preregisterable condition family rather than one hand-tuned clip.

## Literature-guided next directions

1. Context type: compare full-overlap no-context, single-object context, and launch-context trials.
2. Context duration: test whether 750, 500, 100, and 50 ms impact-centered context windows preserve capture.
3. Temporal synchrony: shift the launch context 0, 50, 100, or 200 ms before the full-overlap test event.
4. Direction phase: compare same-direction and opposite-direction launch context, plus the matched single-object controls.
5. Overlap continuum: use the nine-step 0-100% overlap matrix for COGS-style launch/pass psychometric checks.
6. Launch/push contrast: use the entraining preset when the question concerns whether entraining is a distinct causal percept.

## Interface design pass

The interface now follows a stricter research-tool rule: every visible control should either set a stimulus parameter, check the current stimulus, or export a reproducible record. The design pass uses Nielsen's usability heuristics for visible system status, recognition rather than recall, and minimalist design; GOV.UK form guidance for short visible labels and common-case ordering; and Swiss/International Typographic Style principles of grid layout, sans serif type, precise rules, and restrained color.

Design references used for this pass:

- Nielsen Norman Group, "10 Usability Heuristics for User Interface Design": https://www.nngroup.com/articles/ten-usability-heuristics/
- GOV.UK Service Manual, "Structuring forms": https://www.gov.uk/service-manual/design/form-structure
- GOV.UK Design System, "Text input": https://design-system.service.gov.uk/components/text-input/
- Swiss National Library, "The International style 1950-1970": https://www.nb.admin.ch/en/the-international-style-1950-1970

## Literature notes used to shape the parameters

1. Scholl and Nakayama's key test event is a 100% overlap display. In isolation it was judged causal on only 10.7% of trials.
2. The synchronized launch-context condition uses the same full-overlap test event, but adds a nearby 0% overlap launch. It was judged causal on 92.1% of trials.
3. The single-object context is a control for mere nearby motion. It produced only 5% causal reports in the 2002 study.
4. The context can be brief. A 50 ms impact-centered launch context still produced 60.7% causal reports.
5. Synchrony matters. When the context launch occurred 200 ms before the full-overlap test event, capture fell to a small minority of trials, about 20%.
6. Direction matters, but not all-or-none. Same-direction launch context produced stronger capture than opposite-direction launch context, though opposite-direction launch context still produced some capture.
7. Kominsky and Wenig treat overlap as a launch/pass continuum: 0% overlap is prototypical launching, 100% overlap is prototypical passing, and intermediate steps support psychometric functions.
8. Kominsky and Wenig also distinguish launching from entraining with a launch/push contrast, where the key variable is how long A continues to move with B after contact.

## Main references

- Michotte, A. (1963). *The Perception of Causality*. London: Methuen.
- Scholl, B. J., & Tremoulet, P. D. (2000). "Perceptual causality and animacy." *Trends in Cognitive Sciences*, 4(8), 299-309. [PubMed](https://pubmed.ncbi.nlm.nih.gov/10904254/)
- Scholl, B. J., & Nakayama, K. (2002). "Causal capture: Contextual effects on the perception of collision events." *Psychological Science*, 13(6), 493-498. [PDF](https://perception.yale.edu/papers/02-Scholl-Nakayama-PsychSci.pdf)
- Kominsky, J. F., & Scholl, B. J. (2020). "Retinotopic adaptation reveals distinct categories of causal perception." *Cognition*, 203, 104339.
- Kominsky, J. F., & Wenig, K. (2025). "Causal Perception(s)." *Cognitive Science*, 49, e70107.

## Current limits

- video export uses browser-native MediaRecorder; MP4/H.264 appears when supported, and WebM is the fallback
- the app is a stimulus generator, not a trial runner or response-collection framework
- matrix export creates condition specifications, not automatic batch-rendered videos
- the app approximates historical display geometry in browser pixels; use the JSON sidecar to record exact exported values
- the visible controls are intentionally narrow; older broad-animation controls are not part of the main workflow
