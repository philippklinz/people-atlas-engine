# Third-party resources

All runtime resources are local. Exact bytes are recorded in vendor/manifest.json.

| Resource | Origin | Terms |
| --- | --- | --- |
| Modern Objectivity laboratory stylesheet | philippklinz/modern-objectivity-style, commit 4301cfc75e7732550bc9d078cee5edeae49ce8d6 | GPL-2.0-only; LICENSE |
| vis-timeline standalone ESM and CSS, 8.5.6 | Official browser distribution, copied from Anthropology Atlas commit 40fe8a3105fecb87f3311f5943c590069eaf1b82 | MIT option of its dual license; licenses/third-party/vis-timeline-* |
| Moment, 2.31.0 | Anthropology Atlas browser module | MIT; licenses/third-party/moment-LICENSE |
| Liberation Sans, Serif and Mono | Anthropology Atlas local font distribution | SIL Open Font License; licenses/liberation.txt |

The vis standalone distribution embeds dependencies, including vis-data, vis-util, Hammer, keycharm, XSS/CSS filters, UUID, Babel and core-js helpers. Retain the embedded notices and the corresponding files in licenses/third-party. The package inventory and archive references in vendor/manifest.json record the inherited distribution provenance; the checked-in file hashes identify the executable bytes.

Content portraits are not included in the engine. Their individual source and license records live in people-atlas-content.
