
## Run it

From this directory:

```bash
python3 serve.py
```

Then open:

[http://127.0.0.1:8000](http://127.0.0.1:8000)

You can also use:

```bash
python3 -m http.server 8000
```

## How to use it

1. Start from the closest preset. Use canonical launching as the baseline, overlap presets for launch/pass continua, capture presets for context effects, and occluded presets for tunnel-style displays.
2. Tune event-structure variables first: speed, acceleration, delay, spatial gap or overlap, target angle, and whether the launcher stops, continues, or entrains the target.
3. Add context only when it is part of the hypothesis. Nearby launches, pass controls, tunnel occlusion, after-contact depth order, and sound can all change the percept rather than merely decorate it.
4. Check the standards cards after each change. They summarize spatial relation, event category, capture timing, and approach/onset timing for the current stimulus.
5. Use event horizontal and vertical offsets when the research question concerns retinotopic location or adaptation transfer.
6. Switch to clean stimulus or fixation mode before exporting participant-facing videos. Keep lab preview for piloting and debugging.
7. Export both the WebM and the JSON sidecar. The JSON records the exact stimulus parameters, visual-angle metadata, colors, sound settings, and frame rate.
8. Use Build Matrix JSON when you need a preregisterable condition family rather than one hand-tuned clip.

## Literature-guided next directions

1. Boundary mapping: cross overlap with delay before interpreting a condition as clearly causal or non-causal. This gives a local psychometric map for the exact display geometry.
2. Retinotopic locality: compare same-location and shifted-location adapt/test clips. Retinotopic specificity is one of the strongest reasons to treat causal launching as perceptual rather than merely inferential.
3. Feature transfer: cross motion direction, speed, and color identity. Recent adaptation work suggests direction tuning is more diagnostic than speed or color identity.
4. Category carve-up: compare launching, triggering, entraining, pass/slip, and single-object controls. The point is to test whether causal perception is one kind or several related categories.
5. Context after adaptation: compare no-context, launch-context, and pass-context trials before and after launch adaptation. This targets whether causal capture operates through local launch detectors or through a broader contextual route.

## Literature notes used to shape the parameters

1. Michotte's launching effect is the baseline case: object A reaches object B, A stops, and B begins moving in the same direction with little or no delay. Later reviews still treat this as the prototypical causal-perception display.
2. Delay matters sharply. Michotte reported weakening by around 70 ms and disappearance by longer delays; a 2025 registered replication found strong sensitivity beginning even earlier on rating measures, with delayed-launch impressions rising around the 70-100 ms region rather than an all-or-none collapse.
3. Spatial gaps matter too, though not always as an absolute cutoff. The 2025 replication argues that gap effects are strong but can interact with speed and with the wording used to measure the percept, so a gap display should be treated as a graded manipulation rather than a guaranteed non-causal control.
4. Causal capture shows that nearby context can change the percept of an ambiguous collision. Scholl and Nakayama (2002) found that a full-overlap pass display was judged causal only rarely in isolation, but very often when paired with a synchronized nearby launch event. The effect weakened with temporal asynchrony and with opposite-direction motion.
5. Occluded or tunnel events can also be modulated by causal context. Bae and Flombaum (2011) report that the central tunnel event is typically seen as a pass in isolation, but synchronized launch context can make observers perceive a hidden causal launch behind the occluder.
6. Recent adaptation work treats overlap as a launch/pass continuum. Ohl and Rolfs use seven evenly spaced overlap steps from 0% to 100% in brief 175 ms events; Kominsky and Scholl use nine steps from 0% to 100% in 12.5% increments.
7. Launching, triggering, and entraining should not be collapsed. Kominsky and Scholl found triggering transfers with launching-like adaptation, while entraining does not.
8. Direction is not a neutral detail in adaptation paradigms. Ohl and Rolfs report direction-tuned causal routines, with adaptation transfer depending on whether the tested launch direction matches the adapted direction.
9. Participant-facing stimuli should usually be cleaner than lab previews. The app therefore separates lab annotations from exported stimulus rendering, so a video can include only the discs and an optional fixation mark.
10. Visual-angle metadata is included because the adaptation literature typically reports positions, object sizes, and separations in degrees of visual angle rather than raw pixels.
11. Visual object appearance is deliberately separated from the event structure. Color and simple-versus-shaded rendering can be varied without changing contact, gap, delay, or context parameters.
12. Sound is optional because auditory impact cues can change apparent causality. When enabled, the app records the chosen sound type and volume in the JSON sidecar.
13. Event offsets are included because retinotopic adaptation designs require same-location and shifted-location stimuli relative to fixation.
14. The newer matrix families are plans, not automatic trial runners: they encode phase, role, prediction, and literature anchor so the condition file can become a preregistration scaffold.

## Main references

- Michotte, A. (1963). *The Perception of Causality*. London: Methuen.
- Scholl, B. J., & Tremoulet, P. D. (2000). "Perceptual causality and animacy." *Trends in Cognitive Sciences*, 4(8), 299-309. [PubMed](https://pubmed.ncbi.nlm.nih.gov/10904254/)
- Scholl, B. J., & Nakayama, K. (2002). "Causal capture: Contextual effects on the perception of collision events." *Psychological Science*, 13(6), 493-498. [PDF](https://perception.yale.edu/papers/02-Scholl-Nakayama-PsychSci.pdf)
- Bae, G. Y., & Flombaum, J. I. (2011). "Amodal causal capture in the tunnel effect." *Perception*, 40(1), 74-90. [PubMed](https://pubmed.ncbi.nlm.nih.gov/21513186/)
- Young, M. E., & Falmier, O. (2008). "Launching at a distance: The effect of spatial markers." *The Quarterly Journal of Experimental Psychology*, 61(9), 1356-1370.
- Kominsky, J. F., & Scholl, B. J. (2020). "Retinotopic adaptation reveals distinct categories of causal perception." *Cognition*, 203, 104339.
- Kominsky, J. F., & Wenig, K. (2025). "Causal Perception(s)." *Cognitive Science*, 49, e70107.
- Ohl, S., & Rolfs, M. (2024). "Visual routines for detecting causal interactions are tuned to motion direction." *eLife*, 13, RP93454.
- Sommer, B., Rolfs, M., & Ohl, S. (2025). "Putting causality into context: Causal capture escapes the visual adaptation of causality." bioRxiv.
- Straube, B., & Chatterjee, A. (2010). "Space and time in perceptual causality." *Frontiers in Human Neuroscience*, 4, 28. [Open access](https://www.frontiersin.org/articles/10.3389/fnhum.2010.00028/pdf)
- White, P. A. (2018). "Perceptual impressions of causality are affected by common fate." *Psychological Research*, 82(4), 652-664. [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC6013513/)
- White, P. A. (2025). "Michotte's research on perceptual impressions of causality: a registered replication study." *Royal Society Open Science*, 12, 250244. [PDF](https://orca.cardiff.ac.uk/id/eprint/178603/1/white-2025-michotte-s-research-on-perceptual-impressions-of-causality-a-registered-replication-study.pdf)

## Current limits

- export format is WebM, because the app uses browser-native recording rather than a bundled video encoder
- the app is a stimulus generator, not a trial runner or response-collection framework
- matrix export creates condition specifications, not automatic batch-rendered videos
- the occluded mode is a practical hidden-launch/tunnel approximation for experiment design, not a claim that it exactly reproduces every historical stimulus geometry
- the 175 ms adaptation-style preset matches the approach/onset timing; the exported clip remains longer so the event can be reviewed and used outside a trial runner
- browser audio recording depends on MediaRecorder and AudioContext support; unsupported browsers will still export silent WebM files
