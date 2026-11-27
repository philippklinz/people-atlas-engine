# Third-party resources

Libraries, fonts and styles are served locally. The engine records their hashes in vendor/manifest.json and styles/fonts/liberation/PROVENANCE.json.

| Resource | Origin | Terms |
| --- | --- | --- |
| Modern Objectivity laboratory stylesheet | philippklinz/modern-objectivity-style, commit 18a78bc5509bf8407600e87c19b5825fbc6cbf63 | GPL-2.0-only (LICENSE) |
| vis-timeline standalone ESM and CSS, 8.5.6 | Official browser distribution, copied from Anthropology Atlas commit 40fe8a3105fecb87f3311f5943c590069eaf1b82 | MIT option of its dual license; licenses/third-party/vis-timeline-* |
| Moment, 2.31.0 | Anthropology Atlas browser module | MIT; licenses/third-party/moment-LICENSE |
| Liberation Sans Web, Serif Web and Mono Web | philippklinz/LiberationFontsWeb, commit 991e89ba225875d100b5bc4048626e8b6ac93927, via the style kit | SIL Open Font License 1.1 (styles/fonts/liberation/LICENSE and AUTHORS) |
| Liberation Sans Narrow Web | Same LiberationFontsWeb distribution | GPL with font exception (styles/fonts/liberation/LICENSE-Sans-Narrow.txt and COPYING-Sans-Narrow) |

The vis standalone distribution embeds dependencies, including vis-data, vis-util, Hammer, keycharm, XSS/CSS filters, UUID, Babel and core-js helpers. Retain the embedded notices and the corresponding files in licenses/third-party. The package inventory and archive references in vendor/manifest.json record the inherited distribution provenance; the checked-in file hashes identify the executable bytes.

Content portraits are not included in the engine. Their individual source and license records live in people-atlas-content.
