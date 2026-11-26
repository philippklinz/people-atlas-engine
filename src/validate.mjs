import {MIN_YEAR, MAX_YEAR, dateBounds} from './domain.mjs';
const idPattern = /^[a-z][a-z0-9-]{1,79}$/;
const object = value => value && typeof value === 'object' && !Array.isArray(value);
const text = value => typeof value === 'string' && value.trim().length > 0;
const localized = value => object(value) && text(value.en) && text(value.de);
const year = value => Number.isInteger(value) && value !== 0 && value >= MIN_YEAR && value <= MAX_YEAR;
export function safeUrl(value, base) {
  const url = new URL(value, base);
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Only HTTP(S) resources are supported.');
  if (url.username || url.password) throw new Error('Credentials are not allowed in resource URLs.');
  return url.href;
}
export function contentUrl(path, catalogUrl) {
  if (typeof path !== 'string' || !path || path.startsWith('/') || /[\\?#]/.test(path) ||
      /^[a-z][a-z\d+.-]*:/i.test(path) || path.split('/').some(part => part === '..' || part === '.' || !part || /%/.test(part))) {
    throw new Error('Content paths must be relative to the catalogue.');
  }
  return safeUrl(path, catalogUrl);
}
export function validateCatalog(catalog) {
  if (!object(catalog) || catalog.schemaVersion !== '1.0.0' || !localized(catalog.title) ||
      !Array.isArray(catalog.collections) || !catalog.collections.length ||
      !text(catalog.categories) || !text(catalog.updated) || !Array.isArray(catalog.languages) ||
      !['de','en'].every(language => catalog.languages.includes(language))) throw new Error('Invalid or unsupported catalogue.');
  return catalog;
}
export function validateDataset(categories, people) {
  const errors = [];
  const check = (condition,message) => { if (!condition) errors.push(message); };
  if (!Array.isArray(categories) || !Array.isArray(people)) throw new Error('Categories and people must be arrays.');
  const categoryIds = new Set(), personIds = new Set();
  for (const c of categories) {
    if (!object(c)) { errors.push('Invalid category'); continue; }
    check(idPattern.test(c.id ?? '') && !categoryIds.has(c.id), 'Invalid/duplicate category: ' + c.id);
    categoryIds.add(c.id);
    check(localized(c.name) && localized(c.description), 'Category translations: ' + c.id);
    check(['science','mathematics','physics','nature','computing','philosophy','invention','politics','art','literature'].includes(c.icon), 'Category icon: ' + c.id);
  }
  for (const c of categories.filter(object)) {
    check(!c.parent || categoryIds.has(c.parent), 'Unknown parent: ' + c.id);
    const seen = new Set([c.id]);
    let parent = c.parent;
    while (parent && categoryIds.has(parent)) {
      if (seen.has(parent)) { errors.push('Category cycle: ' + c.id); break; }
      seen.add(parent); parent = categories.find(x => x.id === parent)?.parent;
    }
  }
  function validDate(value) {
    if (!object(value)) return false;
    if (value.precision === 'unknown') return value.year == null && value.earliest == null && value.latest == null;
    if (value.precision === 'range') return year(value.earliest) && year(value.latest) && value.earliest <= value.latest;
    return ['year','approximate'].includes(value.precision) && year(value.year);
  }
  for (const p of people) {
    if (!object(p)) { errors.push('Invalid person'); continue; }
    check(idPattern.test(p.id ?? '') && !personIds.has(p.id), 'Invalid/duplicate person: ' + p.id);
    personIds.add(p.id);
    check(text(p.name) && localized(p.summary) && localized(p.biography), 'Person translations: ' + p.id);
    check(Array.isArray(p.aliases) && p.aliases.every(text), 'Person aliases: ' + p.id);
    check(Array.isArray(p.categories) && p.categories.length && new Set(p.categories).size === p.categories.length && p.categories.every(id => categoryIds.has(id)), 'Category references: ' + p.id);
    check(['living','deceased','unknown'].includes(p.status), 'Life status: ' + p.id);
    check(validDate(p.birth) && (p.status === 'living' ? p.death === null : validDate(p.death)), 'Life dates: ' + p.id);
    const birth = dateBounds(p.birth), death = dateBounds(p.death);
    check(!birth || !death || birth[0] <= death[1], 'Reversed lifespan: ' + p.id);
    check(Array.isArray(p.sources) && p.sources.length > 0, 'Missing sources: ' + p.id);
    for (const source of p.sources ?? []) {
      try { check(text(source.title) && /^https:/.test(safeUrl(source.url)), 'Source: ' + p.id); } catch { errors.push('Source URL: ' + p.id); }
    }
    check(Array.isArray(p.highlights), 'Missing highlights: ' + p.id);
    for (const h of p.highlights ?? []) check(validDate(h.date) && localized(h.text), 'Highlight: ' + p.id);
    if (p.dateNote) check(localized(p.dateNote), 'Date note translations: ' + p.id);
    if (p.portrait) {
      try { contentUrl(p.portrait.path,'https://example.test/catalog.json'); safeUrl(p.portrait.source); safeUrl(p.portrait.licenseUrl); } catch { errors.push('Portrait URL: ' + p.id); }
      check(localized(p.portrait.alt) && text(p.portrait.credit) && text(p.portrait.license), 'Portrait attribution: ' + p.id);
    }
  }
  if (errors.length) throw new Error(errors.join('\n'));
  return {categories,people};
}
