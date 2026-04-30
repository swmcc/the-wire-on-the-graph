/* Wire Graph Demo — Cytoscape.js (presentation version) */

const WireGraph = (() => {
  let cy          = null;
  let graphData   = null;
  let initialized = false;
  let prevSynIds  = new Set();
  let obsTimer    = null;

  const state = {
    season:     1,
    removed:    new Set(),
    showRoles:  false,
    showGames:  false,
    selected:   null,
  };

  /* ── Toggle definitions (season-aware) ──────────────────────────────── */

  const TOGGLES = [
    { id: 'toggle-avon',     node: 'avon_barksdale', seasons: [1,2,3] },
    { id: 'toggle-mcnulty',  node: 'jimmy_mcnulty',  seasons: [1,2,3,5] },
    { id: 'toggle-prop-joe', node: 'prop_joe',        seasons: [2,3,4] },
    { id: 'toggle-omar',     node: 'omar_little',     seasons: [1,2,3,4,5] },
  ];

  /* ── Observations ────────────────────────────────────────────────────── */

  const SLIDE_OBS = {
    season: {
      2: { main: "Stringer takes the wheel.",        sub: null },
      3: { main: "Two orgs. One territory.",         sub: "The game gets crowded." },
      4: { main: "The game moves to the schools.",   sub: null },
      5: { main: "The game moves to the newsroom.",  sub: null },
    },
    remove: {
      avon_barksdale: [
        { seasons: [1,2,3], main: "Stringer gets the bump.",               sub: "The game carries on." },
        { seasons: [4,5],   main: "He was already gone.",                  sub: null },
      ],
      jimmy_mcnulty: [
        { seasons: [1,2,3,4,5], main: "The investigation loses its engine.", sub: "The institution carries on." },
      ],
      prop_joe: [
        { seasons: [2,3,4], main: "Marlo seizes the Co-Op.",               sub: "The east side consolidates." },
      ],
      omar_little: [
        { seasons: [1,2,3,4], main: "The role sits empty.",                sub: "Briefly." },
        { seasons: [5],       main: "The role sits empty.",                sub: null },
      ],
    },
  };

  function getSlideObs(nodeId) {
    const entries = SLIDE_OBS.remove[nodeId];
    if (!entries) return null;
    return entries.find(e => e.seasons.includes(state.season)) || null;
  }

  function flashObs(main, sub) {
    const el = document.getElementById('slide-obs');
    if (!el) return;
    if (obsTimer) clearTimeout(obsTimer);
    el.innerHTML = `<span class="sobs-main">${main}</span>${sub ? `<span class="sobs-sub">${sub}</span>` : ''}`;
    el.style.opacity = '1';
    obsTimer = setTimeout(() => { el.style.opacity = '0'; obsTimer = null; }, 2600);
  }

  /* ── Palette ─────────────────────────────────────────────────────────── */

  const NODE_COLORS = {
    Person:       '#4a9edd',
    Organisation: '#e8a43a',
    Role:         '#a78bfa',
    Game:         '#34d399',
  };

  const EDGE_COLORS = {
    LEADS:         '#e74c3c',
    WORKS_FOR:     '#f39c12',
    INVESTIGATES:  '#3498db',
    TARGETS:       '#e74c3c',
    MEMBER_OF:     '#7f8c8d',
    OCCUPIES_ROLE: '#a78bfa',
    PLAYS_GAME:    '#34d399',
    EXPOSED_TO:    '#5d7180',
    CONTROLS:      '#e67e22',
    INFORMS:       '#f1c40f',
  };

  /* ── Stylesheet ──────────────────────────────────────────────────────── */

  function buildStylesheet() {
    const s = [];

    s.push({
      selector: 'node',
      style: {
        'label':               'data(label)',
        'color':               '#e2e8f0',
        'font-size':           11,
        'font-family':         'JetBrains Mono, monospace',
        'font-weight':         500,
        'text-wrap':           'wrap',
        'text-max-width':      82,
        'text-valign':         'bottom',
        'text-margin-y':       7,
        'text-outline-width':  2.5,
        'text-outline-color':  '#06080e',
        'text-outline-opacity': 1,
        'width':               46,
        'height':              46,
        'border-width':        2,
        'border-color':        'rgba(255,255,255,0.10)',
        'background-color':    '#2a2a3a',
        'shadow-blur':         0,
        'shadow-opacity':      0,
        'shadow-color':        '#000',
        'shadow-offset-x':     0,
        'shadow-offset-y':     0,
      },
    });

    Object.entries(NODE_COLORS).forEach(([type, color]) => {
      s.push({
        selector: `node[type="${type}"]`,
        style: {
          'background-color':  color,
          'border-color':      color,
          'border-opacity':    0.4,
          'shadow-blur':       20,
          'shadow-opacity':    0.45,
          'shadow-color':      color,
        },
      });
    });

    s.push({ selector: 'node[type="Organisation"]', style: { shape: 'round-rectangle', width: 72, height: 34, 'font-size': 10 } });
    s.push({ selector: 'node[type="Role"]',         style: { shape: 'diamond',         width: 60, height: 46, 'font-size': 9  } });
    s.push({ selector: 'node[type="Game"]',         style: { shape: 'hexagon',         width: 54, height: 54, 'font-size': 9  } });
    s.push({ selector: 'node.selected', style: { 'border-width': 4, 'border-color': '#fff', 'border-opacity': 0.9 } });
    s.push({ selector: 'node.faded',    style: { opacity: 0.12 } });
    s.push({ selector: 'edge.faded',    style: { opacity: 0.04, 'font-size': 0 } });

    s.push({
      selector: 'edge',
      style: {
        'label':                   'data(label)',
        'font-size':               7.5,
        'font-family':             'JetBrains Mono, monospace',
        'color':                   '#94a3b8',
        'text-rotation':           'autorotate',
        'text-margin-y':           -9,
        'text-background-opacity': 0.7,
        'text-background-color':   '#07090f',
        'text-background-padding': '2px',
        'curve-style':             'bezier',
        'target-arrow-shape':      'triangle',
        'line-color':              '#374151',
        'target-arrow-color':      '#374151',
        'width':                   1.5,
      },
    });

    Object.entries(EDGE_COLORS).forEach(([label, color]) => {
      s.push({ selector: `edge[label="${label}"]`, style: { 'line-color': color, 'target-arrow-color': color } });
    });

    s.push({ selector: 'edge[label="OCCUPIES_ROLE"]', style: { 'line-style': 'dashed', 'line-dash-pattern': [6, 3] } });
    s.push({ selector: 'edge[label="PLAYS_GAME"]',    style: { 'line-style': 'dotted' } });
    s.push({ selector: 'edge[label="EXPOSED_TO"]',    style: { 'line-style': 'dashed', 'line-dash-pattern': [4, 4], width: 1 } });

    s.push({
      selector: 'edge[?inherited]',
      style: {
        'line-color':          '#e8a020',
        'target-arrow-color':  '#e8a020',
        'line-style':          'dashed',
        'line-dash-pattern':   [10, 5],
        'width':               2.5,
        'shadow-blur':         10,
        'shadow-color':        '#e8a020',
        'shadow-opacity':      0.55,
        'shadow-offset-x':     0,
        'shadow-offset-y':     0,
        'color':               '#e8a020',
      },
    });

    return s;
  }

  /* ── Visibility computation ──────────────────────────────────────────── */

  function computeVisibility() {
    const visibleNodes   = new Set();
    const activeEdgeIds  = new Set();
    const inheritedEdges = [];

    graphData.nodes.forEach(n => {
      if (state.removed.has(n.id))              return;
      if (!state.showRoles && n.type === 'Role') return;
      if (!state.showGames && n.type === 'Game') return;
      visibleNodes.add(n.id);
    });

    graphData.edges.forEach(e => {
      if (!visibleNodes.has(e.source) || !visibleNodes.has(e.target)) return;
      if (state.season >= e.season_start && state.season <= e.season_end) activeEdgeIds.add(e.id);
    });

    (graphData.succession || []).forEach(sr => {
      if (!state.removed.has(sr.when_removed)) return;
      sr.rules.forEach(rule => {
        if (!visibleNodes.has(rule.new_source) || !visibleNodes.has(rule.target)) return;
        const regularActive = graphData.edges.find(e =>
          e.source === rule.new_source && e.target === rule.target &&
          e.label  === rule.label &&
          state.season >= e.season_start && state.season <= e.season_end
        );
        if (regularActive) { activeEdgeIds.add(regularActive.id); return; }
        inheritedEdges.push({
          id:        `inh__${sr.when_removed}__${rule.new_source}__${rule.label}__${rule.target}`,
          source:    rule.new_source,
          target:    rule.target,
          label:     rule.label,
          inherited: true,
          note:      sr.note,
        });
      });
    });

    return { visibleNodes, activeEdgeIds, inheritedEdges };
  }

  /* ── Helpers ─────────────────────────────────────────────────────────── */

  function fadeTo(el, opacity, dur, complete) {
    el.stop(true, false);
    if (dur === 0) { el.style('opacity', opacity); if (complete) complete(); return; }
    el.animate({ style: { opacity } }, { duration: dur, easing: 'ease-in-out', complete });
  }

  function pulseNode(node, color = '#e8a020') {
    if (!node || !node.length) return;
    node.stop(true, false);
    node.animate(
      { style: { 'border-width': 8, 'border-color': color, 'border-opacity': 1 } },
      { duration: 220, easing: 'ease-out',
        complete() { node.animate({ style: { 'border-width': 2, 'border-color': 'rgba(255,255,255,0.10)', 'border-opacity': 1 } }, { duration: 600, easing: 'ease-in-out' }); }
      }
    );
  }

  function flashEdge(edge) {
    edge.stop(true, false);
    edge.animate(
      { style: { width: 5 } },
      { duration: 180, easing: 'ease-out',
        complete() { edge.animate({ style: { width: 2.5 } }, { duration: 400 }); }
      }
    );
  }

  /* ── Main update ─────────────────────────────────────────────────────── */

  function updateGraph(animated = true) {
    if (!cy) return;

    const dur = animated ? 280 : 0;
    const { visibleNodes, activeEdgeIds, inheritedEdges } = computeVisibility();

    const currentSynIds = new Set(inheritedEdges.map(e => e.id));
    const newSynIds     = new Set([...currentSynIds].filter(id => !prevSynIds.has(id)));

    cy.edges('[?inherited]').forEach(e => { if (!currentSynIds.has(e.id())) e.remove(); });
    inheritedEdges.forEach(e => { if (!cy.getElementById(e.id).length) cy.add({ group: 'edges', data: e }); });
    prevSynIds = new Set(currentSynIds);

    const connected = new Set();
    cy.edges().forEach(edge => {
      if (activeEdgeIds.has(edge.id()) || edge.data('inherited')) {
        connected.add(edge.source().id());
        connected.add(edge.target().id());
      }
    });

    cy.nodes().forEach(node => {
      const nid  = node.id();
      const show = visibleNodes.has(nid);
      if (!show) { fadeTo(node, 0, dur, () => node.style('display', 'none')); return; }
      node.style('display', 'element');
      fadeTo(node, connected.has(nid) ? 1 : 0.28, dur);
    });

    cy.edges().forEach(edge => {
      const eid      = edge.id();
      const isInh    = !!edge.data('inherited');
      const srcVis   = visibleNodes.has(edge.source().id());
      const tgtVis   = visibleNodes.has(edge.target().id());
      const isActive = activeEdgeIds.has(eid) || isInh;

      if (!srcVis || !tgtVis) { fadeTo(edge, 0, dur / 2); return; }

      edge.style('display', 'element');
      if (isActive) {
        edge.style('font-size', isInh ? 8 : 7.5);
        fadeTo(edge, isInh ? 1 : 0.88, dur);
        if (isInh && newSynIds.has(eid)) setTimeout(() => flashEdge(edge), dur + 40);
      } else {
        edge.style('font-size', 0);
        fadeTo(edge, 0.06, dur);
      }
    });

    if (animated && newSynIds.size > 0) {
      const pulsed = new Set();
      inheritedEdges.filter(e => newSynIds.has(e.id)).forEach(e => {
        [e.source, e.target].forEach(nid => {
          if (!pulsed.has(nid)) { pulseNode(cy.getElementById(nid)); pulsed.add(nid); }
        });
      });
    }

    updateStatus(visibleNodes, activeEdgeIds, inheritedEdges);
    updateSuccessionNote(inheritedEdges);
    applySelectionFade();
  }

  /* ── Selection ───────────────────────────────────────────────────────── */

  function applySelectionFade() {
    if (!state.selected) { cy.elements().removeClass('selected faded'); return; }
    const sel  = cy.getElementById(state.selected);
    const hood = sel.closedNeighborhood();
    cy.elements().addClass('faded');
    hood.removeClass('faded');
    sel.addClass('selected');
  }

  function selectNode(id) { state.selected = id; applySelectionFade(); }
  function clearSelection() { state.selected = null; applySelectionFade(); }

  /* ── Status ──────────────────────────────────────────────────────────── */

  function updateStatus(visibleNodes, activeEdgeIds, inheritedEdges) {
    const el = document.getElementById('status-text');
    if (!el) return;
    const edgeCount   = activeEdgeIds.size + inheritedEdges.length;
    const removedList = [...state.removed].map(id => {
      const n = graphData.nodes.find(n => n.id === id);
      return n ? n.label : id;
    });
    let line = `S${state.season} · ${visibleNodes.size} nodes · ${edgeCount} active edges`;
    if (removedList.length) line += `\n${removedList.join(', ')} removed`;
    if (inheritedEdges.length) line += `\n${inheritedEdges.length} succession edge${inheritedEdges.length !== 1 ? 's' : ''} active`;
    el.textContent = line;
  }

  function updateSuccessionNote(inheritedEdges) {
    const el = document.getElementById('succession-note');
    if (!el) return;
    if (!inheritedEdges.length) {
      el.style.opacity = '0';
      setTimeout(() => { if (!inheritedEdges.length) el.textContent = ''; }, 300);
      return;
    }
    const seen = new Map();
    inheritedEdges.forEach(e => { if (!seen.has(e.note)) seen.set(e.note, true); });
    el.textContent = [...seen.keys()].join(' · ');
    el.style.opacity = '1';
  }

  /* ── Season-aware toggles ────────────────────────────────────────────── */

  function updateTogglesForSeason() {
    TOGGLES.forEach(({ id, node, seasons }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const relevant = seasons.includes(state.season);
      const label = el.closest('label');
      if (label) label.style.opacity = relevant ? '' : '0.32';
      el.disabled = !relevant;
      if (!relevant && el.checked) {
        el.checked = false;
        state.removed.delete(node);
      }
    });
  }

  /* ── Initialise ──────────────────────────────────────────────────────── */

  async function init() {
    if (initialized) return;
    initialized = true;

    const res = await fetch('data/wire-graph.json');
    graphData  = await res.json();

    const nodes = graphData.nodes.map(n => ({
      data:     { id: n.id, label: n.label, type: n.type },
      position: { x: n.x, y: n.y },
    }));

    const edges = graphData.edges.map(e => ({
      data: { id: e.id, source: e.source, target: e.target, label: e.label, season_start: e.season_start, season_end: e.season_end },
    }));

    cy = cytoscape({
      container:           document.getElementById('cy'),
      elements:            { nodes, edges },
      style:               buildStylesheet(),
      layout:              { name: 'preset' },
      minZoom:             0.25,
      maxZoom:             3,
      userZoomingEnabled:  true,
      userPanningEnabled:  true,
      boxSelectionEnabled: false,
    });

    cy.fit(cy.nodes(), 50);

    cy.on('tap', 'node', evt => selectNode(evt.target.id()));
    cy.on('tap', evt  => { if (evt.target === cy) clearSelection(); });

    const tooltip = document.getElementById('graph-tooltip');
    if (tooltip) {
      cy.on('mouseover', 'node', evt => {
        const rp = evt.renderedPosition;
        const nd = evt.target.data();
        tooltip.textContent = `${nd.label.replace('\n', ' ')} [${nd.type}]`;
        tooltip.style.left    = (rp.x + 14) + 'px';
        tooltip.style.top     = (rp.y - 34) + 'px';
        tooltip.style.opacity = '1';
      });
      cy.on('mouseout pan zoom', () => { tooltip.style.opacity = '0'; });
    }

    updateGraph(false);
    updateTogglesForSeason();
    bindControls();
  }

  /* ── Controls ────────────────────────────────────────────────────────── */

  function bindControls() {
    document.querySelectorAll('.season-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.season-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.season = +btn.dataset.season;
        updateTogglesForSeason();
        updateGraph(true);
        const sObs = SLIDE_OBS.season[state.season];
        if (sObs) setTimeout(() => flashObs(sObs.main, sObs.sub), 360);
      });
    });

    TOGGLES.forEach(({ id, node }) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('change', e => {
        if (e.target.checked) {
          state.removed.add(node);
          const obs = getSlideObs(node);
          if (obs) setTimeout(() => flashObs(obs.main, obs.sub), 420);
        } else {
          state.removed.delete(node);
        }
        updateGraph(true);
      });
    });

    [
      { id: 'toggle-roles', key: 'showRoles' },
      { id: 'toggle-games', key: 'showGames' },
    ].forEach(({ id, key }) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('change', e => { state[key] = e.target.checked; updateGraph(true); });
    });

    const resetBtn = document.getElementById('btn-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        state.season    = 1;
        state.removed.clear();
        state.showRoles = false;
        state.showGames = false;
        state.selected  = null;

        document.querySelectorAll('.season-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
        TOGGLES.forEach(({ id }) => { const el = document.getElementById(id); if (el) el.checked = false; });
        ['toggle-roles', 'toggle-games'].forEach(id => { const el = document.getElementById(id); if (el) el.checked = false; });

        updateTogglesForSeason();
        updateGraph(true);
      });
    }
  }

  return { init };
})();

