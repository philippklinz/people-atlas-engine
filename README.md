# People Atlas

Explore lives through time. A static, openly accessible Learning Lab for comparing people from science, philosophy, invention, politics, art and literature.

Select categories on the overview, then open their shared timeline. A person appears once even when several selected categories include them. Search, zoom, period presets, a readable list, source-backed biographies and URL navigation are included.

The timeline fills the viewport. Search, category selection, time controls and settings sit in a collapsible left menu. Person details slide in from the right at 40% of the desktop width; the timeline remains usable alongside them. Narrow screens use a full-width person panel and a collapsible overlay menu.

## Repositories

- This repository owns the engine, interface, translations and executable contract checks.
- [people-atlas-content](https://github.com/philippklinz/people-atlas-content) owns historical records, categories, images, sources and versioned JSON Schemas.
- The design follows [Modern Objectivity](https://github.com/philippklinz/modern-objectivity-style). See [the adoption record](docs/DESIGN.md).

## Run

Serve this directory with any static HTTP server, or publish the main branch root with GitHub Pages. For example:

    python3 -m http.server 8000

Open http://localhost:8000. There is no installation or compilation step. Direct file URLs are not supported because the application loads JSON and ES modules.

Edit atlas.config.json to choose another content catalogue. The default reads the content repository's main branch on reload. A pinned commit URL or a same-origin relative catalogue URL works through the same contract. A remote server must permit cross-origin requests. Network access is needed for the configured remote collection; this is not an offline bundle.

## Current scope

- 28 initial people and 10 overlapping categories in the companion content repository.
- Complete German and English journeys, with local UI messages and translated content. The remaining 22 official EU languages are planned under MO-13; see [language coverage](docs/LANGUAGES.md).
- Year-level dates, BCE/CE without year zero, approximate and bounded dates, living/unknown status.
- Unknown endpoints remain available in the list; the engine does not fabricate a lifespan bar.
- No geographical map, account system, editing backend or relationship graph.

## Validation

Open [tests/index.html](tests/index.html) through the same server. The tests use synthetic fixtures.

Optional command-line equivalent with a recent Node installation:

    node --input-type=module -e "import {runTests} from './tests/domain.mjs'; const r=runTests(); console.table(r); if(r.some(x=>!x.ok)) process.exit(1);"

The optional browser integration runner is documented in [docs/TESTING.md](docs/TESTING.md). It serves both repositories locally and never changes the production configuration.

## License

Original engine code and the Modern Objectivity stylesheet: GPL-2.0-only. Bundled libraries and fonts retain their own licenses; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Content images have individual attributions in the content records.
