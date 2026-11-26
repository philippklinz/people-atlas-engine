const paths = {
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  science:'<path d="M9 3h6m-5 0v7L4 20h16l-6-10V3M7 15h10"/>',
  mathematics:'<path d="M4 7h6M7 4v6m7-5 6 6m0-6-6 6M4 16h6m4-1h6m-6 4h6"/>',
  physics:'<ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/>',
  nature:'<path d="M5 20C4 9 10 4 21 3c0 11-6 17-16 17Zm0 0L16 9M8 14h5V9"/>',
  computing:'<rect x="5" y="5" width="14" height="14" rx="1"/><path d="M9 1v4m6-4v4M9 19v4m6-4v4M1 9h4m-4 6h4M19 9h4m-4 6h4M9 9h6v6H9z"/>',
  philosophy:'<path d="M8 17H4V5h16v12h-6l-6 5v-5Z"/><path d="M9 9a3 3 0 1 1 5 2c-1 1-2 1-2 3m0 1v1"/>',
  invention:'<path d="M8 16c-5-5-2-13 4-13s9 8 4 13l-1 2H9l-1-2Zm1 5h6m-3-3v-6m-3-3 3 3 3-3"/>',
  politics:'<path d="m2 8 10-5 10 5H2Zm2 12h16M6 10v8m6-8v8m6-8v8M2 22h20"/>',
  art:'<path d="M12 3a9 9 0 1 0 0 18c2 0 3-1 2-3s1-3 3-3h2c5-4 0-12-7-12Z"/><circle cx="7" cy="10" r="1"/><circle cx="10" cy="6" r="1"/><circle cx="16" cy="7" r="1"/>',
  literature:'<path d="M12 5v16M2 4c4-1 7 0 10 2 3-2 6-3 10-2v15c-4-1-7 0-10 2-3-2-6-3-10-2V4Z"/>',
  arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
  grid:'<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
  timeline:'<path d="M3 6h14M7 12h14M3 18h11M6 3v6m9 0v6m-5 0v6"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-11v2"/>',
  moon:'<path d="M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  copy:'<rect x="8" y="8" width="12" height="13" rx="1"/><path d="M16 8V3H3v13h5"/>',
  close:'<path d="m6 6 12 12M6 18 18 6"/>',
  search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
  external:'<path d="M14 3h7v7m0-7L10 14M10 4H4v16h16v-6"/>'
};
export function icon(name, cls = '') {
  return '<svg class="icon ' + cls + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (paths[name] ?? paths.science) + '</svg>';
}
