# Utility Interface Benchmarks

This file records current external benchmarks for Launching Video Maker. The goal is not to imitate the surface style of industrial catalog sites. The goal is to borrow the product discipline: dense state, stable controls, domain-specific filters, visible specifications, and fast return to work.

## Benchmarks Checked

### McMaster-Carr

Use McMaster-Carr as the baseline for task-first catalog structure: dense categories, domain-specific filters, short descriptions, stable page patterns, and decision data close to the item being specified.

Carryover for this app:

- Keep the maker itself as the first screen.
- Keep controls domain-specific: O1, O2, delay, overlap, context, FPS, PsychoPy CSV, metadata.
- Put current parameter consequences next to the preview, not only inside export files.

### Digi-Key

Digi-Key's product index foregrounds filters such as in-stock and RoHS status, then lists categories and subcategories with item counts. Its value is not visual polish; it is letting engineers narrow a huge option space by real technical attributes.

Carryover for this app:

- Treat presets and condition sets as category routes, not decoration.
- Keep counts visible where counts matter: context pairs, condition rows, generated artifacts.
- Prefer exact parameter labels over generic tags.

Source: https://www.digikey.com/en/products

### Mouser

Mouser's component pages expose total results, quick stock/compliance flags, search-within-results, and manufacturer counts. It supports both known-part lookup and exploratory narrowing.

Carryover for this app:

- Support both quick preset use and exact parameter editing.
- Keep common binary flags close to the controls they affect.
- Make search/filter-like narrowing visible before users export.

Sources:

- https://www.mouser.com/electronic-components/
- https://www.mouser.com/searchtools/

### Grainger

Grainger foregrounds account/order shortcuts, order lookup, bulk order, product categories, branch/contact paths, and a large product-count claim. The useful pattern is operational: the user can return to procurement and support tasks without hunting.

Carryover for this app:

- Keep export actions close to the working surface.
- Show artifact status near preview and export, because exported files are the real lab deliverable.
- Avoid burying download state inside prose.

Source: https://www.grainger.com/

### MISUMI

MISUMI's CAD workflow turns selected specifications and dimensions into a part number, then into CAD preview/download. The important lesson is that specification, preview, and output artifact are one chain.

Carryover for this app:

- Treat parameter settings, preview, exported video, PsychoPy CSV, and metadata JSON as one chain.
- Keep preview clearly secondary to exported video for timing.
- Show the user which specs are defining the current output.

Source: https://us.misumi-ec.com/guide/category/ecatalog/use_cad.html

### Octopart

Octopart combines search, filters, price/availability, part specifications, distributor rows, datasheets, CAD links, and BOM actions. Its strong pattern is comparison: it lets technical users compare options without opening many pages.

Carryover for this app:

- Put compact current-state facts next to the preview: relation, category, context, timing, output, and filename.
- Keep CSV/JSON/video artifact status explicit.
- Make condition sets clear as plans, not rendered videos.

Sources:

- https://octopart.com/
- https://octopart.com/distributors/component-search
- https://octopart.com/pulse/p/exploring-octoparts-powerful-search-filters

### Thomasnet

Thomasnet centers supplier discovery, product catalogs, CAD models, certifications, capabilities, services, shortlists, and regional sourcing. The useful pattern is capability filtering: users search by what a supplier can do, not by marketing claims.

Carryover for this app:

- Organize advanced controls by what they let the experimenter do: movement, position, visible cue, output, condition planning.
- Keep feature names tied to experimental function.
- Avoid broad "advanced settings" buckets when a functional group is clearer.

Source: https://www.thomasnet.com/

## Design Rules For This App

1. The preview panel should show the current experiment facts without requiring the user to open a details drawer.
2. The visible facts should be compact and operational: relation, category, context, timing, output, and filename.
3. Export and artifact state should stay close to preview because the exported video is the real stimulus.
4. Labels should use domain terms, not generic UI vocabulary.
5. Dense layout is acceptable only when alignment, short labels, and stable dimensions keep scanning fast.
6. Any new feature must say which output record proves it: video, PsychoPy CSV, metadata JSON, or condition-set manifest.
