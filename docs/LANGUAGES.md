# Language coverage

Source language: English. Complete published application and content editions: English (en), German (de). The initial UI language defaults to de through configuration; the translation authoring source remains en.

Planned: bg, hr, cs, da, nl, et, fi, fr, el, hu, ga, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv.

The language selector advertises only complete editions. Unsupported requested languages produce a visible message in the actual fallback language. Language state is stored in the URL and preserves filters, current person and time window.

Translation status, source hashes and review provenance are recorded in i18n-status.json. After an English source change, reconcile the corresponding German text and regenerate the source hash. Do not update fingerprints without reviewing the source diff. A matching fingerprint and key count are mechanical checks, not independent linguistic review.

Texts and translations are AI-assisted. Independent native-language and historical subject review is pending. Original source titles, personal names, code identifiers and authoritative license texts remain as supplied.
