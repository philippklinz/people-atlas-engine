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

A compact header reserves space above the timeline for the menu button, time controls, language, theme and link copying. On narrow screens these controls wrap into rows without horizontal scrolling. The timeline fills the remaining viewport. The graphite menu overlays the left side and never shifts, resizes or refits the timeline. Search, categories, manual year entry and explanatory notes remain in the menu. It starts closed on every screen size and closes after opening the timeline, applying categories, switching views or applying a valid year range. A dimmed backdrop covers the workspace and any desktop person panel. Clicking it, pressing Escape or using the close button dismisses the menu. Focus stays inside the open menu, background controls are inert, and dismissal returns focus to the menu button. Each panel scrolls independently.

Person details slide in from the right, using 40% of desktop width with a 400 px reading minimum. This native non-modal dialog leaves the timeline and menu operable. At 700 px or narrower it fills the viewport and uses native modal focus handling; crossing the breakpoint updates that behavior. Escape and the close button dismiss the panel. Language and colour changes preserve the selected records and time window. The entry transition respects reduced motion; there is no automatic animation or polling.

MO-13 permits incremental language coverage when explicitly reported. This first edition is complete in de/en; all other EU languages remain planned, not selectable as finished editions.
