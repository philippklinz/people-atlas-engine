# People Atlas engineering rules

Read README.md and docs/DATA_MODEL.md before changing the application.

- Modern Objectivity is binding. Read docs/DESIGN.md and the pinned upstream rules before visual work. Reuse semantic tokens and the vendored reference stylesheet. Keep focus, readable density, empty/error states and reduced motion working.
- This is a directly executable static site: native browser HTML, CSS and JavaScript. No application build, package manager, backend, telemetry, accounts or CDN dependencies.
- Historical biographies, categories, media and citations belong in people-atlas-content. Only explicitly synthetic test fixtures belong in this repository.
- The content source is configured in atlas.config.json; do not hardcode biographies, category IDs or a second fallback dataset in runtime code.
- Category selection is a union, including descendants. Render each person once, regardless of overlapping selections.
- Preserve stable person/category IDs, contract versioning, unknown values and uncertainty. Never invent a birth or death date to make a record plottable.
- Civil years have no year zero. Convert explicitly when using JavaScript Date or vis-timeline.
- Views, people, language, filters and time windows have real URLs. Direct links and browser Back/Forward must work without local storage.
- Dependencies, fonts, licenses and provenance are committed locally. Deliberately review upgrades and update vendor/manifest.json.
- MO-13 targets all 24 EU languages. The current complete editions are de/en; the other 22 are planned. Do not advertise incomplete editions. Maintain source fingerprints and honest review status.
- Run the browser-based contract tests and appropriate browser checks for substantial UI changes. Node/Playwright are optional development tools only, never application dependencies.
- Do not claim historical accuracy, native-language review or WCAG conformance from passing automated tests.
