// Historical values use signed civil years: -1 = 1 BCE; year zero is invalid.
export const MIN_YEAR = -10000;
export const MAX_YEAR = 2200;
export const locales = ['de', 'en'];
export const localize = (value, language) => value?.[language] ?? value?.en ?? '';
export const toAstronomical = year => year < 0 ? year + 1 : year;
export const fromAstronomical = year => year <= 0 ? year - 1 : year;
export function dateForYear(year, end = false) {
  const date = new Date(0);
  date.setUTCFullYear(toAstronomical(year), end ? 11 : 0, end ? 31 : 1);
  date.setUTCHours(end ? 23 : 0, end ? 59 : 0, end ? 59 : 0, 0);
  return date;
}
export const yearForDate = date => fromAstronomical(new Date(date).getUTCFullYear());
export function formatYear(year, language) {
  if (year == null) return language === 'de' ? 'unbekannt' : 'unknown';
  return String(Math.abs(year)) + (year < 0 ? (language === 'de' ? ' v. u. Z.' : ' BCE') : '');
}
export function formatDate(date, language) {
  if (!date || date.precision === 'unknown') return language === 'de' ? 'unbekannt' : 'unknown';
  if (date.precision === 'range') return formatYear(date.earliest, language) + '–' + formatYear(date.latest, language);
  return (date.precision === 'approximate' ? (language === 'de' ? 'ca. ' : 'c. ') : '') + formatYear(date.year, language);
}
export function lifespan(person, language) {
  return formatDate(person.birth, language) + ' – ' + (person.status === 'living' ? (language === 'de' ? 'heute' : 'present') : formatDate(person.death, language));
}
export function dateBounds(date) {
  if (!date || date.precision === 'unknown') return null;
  return date.precision === 'range' ? [date.earliest, date.latest] : [date.year, date.year];
}
export function interval(person, currentYear = new Date().getUTCFullYear()) {
  const birth = dateBounds(person.birth);
  const death = person.status === 'living' ? [currentYear, currentYear] : dateBounds(person.death);
  if (!birth || !death) return null;
  return {start: birth[0], end: death[1], uncertain: person.birth.precision !== 'year' || person.death?.precision !== 'year'};
}
export function expandCategories(ids, categories) {
  const result = new Set(ids);
  let changed = true;
  while (changed) {
    changed = false;
    for (const category of categories) {
      if (category.parent && result.has(category.parent) && !result.has(category.id)) {
        result.add(category.id); changed = true;
      }
    }
  }
  return result;
}
export const normalizeSearch = text => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
export function selectPeople(people, categories, selected, query = '', language = 'en') {
  const accepted = expandCategories(selected, categories);
  const terms = normalizeSearch(query.trim()).split(/\s+/).filter(Boolean);
  return people.filter(person => {
    if (!person.categories.some(id => accepted.has(id))) return false;
    const haystack = normalizeSearch([person.name, ...(person.aliases ?? []), localize(person.summary, language),
      ...person.categories.map(id => localize(categories.find(c => c.id === id)?.name, language))].join(' '));
    return terms.every(term => haystack.includes(term));
  }).sort((a,b) => (dateBounds(a.birth)?.[0] ?? Infinity) - (dateBounds(b.birth)?.[0] ?? Infinity) || a.id.localeCompare(b.id));
}
export function fitYears(people) {
  const spans = people.map(p => interval(p)).filter(Boolean);
  if (!spans.length) return [1800, 2025];
  const first = Math.min(...spans.map(s => toAstronomical(s.start)));
  const last = Math.max(...spans.map(s => toAstronomical(s.end)));
  const pad = Math.max(8, Math.ceil((last - first) * 0.06));
  return [fromAstronomical(Math.max(toAstronomical(MIN_YEAR), first - pad)), fromAstronomical(Math.min(MAX_YEAR, last + pad))];
}
export function readState(url, categories, defaultLanguage = 'de') {
  const params = new URL(url, 'https://example.test').searchParams;
  const valid = new Set(categories.map(c => c.id));
  const chosen = (params.get('categories') ?? '').split(',').filter(id => valid.has(id));
  const from = Number(params.get('from')), to = Number(params.get('to'));
  const years = Number.isInteger(from) && Number.isInteger(to) && from !== 0 && to !== 0 && from >= MIN_YEAR && to <= MAX_YEAR &&
    toAstronomical(to) > toAstronomical(from) ? [from,to] : null;
  return {
    view: params.get('view') === 'timeline' || params.has('person') ? 'timeline' : 'categories',
    language: locales.includes(params.get('lang')) ? params.get('lang') : defaultLanguage,
    categories: [...new Set(chosen)],
    query: (params.get('q') ?? '').slice(0,160),
    years, person: params.get('person') ?? null,
    theme: params.get('theme') === 'dark' ? 'dark' : 'light',
    display: params.get('display') === 'list' ? 'list' : 'timeline'
  };
}
export function stateUrl(state, base = location.href) {
  const url = new URL(base);
  for (const key of ['view','lang','categories','q','from','to','person','theme','display']) url.searchParams.delete(key);
  url.searchParams.set('lang', state.language);
  if (state.categories.length) url.searchParams.set('categories', state.categories.join(','));
  if (state.view === 'timeline') url.searchParams.set('view','timeline');
  if (state.query) url.searchParams.set('q',state.query);
  if (state.years) { url.searchParams.set('from',state.years[0]); url.searchParams.set('to',state.years[1]); }
  if (state.person) url.searchParams.set('person',state.person);
  if (state.theme === 'dark') url.searchParams.set('theme','dark');
  if (state.display === 'list') url.searchParams.set('display','list');
  url.hash = '';
  return url;
}
