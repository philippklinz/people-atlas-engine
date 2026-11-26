# Modern Objectivity adoption

The practical reference stylesheet is copied unchanged from philippklinz/modern-objectivity-style at commit 4301cfc75e7732550bc9d078cee5edeae49ce8d6 (26 November 2026).

Upstream rules reviewed:

- guides/visual-style-spec.md
- guides/data-visualization.md
- docs/05-time-interaction.md
- docs/10-multilingual-access.md
- guides/multilingual-pattern.md

The app uses the graphite navigation rail, light canvas, teal action accent, Liberation typefaces, semantic dark-theme tokens, 4 px spacing rhythm, 9 px panels and 5 px controls. People and their dates are the content. Small charts on the entry page are calculated from real catalogue records, not invented decoration.

The timeline library is locally vendored from the Anthropology Atlas distribution. App-specific rules override its injected default styles using scoped selectors. Do not rely on stylesheet order alone.

Uncertainty is identified with text and dashed/hatched bars, not colour alone. The list supplies a semantic table and ordinary links. A lifespan overlap is not a claim of contact or influence.

Dialogs use native modal focus handling. Language and colour changes preserve the selected records and time window. There is no automatic animation or polling; reduced-motion preferences are respected.

MO-13 permits incremental language coverage when explicitly reported. This first edition is complete in de/en; all other EU languages remain planned, not selectable as finished editions.
