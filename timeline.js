(() => {
  'use strict';
  const tabs = [...document.querySelectorAll('[data-chapter]')];
  const chapters = [...document.querySelectorAll('.chapter')];
  const previous = document.querySelector('#previous-chapter');
  const next = document.querySelector('#next-chapter');
  const fullHistory = document.querySelector('#full-history');
  let current = 6;
  let reading = false;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function selectChapter(index, { focus = false, hash = true } = {}) {
    current = Math.max(0, Math.min(chapters.length - 1, index));
    reading = false;
    document.querySelector('.chapters').classList.remove('all-chapters');
    fullHistory.setAttribute('aria-expanded', 'false');
    fullHistory.textContent = 'View full history';
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === current));
      tab.tabIndex = i === current ? 0 : -1;
      chapters[i].hidden = i !== current;
      chapters[i].setAttribute('role', 'tabpanel');
    });
    previous.disabled = current === 0;
    next.disabled = current === chapters.length - 1;
    document.querySelector('#chapter-position').textContent = `Chapter ${current + 1} of ${chapters.length}`;
    if (hash) window.history.replaceState(null, '', `#${chapters[current].id}`);
    if (focus) tabs[current].focus({ preventScroll: true });
    // Keep the selected year visible without moving the page vertically.
    const rail = document.querySelector('.timeline-tabs');
    const tab = tabs[current];
    if (rail.scrollWidth > rail.clientWidth) {
      rail.scrollTo({ left: tab.offsetLeft - rail.offsetLeft - (rail.clientWidth - tab.offsetWidth) / 2, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    }
  }

  tabs.forEach((tab, i) => tab.addEventListener('click', () => selectChapter(i)));
  document.querySelector('.timeline-tabs').addEventListener('keydown', event => {
    let target;
    if (event.key === 'ArrowRight') target = (current + 1) % tabs.length;
    if (event.key === 'ArrowLeft') target = (current - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') target = 0;
    if (event.key === 'End') target = tabs.length - 1;
    if (target !== undefined) {
      event.preventDefault();
      selectChapter(target, { focus: true });
    }
  });
  previous.addEventListener('click', () => selectChapter(current - 1));
  next.addEventListener('click', () => selectChapter(current + 1));
  fullHistory.addEventListener('click', () => {
    if (reading) return selectChapter(current, { hash: false });
    reading = true;
    document.querySelector('.chapters').classList.add('all-chapters');
    chapters.forEach(chapter => { chapter.hidden = false; chapter.setAttribute('role', 'article'); });
    fullHistory.setAttribute('aria-expanded', 'true');
    fullHistory.textContent = 'Return to chapters';
    document.querySelector('#chapter-position').textContent = 'All 8 chapters, in order';
    previous.disabled = true;
    next.disabled = true;
  });
  document.querySelector('#begin-history').addEventListener('click', () => selectChapter(0, { hash: false }));
  document.querySelector('[data-show-science]').addEventListener('click', () => selectChapter(7, { hash: false }));
  window.addEventListener('hashchange', () => {
    const match = chapters.findIndex(chapter => `#${chapter.id}` === window.location.hash);
    if (match !== -1) selectChapter(match, { hash: false });
  });

  const explanations = {
    parts: [
      'A consistent part label connects the physical item to its operational record.',
      'Reliable records support performance reports, labor-hour accounting, and maintenance scheduling.',
      'Better information helps maintenance teams find parts and improve the flow of work.'
    ],
    property: [
      'Acquisition cost, renovation scope, and resale assumptions define the decision.',
      'Compare costs and expected benefits across properties, vendors, and project scope.',
      'The analysis supports property selection and project planning. This diagram shows the method, not a specific property.'
    ],
    markets: [
      'Time-series signals inform a decision. They do not guarantee an outcome.',
      'Consider a range of possible outcomes instead of relying on a single point estimate.',
      'A rule-based decision connects the signal to an explicit risk assumption. This curve is illustrative, not a return history.'
    ],
    bank: [
      'Transaction records enter a controlled process for accurate reconciliation.',
      'Controls and traceable reports help identify exceptions at each handoff.',
      'Reconciliation connects processed transactions to accurate records and resolved exceptions.'
    ],
    aircraft: [
      'Maintenance records connect shop activity, workforce capacity, and production flow.',
      'Root cause analysis examines bottlenecks across avionics, sheet metal, and electrics. Marker positions are illustrative.',
      'Recurring reports and Excel macros make production metrics more useful to squadron leadership.'
    ],
    leadership: [
      'The tracking program connected 700+ check-flight events to recurring part failures.',
      'Patterns across 10+ parts established a reliability signal that individual events could not show alone.',
      'The work supported a reduction of 5+ post-dock flow days, approximately 10%, and informed resource decisions.'
    ]
  };

  const defs = `<defs><linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f8ffff"/><stop offset="1" stop-color="#b9d3d9"/></linearGradient><linearGradient id="glass" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#e7f4ef" stop-opacity=".8"/><stop offset="1" stop-color="#b5d6cd" stop-opacity=".45"/></linearGradient><filter id="shadow" x="-30%" y="-30%" width="170%" height="180%"><feDropShadow dx="0" dy="9" stdDeviation="8" flood-color="#54767f" flood-opacity=".12"/></filter><pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#d9e5e6" stroke-width=".6"/></pattern></defs>`;
  const start = title => `<svg viewBox="0 0 480 320" role="img" aria-label="${title}" xmlns="http://www.w3.org/2000/svg">${defs}<rect x="15" y="20" width="450" height="280" rx="12" fill="url(#grid)"/>`;
  const path = (d, extra = '') => `<path d="${d}" fill="none" stroke="#6d969b" stroke-width="1.5" ${extra}/>`;
  const connector = d => path(d, 'stroke-dasharray="4 5"');
  const node = (x, y, text, n) => `<g data-node="${n}"><circle cx="${x}" cy="${y}" r="6" fill="#236d68" stroke="#fff" stroke-width="3"/><circle cx="${x}" cy="${y}" r="13" fill="none" stroke="#9fc6b9" stroke-width="1"/><text x="${x}" y="${y + 32}" text-anchor="middle">${text}</text></g>`;
  const cube = (x, y, w, h, n, label) => `<g data-node="${n}" filter="url(#shadow)"><path d="M${x} ${y}l${w} -${w * .45} ${w} ${w * .45} -${w} ${w * .45}z" fill="#e8f2f1" stroke="#8fb2b9"/><path d="M${x} ${y}v${h}l${w} ${w * .45}v-${h}z" fill="#c2d9dd" stroke="#8fb2b9"/><path d="M${x + w} ${y + w * .45}v${h}l${w} -${w * .45}v-${h}z" fill="#a8c6ca" stroke="#8fb2b9"/><text x="${x + w}" y="${y + h + w * .45 + 28}" text-anchor="middle" class="diagram-title">${label}</text></g>`;

  function schematic(kind) {
    if (kind === 'parts') return start('A conceptual isometric map connects part labels, records, and a maintenance schedule.') +
      `<path d="M40 218L250 300 451 198 242 116z" fill="#e4eff0" stroke="#cadbdd"/>` +
      connector('M114 225L240 194 367 128') + cube(50, 156, 45, 45, 0, 'Label') + cube(193, 125, 45, 45, 1, 'Record') + cube(335, 89, 45, 45, 2, 'Schedule') +
      `<g data-node="1"><path d="M218 130l32 -15m-29 21 26 -12m-23 20 22 -10" stroke="#4c8d88" stroke-width="3"/></g><text x="35" y="45">Physical work</text><text x="357" y="45">Usable information</text></svg>`;
    if (kind === 'property') return start('An isometric house connects acquisition inputs, project costs, and a property decision.') +
      `<g filter="url(#shadow)"><path d="M137 235l110 48 112 -62 -110 -46z" fill="#d9e8e6" stroke="#b5cecc"/><path d="M177 143v87l68 30v-91z" fill="#d4e7e4" stroke="#8fb1b5"/><path d="M245 169v91l74 -42v-87z" fill="#b4d1cf" stroke="#8fb1b5"/><path d="M168 145l78 -89 85 75 -85 46z" fill="#edf4f2" stroke="#759aa2"/><path d="M246 56v121l85 -46z" fill="#7fa9af" stroke="#759aa2"/><path d="M198 166v29l20 9v-29zM273 165v30l21 -12v-30z" fill="#f7fbfa" stroke="#8fb1b5"/><path d="M225 215v36l15 7v-36z" fill="#8cacad"/></g>` + connector('M60 232L157 206M368 112L315 144M369 258L318 231') + node(59, 232, 'Acquisition', 0) + node(383, 104, 'Renovation', 1) + node(390, 251, 'Decision', 2) + `</svg>`;
    if (kind === 'markets') return start('An illustrative probability distribution shows signals, uncertainty, and a decision rule; it is not a return history.') +
      `<path d="M40 243C105 242 117 225 145 179S195 65 238 64 303 143 325 184 367 241 440 243V250H40z" fill="url(#glass)"/>` +
      `<g data-node="1"><path d="M120 244C143 182 186 64 238 64S331 183 355 244" fill="none" stroke="#9fc6b9" stroke-width="12" opacity=".4"/></g>` +
      path('M40 243C105 242 117 225 145 179S195 65 238 64 303 143 325 184 367 241 440 243', 'stroke-linecap="round"') +
      `<path d="M38 251H442" stroke="#aec5c8"/><g data-node="2"><path d="M294 74V250" stroke="#236d68" stroke-width="2" stroke-dasharray="5 5"/><rect x="310" y="71" width="113" height="33" rx="5" fill="#e0ede7"/><text x="366" y="92" text-anchor="middle">Decision rule</text></g>` + node(116, 221, 'Signal', 0) + `<text x="240" y="289" text-anchor="middle">Range of possible outcomes (illustrative)</text><text x="24" y="39">Uncertainty is part of the model.</text></svg>`;
    if (kind === 'bank') {
      let s = start('A conceptual transaction process moves from records through controls to reconciliation.');
      ['Records', 'Controls', 'Reconciled'].forEach((label, n) => {
        const x = 30 + n * 151;
        s += `<g data-node="${n}" filter="url(#shadow)"><rect x="${x + 8}" y="86" width="104" height="153" rx="7" fill="#d7e7e8" stroke="#aac5ca"/><rect x="${x}" y="78" width="104" height="153" rx="7" fill="#f6fbfa" stroke="#9fbcc3"/><rect x="${x}" y="78" width="104" height="29" rx="7" fill="#e0eee9"/><text x="${x + 52}" y="98" text-anchor="middle" class="diagram-title">${label}</text>`;
        for (let i = 0; i < 4; i++) s += `<rect x="${x + 14}" y="${125 + i * 23}" width="7" height="7" rx="2" fill="#70a296"/><path d="M${x + 30} ${129 + i * 23}h${i % 2 ? 48 : 57}" stroke="#c0d3d7" stroke-width="3"/>`;
        s += `</g>`;
        if (n < 2) s += path(`M${x + 120} 160h20m-5 -4 5 4 -5 4`);
      });
      return s + `<text x="240" y="284" text-anchor="middle">Accuracy at each handoff</text></svg>`;
    }
    if (kind === 'aircraft') return start('A conceptual top-view aircraft schematic links maintenance operations, constraints, and reporting. Marker positions are illustrative.') +
      `<g transform="translate(0 6)" filter="url(#shadow)"><path d="M235 31Q240 10 245 31L256 137 441 240 441 253 257 207 252 272 291 299 291 306 240 291 189 306 189 299 228 272 223 207 39 253 39 240 224 137z" fill="url(#metal)" stroke="#7599a4" stroke-width="1.2"/><path d="M240 30v260M223 168l-159 78M256 168l159 78" fill="none" stroke="#adc6cc"/>` +
      [107,159,309,361].map(x => `<rect x="${x}" y="202" width="18" height="37" rx="7" fill="#b2cdd3" stroke="#6e98a3"/><path d="M${x + 9} 202v37" stroke="#7a9fa8"/>`).join('') + `<path d="M230 66q10 -5 20 0v15h-20z" fill="#6f929d"/></g>` +
      connector('M244 84L357 53M160 185L85 115M274 261L368 282') + node(361, 51, 'Operations', 0) + node(79, 112, 'Constraints', 1) + node(374, 275, 'Reporting', 2) + `</svg>`;
    if (kind === 'leadership') return start('A process model connects 700-plus check-flight events, recurring patterns across 10-plus parts, and maintenance action.') +
      `<g data-node="0">${Array.from({ length: 12 }, (_, i) => `<circle cx="${52 + (i % 3) * 26}" cy="${87 + Math.floor(i / 3) * 32}" r="6" fill="${i % 3 === 0 ? '#46897f' : '#a3c4c9'}"/>`).join('')}<text x="78" y="253" text-anchor="middle" class="diagram-title">700+ events</text></g>` + connector('M117 132L214 93M117 163L214 160M117 195L214 226') +
      `<g data-node="1"><rect x="214" y="75" width="63" height="43" rx="7" fill="#cee3da" stroke="#8db4a8"/><rect x="214" y="138" width="63" height="43" rx="7" fill="#e1ecec" stroke="#9cbec3"/><rect x="214" y="201" width="63" height="43" rx="7" fill="#cee3da" stroke="#8db4a8"/><path d="M229 96h33M229 159h33M229 222h33" stroke="#659b8e" stroke-width="3"/><text x="245" y="276" text-anchor="middle" class="diagram-title">Recurring patterns</text></g>` + connector('M280 96L367 155M280 160H367M280 222L367 164') +
      `<g data-node="2"><circle cx="405" cy="160" r="37" fill="#e0eee8" stroke="#87b2a1"/><path d="M389 159l11 11 22 -23" fill="none" stroke="#236d68" stroke-width="3"/><text x="405" y="253" text-anchor="middle" class="diagram-title">Action</text></g><text x="28" y="37">Patterns that survive beyond one event</text></svg>`;
    return '';
  }

  document.querySelectorAll('[data-inspector]').forEach(panel => {
    const kind = panel.dataset.inspector;
    if (kind === 'forecast') return;
    // Scope gradient IDs to each diagram so full-history mode renders correctly.
    panel.querySelector('.model-canvas').innerHTML = schematic(kind).replace(/id="(metal|glass|shadow|grid)"/g, `id="${kind}-$1"`).replace(/url\(#(metal|glass|shadow|grid)\)/g, `url(#${kind}-$1)`);
    const controls = [...panel.querySelectorAll('[data-layer]')];
    function inspect(index) {
      controls.forEach((button, i) => {
        button.classList.toggle('is-active', i === index);
        button.setAttribute('aria-pressed', String(i === index));
      });
      panel.querySelectorAll('[data-node]').forEach(item => item.classList.toggle('dimmed', Number(item.dataset.node) !== index));
      panel.querySelector('.model-explanation').textContent = explanations[kind][index];
    }
    controls.forEach(button => button.addEventListener('click', () => inspect(Number(button.dataset.layer))));
    inspect(0);
  });

  const forecastPanel = document.querySelector('[data-inspector="forecast"]');
  forecastPanel.querySelector('.model-canvas').innerHTML = `<svg viewBox="0 0 480 300" role="img" aria-label="An illustrative forecast chart compares a baseline with a scenario and an uncertainty band." xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="forecast-band" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#a8d0bd" stop-opacity=".55"/><stop offset="1" stop-color="#a8d0bd" stop-opacity=".08"/></linearGradient></defs><text x="45" y="24">Index (illustrative)</text>${[80,110,140,170].map(v => `<path d="M45 ${50 + (170 - v) * 2}H447" stroke="#dbe6e7" stroke-width="1"/><text x="32" y="${54 + (170 - v) * 2}" text-anchor="end" font-size="9">${v}</text>`).join('')}<path id="uncertainty-band" fill="url(#forecast-band)"/><path id="baseline-curve" fill="none" stroke="#91abb3" stroke-width="2" stroke-dasharray="4 6"/><path id="scenario-curve" fill="none" stroke="#236d68" stroke-width="2.8" stroke-linecap="round"/><circle id="forecast-endpoint" r="5" fill="#236d68" stroke="#fff" stroke-width="2"/><path d="M45 234H447" stroke="#b4cbd0"/><text x="45" y="254">Now</text><text x="447" y="254" text-anchor="end">Forecast horizon</text><path d="M123 280h20" stroke="#91abb3" stroke-width="2" stroke-dasharray="4 3"/><text x="149" y="284">Baseline</text><path d="M251 280h20" stroke="#236d68" stroke-width="2.8"/><text x="277" y="284">Scenario</text></svg>`;
  const base = Array.from({ length: 10 }, (_, i) => 100 + i * 4 + Math.sin(i * .9) * 2);
  const points = values => values.map((value, i) => [45 + i * (402 / 9), 50 + (170 - value) * 2]);
  const line = coordinates => coordinates.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');
  function updateForecast() {
    const shift = Number(document.querySelector('#scenario-shift').value);
    const scenario = base.map((value, i) => value * (1 + (shift / 100) * i / 9));
    const upper = points(scenario.map((value, i) => value + 5 + i * .85));
    const lower = points(scenario.map((value, i) => value - 5 - i * .85)).reverse();
    document.querySelector('#baseline-curve').setAttribute('d', line(points(base)));
    document.querySelector('#scenario-curve').setAttribute('d', line(points(scenario)));
    document.querySelector('#uncertainty-band').setAttribute('d', line(upper) + ' L' + lower.map(([x,y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(' L') + ' Z');
    const end = points(scenario).at(-1);
    document.querySelector('#forecast-endpoint').setAttribute('cx', end[0]);
    document.querySelector('#forecast-endpoint').setAttribute('cy', end[1]);
    const label = shift === 0 ? 'Baseline' : `${shift > 0 ? '+' : ''}${shift}% assumption`;
    document.querySelector('#scenario-label').value = label;
    document.querySelector('#scenario-shift').setAttribute('aria-valuetext', label);
  }
  document.querySelector('#scenario-shift').addEventListener('input', updateForecast);
  updateForecast();

  // Values come from the capstone's corrected test_evaluation_results.csv.
  const evaluations = [
    { model: 'LightGBM', MAE: 21.719, RMSE: 51.574 },
    { model: 'Random Forest', MAE: 22.115, RMSE: 51.933 },
    { model: 'XGBoost', MAE: 22.039, RMSE: 51.993 },
    { model: 'Ridge Regression', MAE: 22.845, RMSE: 52.658 },
    { model: 'Lasso Regression', MAE: 22.844, RMSE: 52.658 },
    { model: 'Linear Regression', MAE: 23.211, RMSE: 52.942 }
  ];
  function renderBenchmark(metric) {
    const maximum = metric === 'MAE' ? 25 : 60;
    document.querySelector('#model-benchmark').innerHTML = evaluations.map(result => `<div class="benchmark-row"><span>${result.model}</span><div class="benchmark-track" aria-hidden="true"><div class="benchmark-fill" style="width:${result[metric] / maximum * 100}%"></div></div><span class="benchmark-number">${result[metric].toFixed(2)}<span class="sr-only"> minutes ${metric}</span></span></div>`).join('');
    document.querySelectorAll('[data-metric]').forEach(button => {
      button.classList.toggle('is-active', button.dataset.metric === metric);
      button.setAttribute('aria-pressed', String(button.dataset.metric === metric));
    });
  }
  document.querySelectorAll('[data-metric]').forEach(button => button.addEventListener('click', () => renderBenchmark(button.dataset.metric)));
  renderBenchmark('MAE');
  document.documentElement.classList.add('enhanced');
  const initial = chapters.findIndex(chapter => `#${chapter.id}` === window.location.hash);
  selectChapter(initial === -1 ? 6 : initial, { hash: false });
})();
