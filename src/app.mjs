import {localize, formatYear, formatDate, lifespan, interval, selectPeople, expandCategories, fitYears, readState, stateUrl, toAstronomical, fromAstronomical, MIN_YEAR, MAX_YEAR} from './domain.mjs';
import {validateCatalog, validateDataset, safeUrl, contentUrl} from './validate.mjs';
import {translate} from './locales.mjs';
import {icon} from './icons.mjs';
import {PeopleTimeline} from './timeline.mjs';

const app = document.querySelector('#app');
const personDialog = document.querySelector('#person-dialog');
const aboutDialog = document.querySelector('#about-dialog');
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
let state, categories = [], people = [], catalog, catalogUrl, timeline, config, queryTimer, rangeTimer;
let lastGroupedAction = {kind:'', time:0}, missingPerson = false, languageFallback = false;
const narrowPerson = matchMedia('(max-width: 700px)');
let menuOpen = false, personTrigger = null;
const t = (key, values) => translate(state?.language ?? 'de',key,values);
const text = value => escape(localize(value,state.language));
const filtered = () => selectPeople(people,categories,state.categories,state.query,state.language);
const personUrl = id => stateUrl({...state,person:id,view:'timeline'}).href;
const categoryName = id => text(categories.find(c=>c.id===id)?.name);
const button = (action,label,cls='mo-btn',extra='') => '<button type="button" class="' + cls + '" data-action="' + action + '" ' + extra + '>' + label + '</button>';
function learningLabsLink() {
  return '<a class="mo-btn learning-labs-link" href="https://philipp-klinz.net/learning-labs/" aria-label="' + t('learningLabs') + '" title="' + t('learningLabs') + '">' + icon('back') + 'Learning Labs</a>';
}
function languageControl() {
  return '<label class="language-control"><span>' + t('language') + '</span><select class="mo-select" data-action="language" aria-label="' + t('language') + '"><option value="de" ' + (state.language === 'de' ? 'selected' : '') + '>Deutsch</option><option value="en" ' + (state.language === 'en' ? 'selected' : '') + '>English</option></select></label>';
}
function themeButton() {
  const dark = state.theme === 'dark';
  return button('theme', icon(dark ? 'sun' : 'moon'), 'mo-btn icon-button',
    'aria-label="' + t('theme') + '" title="' + t('theme') + '" aria-pressed="' + dark + '"');
}
function push(next,kind=null,replace=false) {
  state = {...state,...next};
  const now = Date.now();
  const grouped = kind && lastGroupedAction.kind === kind && now-lastGroupedAction.time < 800;
  const method = replace || grouped ? 'replaceState' : 'pushState';
  history[method]({peopleAtlas:true},'',stateUrl(state));
  lastGroupedAction = {kind:kind ?? '',time:now};
}
function announce(message) { document.querySelector('#announcement').textContent = message; }
function footer() {
  return '<footer class="page-footer"><span>' + t('footer') + '</span><button type="button" data-action="about" aria-haspopup="dialog">' + t('design') + '</button></footer>';
}
function shell(main) {
  if (state.view === 'timeline') return workspace(main);
  const overview = stateUrl({...state,view:'categories',person:null});
  const timelineUrl = stateUrl({...state,view:'timeline',display:'timeline',person:null});
  return '<div class="mo-shell"><aside class="mo-sidebar" data-theme="dark"><a class="mo-brand" href="' + escape(overview) + '" data-nav="categories"><span class="brand-symbol">' + icon('timeline') + '</span><span>People Atlas<small>Learning Labs</small></span></a><div class="mo-nav-group"><div class="mo-nav-title">' + t('atlas') + '</div><nav class="mo-nav" aria-label="' + t('atlas') + '"><a href="' + escape(overview) + '" data-nav="categories" ' + (state.view === 'categories' ? 'aria-current="page"' : '') + '>' + icon('grid') + t('categories') + '</a><a href="' + escape(timelineUrl) + '" data-nav="timeline" ' + (state.view === 'timeline' ? 'aria-current="page"' : '') + '>' + icon('timeline') + t('timeline') + '</a><button type="button" data-action="about" aria-haspopup="dialog">' + icon('info') + t('about') + '</button></nav></div><p class="rail-intro">' + t('description') + '</p><div class="rail-legend"><i></i><span>' + t('legend') + '</span></div><div class="mo-sidebar-foot">STATIC BY DESIGN<br>' + t('noTracking') + '</div></aside><div class="mo-main"><header class="mo-topbar"><div class="mo-topbar-path">' + learningLabsLink() + '</div><div class="mo-topbar-actions">' + languageControl() + themeButton() + '</div></header><main id="main" class="page" tabindex="-1">' + (languageFallback ? '<div class="notice">' + t('sourceFallback') + '</div>' : '') + main + footer() + '</main></div>';
}
function preview() {
  const featured = (catalog.featured ?? []).map(id=>people.find(p=>p.id===id)).filter(p=>p && interval(p)).slice(0,4);
  if (!featured.length) return '';
  const start = Math.floor(Math.min(...featured.map(p=>interval(p).start))/50)*50;
  const end = Math.ceil(Math.max(...featured.map(p=>interval(p).end))/50)*50;
  return '<figure class="preview" aria-label="' + t('previewLabel') + '"><figcaption class="preview-caption">' + t('livesPreview') + '</figcaption><div class="preview-axis"><span>' + formatYear(start,state.language) + '</span><span>' + formatYear(Math.round((start+end)/2),state.language) + '</span><span>' + formatYear(end,state.language) + '</span></div>' + featured.map(p=>{
    const span=interval(p),left=(span.start-start)/(end-start)*100,width=(span.end-span.start)/(end-start)*100;
    return '<div class="preview-row"><span>' + escape(p.name.split(' ').slice(-1)[0]) + '</span><div class="preview-track" title="' + escape(p.name + ': ' + lifespan(p,state.language)) + '"><span class="preview-bar" style="left:' + left + '%;width:' + width + '%"></span></div></div>';
  }).join('') + '<p class="preview-note">' + t('personCount',{count:people.length}) + ' · ' + t('categoryCount',{count:categories.length}) + '</p></figure>';
}
function overviewPage() {
  const selected = selectPeople(people,categories,state.categories,'',state.language);
  const expanded = expandCategories(state.categories,categories);
  return '<section class="intro-grid"><div><span class="mo-eyebrow">' + t('collection') + '</span><h1 tabindex="-1">' + t('hero') + '</h1><p class="lead">' + t('intro') + '</p></div>' + preview() + '</section><section aria-labelledby="category-heading"><div class="section-heading"><h2 id="category-heading">' + t('choose') + '</h2><div class="actions">' + button('all',t('all'),'text-action') + button('clear',t('clear'),'text-action') + '</div></div><div class="categories-grid">' + categories.map(c=>{
    const count = selectPeople(people,categories,[c.id]).length;
    const chosen = state.categories.includes(c.id);
    const inherited = expanded.has(c.id) && !chosen;
    return '<label class="category-card" for="category-' + c.id + '"><div class="category-top mo-check"><span class="category-icon">' + icon(c.icon) + '</span><input type="checkbox" id="category-' + c.id + '" data-category="' + c.id + '" ' + (chosen ? 'checked' : '') + ' aria-labelledby="name-' + c.id + '" aria-describedby="description-' + c.id + ' category-meta-' + c.id + '"></div><div><h3 id="name-' + c.id + '">' + text(c.name) + '</h3><p id="description-' + c.id + '">' + text(c.description) + '</p></div><div class="category-footer" id="category-meta-' + c.id + '"><span class="count">' + t('personCount',{count}) + '</span>' + (inherited ? '<span class="inherited">' + t('inherited') + '</span>' : c.parent ? '<span class="inherited">' + t('included',{parent:categoryName(c.parent)}) + '</span>' : '') + '</div></label>';
  }).join('') + '</div></section><div class="selection-tray"><div><strong>' + t('selected',{count:state.categories.length}) + '</strong><p>' + (state.categories.length ? t('selectedPeople',{count:selected.length}) : t('emptySelection')) + '</p></div>' + button('open',t('open') + icon('arrow'),'mo-btn mo-btn-primary',state.categories.length ? '' : 'disabled') + '</div><p class="selection-note">' + t('selectHint') + '</p>';
}
function categoryEditor() {
  return '<details class="category-editor"><summary class="mo-btn">' + t('editCategories') + ' (' + state.categories.length + ')</summary><form class="category-popover" id="category-form">' + categories.map(c=>'<label class="mo-check' + (c.parent ? ' child' : '') + '"><input type="checkbox" name="category" value="' + c.id + '" ' + (state.categories.includes(c.id) ? 'checked' : '') + '>' + text(c.name) + '</label>').join('') + '<div class="actions">' + button('editor-all',t('all'),'text-action') + '<button class="mo-btn mo-btn-primary" type="submit">' + t('apply') + '</button></div></form></details>';
}
function listView(matches) {
  return '<div class="table-wrap" role="region" aria-labelledby="workspace-title" tabindex="0"><table class="people-table"><caption>' + t('listCaption') + '</caption><thead><tr><th scope="col">' + t('name') + '</th><th scope="col">' + t('dates') + '</th><th scope="col">' + t('fields') + '</th></tr></thead><tbody>' + matches.map(p=>'<tr><td><a href="' + escape(personUrl(p.id)) + '" data-person="' + p.id + '">' + avatar(p) + '<span>' + escape(p.name) + '</span></a></td><td class="mo-mono">' + lifespan(p,state.language) + '</td><td>' + p.categories.map(categoryName).join(', ') + '</td></tr>').join('') + '</tbody></table></div>';
}
function timeControls() {
  return '<div class="time-controls" role="group" aria-label="' + t('range') + '"><div class="period-readout"><span>' + t('range') + '</span><output id="period-text" class="period-text"></output></div><div class="axis-tools"><div class="range-buttons">' +
    button('pan-left','←','mo-btn','aria-label="' + t('previous') + '" title="' + t('previous') + '"') + button('pan-right','→','mo-btn','aria-label="' + t('next') + '" title="' + t('next') + '"') + button('zoom-in','+','mo-btn','aria-label="' + t('zoomIn') + '" title="' + t('zoomIn') + '"') + button('zoom-out','−','mo-btn','aria-label="' + t('zoomOut') + '" title="' + t('zoomOut') + '"') + '</div>' + button('fit',t('fit'),'mo-btn fit-button') + '</div>' +
    '<select id="period-select" class="mo-select" aria-label="' + t('presets') + '"><option value="">' + t('presets') + '</option><option value="all">' + t('whole') + '</option><option value="ancient">' + t('antiquity') + '</option><option value="medieval">' + t('medieval') + '</option><option value="early">' + t('earlyModern') + '</option><option value="modern">' + t('modern') + '</option></select></div>';
}
function manualRange() {
  return '<details class="menu-section manual-range"><summary>' + t('range') + '</summary><form id="range-form"><label>' + t('from') + '<input class="mo-input" aria-describedby="range-help range-error" id="range-from" name="from" type="number" min="-10000" max="2200" value="' + state.years[0] + '" required></label><label>' + t('to') + '<input class="mo-input" aria-describedby="range-help range-error" id="range-to" name="to" type="number" min="-10000" max="2200" value="' + state.years[1] + '" required></label><button class="mo-btn" type="submit">' + t('go') + '</button></form><small id="range-help">' + t('yearHelp') + '</small><p id="range-error" role="alert" class="error-detail"></p></details>';
}
function workspaceHeader(matches) {
  return '<header id="workspace-header" class="workspace-header"><div class="workspace-identity">' +
    button('open-menu',icon('menu'),'mo-btn menu-launcher','aria-label="' + t('openMenu') + '" title="' + t('openMenu') + '" aria-controls="workspace-menu" aria-expanded="' + menuOpen + '"') +
    '<div class="workspace-title"><h1 id="workspace-title">' + t(state.display === 'list' ? 'peopleList' : 'timeline') + '</h1><span id="in-view" class="header-status" aria-live="polite"></span></div></div>' +
    (state.display==='timeline' && matches.some(person=>interval(person)) ? timeControls() : '') + '<div class="workspace-preferences">' + languageControl() +
    themeButton() +
    button('share',icon('copy'),'mo-btn icon-button','aria-label="' + t('share') + '" title="' + t('share') + '"') + '</div></header>';
}
function workspace(main) {
  const matches=filtered(), unknown=matches.filter(p=>!interval(p)).length;
  const overview=stateUrl({...state,view:'categories',person:null});
  return '<div class="atlas-workspace ' + (menuOpen ? '' : 'menu-closed') + '">' + workspaceHeader(matches) +
    '<main id="main" class="workspace-stage" tabindex="-1" aria-labelledby="workspace-title"><div class="workspace-notices">' + (languageFallback ? '<div class="notice">' + t('sourceFallback') + '</div>' : '') + (missingPerson ? '<div class="notice">' + t('invalidPerson') + button('dismiss-person',t('dismiss'),'text-action') + '</div>' : '') + '</div>' + main + '</main></div>' +
    button('close-menu','','menu-backdrop','id="menu-backdrop" tabindex="-1" aria-label="' + t('closeMenu') + '" ' + (menuOpen ? '' : 'hidden')) +
    '<div id="workspace-menu" class="workspace-menu ' + (menuOpen ? '' : 'is-closed') + '" data-theme="dark" role="dialog" aria-label="' + t('controls') + '" aria-hidden="' + !menuOpen + '" ' + (menuOpen ? 'aria-modal="true"' : 'inert') + '><div class="workspace-menu-head"><a class="mo-brand" href="' + escape(overview) + '" data-nav="categories"><span class="brand-symbol">' + icon('timeline') + '</span><span>People Atlas<small>Learning Labs</small></span></a>' + button('close-menu',icon('close'),'mo-btn icon-button','aria-label="' + t('closeMenu') + '" title="' + t('closeMenu') + '"') + '</div>' +
    '<div class="workspace-menu-scroll"><nav class="workspace-nav" aria-label="' + t('atlas') + '"><a class="mo-btn" href="' + escape(overview) + '" data-nav="categories">' + icon('grid') + t('overview') + '</a>' + learningLabsLink() + '</nav><div class="workspace-heading"><h2>' + t('selection') + '</h2></div>' +
    '<section class="menu-section"><form id="search-form" class="search-field"><label for="person-search">' + t('search') + '</label><div class="search-wrap">' + icon('search') + '<input class="mo-input" id="person-search" name="q" type="search" value="' + escape(state.query) + '" placeholder="' + t('searchPlaceholder') + '" autocomplete="off" maxlength="160"></div>' + (state.query ? button('reset-search',t('resetSearch'),'text-action') : '') + '</form>' + categoryEditor() + '<div class="chips">' + state.categories.map(id=>'<span class="chip">' + categoryName(id) + '</span>').join('') + '</div><div class="view-switch" role="group" aria-label="' + t('viewMode') + '">' + button('show-timeline',t('chart'),'mo-btn ' + (state.display === 'timeline' ? 'active' : ''),'aria-pressed="' + (state.display === 'timeline') + '"') + button('show-list',t('list'),'mo-btn ' + (state.display === 'list' ? 'active' : ''),'aria-pressed="' + (state.display === 'list') + '"') + '</div></section>' +
    (state.display==='timeline' && matches.some(person=>interval(person)) ? manualRange() : '') +
    '<details class="menu-section timeline-guide"><summary>' + t('timelineGuide') + '</summary><div class="legend"><span><i></i>' + t('legend') + '</span><span><i class="dashed"></i>' + t('uncertain') + '</span>' + (matches.some(p=>p.status==='living') ? '<span><i class="open"></i>' + t('continuing') + '</span>' : '') + '</div><p class="timeline-help" id="timeline-help">' + t('gesture') + '</p><p class="timeline-help">' + t('noYearZero') + '</p><p class="timeline-help">' + t('daysPrecision') + '</p></details>' +
    (unknown ? '<p class="notice">' + t('unknownDates',{count:unknown}) + '</p>' : '') +
    '<section class="menu-section workspace-settings">' + button('about',icon('info') + t('about'),'mo-btn') + '</section><p class="workspace-foot">STATIC BY DESIGN · LEARNING LABS</p></div></div>';
}
function setMenuOpen(open, focus=true) {
  const workspace=document.querySelector('.atlas-workspace'),menu=document.querySelector('#workspace-menu'),launcher=document.querySelector('.menu-launcher');
  menuOpen=Boolean(open && workspace);
  personDialog.inert=menuOpen;
  document.querySelector('.skip-link').inert=menuOpen;
  if (!workspace) return;
  workspace.classList.toggle('menu-closed',!menuOpen);
  menu.classList.toggle('is-closed',!menuOpen);
  menu.inert=!menuOpen;
  menu.setAttribute('aria-hidden',String(!menuOpen));
  if(menuOpen)menu.setAttribute('aria-modal','true');else menu.removeAttribute('aria-modal');
  launcher.setAttribute('aria-expanded',String(menuOpen));
  document.querySelector('#menu-backdrop').hidden=!menuOpen;
  document.querySelector('#workspace-header').inert=menuOpen;
  document.querySelector('#main').inert=menuOpen;
  if(focus)(menuOpen ? menu.querySelector('[data-action="close-menu"]') : launcher).focus({preventScroll:true});
}
function timelinePage() {
  const matches=filtered();
  if (!state.years) state.years=fitYears(matches);
  if (!matches.length) return '<section class="empty"><h2>' + (state.categories.length ? t('noResults') : t('emptySelection')) + '</h2><p>' + t('noResultsHelp') + '</p>' + (state.query ? button('reset-search',t('resetSearch'),'mo-btn mo-btn-primary') : button('all-open',t('all'),'mo-btn mo-btn-primary')) + '</section>';
  if (state.display==='list') return listView(matches);
  if (!matches.some(person=>interval(person))) return '<section class="empty"><h2>' + t('unknownDates',{count:matches.length}) + '</h2>' + button('show-list',t('list'),'mo-btn mo-btn-primary') + '</section>';
  return '<div class="timeline-frame"><div id="timeline" class="timeline-canvas" tabindex="0" role="region" aria-label="' + t('timeline') + '" aria-describedby="timeline-help"></div></div><div id="range-empty" class="notice range-notice" hidden>' + t('outOfRange') + button('fit',t('showAll'),'text-action') + '</div>';
}
function render(focusHeading=false) {
  const active = document.activeElement;
  const focusId=active?.id, position=active?.selectionStart;
  const focusAction=active?.dataset.action, focusInPerson=personDialog.contains(active);
  const focusScope=active?.closest('#workspace-header, #workspace-menu')?.id;
  const y=window.scrollY;
  const menuScroll=document.querySelector('.workspace-menu-scroll')?.scrollTop ?? 0;
  const openDetails=[...document.querySelectorAll('#workspace-menu details[open]')].map(detail=>detail.className.split(' ')[0]);
  timeline?.destroy(); timeline=null;
  document.documentElement.lang=state.language;
  document.documentElement.dataset.theme=state.theme;
  document.documentElement.dataset.view=state.view;
  const pageTitle = state.view === 'categories' ? 'title' : state.display === 'list' ? 'peopleList' : 'timeline';
  document.title = 'People Atlas — ' + t(pageTitle);
  document.querySelector('meta[name="description"]').content=t('description');
  document.querySelector('.skip-link').textContent=state.language==='de'?'Zum Inhalt':'Skip to content';
  app.innerHTML=shell(state.view === 'categories' ? overviewPage() : timelinePage());
  for(const name of openDetails) document.querySelector('#workspace-menu details.'+name)?.setAttribute('open','');
  if(document.querySelector('.workspace-menu-scroll'))document.querySelector('.workspace-menu-scroll').scrollTop=menuScroll;
  if (state.view==='timeline' && state.display==='timeline' && filtered().some(p=>interval(p))) {
    timeline=new PeopleTimeline(document.querySelector('#timeline'),filtered(),state,years=>{
      clearTimeout(rangeTimer);
      rangeTimer=setTimeout(()=>{ setYears(years,true,'gesture'); },160);
    });
  }
  if (state.view==='timeline') updateRangeLabels();
  renderPerson();
  setMenuOpen(menuOpen,false);
  if (focusHeading) { document.querySelector(state.view==='timeline' ? (menuOpen ? '#workspace-menu [data-action="close-menu"]' : '#main') : 'h1')?.focus({preventScroll:true}); window.scrollTo(0,0); }
  else if (!focusInPerson && (focusId || focusAction)) {
    const target=focusId ? document.getElementById(focusId) : document.querySelector((focusScope ? '#'+focusScope+' ' : '')+'[data-action="'+focusAction+'"]');
    if (target && !target.closest('[inert]')) {
      target.focus({preventScroll:true});
      if (position!=null && target.type==='search') target.setSelectionRange(position,position);
    }
    window.scrollTo(0,y);
  }
  if(menuOpen && !aboutDialog.open && !document.querySelector('#workspace-menu').contains(document.activeElement))document.querySelector('#workspace-menu [data-action="close-menu"]').focus({preventScroll:true});
  history.replaceState(history.state,'',stateUrl(state));
}
function updateRangeLabels() {
  if (!state.years) return;
  const range = document.querySelector('#period-text');
  if (range) range.textContent=range.title=formatYear(state.years[0],state.language) + ' — ' + formatYear(state.years[1],state.language);
  const matches=filtered(), visible=matches.filter(p=>{const span=interval(p);return span && span.start<=state.years[1] && span.end>=state.years[0];}).length;
  const status=document.querySelector('#in-view');
  if (status) status.textContent = state.display === 'list'
    ? t('personCount', {count:matches.length})
    : t('visible', {visible,total:matches.length});
  const empty=document.querySelector('#range-empty');
  if (empty) empty.hidden=visible>0;
  if (document.querySelector('#range-from')) document.querySelector('#range-from').value=state.years[0];
  if (document.querySelector('#range-to')) document.querySelector('#range-to').value=state.years[1];
  document.querySelectorAll('a[data-person]').forEach(link=>link.href=personUrl(link.dataset.person));
}
function clampYears(years) {
  let start=toAstronomical(years[0]),end=toAstronomical(years[1]);
  const span=Math.max(4,end-start),min=toAstronomical(MIN_YEAR);
  if (start<min) {start=min;end=start+span;}
  if (end>MAX_YEAR) {end=MAX_YEAR;start=end-span;}
  start=Math.max(min,start);end=Math.min(MAX_YEAR,Math.max(start+4,end));
  return [fromAstronomical(Math.round(start)),fromAstronomical(Math.round(end))];
}
function setYears(years,fromTimeline=false,kind=null) {
  push({years:clampYears(years)},kind);
  timeline?.setYears(state.years,!fromTimeline);
  updateRangeLabels();
}
function shiftYears(action) {
  const first=toAstronomical(state.years[0]),last=toAstronomical(state.years[1]),span=last-first,center=(first+last)/2;
  let a=first,b=last;
  if (action==='pan-left') {a-=span*.3;b-=span*.3;}
  if (action==='pan-right') {a+=span*.3;b+=span*.3;}
  if (action==='zoom-in') {const size=Math.max(4,span*.65);a=center-size/2;b=center+size/2;}
  if (action==='zoom-out') {a=center-span*.8;b=center+span*.8;}
  setYears([fromAstronomical(Math.round(a)),fromAstronomical(Math.round(b))]);
}
function initials(person) { return person.name.split(/\s+/).map(x=>x[0]).slice(0,2).join(''); }
function avatar(person) {
  return person.portrait ? '<img class="avatar" src="' + escape(contentUrl(person.portrait.path,catalogUrl)) + '" alt="" loading="lazy">' : '<span class="avatar" aria-hidden="true">' + escape(initials(person)) + '</span>';
}
function openPerson(id) {
  const person=people.find(p=>p.id===id);
  if (!person) return;
  if(!personDialog.open)personTrigger=document.activeElement;
  push({person:id,view:'timeline'});
  renderPerson();
}
function closePerson() {
  if (!state.person) return;
  const id=state.person;
  push({person:null});
  renderPerson();
  const target=personTrigger?.isConnected ? personTrigger : document.querySelector('a[data-person="'+id+'"]') ?? document.querySelector('#timeline, #main');
  target?.focus({preventScroll:true});
}
function syncPersonPanel() {
  const modal=narrowPerson.matches;
  if(modal && menuOpen)setMenuOpen(false,false);
  if(personDialog.open && personDialog.matches(':modal')!==modal)personDialog.close();
  personDialog.setAttribute('aria-modal',String(modal));
  if(!personDialog.open)modal ? personDialog.showModal() : personDialog.show();
}
function renderPerson() {
  const person=people.find(p=>p.id===state.person);
  if (!person) { if(personDialog.open) personDialog.close(); return; }
  const previousPerson=personDialog.dataset.person,scroll=personDialog.scrollTop;
  const focused=personDialog.contains(document.activeElement)?document.activeElement:null;
  const focusedAction=focused?.dataset.action;
  personDialog.dataset.person=person.id;
  const span=interval(person),contemporaries=span ? filtered().filter(other=>{
    const otherSpan=interval(other);
    return other.id!==person.id && otherSpan && span.start<=otherSpan.end && span.end>=otherSpan.start;
  }).slice(0,7) : [];
  const portrait=person.portrait;
  personDialog.innerHTML='<div class="dialog-toolbar"><span class="mo-eyebrow">' + t('personDetails') + '</span><div class="mo-topbar-actions">' + languageControl() + button('close-person',icon('close'),'mo-btn icon-button','aria-label="' + t('close') + '" autofocus') + '</div></div><article class="dialog-body"><div class="person-hero">' +
    (portrait ? '<img class="portrait" src="' + escape(contentUrl(portrait.path,catalogUrl)) + '" alt="' + text(portrait.alt) + '">' : '<div class="portrait-placeholder"><b aria-hidden="true">' + escape(initials(person)) + '</b><span>' + t('noPortrait') + '</span></div>') +
    '<div class="person-title"><span class="mo-eyebrow">' + person.categories.map(categoryName).join(' · ') + '</span><h2 id="person-name">' + escape(person.name) + '</h2><div class="lifespan">' + lifespan(person,state.language) + '</div><p>' + text(person.summary) + '</p></div></div><section class="dialog-section"><h3>' + t('biography') + '</h3><p>' + text(person.biography) + '</p></section>' +
    (person.dateNote ? '<section class="dialog-section"><h3>' + t('dateNote') + '</h3><p>' + text(person.dateNote) + '</p></section>' : '') +
    (person.highlights.length ? '<section class="dialog-section"><h3>' + t('highlights') + '</h3><ol class="highlights">' + person.highlights.map(h=>'<li><time>' + formatDate(h.date,state.language) + '</time><span>' + text(h.text) + '</span></li>').join('') + '</ol></section>' : '') +
    (contemporaries.length ? '<section class="dialog-section"><h3>' + t('contemporaries') + '</h3><div class="contemporaries">' + contemporaries.map(p=>'<a href="' + escape(personUrl(p.id)) + '" data-person="' + p.id + '">' + escape(p.name) + '</a>').join('') + '</div><p class="source-hint">' + t('contemporariesHint') + '</p></section>' : '') +
    '<section class="dialog-section"><h3>' + t('sources') + '</h3><ul class="source-list">' + person.sources.map(s=>'<li><a href="' + escape(safeUrl(s.url)) + '" target="_blank" rel="noopener noreferrer" lang="en">' + escape(s.title) + icon('external') + '</a></li>').join('') + '</ul><p class="source-hint">' + t('sourceHint') + '</p></section>' +
    (portrait ? '<details class="credits"><summary>' + t('portraitCredit') + '</summary><p>' + escape(portrait.credit) + ' · <a href="' + escape(portrait.source) + '" target="_blank" rel="noopener noreferrer">' + escape(portrait.originalFile ?? t('portraitCredit')) + '</a> · <a href="' + escape(portrait.licenseUrl) + '" target="_blank" rel="noopener noreferrer">' + escape(portrait.license) + '</a></p></details>' : '') +
    '<div class="dialog-actions">' + (span ? button('focus-person',t('focusPerson'),'mo-btn mo-btn-primary') : '') + button('share',t('share'),'mo-btn') + '</div></article>';
  syncPersonPanel();
  personDialog.scrollTop=previousPerson===person.id?scroll:0;
  if(focusedAction)personDialog.querySelector('[data-action="'+focusedAction+'"]')?.focus({preventScroll:true});
  else if(focused)personDialog.querySelector('[data-action="close-person"]')?.focus({preventScroll:true});
}
function renderAbout() {
  aboutDialog.innerHTML='<div class="dialog-toolbar"><span class="mo-eyebrow">People Atlas</span>' + button('close-about',icon('close'),'mo-btn icon-button','aria-label="' + t('close') + '" autofocus') + '</div><div class="dialog-body"><h2 id="about-title">' + t('aboutTitle') + '</h2>' + ['aboutText','scope','languageCoverage','privacy','licenses'].map(key=>'<p>' + t(key) + '</p>').join('') + '<p class="mo-mono mo-small">' + t('dataUpdated',{date:escape(catalog.updated)}) + '</p><ul class="source-list"><li><a href="https://github.com/philippklinz/people-atlas-engine" target="_blank" rel="noopener noreferrer">' + t('engine') + '</a></li><li><a href="https://github.com/philippklinz/people-atlas-content" target="_blank" rel="noopener noreferrer">' + t('content') + '</a></li><li><a href="https://philippklinz.github.io/modern-objectivity-style/" target="_blank" rel="noopener noreferrer">Modern Objectivity</a></li></ul></div>';
  aboutDialog.showModal();
}
async function copyLink() {
  try {await navigator.clipboard.writeText(stateUrl(state).href);announce(t('copied'));
    const targets=document.querySelectorAll('[data-action="share"]');targets.forEach(b=>{b.dataset.original=b.innerHTML;if(b.classList.contains('icon-button'))b.innerHTML=icon('check');else b.textContent=t('copied');});
    setTimeout(()=>targets.forEach(b=>{if(b.isConnected)b.innerHTML=b.dataset.original;}),1600);
  } catch {announce(t('shareFail'));}
}
document.addEventListener('click',event=>{
  const link=event.target.closest('a[data-person],a[data-nav]');
  if (link && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button!==0)) return;
  if (link?.dataset.person) {event.preventDefault();openPerson(link.dataset.person);return;}
  if (link?.dataset.nav) {event.preventDefault();setMenuOpen(false,false);push({view:link.dataset.nav,display:link.dataset.nav==='timeline' ? 'timeline' : state.display,person:null});render(true);return;}
  const control=event.target.closest('[data-action]');
  if (!control || control.tagName==='SELECT') return;
  const action=control.dataset.action;
  event.preventDefault();
  if(action==='open-menu'||action==='close-menu')setMenuOpen(action==='open-menu');
  else if(action==='theme'){push({theme:state.theme==='dark'?'light':'dark'});render();}
  else if(action==='about')renderAbout();
  else if(action==='close-about')aboutDialog.close();
  else if(action==='close-person')closePerson();
  else if(action==='all'||action==='all-open'){if(action==='all-open')setMenuOpen(false,false);push({categories:categories.map(c=>c.id),years:null,...(action==='all-open'?{view:'timeline'}:{})});render();}
  else if(action==='clear'){push({categories:[],years:null});render();}
  else if(action==='open'){setMenuOpen(false,false);push({view:'timeline',display:'timeline',years:null,person:null});render(true);}
  else if(action==='editor-all'){document.querySelectorAll('#category-form input').forEach(input=>input.checked=true);}
  else if(action==='show-list'||action==='show-timeline'){setMenuOpen(false,false);push({display:action==='show-list'?'list':'timeline'});render(true);}
  else if(action==='reset-search'){push({query:'',years:null});render();}
  else if(action==='dismiss-person'){missingPerson=false;push({person:null},null,true);render();}
  else if(action==='fit'){setYears(fitYears(filtered()));}
  else if(['pan-left','pan-right','zoom-in','zoom-out'].includes(action))shiftYears(action);
  else if(action==='share')copyLink();
  else if(action==='focus-person'){
    const person=people.find(p=>p.id===state.person);
    push({person:null,display:'timeline',query:'',categories:[...new Set([...state.categories,...person.categories])],years:fitYears([person])});
    personDialog.close();render();
  }
  else if(action==='retry')boot();
});
document.addEventListener('change',event=>{
  const input=event.target;
  if(input.dataset.category){
    const selected=new Set(state.categories);input.checked?selected.add(input.dataset.category):selected.delete(input.dataset.category);
    push({categories:[...selected],years:null});render();
  } else if(input.dataset.action==='language'){
    push({language:input.value});languageFallback=false;render();
  } else if(input.id==='period-select'){
    const periods={all:fitYears(filtered()),ancient:[-500,500],medieval:[500,1500],early:[1500,1800],modern:[1800,new Date().getUTCFullYear()]};
    if(periods[input.value])setYears(periods[input.value]);
  }
});
document.addEventListener('input',event=>{
  if(event.target.id!=='person-search')return;
  clearTimeout(queryTimer);
  const query=event.target.value;
  queryTimer=setTimeout(()=>{push({query,years:null},'search');render();},200);
});
document.addEventListener('submit',event=>{
  const form=event.target;
  if(!['search-form','category-form','range-form'].includes(form.id))return;
  event.preventDefault();
  if(form.id==='search-form'){clearTimeout(queryTimer);push({query:new FormData(form).get('q'),years:null},'search');render();}
  if(form.id==='category-form'){push({categories:new FormData(form).getAll('category'),years:null});setMenuOpen(false,false);render(true);}
  if(form.id==='range-form'){
    const data=new FormData(form),from=Number(data.get('from')),to=Number(data.get('to'));
    if(!Number.isInteger(from)||!Number.isInteger(to)||from===0||to===0||from<MIN_YEAR||to>MAX_YEAR||from>=to){document.querySelector('#range-error').textContent=t('invalidRange');return;}
    document.querySelector('#range-error').textContent='';setYears([from,to]);setMenuOpen(false);
  }
});
document.addEventListener('keydown',event=>{
  if(menuOpen && !aboutDialog.open && !personDialog.matches(':modal')){
    if(event.key==='Escape'){event.preventDefault();setMenuOpen(false);return;}
    if(event.key==='Tab'){
      const menu=document.querySelector('#workspace-menu');
      const items=[...menu.querySelectorAll('a[href], button, input, select, summary, [tabindex="0"]')].filter(el=>!el.disabled && el.getClientRects().length);
      const first=items[0],last=items.at(-1);
      if(event.shiftKey && (document.activeElement===first || !menu.contains(document.activeElement))){event.preventDefault();last?.focus();}
      else if(!event.shiftKey && (document.activeElement===last || !menu.contains(document.activeElement))){event.preventDefault();first?.focus();}
    }
  }
  if(event.key==='Escape' && !aboutDialog.open){
    if(personDialog.open && !personDialog.matches(':modal')){event.preventDefault();closePerson();return;}
  }
  if(event.target.id!=='timeline')return;
  const keys={ArrowLeft:'pan-left',ArrowRight:'pan-right','+':'zoom-in','=':'zoom-in','-':'zoom-out'};
  if(keys[event.key]){event.preventDefault();shiftYears(keys[event.key]);}
});
document.addEventListener('personselect',event=>openPerson(event.detail));
personDialog.addEventListener('cancel',event=>{event.preventDefault();closePerson();});
personDialog.addEventListener('click',event=>{if(event.target===personDialog){const r=personDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closePerson();}});
aboutDialog.addEventListener('click',event=>{if(event.target===aboutDialog){const r=aboutDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)aboutDialog.close();}});
window.addEventListener('popstate',()=>{if(!config)return;clearTimeout(queryTimer);clearTimeout(rangeTimer);setMenuOpen(false,false);state=readState(location.href,categories,config.defaultLanguage);render();});
narrowPerson.addEventListener('change',()=>{if(personDialog.open)syncPersonPanel();});

