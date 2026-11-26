# Checks

The production app has no Node or package-manager dependency.

## Browser-only contract checks

Serve the app and open tests/index.html. This covers category union and hierarchy, historical date conversions, uncertain/unknown values, URL round trips, invalid content and translation-key consistency.

## Optional command-line checks

    node tests/check.mjs

This additionally checks vendored bytes and the UI translation fingerprint. When a sibling people-atlas-content checkout exists, it checks the real content with the runtime validator.

## Optional browser integration

Use an existing development installation of Playwright:

    PLAYWRIGHT_MODULE=/absolute/path/to/playwright node tests/browser-check.cjs

Optional environment variables:

- BROWSER_EXECUTABLE: an existing Chromium executable.
- ATLAS_CONTENT_DIR: an alternate content checkout (default: sibling people-atlas-content).

The runner starts its own local server and routes the configuration only inside its isolated browser. It leaves atlas.config.json untouched. Screenshots are written to ignored qa/. It verifies category overlap, dates, time controls, search, list mode, person links, browser history, local portraits, language and theme preservation, keyboard operation, narrow layouts, unsupported-language fallback and failed-load recovery.

Workspace checks cover the full viewport without page scrolling, unchanged canvas and plot geometry when the left menu opens or closes, preservation of the time window, the 40% right-hand person panel, timeline interaction while that panel is open, and the switch between non-modal desktop and modal narrow-screen details.

Automated checks do not establish historical accuracy, native-language review or full assistive-technology conformance.
