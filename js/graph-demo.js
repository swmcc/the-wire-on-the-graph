/* Wire Graph Demo — Cytoscape.js interactive graph */

const WireGraph = (() => {
  let cy = null;
  let graphData = null;
  let savedPositions = null;
  let initialized = false;

  let state = {
    season: 1,
    removeAvon: false,
    removeMcnulty: false,
    showRoles: false,
    showGames: false,
  };

  const NODE_COLORS = {
    Person:       '#4a9edd',
    Organisation: '#e8a43a',
    Role:         '#9b59b6',
    Game:         '#2ecc71',
    Place:        '#7f8c8d',
  };

  const EDGE_COLORS = {
    LEADS:         '#e74c3c',
    WORKS_FOR:     '#f39c12',
    INVESTIGATES:  '#3498db',
    TARGETS:       '#e74c3c',
    MEMBER_OF:     '#95a5a6',
    OCCUPIES_ROLE: '#9b59b6',
    PLAYS_GAME:    '#2ecc71',
    EXPOSED_TO:    '#7f8c8d',
    CONTROLS:      '#e67e22',
    SUPPLIES:      '#1abc9c',
    INFORMS:       '#f1c40f',
    OPPOSES:       '#e74c3c',
  };

  function buildStylesheet() {
    const nodeStyles = [
      {
        selector: 'node',
        style: {
          'label':            'data(label)',
          'color':            '#fff',
          'font-size':        10,
          'text-wrap':        'wrap',
          'text-max-width':   70,
          'text-valign':      'bottom',
          'text-margin-y':    5,
          'width':            52,
          'height':           52,
          'border-width':     2,
          'border-color':     'rgba(255,255,255,0.15)',
          'background-color': '#555',
          'font-family':      'monospace',
        },
      },
    ];

    Object.entries(NODE_COLORS).forEach(([type, color]) => {
      nodeStyles.push({
        selector: `node[type = "${type}"]`,
        style: { 'background-color': color },
      });
    });

    const edgeBase = {
      selector: 'edge',
      style: {
        'label':               'data(label)',
        'font-size':           8,
        'color':               '#bbb',
        'text-rotation':       'autorotate',
        'text-margin-y':       -8,
        'curve-style':         'bezier',
        'target-arrow-shape':  'triangle',
        'line-color':          '#555',
        'target-arrow-color':  '#555',
        'width':               1.5,
        'font-family':         'monospace',
        'text-background-opacity': 0,
      },
    };

    const edgeStyles = [edgeBase];

    Object.entries(EDGE_COLORS).forEach(([label, color]) => {
      edgeStyles.push({
        selector: `edge[label = "${label}"]`,
        style: {
          'line-color':           color,
          'target-arrow-color':   color,
        },
      });
    });

    edgeStyles.push({
      selector: 'edge[label = "OCCUPIES_ROLE"]',
      style: { 'line-style': 'dashed', 'width': 1.5 },
    });

    edgeStyles.push({
      selector: 'edge[label = "PLAYS_GAME"]',
      style: { 'line-style': 'dotted', 'width': 1.5 },
    });

    edgeStyles.push({
      selector: 'edge[label = "EXPOSED_TO"]',
      style: { 'line-style': 'dashed', 'width': 1 },
    });

    return [...nodeStyles, ...edgeStyles];
  }

  function visibleNodeIds() {
    const ids = new Set();
    graphData.nodes.forEach(n => {
      if (state.removeAvon    && n.id === 'avon_barksdale')  return;
      if (state.removeMcnulty && n.id === 'jimmy_mcnulty')   return;
      if (!state.showRoles    && n.type === 'Role')           return;
      if (!state.showGames    && n.type === 'Game')           return;
      ids.add(n.id);
    });
    return ids;
  }

  function activeEdgeIds(season) {
    const ids = new Set();
    graphData.edges.forEach(e => {
      if (season >= e.season_start && season <= e.season_end) ids.add(e.id);
    });
    return ids;
  }

  function updateGraph() {
    if (!cy) return;

    const visible  = visibleNodeIds();
    const active   = activeEdgeIds(state.season);

    cy.batch(() => {
      cy.nodes().forEach(node => {
        if (visible.has(node.id())) {
          node.style({ display: 'element', opacity: 1 });
        } else {
          node.style({ display: 'none' });
        }
      });

      cy.edges().forEach(edge => {
        const srcVisible = visible.has(edge.source().id());
        const tgtVisible = visible.has(edge.target().id());
        if (!srcVisible || !tgtVisible) {
          edge.style({ display: 'none' });
        } else if (active.has(edge.id())) {
          edge.style({ display: 'element', opacity: 0.9 });
        } else {
          edge.style({ display: 'element', opacity: 0.1 });
        }
      });
    });

    updateStatus(visible, active);
  }

  function updateStatus(visible, active) {
    const el = document.getElementById('status-text');
    if (!el) return;

    const nodeCount = visible.size;
    const edgeCount = [...active].filter(id => {
      const e = cy.getElementById(id);
      return e.length > 0 && e.style('display') !== 'none';
    }).length;

    let notes = [];
    if (state.removeAvon)    notes.push('Avon removed');
    if (state.removeMcnulty) notes.push('McNulty removed');

    el.textContent = `S${state.season} — ${nodeCount} nodes, ${edgeCount} active edges` +
      (notes.length ? ' — ' + notes.join(', ') : '');
  }

  function savePositions() {
    savedPositions = {};
    cy.nodes().forEach(n => {
      savedPositions[n.id()] = { ...n.position() };
    });
  }

  async function init() {
    if (initialized) return;
    initialized = true;

    const res = await fetch('data/wire-graph.json');
    graphData = await res.json();

    const nodes = graphData.nodes.map(n => ({
      data: { id: n.id, label: n.label, type: n.type },
    }));

    const edges = graphData.edges.map(e => ({
      data: {
        id:           e.id,
        source:       e.source,
        target:       e.target,
        label:        e.label,
        season_start: e.season_start,
        season_end:   e.season_end,
      },
    }));

    cy = cytoscape({
      container: document.getElementById('cy'),
      elements:  { nodes, edges },
      style:     buildStylesheet(),
      layout: {
        name:            'cose',
        animate:         false,
        randomize:       false,
        nodeRepulsion:   10000,
        idealEdgeLength: 130,
        gravity:         0.6,
        numIter:         500,
        padding:         20,
      },
      minZoom: 0.3,
      maxZoom: 2.5,
    });

    cy.on('layoutstop', () => savePositions());

    updateGraph();
    bindControls();
  }

  function bindControls() {
    document.querySelectorAll('.season-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.season-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.season = parseInt(btn.dataset.season, 10);
        updateGraph();
      });
    });

    const toggleAvon     = document.getElementById('toggle-avon');
    const toggleMcnulty  = document.getElementById('toggle-mcnulty');
    const toggleRoles    = document.getElementById('toggle-roles');
    const toggleGames    = document.getElementById('toggle-games');

    if (toggleAvon)    toggleAvon.addEventListener('change',    e => { state.removeAvon    = e.target.checked; updateGraph(); });
    if (toggleMcnulty) toggleMcnulty.addEventListener('change', e => { state.removeMcnulty = e.target.checked; updateGraph(); });
    if (toggleRoles)   toggleRoles.addEventListener('change',   e => { state.showRoles     = e.target.checked; updateGraph(); });
    if (toggleGames)   toggleGames.addEventListener('change',   e => { state.showGames     = e.target.checked; updateGraph(); });
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
  if (typeof Reveal !== 'undefined') {
    Reveal.on('slidechanged', event => {
      if (event.currentSlide && event.currentSlide.id === 'demo-slide') {
        WireGraph.init();
      }
    });
    Reveal.on('ready', event => {
      if (event.currentSlide && event.currentSlide.id === 'demo-slide') {
        WireGraph.init();
      }
    });
  }
});