async function json(url) {
  const response=await fetch(url,{cache:'no-cache',signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw new Error('HTTP '+response.status+' loading '+url);
  return response.json();
}
async function boot() {
  const requestedLanguage=new URL(location.href).searchParams.get('lang');
  if(!state)state={language:['de','en'].includes(requestedLanguage)?requestedLanguage:'de'};
  document.documentElement.lang=state.language;
  timeline?.destroy();timeline=null;
  app.innerHTML='<main class="boot"><p class="mo-eyebrow">Learning Labs / People Atlas</p><h1>People Atlas</h1><p role="status">'+t('loading')+'</p></main>';
  try {
    config=await json(new URL('../atlas.config.json',import.meta.url));
    if(config.configVersion!==1||!['de','en'].includes(config.defaultLanguage))throw new Error('Invalid configuration');
    state.language=['de','en'].includes(requestedLanguage)?requestedLanguage:config.defaultLanguage;
    document.documentElement.lang=state.language;
    catalogUrl=safeUrl(config.content.catalogUrl,document.baseURI);
    catalog=validateCatalog(await json(catalogUrl));
    const results=await Promise.all([catalog.categories,...catalog.collections].map(path=>json(contentUrl(path,catalogUrl))));
    categories=results[0];people=results.slice(1).flat();
    validateDataset(categories,people);
    state=readState(location.href,categories,config.defaultLanguage);
    const requested=new URL(location.href).searchParams.get('lang');
    languageFallback=Boolean(requested&&!['de','en'].includes(requested));
    missingPerson=Boolean(state.person&&!people.some(p=>p.id===state.person));
    if(state.person&&!state.categories.length){const person=people.find(p=>p.id===state.person);if(person)state.categories=[...person.categories];}
    render();
    history.replaceState(history.state,'',stateUrl(state));
    announce(t('ready'));
    document.documentElement.dataset.ready='true';
  } catch(error) {
    console.error('People Atlas load error:',error);
    app.innerHTML='<main class="boot"><p class="mo-eyebrow">People Atlas</p><h1>'+t('errorTitle')+'</h1><p>'+t('errorHelp')+'</p>'+button('retry',t('retry'),'mo-btn mo-btn-primary')+'</main>';
    document.documentElement.dataset.ready='error';
  }
}
boot();
