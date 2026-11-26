# Content contract 1.0.0

The companion content repository owns the machine-readable schemas under schemas/1.0.0. The engine rejects unsupported schema versions and validates record structure, category references, uniqueness, dates, source links and media paths before rendering.

## Catalogue

A catalogue supplies schemaVersion, id, multilingual title, updated date, license, available languages, a relative categories file, and an ordered list of relative collection files. Each collection is an array of people. Optional featured IDs drive the entry-page lifespan preview.

All collection and image paths are relative to the catalogue directory. They cannot escape that directory or change the origin. External source and license links are HTTP(S) hyperlinks; they are not fetched by the application.

## Categories and people

Category fields: id, optional parent, semantic icon, multilingual name and description. Parent selection includes descendants. The hierarchy must be acyclic.

Person fields: id, canonical name, aliases, birth, death, life status, category IDs, multilingual summary and biography, highlights, sources, optional date note and portrait.

IDs are lowercase ASCII slugs. They are permanent addresses, independent of a person's display name or a translation. Renaming a record must preserve its ID. Categories are modern editorial groupings and can overlap.

## Historical time

The stored calendar uses signed civil years: -1 means 1 BCE; 1 means 1 CE. Zero is invalid. JavaScript's astronomical year zero is used only inside the rendering adapter. Dates have one of four explicit precisions:

- year: a known calendar year.
- approximate: a year estimate; the engine does not invent a numeric error margin.
- range: earliest and latest possible years supplied by the source.
- unknown: no year is asserted.

The supported domain is -10000 through 2200. Dates are displayed at year resolution. A known death year extends through the end of that year for rendering. A person marked living has death=null and extends to the current year with an open end. Unknown or missing endpoints produce no fabricated bar; the person remains in search and the list.

For bounded dates, the bar represents the outer possible lifespan, not a claim of exact duration. Dashed styling and the written date range preserve uncertainty.

## Navigation

The URL stores lang, view, categories, q, from, to, person, theme and display. Selection is a union, so a record appears once. Continuous pan/zoom and search updates are grouped in browser history; discrete changes remain navigable. A minimal person URL works without a prior visit.

## Evolution

Keep source and schema changes coordinated across repositories. A breaking contract requires a new schema version and an engine migration. Adding categories or people to an existing valid catalogue needs no engine code change.