/* ── Hook into Reveal.js ──────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof Reveal === 'undefined') return;
  const tryInit = slide => { if (slide?.id === 'demo-slide') WireGraph.init(); };
  Reveal.on('slidechanged', evt => tryInit(evt.currentSlide));
  Reveal.on('ready',        evt => tryInit(evt.currentSlide));
});

/* ── Live-computed slide metrics ──────────────────────────────────────────
   Builds headless Cytoscape graphs from the same wire-graph.json the
   explorer uses, then computes the centrality and component numbers shown
   on slides 7 and 9b. The HTML carries baked-in fallbacks so the deck still
   works if this fails. */

const WireMetrics = (() => {
  const PERSON_ORG = n => n.type === 'Person' || n.type === 'Organisation';

  function buildHeadless(graphData, season, removed, nodeFilter) {
    const visible = new Set();
    graphData.nodes.forEach(n => {
      if (removed.has(n.id))   return;
      if (!nodeFilter(n))      return;
      visible.add(n.id);
    });

    const nodes = [...visible].map(id => {
      const n = graphData.nodes.find(x => x.id === id);
      return { data: { id: n.id, type: n.type } };
    });

    const edges = graphData.edges
      .filter(e =>
        visible.has(e.source) && visible.has(e.target) &&
        season >= e.season_start && season <= e.season_end
      )
      .map(e => ({ data: { id: e.id, source: e.source, target: e.target, label: e.label } }));

    return cytoscape({ headless: true, styleEnabled: false, elements: { nodes, edges } });
  }

  function largestComponent(headless) {
    const comps = headless.elements().components();
    let max = 0;
    comps.forEach(c => { max = Math.max(max, c.nodes().length); });
    return max;
  }

  function normalizedBetweenness(headless, nodeId) {
    const node = headless.getElementById(nodeId);
    if (!node || !node.length) return null;
    const bc = headless.elements().betweennessCentrality({ directed: false, weight: () => 1 });
    const v = bc.betweennessNormalized(node);
    return Number.isFinite(v) ? v : null;
  }

  function degreeOf(headless, nodeId) {
    const node = headless.getElementById(nodeId);
    if (!node || !node.length) return null;
    return node.connectedEdges().length;
  }

  function setSpan(name, value) {
    document.querySelectorAll(`[data-metric="${name}"]`).forEach(el => { el.textContent = value; });
  }

  function fmt(v, digits = 2) {
    if (v === null || v === undefined || Number.isNaN(v)) return '—';
    return v.toFixed(digits);
  }

  async function compute() {
    if (typeof cytoscape === 'undefined') return;
    let graphData;
    try {
      const res = await fetch('data/wire-graph.json');
      graphData = await res.json();
    } catch { return; }

    const noRemoved = new Set();

    /* Season 2 — Avon experiment */
    const s2Full = buildHeadless(graphData, 2, noRemoved, PERSON_ORG);
    const s2NoAvon = buildHeadless(graphData, 2, new Set(['avon_barksdale']), PERSON_ORG);

    const s2CompBefore   = largestComponent(s2Full);
    const s2CompAfterAvn = largestComponent(s2NoAvon);
    const bksdBefore     = normalizedBetweenness(s2Full,   'barksdale_org');
    const bksdAfter      = normalizedBetweenness(s2NoAvon, 'barksdale_org');
    const avonDeg        = degreeOf(s2Full, 'avon_barksdale');
    const avonBtw        = normalizedBetweenness(s2Full, 'avon_barksdale');

    setSpan('s2-comp-before',        s2CompBefore);
    setSpan('s2-comp-after-avon',    s2CompAfterAvn);
    setSpan('s2-comp-before-2',      s2CompBefore);
    setSpan('s2-comp-after-avon-2',  s2CompAfterAvn);
    setSpan('s2-bksd-before',        fmt(bksdBefore));
    setSpan('s2-bksd-after',         fmt(bksdAfter));
    if (bksdBefore && bksdAfter !== null && bksdBefore > 0) {
      const pct = Math.round(((bksdAfter - bksdBefore) / bksdBefore) * 100);
      setSpan('s2-bksd-delta', `${pct >= 0 ? '+' : ''}${pct}%`);
    }
    setSpan('avon-degree',  avonDeg ?? '—');
    setSpan('avon-between', fmt(avonBtw));

    /* Season 3 — Prop Joe experiment */
    const s3Full   = buildHeadless(graphData, 3, noRemoved, PERSON_ORG);
    const s3NoPJ   = buildHeadless(graphData, 3, new Set(['prop_joe']), PERSON_ORG);
    const s3CompBefore = largestComponent(s3Full);
    const s3CompAfterPJ = largestComponent(s3NoPJ);
    const pjDeg = degreeOf(s3Full, 'prop_joe');
    const pjBtw = normalizedBetweenness(s3Full, 'prop_joe');

    setSpan('s3-comp-before',    s3CompBefore);
    setSpan('s3-comp-after-pj',  s3CompAfterPJ);
    setSpan('pj-degree',         pjDeg ?? '—');
    setSpan('pj-between',        fmt(pjBtw));
  }

  return { compute };
})();

document.addEventListener('DOMContentLoaded', () => { WireMetrics.compute(); });
