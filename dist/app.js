(() => {
  "use strict";

  const PATHS = [
    { id: "CKIhap1", label: "紀州 hap1", short: "CKI h1", group: "kishu", color: "#f0ad3d" },
    { id: "CKIhap2", label: "紀州 hap2", short: "CKI h2", group: "kishu", color: "#ffd889" },
    { id: "CUNphKi", label: "温州・紀州由来", short: "CUN Ki", group: "mikan-kishu", color: "#f4bd55" },
    { id: "CUNphKu", label: "温州・九年母由来", short: "CUN Ku", group: "mikan-kunenbo", color: "#59a9df" },
    { id: "CKUhap1", label: "九年母 hap1", short: "CKU h1", group: "kunenbo", color: "#3e94d8" },
    { id: "CKUhap2", label: "九年母 hap2", short: "CKU h2", group: "kunenbo", color: "#8ec7ee" },
  ];

  const MODES = {
    all: { label: "全6ハプロタイプ", paths: PATHS.map(p => p.id), accent: "#53bd7a" },
    kishu: { label: "紀州由来トリオ", paths: ["CKIhap1", "CKIhap2", "CUNphKi"], accent: "#f0ad3d" },
    kunenbo: { label: "九年母由来トリオ", paths: ["CUNphKu", "CKUhap1", "CKUhap2"], accent: "#3e94d8" },
  };

  const CHR_LENGTHS = [53.8, 45.2, 50.6, 34.4, 47.9, 35.7, 32.8, 28.6, 31.4];
  const CHART_LAYOUT = { left: 122, right: 22 };
  const I18N = {
    ja: {
      comparison: "比較セット", all6: "全6本", all6sub: "共通座標で比較", kishu3: "紀州 3本", kishu3sub: "CKI h1/h2 + CUNphKi", kunenbo3: "九年母 3本", kunenbo3sub: "CUNphKu + CKU h1/h2",
      chromosome: "染色体", data: "データ", upload: "別のviewer JSONをドロップまたは選択", openJson: "JSONを開く", tracks: "トラック", sv: "SV・分岐候補", inversion: "逆向き区間", uncertain: "低信頼区間",
      whole: "全体", overview: "染色体全体", kishuLineage: "紀州系統", kunenboLineage: "九年母系統", invCandidate: "逆位候補", lowConfidence: "低信頼",
      referenceShared: "参照共有ノード", offReference: "参照外配列量", graphStructureTitle: "参照外分岐の局所グラフ", graphStructureHelp: "灰色がCUN#1参照パス、上側の分岐が参照にない配列です。画面端の矢印は分岐が表示範囲外へ続くことを示します。", graphZoomHint: "2 Mb以下へ拡大すると、参照外分岐をグラフとして表示します。", graphNoBranches: "この範囲には表示対象の参照外分岐がありません。", offReferenceBp: "参照外", branchNodes: "GFAノード", branchSupport: "通るパス", shownBranches: "表示分岐", continuesOutside: "表示範囲外へ継続",
      similarityHelp: "ゼロ交差は組換え候補。GFA共有ノードの差を表示します。", allOriginTitle: "温州2 hapの親由来：紀州 ↔ 九年母", allOriginHelp: "黄=CUNphKi、青=CUNphKu。各温州hapと親4 hapの最大共有ノード類似度の差です。灰色は親間の判別力が低い区間。", kishuSimilarityHelp: "CUNphKiと紀州hap1／hap2の共有ノード類似度差。上ほどhap1、下ほどhap2に近い区間です。", kunenboSimilarityHelp: "CUNphKuと九年母hap1／hap2の共有ノード類似度差。上ほどhap1、下ほどhap2に近い区間です。", kishuAxis: "紀州", kunenboAxis: "九年母", hap1Axis: "hap1", hap2Axis: "hap2", eventsTitle: "表示範囲のイベント", eventHelp: "候補を選択すると位置を拡大します。", noEvents: "表示範囲にイベントはありません。",
      selection: "選択範囲", selectionHint: "染色体上をクリックすると、その位置のパス状態を確認できます。", graphAria: "6ハプロタイプの染色体グラフ。左右へドラッグすると表示幅を保って移動できます。", position: "位置", window: "表示幅", shownPaths: "表示パス", events: "イベント",
      recombNote: "組換えは新規配列ではなく、温州パスが親のhap1／hap2に対応する経路を切り替える現象として読みます。", pathState: "パス状態", pathHelp: "現在位置で最も近い親ハプロタイプを示します。",
      loadedBadge: "GFA投影データ", loading: "Chr1–9 GFAを読み込み中", loaded: "Chr1–9 GFAを表示中", loadToast: "Chr1–9のGFA投影データを読み込みました", pathDivergence: "経路差候補",
      support: "支持", confidence: "信頼度", crossoverCandidate: "経路切替候補",
      noComparable: "この領域には比較可能な親共有ノードがありません", nearest: "に最も近い区間（共有ノード判定）", noParent: "親候補なし", noMikan: "この表示セットには温州パスがありません。",
      kishuSimilarity: "CUNphKi：CKI hap1 ↔ hap2 類似度", kunenboSimilarity: "CUNphKu：CKU hap1 ↔ hap2 類似度", pathsWord: "paths", windowWord: "window",
      traitLoci: "表現型候補", traitLociHelp: "最初は染色体全体を表示。同じ遺伝子名で周辺へ拡大／全体へ戻ります。", traitDetails: "表現型候補の詳細", mappedFrom: "座標対応", sourcePaper: "原著論文", openLocus: "領域を開く", evidenceLimits: "注意点・未局在形質", geneInterval: "遺伝子区間", displayNeighborhood: "周辺表示", help: "Help", literatureEvidence: "文献根拠", studySystem: "対象材料", experiment: "実験根拠", relevanceHere: "この3品種での解釈", mappingBasis: "座標の根拠", sources: "原著・ソース", openGeneOverview: "染色体全体で遺伝子を表示", zoomInGene: "遺伝子周辺へ拡大", zoomOutGene: "染色体全体へ戻る"
    },
    en: {
      comparison: "Comparison set", all6: "All 6", all6sub: "Compare in shared coordinates", kishu3: "Kishu trio", kishu3sub: "CKI h1/h2 + CUNphKi", kunenbo3: "Kunenbo trio", kunenbo3sub: "CUNphKu + CKU h1/h2",
      chromosome: "Chromosome", data: "Data", upload: "Drop or choose another viewer JSON", openJson: "Open JSON", tracks: "Tracks", sv: "SV / branch candidates", inversion: "Reverse-oriented regions", uncertain: "Low-confidence regions",
      whole: "Fit", overview: "Whole chromosome", kishuLineage: "Kishu lineage", kunenboLineage: "Kunenbo lineage", invCandidate: "Inversion candidate", lowConfidence: "Low confidence",
      referenceShared: "Reference-shared nodes", offReference: "Off-reference sequence", graphStructureTitle: "Local off-reference graph", graphStructureHelp: "Gray is the CUN#1 reference path; branches above it are absent from that path. An arrow at an edge means the branch continues beyond the view.", graphZoomHint: "Zoom to 2 Mb or less to show off-reference branches as a graph.", graphNoBranches: "No retained off-reference branch occurs in this region.", offReferenceBp: "Off-reference", branchNodes: "GFA nodes", branchSupport: "Traversed by", shownBranches: "branches shown", continuesOutside: "Continues beyond the displayed window",
      similarityHelp: "Zero crossings indicate crossover candidates. Values are differences in shared GFA nodes.", allOriginTitle: "Parent origin of two Satsuma (Unshu) haplotypes: Kishu ↔ Kunenbo", allOriginHelp: "Yellow=CUNphKi; blue=CUNphKu. Each line is the difference between its best Kishu and best Kunenbo shared-node similarity. Gray marks low parental separability.", kishuSimilarityHelp: "Shared-node similarity difference between CUNphKi and Kishu hap1/hap2. Higher values favor hap1; lower values favor hap2.", kunenboSimilarityHelp: "Shared-node similarity difference between CUNphKu and Kunenbo hap1/hap2. Higher values favor hap1; lower values favor hap2.", kishuAxis: "Kishu", kunenboAxis: "Kunenbo", hap1Axis: "hap1", hap2Axis: "hap2", eventsTitle: "Events in view", eventHelp: "Select a candidate to zoom to its position.", noEvents: "No events in the current view.",
      selection: "Selection", selectionHint: "Click the chromosome view to inspect path states at that position.", graphAria: "Six-haplotype chromosome graph. Drag left or right to pan without changing the window width.", position: "Position", window: "Window", shownPaths: "Visible paths", events: "Events",
      recombNote: "A crossover is read as a switch in which parental haplotype path the Satsuma (Unshu) path follows, rather than as novel sequence.", pathState: "Path state", pathHelp: "Shows the closest parental haplotype at the current position.",
      loadedBadge: "GFA projection", loading: "Loading Chr1–9 GFA", loaded: "Showing Chr1–9 GFA", loadToast: "Loaded the Chr1–9 GFA projection", pathDivergence: "Path divergence candidate",
      support: "Support", confidence: "Confidence", crossoverCandidate: "Path-switch candidate",
      noComparable: "No comparable parent-shared nodes in this region", nearest: " is the closest region (shared-node estimate)", noParent: "No parent candidate", noMikan: "No Satsuma (Unshu) path in this comparison set.",
      kishuSimilarity: "CUNphKi: similarity to CKI hap1 ↔ hap2", kunenboSimilarity: "CUNphKu: similarity to CKU hap1 ↔ hap2", pathsWord: "paths", windowWord: "window",
      traitLoci: "Trait candidates", traitLociHelp: "First click shows the whole chromosome. Click the same gene to zoom in or back out.", traitDetails: "Trait candidate details", mappedFrom: "Coordinate mapping", sourcePaper: "Source paper", openLocus: "Open region", evidenceLimits: "Caveats and unmapped traits", geneInterval: "Gene interval", displayNeighborhood: "Displayed neighborhood", help: "Help", literatureEvidence: "Literature evidence", studySystem: "Study material", experiment: "Experimental evidence", relevanceHere: "Interpretation for these cultivars", mappingBasis: "Coordinate basis", sources: "Primary sources", openGeneOverview: "Show gene on whole chromosome", zoomInGene: "Zoom into gene neighborhood", zoomOutGene: "Return to whole chromosome"
    }
  };
  const state = {
    mode: "all",
    chromosome: "Chr1",
    start: 0,
    end: CHR_LENGTHS[0] * 1e6,
    cursor: 18.6e6,
    showVariants: true,
    showInversions: true,
    showUncertain: true,
    data: null,
    traitData: null,
    activeLocus: null,
    locusZoomed: false,
    filename: "",
    language: new URLSearchParams(location.search).get("lang") === "en" || localStorage.getItem("citrus-language") === "en" ? "en" : "ja",
  };
  let windowAnimationFrame = 0;
  let graphDrag = null;
  let suppressGraphClick = false;

  const t = key => I18N[state.language][key] || key;
  const modeLabel = mode => state.language === "ja" ? MODES[mode].label : ({all:"All 6 haplotypes",kishu:"Kishu-origin trio",kunenbo:"Kunenbo-origin trio"}[mode]);
  function pathLabel(path) {
    if (state.language === "ja") return path.label;
    return ({
      CKIhap1:"Kishu hap1", CKIhap2:"Kishu hap2",
      CUNphKi:"Satsuma (Unshu) · Kishu-origin candidate", CUNphKu:"Satsuma (Unshu) · Kunenbo-origin candidate",
      CKUhap1:"Kunenbo hap1", CKUhap2:"Kunenbo hap2"
    })[path.id] || path.label;
  }
  function pathTooltip(path) {
    const labels = state.language === "ja" ? {
      CKIhap1: ["紀州みかん hap1", "紀州みかんの第1ハプロタイプ"],
      CKIhap2: ["紀州みかん hap2", "紀州みかんの第2ハプロタイプ"],
      CUNphKi: ["温州みかん・紀州由来候補 hap", "温州みかんのうち、紀州由来と暫定判定しているハプロタイプ"],
      CUNphKu: ["温州みかん・九年母由来候補 hap", "温州みかんのうち、九年母由来と暫定判定しているハプロタイプ"],
      CKUhap1: ["九年母 hap1", "九年母の第1ハプロタイプ"],
      CKUhap2: ["九年母 hap2", "九年母の第2ハプロタイプ"],
    } : {
      CKIhap1: ["Kishu mandarin hap1", "Haplotype 1 of Kishu mandarin"],
      CKIhap2: ["Kishu mandarin hap2", "Haplotype 2 of Kishu mandarin"],
      CUNphKi: ["Satsuma (Unshu) · Kishu-origin candidate haplotype", "The Satsuma (Unshu) haplotype provisionally assigned to the Kishu-derived lineage"],
      CUNphKu: ["Satsuma (Unshu) · Kunenbo-origin candidate haplotype", "The Satsuma (Unshu) haplotype provisionally assigned to the Kunenbo-derived lineage"],
      CKUhap1: ["Kunenbo mandarin hap1", "Haplotype 1 of Kunenbo mandarin"],
      CKUhap2: ["Kunenbo mandarin hap2", "Haplotype 2 of Kunenbo mandarin"],
    };
    const [title, description] = labels[path.id] || [pathLabel(path), path.id];
    return `<strong>${title}</strong><br>${description}<br><span class="tooltip-id">${path.id}</span>`;
  }
  const eventLabel = event => state.language === "ja" ? event.label : event.type === "BUBBLE" ? t("pathDivergence") : `${event.type} candidate`;

  const fmtMb = n => `${(n / 1e6).toFixed(n >= 1e7 ? 1 : 2)} Mb`;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const seeded = n => {
    const x = Math.sin(n * 128.71 + 78.23) * 43758.5453;
    return x - Math.floor(x);
  };

  document.getElementById("app").innerHTML = `
    <div class="shell">
      <header class="topbar">
        <div class="brand">
          <div class="mark" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24"><path d="M2 13h5l3-7 4 13 3-6h5" fill="none" stroke="#f0ad3d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div><h1>Unshu Haplotype Viewer</h1><p>Satsuma (Unshu) · Kishu · Kunenbo</p></div>
        </div>
        <div class="top-actions">
          <div class="status"><span class="status-dot"></span><span id="data-status">${t("loading")}</span></div>
          <a class="help-link" href="./help.html" data-i18n="help">${t("help")}</a>
          <button class="language-toggle" id="language-toggle" aria-label="Switch language">${state.language === "ja" ? "English" : "日本語"}</button>
        </div>
      </header>

      <div class="workspace">
        <aside class="sidebar" aria-label="表示設定">
          <section class="section">
            <h2 class="section-title" data-i18n="comparison">${t("comparison")}</h2>
            <div class="mode-list">
              <button class="mode-button active" data-mode="all"><span class="mode-icon"><i></i><i></i><i></i></span><span class="mode-copy"><strong data-i18n="all6">${t("all6")}</strong><span data-i18n="all6sub">${t("all6sub")}</span></span></button>
              <button class="mode-button" data-mode="kishu"><span class="mode-icon"><i></i><i></i><i></i></span><span class="mode-copy"><strong data-i18n="kishu3">${t("kishu3")}</strong><span data-i18n="kishu3sub">${t("kishu3sub")}</span></span></button>
              <button class="mode-button" data-mode="kunenbo"><span class="mode-icon"><i></i><i></i><i></i></span><span class="mode-copy"><strong data-i18n="kunenbo3">${t("kunenbo3")}</strong><span data-i18n="kunenbo3sub">${t("kunenbo3sub")}</span></span></button>
            </div>
          </section>

          <section class="section">
            <h2 class="section-title" data-i18n="chromosome">${t("chromosome")}</h2>
            <div class="chr-grid" id="chr-grid"></div>
          </section>

          <section class="section trait-section">
            <h2 class="section-title" data-i18n="traitLoci">${t("traitLoci")}</h2>
            <p class="section-help" data-i18n="traitLociHelp">${t("traitLociHelp")}</p>
            <div class="trait-loci" id="trait-loci"></div>
            <details class="trait-unmapped" id="trait-unmapped">
              <summary data-i18n="evidenceLimits">${t("evidenceLimits")}</summary>
              <div id="trait-unmapped-list"></div>
            </details>
          </section>

          <section class="section">
            <h2 class="section-title" data-i18n="data">${t("data")}</h2>
            <label class="upload" id="drop-zone">
              <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v5h14v-5" fill="none" stroke="#9ab1af" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <p data-i18n="upload">${t("upload")}</p>
              <span class="button primary" data-i18n="openJson">${t("openJson")}</span>
              <input id="file-input" type="file" accept=".json,application/json" />
            </label>
          </section>

          <section class="section">
            <h2 class="section-title" data-i18n="tracks">${t("tracks")}</h2>
            <div class="filters">
              <label class="check"><input type="checkbox" id="toggle-variants" checked /> <span data-i18n="sv">${t("sv")}</span></label>
              <label class="check"><input type="checkbox" id="toggle-inversions" checked /> <span data-i18n="inversion">${t("inversion")}</span></label>
              <label class="check"><input type="checkbox" id="toggle-uncertain" checked /> <span data-i18n="uncertain">${t("uncertain")}</span></label>
            </div>
          </section>
        </aside>

        <main class="main">
          <div class="viewer-head">
            <div><h2 id="view-title">Chr1 · 全6ハプロタイプ</h2><p id="view-subtitle">0.0–53.8 Mb · 6 paths</p></div>
            <div class="head-actions">
              <button class="button icon" id="pan-left" aria-label="左へ移動">‹</button>
              <button class="button icon" id="zoom-out" aria-label="縮小">−</button>
              <button class="button icon" id="zoom-in" aria-label="拡大">＋</button>
              <button class="button icon" id="pan-right" aria-label="右へ移動">›</button>
              <button class="button" id="reset-view" data-i18n="whole">${t("whole")}</button>
              <input class="coordinate" id="coordinate" aria-label="表示座標" value="Chr1:0-53,800,000" />
            </div>
          </div>

          <section class="card chart-card" aria-label="パンゲノム染色体表示">
            <div class="chart-toolbar">
              <div class="chart-toolbar-left"><span class="badge mock"><span class="mini-dot"></span><span data-i18n="loadedBadge">${t("loadedBadge")}</span></span><span class="badge" id="mode-badge">6 paths</span></div>
              <span class="badge" id="window-badge">53.8 Mb window</span>
            </div>
            <div class="graph-wrap" id="graph-wrap"><svg id="graph" role="img" aria-label="6ハプロタイプの染色体グラフ"></svg><div class="tooltip" id="tooltip"></div></div>
            <div class="overview">
              <div class="overview-labels"><span data-i18n="overview">${t("overview")}</span><span id="overview-length">—</span></div>
              <div class="overview-row"><span data-i18n="referenceShared">${t("referenceShared")}</span><div class="overview-track" id="overview-track"><div class="overview-bars" id="overview-bars"></div><div class="overview-window" id="overview-window"></div></div></div>
              <div class="overview-row"><span data-i18n="offReference">${t("offReference")}</span><div class="overview-track branch-overview-track" id="branch-overview-track"><div class="overview-bars" id="branch-overview-bars"></div><div class="overview-window" id="branch-overview-window"></div></div></div>
            </div>
            <div class="legend">
              <span class="legend-item"><i class="swatch kishu"></i><span data-i18n="kishuLineage">${t("kishuLineage")}</span></span>
              <span class="legend-item"><i class="swatch kunenbo"></i><span data-i18n="kunenboLineage">${t("kunenboLineage")}</span></span>
              <span class="legend-item"><i class="swatch inversion"></i><span data-i18n="invCandidate">${t("invCandidate")}</span></span>
              <span class="legend-item"><i class="swatch uncertain"></i><span data-i18n="lowConfidence">${t("lowConfidence")}</span></span>
            </div>
          </section>

          <div class="lower-grid">
            <section class="card small-card local-graph-card">
              <div class="local-graph-copy"><h3 data-i18n="graphStructureTitle">${t("graphStructureTitle")}</h3>
              <div class="sub" id="local-graph-help">${t("graphStructureHelp")}</div></div>
              <div class="local-graph-wrap" id="local-graph-wrap"><svg class="local-graph-svg" id="local-graph" role="img" aria-label="参照外分岐の局所グラフ"></svg><div class="tooltip" id="branch-tooltip"></div></div>
            </section>
            <section class="card small-card similarity-card">
              <div class="similarity-copy"><h3 id="similarity-title">親ハプロタイプへの局所類似度</h3>
              <div class="sub" id="similarity-help">${t("allOriginHelp")}</div></div>
              <svg class="similarity-svg" id="similarity" role="img" aria-label="局所類似度の推移"></svg>
            </section>
            <section class="card small-card">
              <h3 data-i18n="eventsTitle">${t("eventsTitle")}</h3>
              <div class="sub" id="events-sub" data-i18n="eventHelp">${t("eventHelp")}</div>
              <div class="events" id="events"></div>
            </section>
          </div>
        </main>

        <aside class="inspector" aria-label="選択範囲の詳細">
          <div>
            <h2 data-i18n="selection">${t("selection")}</h2>
            <p class="hint" id="selection-hint" data-i18n="selectionHint">${t("selectionHint")}</p>
            <div class="metric-list">
              <div class="metric"><span data-i18n="position">${t("position")}</span><strong id="metric-position">—</strong></div>
              <div class="metric"><span data-i18n="window">${t("window")}</span><strong id="metric-window">—</strong></div>
              <div class="metric"><span data-i18n="shownPaths">${t("shownPaths")}</span><strong id="metric-paths">6</strong></div>
              <div class="metric"><span data-i18n="events">${t("events")}</span><strong id="metric-events">0</strong></div>
            </div>
            <div class="note" data-i18n="recombNote">${t("recombNote")}</div>
            <div class="locus-details" id="locus-details"></div>
          </div>
          <div class="path-summary">
            <h2 data-i18n="pathState">${t("pathState")}</h2>
            <p class="hint" data-i18n="pathHelp">${t("pathHelp")}</p>
            <div id="path-cards"></div>
          </div>
        </aside>
      </div>
    </div>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
  `;

  const els = Object.fromEntries([
    "chr-grid", "view-title", "view-subtitle", "graph", "graph-wrap", "tooltip", "overview-bars", "overview-window",
    "overview-track", "branch-overview-track", "branch-overview-bars", "branch-overview-window", "overview-length", "mode-badge", "window-badge", "coordinate", "similarity", "similarity-title", "similarity-help",
    "local-graph", "local-graph-wrap", "local-graph-help", "branch-tooltip",
    "events", "events-sub", "selection-hint", "metric-position", "metric-window", "metric-paths", "metric-events",
    "path-cards", "file-input", "drop-zone", "data-status", "toast", "trait-loci", "trait-unmapped-list", "locus-details"
  ].map(id => [id, document.getElementById(id)]));

  function getChr() { return state.data.chromosomes.find(c => c.id === state.chromosome) || state.data.chromosomes[0]; }
  function getPaths() {
    const allowed = new Set(MODES[state.mode].paths);
    return state.data.paths.filter(p => allowed.has(p.id));
  }

  function initChrButtons() {
    els["chr-grid"].innerHTML = state.data.chromosomes.map(c => `<button class="chr-button ${c.id === state.chromosome ? "active" : ""}" data-chr="${c.id}">${c.id.replace("Chr", "")}</button>`).join("");
    els["chr-grid"].querySelectorAll("button").forEach(b => b.addEventListener("click", () => selectChromosome(b.dataset.chr)));
  }

  function selectChromosome(id) {
    const chr = state.data.chromosomes.find(c => c.id === id);
    if (!chr) return;
    state.activeLocus = null;
    state.locusZoomed = false;
    state.chromosome = id;
    state.start = Number.isFinite(chr.viewStart) ? chr.viewStart : 0;
    state.end = Number.isFinite(chr.viewEnd) ? chr.viewEnd : chr.length;
    state.cursor = state.start + (state.end - state.start) * .35;
    render();
  }

  function setMode(mode) {
    if (!MODES[mode]) return;
    state.mode = mode;
    document.querySelectorAll(".mode-button").forEach(b => b.classList.toggle("active", b.dataset.mode === mode));
    render();
  }

  function setWindow(start, end) {
    if (windowAnimationFrame) cancelAnimationFrame(windowAnimationFrame);
    windowAnimationFrame = 0;
    const chr = getChr();
    const minWidth = Math.min(20000, chr.length);
    let width = clamp(end - start, minWidth, chr.length);
    let s = clamp(start, 0, chr.length - width);
    state.start = s; state.end = s + width; state.cursor = clamp(state.cursor, state.start, state.end);
    const active = state.traitData?.loci?.find(item => item.id === state.activeLocus && item.chromosome === chr.id);
    if (active) state.locusZoomed = width <= active.window * 1.35;
    render();
  }

  function animateWindow(start, end, zoomed) {
    if (windowAnimationFrame) cancelAnimationFrame(windowAnimationFrame);
    const chr = getChr();
    const minWidth = Math.min(20000, chr.length);
    const targetWidth = clamp(end - start, minWidth, chr.length);
    const targetStart = clamp(start, 0, chr.length - targetWidth);
    const targetEnd = targetStart + targetWidth;
    const fromStart = state.start;
    const fromEnd = state.end;
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 560;
    state.locusZoomed = zoomed;
    renderTraitLoci();
    if (!duration) {
      state.start = targetStart; state.end = targetEnd;
      state.cursor = clamp(state.cursor, state.start, state.end);
      render();
      return;
    }
    const started = performance.now();
    const frame = now => {
      const rawProgress = clamp((now - started) / duration, 0, 1);
      const progress = rawProgress >= .985 ? 1 : rawProgress;
      const eased = 1 - Math.pow(1 - progress, 3);
      state.start = fromStart + (targetStart - fromStart) * eased;
      state.end = fromEnd + (targetEnd - fromEnd) * eased;
      state.cursor = clamp(state.cursor, state.start, state.end);
      renderHeader(); renderGraph(); renderOverview(); renderLocalGraph(); renderSimilarity(); renderInspector();
      if (progress < 1) windowAnimationFrame = requestAnimationFrame(frame);
      else { windowAnimationFrame = 0; render(); }
    };
    windowAnimationFrame = requestAnimationFrame(frame);
  }

  function toggleTraitLocus(id) {
    const locus = state.traitData?.loci?.find(item => item.id === id);
    if (!locus || !state.data) return;
    const chr = state.data.chromosomes.find(c => c.id === locus.chromosome);
    if (!chr) return;
    const center = (locus.start + locus.end) / 2;
    if (state.activeLocus !== id || state.chromosome !== locus.chromosome) {
      if (windowAnimationFrame) cancelAnimationFrame(windowAnimationFrame);
      windowAnimationFrame = 0;
      state.activeLocus = id;
      state.locusZoomed = false;
      state.chromosome = locus.chromosome;
      state.start = 0;
      state.end = chr.length;
      state.cursor = center;
      render();
      return;
    }
    state.cursor = center;
    if (state.locusZoomed) animateWindow(0, chr.length, false);
    else animateWindow(center - locus.window / 2, center + locus.window / 2, true);
  }

  function renderTraitLoci() {
    if (!state.traitData) return;
    const lang = state.language;
    const groups = [];
    state.traitData.loci.forEach(locus => {
      const name = locus.trait[lang];
      let group = groups.find(item => item.name === name);
      if (!group) { group = { name, loci: [] }; groups.push(group); }
      group.loci.push(locus);
    });
    els["trait-loci"].innerHTML = groups.map(group => `
      <section class="trait-group">
        <h3>${group.name}<span>${group.loci.length}</span></h3>
        ${group.loci.map(locus => {
          const active = state.activeLocus === locus.id;
          const action = active ? (state.locusZoomed ? t("zoomOutGene") : t("zoomInGene")) : t("openGeneOverview");
          return `
          <button class="trait-locus ${active ? "active" : ""}" data-locus="${locus.id}" aria-label="${locus.symbol}：${action}" title="${action}">
            <i style="background:${locus.color}"></i>
            <span><strong>${locus.symbol}</strong><small>${locus.evidenceLabel[lang]}</small></span>
            <b class="zoom-glyph">${active ? (state.locusZoomed ? "−" : "+") : "›"}</b>
          </button>`}).join("")}
      </section>`).join("");
    els["trait-loci"].querySelectorAll("button").forEach(button => button.addEventListener("click", () => toggleTraitLocus(button.dataset.locus)));
    els["trait-unmapped-list"].innerHTML = state.traitData.unmappedTraits.map(item => `<p><strong>${item.trait[lang]}</strong>${item.note[lang]}</p>`).join("");
  }

  function zoom(factor) {
    const center = (state.start + state.end) / 2;
    const width = (state.end - state.start) * factor;
    setWindow(center - width / 2, center + width / 2);
  }

  function pan(fraction) {
    const width = state.end - state.start;
    setWindow(state.start + width * fraction, state.end + width * fraction);
  }

  function parseCoordinate(value) {
    const clean = value.replace(/,/g, "").trim();
    const match = clean.match(/^(Chr\w+):([0-9.]+)([kKmM]?)\s*-\s*([0-9.]+)([kKmM]?)$/);
    if (!match) throw new Error("Chr1:0-53800000 の形式で入力してください");
    const scale = s => /m/i.test(s) ? 1e6 : /k/i.test(s) ? 1e3 : 1;
    return { chr: match[1], start: Number(match[2]) * scale(match[3]), end: Number(match[4]) * scale(match[5]) };
  }

  function tickStep(span) {
    const raw = span / 6;
    const p = 10 ** Math.floor(Math.log10(raw));
    const n = raw / p;
    return (n < 2 ? 1 : n < 5 ? 2 : 5) * p;
  }

  function svgEl(tag, attrs = {}) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  }

  function localParent(pathId, chr, pos) {
    if (pathId === "CUNphKi") {
      let index = 0; chr.switchesKi.forEach(f => { if (pos / chr.length >= f) index++; });
      return index % 2 === 0 ? "CKIhap1" : "CKIhap2";
    }
    if (pathId === "CUNphKu") {
      let index = 0; chr.switchesKu.forEach(f => { if (pos / chr.length >= f) index++; });
      return index % 2 === 0 ? "CKUhap2" : "CKUhap1";
    }
    return null;
  }

  function drawPathTrack(svg, path, pathIndex, chr, y, x, visibleStart, visibleEnd) {
    const track = chr.tracks?.[path.id];
    if (!Array.isArray(track) || !track.length) return false;
    const coverageValues = track.map(s => Number(s.coverage) || 0).filter(v => v > 0);
    const coverageScale = coverageValues.length ? Math.max(...coverageValues) : 1;
    track.filter(s => s.end >= visibleStart && s.start <= visibleEnd).forEach(segment => {
      const start = Math.max(segment.start, visibleStart);
      const end = Math.min(segment.end, visibleEnd);
      const coverage = Number(segment.coverage) || 0;
      if (end <= start || coverage <= 0) return;
      const opacity = clamp(.3 + .7 * Math.sqrt(coverage / coverageScale), .3, 1);
      const width = path.id.startsWith("CUN") ? 8 : 6;
      svg.append(svgEl("line", {
        x1: x(start), y1: y, x2: x(end) + .5, y2: y,
        stroke: path.color, "stroke-width": width, opacity,
        "stroke-linecap": "butt"
      }));
      if (state.showInversions && Number(segment.inversion) > .15) {
        svg.append(svgEl("line", {
          x1: x(start), y1: y + 7, x2: x(end), y2: y + 7,
          stroke: "#f36a6a", "stroke-width": 2,
          opacity: clamp(Number(segment.inversion), .35, 1)
        }));
      }
    });
    return true;
  }

  function renderGraph() {
    const svg = els.graph;
    const chr = getChr(); const paths = getPaths();
    const rect = svg.getBoundingClientRect();
    const W = Math.max(720, rect.width || 900), H = 405;
    const { left, right } = CHART_LAYOUT;
    const top = 52, bottom = 35;
    const plotW = W - left - right;
    const laneGap = paths.length <= 3 ? 78 : 48;
    const laneStart = paths.length <= 3 ? 100 : 83;
    svg.setAttribute("aria-label", t("graphAria"));
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.innerHTML = "";
    const x = pos => left + (pos - state.start) / (state.end - state.start) * plotW;

    const bg = svgEl("rect", { x: left, y: top, width: plotW, height: H - top - bottom, rx: 8, fill: "#071416" }); svg.append(bg);
    const step = tickStep(state.end - state.start);
    const first = Math.ceil(state.start / step) * step;
    for (let t = first; t <= state.end; t += step) {
      const tx = x(t);
      svg.append(svgEl("line", { x1: tx, y1: top, x2: tx, y2: H - bottom, stroke: "#1b3033", "stroke-width": 1 }));
      const label = svgEl("text", { x: tx, y: 27, fill: "#8ba2a1", "font-size": 11, "text-anchor": "middle" });
      label.textContent = t >= 1e6 ? `${(t / 1e6).toFixed(step < 1e6 ? 1 : 0)} Mb` : `${Math.round(t / 1e3)} kb`; svg.append(label);
    }

    paths.forEach((path, pi) => {
      const y = laneStart + pi * laneGap;
      const label = svgEl("text", { x: left - 12, y: y + 4, fill: path.color, "font-size": 12, "font-weight": path.id.startsWith("CUN") ? 700 : 550, "text-anchor": "end", class: "path-label", "data-path": path.id, tabindex: 0 });
      label.textContent = path.short; svg.append(label);
      svg.append(svgEl("line", { x1: left, y1: y, x2: W - right, y2: y, stroke: "#405456", "stroke-width": 7, "stroke-linecap": "round", opacity: .65 }));

      const usedLoadedTrack = drawPathTrack(svg, path, pi, chr, y, x, state.start, state.end);
      if (!usedLoadedTrack) {
        const bins = 90;
        for (let i = 0; i < bins; i++) {
          const bs = state.start + (state.end - state.start) * i / bins;
          const be = state.start + (state.end - state.start) * (i + 1) / bins;
          const mid = (bs + be) / 2;
          const dev = seeded((parseInt(chr.id.replace("Chr", "")) * 1000) + pi * 101 + Math.floor(mid / 400000));
          const opacity = .42 + dev * .35;
          svg.append(svgEl("line", { x1: x(bs), y1: y, x2: x(be) + .5, y2: y, stroke: path.color, "stroke-width": path.id.startsWith("CUN") ? 8 : 6, opacity, "stroke-linecap": "butt" }));
        }
      }

      const switches = path.id === "CUNphKi" ? chr.switchesKi : path.id === "CUNphKu" ? chr.switchesKu : [];
      switches.forEach((f, si) => {
        const pos = chr.length * f;
        if (pos < state.start || pos > state.end) return;
        const sx = x(pos);
        svg.append(svgEl("line", { x1: sx, y1: y - 13, x2: sx, y2: y + 13, stroke: "#f5d56b", "stroke-width": 2, "stroke-dasharray": "3 3" }));
        const dot = svgEl("circle", { cx: sx, cy: y, r: 5, fill: "#f5d56b", stroke: "#071416", "stroke-width": 2, class: "switch-mark", "data-pos": pos, "data-path": path.id });
        svg.append(dot);
      });
    });

    const visibleEvents = chr.variants.filter(v => v.end >= state.start && v.start <= state.end).filter(v => {
      if (v.type === "INV" && !state.showInversions) return false;
      if (v.type === "UNCERTAIN" && !state.showUncertain) return false;
      return state.showVariants;
    });
    visibleEvents.forEach(v => {
      const vx = x((v.start + v.end) / 2);
      const color = v.type === "INV" ? "#f36a6a" : v.type === "UNCERTAIN" ? "#849496" : "#d9c36b";
      const marker = svgEl(v.type === "INV" ? "rect" : "circle", v.type === "INV"
        ? { x: vx - 4, y: 38, width: 8, height: H - 68, fill: color, opacity: .32, rx: 2, class: "event-mark", "data-event": v.id }
        : { cx: vx, cy: 42, r: v.type === "BUBBLE" ? 6 : 4, fill: color, stroke: "#071416", "stroke-width": 2, class: "event-mark", "data-event": v.id });
      svg.append(marker);
    });

    const activeLocus = state.traitData?.loci?.find(item => item.id === state.activeLocus && item.chromosome === chr.id);
    if (activeLocus && activeLocus.end >= state.start && activeLocus.start <= state.end) {
      const exactStart = x(Math.max(activeLocus.start, state.start));
      const exactEnd = x(Math.min(activeLocus.end, state.end));
      const exactWidth = Math.max(1.5, exactEnd - exactStart);
      const lx = (exactStart + exactEnd) / 2;
      const visibleWidth = Math.max(8, exactWidth);
      const visibleX = lx - visibleWidth / 2;
      const marker = svgEl("g", { class: "locus-marker", "data-locus": activeLocus.id });
      marker.append(svgEl("rect", { x: visibleX, y: top - 3, width: visibleWidth, height: H - top - bottom + 3, fill: activeLocus.color, opacity: .16, rx: 2 }));
      marker.append(svgEl("rect", { x: exactStart, y: top - 3, width: exactWidth, height: H - top - bottom + 3, fill: activeLocus.color, opacity: .82, rx: 1 }));
      marker.append(svgEl("line", { x1: exactStart, y1: top - 8, x2: exactEnd, y2: top - 8, stroke: activeLocus.color, "stroke-width": 3, "stroke-linecap": "round" }));
      const text = svgEl("text", { x: clamp(lx + 9, left + 4, W - right - 95), y: top - 2, fill: activeLocus.color, "font-size": 11, "font-weight": 750 });
      text.textContent = activeLocus.symbol; marker.append(text); svg.append(marker);
    }

    const cx = x(state.cursor);
    svg.append(svgEl("line", { x1: cx, y1: top - 8, x2: cx, y2: H - bottom, stroke: "#edf4f2", "stroke-width": 1, opacity: .55, "stroke-dasharray": "2 5", class: "cursor-line" }));

    svg.querySelectorAll(".event-mark").forEach(el => {
      el.style.cursor = "pointer";
      el.addEventListener("mouseenter", e => {
        const v = chr.variants.find(x => x.id === el.dataset.event); showTooltip(e, `<strong>${eventLabel(v)}</strong><br>${fmtMb(v.start)}–${fmtMb(v.end)}<br>${t("support")} ${v.support.length} paths · ${t("confidence")} ${v.confidence}%`);
      });
      el.addEventListener("mouseleave", hideTooltip);
      el.addEventListener("click", e => { e.stopPropagation(); focusEvent(el.dataset.event); });
    });
    svg.querySelectorAll(".switch-mark").forEach(el => {
      el.style.cursor = "pointer";
      el.addEventListener("mouseenter", e => showTooltip(e, `<strong>${t("crossoverCandidate")}</strong><br>${el.dataset.path}<br>${fmtMb(Number(el.dataset.pos))}`));
      el.addEventListener("mouseleave", hideTooltip);
      el.addEventListener("click", e => { e.stopPropagation(); state.cursor = Number(el.dataset.pos); render(); });
    });
    svg.querySelectorAll(".path-label").forEach(el => {
      const path = PATHS.find(item => item.id === el.dataset.path);
      if (!path) return;
      el.addEventListener("mouseenter", e => showTooltip(e, pathTooltip(path)));
      el.addEventListener("mousemove", e => showTooltip(e, pathTooltip(path)));
      el.addEventListener("mouseleave", hideTooltip);
      el.addEventListener("focus", () => {
        const labelRect = el.getBoundingClientRect();
        showTooltip({ clientX: labelRect.right, clientY: labelRect.bottom }, pathTooltip(path));
      });
      el.addEventListener("blur", hideTooltip);
    });
    svg.querySelectorAll(".locus-marker").forEach(el => {
      el.style.cursor = "pointer";
      el.addEventListener("mouseenter", e => {
        const locus = state.traitData.loci.find(item => item.id === el.dataset.locus);
        showTooltip(e, `<strong>${locus.trait[state.language]} · ${locus.symbol}</strong><br>${locus.title[state.language]}<br>${locus.chromosome}:${Math.round(locus.start).toLocaleString("en-US")}–${Math.round(locus.end).toLocaleString("en-US")}<br>${locus.evidenceLabel[state.language]}`);
      });
      el.addEventListener("mouseleave", hideTooltip);
    });
    svg.onclick = e => {
      if (suppressGraphClick) {
        suppressGraphClick = false;
        return;
      }
      const r = svg.getBoundingClientRect();
      const sx = (e.clientX - r.left) * W / r.width;
      if (sx < left || sx > W - right) return;
      state.cursor = state.start + (sx - left) / plotW * (state.end - state.start); render();
    };
  }

  function showTooltip(event, html) {
    const wrap = els["graph-wrap"].getBoundingClientRect();
    els.tooltip.innerHTML = html; els.tooltip.style.display = "block";
    els.tooltip.style.left = `${clamp(event.clientX - wrap.left + 10, 8, wrap.width - 240)}px`;
    els.tooltip.style.top = `${clamp(event.clientY - wrap.top + 10, 8, wrap.height - 90)}px`;
  }
  function hideTooltip() { els.tooltip.style.display = "none"; }

  function showBranchTooltip(event, html) {
    const wrap = els["local-graph-wrap"].getBoundingClientRect();
    const tooltip = els["branch-tooltip"];
    tooltip.innerHTML = html; tooltip.style.display = "block";
    tooltip.style.left = `${clamp(event.clientX - wrap.left + 10, 8, wrap.width - 250)}px`;
    tooltip.style.top = `${clamp(event.clientY - wrap.top + 10, 8, wrap.height - 88)}px`;
  }
  function hideBranchTooltip() { els["branch-tooltip"].style.display = "none"; }

  function renderLocalGraph() {
    const svg = els["local-graph"];
    const chr = getChr();
    const visiblePaths = new Set(getPaths().map(path => path.id));
    const branches = (chr.graphBranches || []).filter(branch =>
      branch.end >= state.start && branch.start <= state.end &&
      (branch.support || []).some(path => visiblePaths.has(path))
    );
    const W = Math.max(720, svg.getBoundingClientRect().width || 900), H = 188;
    const l = CHART_LAYOUT.left, r = CHART_LAYOUT.right, top = 12, bottom = 27;
    const pw = W - l - r;
    const x = position => l + (position - state.start) / (state.end - state.start) * pw;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.innerHTML = "";

    const step = tickStep(state.end - state.start);
    const first = Math.ceil(state.start / step) * step;
    for (let position = first; position <= state.end; position += step) {
      const xx = x(position);
      svg.append(svgEl("line", {x1:xx,y1:top,x2:xx,y2:H-bottom,stroke:"#1b3033","stroke-width":1}));
      const label = svgEl("text", {x:xx,y:H-7,fill:"#8ba2a1","font-size":9,"text-anchor":"middle"});
      label.textContent = position >= 1e6 ? `${(position / 1e6).toFixed(step < 1e6 ? 1 : 0)} Mb` : `${Math.round(position / 1e3)} kb`;
      svg.append(label);
    }

    const referenceY = 142;
    const refLabel = svgEl("text", {x:l-12,y:referenceY+4,fill:"#a8b8b7","font-size":10,"text-anchor":"end"});
    refLabel.textContent = "CUN#1 ref"; svg.append(refLabel);
    svg.append(svgEl("line", {x1:l,y1:referenceY,x2:W-r,y2:referenceY,stroke:"#778789","stroke-width":7,"stroke-linecap":"round",opacity:.8}));

    const wide = state.end - state.start > 2e6;
    if (wide) {
      const bins = (chr.offReferenceBins || []).filter(bin => bin.end >= state.start && bin.start <= state.end);
      const values = bins.map(bin => [...visiblePaths].reduce((sum, path) => sum + Number(bin.bpByPath?.[path] || 0), 0));
      const max = Math.max(1, ...values);
      bins.forEach((bin, index) => {
        const bp = values[index]; if (!bp) return;
        const start = Math.max(bin.start, state.start), end = Math.min(bin.end, state.end);
        const height = 12 + Math.log1p(bp) / Math.log1p(max) * 68;
        svg.append(svgEl("rect", {x:x(start),y:referenceY-height,width:Math.max(1,x(end)-x(start)),height,fill:MODES[state.mode].accent,opacity:.48}));
      });
      const hint = svgEl("text", {x:l+pw/2,y:34,fill:"#b5c5c3","font-size":11,"text-anchor":"middle"});
      hint.textContent = t("graphZoomHint"); svg.append(hint);
      els["local-graph-help"].textContent = t("graphStructureHelp");
    } else {
      const selected = [...branches].sort((a,b) => b.offReferenceBp - a.offReferenceBp).slice(0,24).sort((a,b) => a.start - b.start);
      const colors = {kishu:"#f0ad3d",kunenbo:"#3e94d8",shared:"#a8b8b7"};
      selected.forEach((branch, index) => {
        const outsideLeft = branch.start < state.start;
        const outsideRight = branch.end > state.end;
        const anchorX1 = x(clamp(branch.start, state.start, state.end));
        const anchorX2 = x(clamp(branch.end, state.start, state.end));
        const laneY = 26 + (index % 5) * 20;
        const color = colors[branch.lineage] || colors.shared;
        const nodeWidth = clamp(8 + Math.log10(Math.max(1,branch.offReferenceBp)) * 6, 16, 55);
        const midX = clamp((anchorX1 + anchorX2) / 2, l + nodeWidth / 2 + 9, W - r - nodeWidth / 2 - 9);
        const blockLeft = midX - nodeWidth / 2, blockRight = midX + nodeWidth / 2;
        const leftPath = outsideLeft
          ? `M ${l} ${laneY} L ${blockLeft} ${laneY}`
          : `M ${anchorX1} ${referenceY} C ${anchorX1} ${laneY}, ${Math.min(anchorX1,blockLeft)} ${laneY}, ${blockLeft} ${laneY}`;
        const rightPath = outsideRight
          ? `L ${W-r} ${laneY}`
          : `C ${Math.max(anchorX2,blockRight)} ${laneY}, ${anchorX2} ${laneY}, ${anchorX2} ${referenceY}`;
        const path = svgEl("path", {d:`${leftPath} L ${blockRight} ${laneY} ${rightPath}`,fill:"none",stroke:color,"stroke-width":2.2,opacity:.9,class:"branch-mark","data-branch":branch.id});
        svg.append(path);
        svg.append(svgEl("rect", {x:blockLeft,y:laneY-5,width:nodeWidth,height:10,rx:4,fill:color,stroke:"#071416","stroke-width":1,class:"branch-mark","data-branch":branch.id}));
        if (outsideLeft) svg.append(svgEl("path", {d:`M ${l+7} ${laneY-5} L ${l} ${laneY} L ${l+7} ${laneY+5}`,fill:"none",stroke:color,"stroke-width":2.2,class:"branch-mark","data-branch":branch.id}));
        if (outsideRight) svg.append(svgEl("path", {d:`M ${W-r-7} ${laneY-5} L ${W-r} ${laneY} L ${W-r-7} ${laneY+5}`,fill:"none",stroke:color,"stroke-width":2.2,class:"branch-mark","data-branch":branch.id}));
        if (branch.offReferenceBp >= 1000 && nodeWidth >= 34) {
          const label = svgEl("text", {x:midX,y:laneY-9,fill:color,"font-size":8,"text-anchor":"middle","pointer-events":"none"});
          label.textContent = branch.offReferenceBp >= 1e6 ? `${(branch.offReferenceBp/1e6).toFixed(1)} Mb` : `${Math.round(branch.offReferenceBp/1e3)} kb`;
          svg.append(label);
        }
      });
      if (!selected.length) {
        const empty = svgEl("text", {x:l+pw/2,y:72,fill:"#79908f","font-size":11,"text-anchor":"middle"});
        empty.textContent = t("graphNoBranches"); svg.append(empty);
      }
      const omitted = Math.max(0, branches.length - selected.length);
      els["local-graph-help"].textContent = `${t("graphStructureHelp")} ${selected.length}${omitted ? ` / ${branches.length}` : ""} ${t("shownBranches")}.`;
    }

    const cursorX = x(state.cursor);
    svg.append(svgEl("line", {x1:cursorX,y1:top,x2:cursorX,y2:H-bottom,stroke:"#edf4f2","stroke-width":1,opacity:.55,"stroke-dasharray":"2 5"}));
    svg.querySelectorAll(".branch-mark").forEach(element => {
      const branch = branches.find(item => item.id === element.dataset.branch);
      if (!branch) return;
      element.style.cursor = "pointer";
      const outsideNote = branch.start < state.start || branch.end > state.end ? `<br>↔ ${t("continuesOutside")}` : "";
      const tooltip = event => showBranchTooltip(event, `<strong>${fmtMb(branch.start)}–${fmtMb(branch.end)}</strong><br>${t("offReferenceBp")}: ${Number(branch.offReferenceBp).toLocaleString("en-US")} bp · ${branch.nodeCount.toLocaleString("en-US")} ${t("branchNodes")}<br>${t("branchSupport")}: ${(branch.support || []).join(", ")}${outsideNote}`);
      element.addEventListener("mouseenter", tooltip);
      element.addEventListener("mousemove", tooltip);
      element.addEventListener("mouseleave", hideBranchTooltip);
      element.addEventListener("click", () => {
        const center = (branch.start + branch.end) / 2;
        const width = Math.max(100000, Math.abs(branch.end - branch.start) * 2.5, branch.offReferenceBp * 2.5);
        state.cursor = center; setWindow(center-width/2, center+width/2);
      });
    });
  }

  function renderSimilarity() {
    const svg = els.similarity; const chr = getChr();
    const W = Math.max(720, svg.getBoundingClientRect().width || 900), H = 132;
    const allMode = state.mode === "all";
    const l = CHART_LAYOUT.left, r = CHART_LAYOUT.right, top = 8, b = 28;
    const pw = W - l - r, ph = H - top - b;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.innerHTML = "";
    const uncertaintyLayer = svgEl("g", {"data-layer": "uncertainty"});
    const guideLayer = svgEl("g", {"data-layer": "guides"});
    const kishuCandidateLayer = svgEl("g", {"data-layer": "CUNphKi"});
    const kunenboCandidateLayer = svgEl("g", {"data-layer": "CUNphKu"});
    const annotationLayer = svgEl("g", {"data-layer": "annotations"});
    svg.append(uncertaintyLayer, guideLayer, kishuCandidateLayer, kunenboCandidateLayer, annotationLayer);

    const step = tickStep(state.end - state.start);
    const first = Math.ceil(state.start / step) * step;
    for (let position = first; position <= state.end; position += step) {
      const xx = l + (position - state.start) / (state.end - state.start) * pw;
      guideLayer.append(svgEl("line", {x1: xx, y1: top, x2: xx, y2: H - b, stroke: "#1b3033", "stroke-width": 1}));
      const label = svgEl("text", {x: xx, y: H - 7, fill: "#8ba2a1", "font-size": 9, "text-anchor": "middle"});
      label.textContent = position >= 1e6 ? `${(position / 1e6).toFixed(step < 1e6 ? 1 : 0)} Mb` : `${Math.round(position / 1e3)} kb`;
      annotationLayer.append(label);
    }

    if (allMode && state.showUncertain) {
      const basis = chr.parentOrigin?.CUNphKi || chr.parentOrigin?.CUNphKu || [];
      const step = basis.length > 1 ? Math.abs(basis[1].position - basis[0].position) : 50000;
      basis.filter(item => item.position + step / 2 >= state.start && item.position - step / 2 <= state.end)
        .filter(item => !item.comparable || Number(item.parentSeparability) < .08)
        .forEach(item => {
          const start = Math.max(state.start, item.position - step / 2);
          const end = Math.min(state.end, item.position + step / 2);
          const x = l + (start - state.start) / (state.end - state.start) * pw;
          const width = Math.max(.6, (end - start) / (state.end - state.start) * pw);
          uncertaintyLayer.append(svgEl("rect", {x, y: top, width, height: ph, fill: "#7f8f92", opacity: .18}));
        });
    }
    guideLayer.append(svgEl("line", { x1: l, y1: top + ph/2, x2: W-r, y2: top+ph/2, stroke: "#5a7072", "stroke-dasharray": "3 4" }));

    function drawSeries(scores, color, layer, width = 2.5) {
      let segment = [];
      let count = 0;
      const flush = () => {
        if (segment.length > 1) {
          layer.append(svgEl("polyline", { points: segment.join(" "), fill: "none", stroke: color, "stroke-width": width, "stroke-linejoin": "round" }));
          count += segment.length;
        }
        segment = [];
      };
      (Array.isArray(scores) ? scores : []).forEach(item => {
        if (item.position < state.start || item.position > state.end || item.comparable === false) { flush(); return; }
        const xx = l + (item.position - state.start) / (state.end - state.start) * pw;
        const yy = top + ph * (1 - (clamp(Number(item.score), -1, 1) + 1) / 2);
        segment.push(`${xx},${yy}`);
      });
      flush();
      return count;
    }

    let pointCount = 0;
    let switches = [];
    if (allMode) {
      pointCount += drawSeries(chr.parentOrigin?.CUNphKi, "#f4bd55", kishuCandidateLayer, 2.4);
      pointCount += drawSeries(chr.parentOrigin?.CUNphKu, "#59a9df", kunenboCandidateLayer, 2.4);
      els["similarity-title"].textContent = t("allOriginTitle");
      els["similarity-help"].textContent = t("allOriginHelp");
    } else {
      const mode = state.mode === "kunenbo" ? "ku" : "ki";
      const color = mode === "ki" ? "#f0ad3d" : "#3e94d8";
      switches = mode === "ki" ? chr.switchesKi : chr.switchesKu;
      pointCount += drawSeries(mode === "ki" ? chr.similarityKi : chr.similarityKu, color, mode === "ki" ? kishuCandidateLayer : kunenboCandidateLayer);
      els["similarity-title"].textContent = mode === "ki" ? t("kishuSimilarity") : t("kunenboSimilarity");
      els["similarity-help"].textContent = mode === "ki" ? t("kishuSimilarityHelp") : t("kunenboSimilarityHelp");
    }
    if (pointCount < 2) {
      const empty = svgEl("text", {x: l + pw / 2, y: top + ph / 2 + 4, fill: "#79908f", "font-size": 11, "text-anchor": "middle"});
      empty.textContent = t("noComparable"); annotationLayer.append(empty);
    }
    switches.forEach(f => {
      const pos = chr.length*f; if(pos<state.start||pos>state.end)return;
      const xx=l+(pos-state.start)/(state.end-state.start)*pw;
      annotationLayer.append(svgEl("line", {x1:xx,y1:top,x2:xx,y2:H-b,stroke:"#f5d56b","stroke-width":1,"stroke-dasharray":"3 3"}));
    });
    const cursorX = l + (state.cursor - state.start) / (state.end - state.start) * pw;
    annotationLayer.append(svgEl("line", {x1:cursorX,y1:top,x2:cursorX,y2:H-b,stroke:"#edf4f2","stroke-width":1,opacity:.55,"stroke-dasharray":"2 5"}));
    const axis = allMode ? [[top,t("kishuAxis")],[top+ph/2,"0"],[top+ph,t("kunenboAxis")]] : [[top,t("hap1Axis")],[top+ph/2,"0"],[top+ph,t("hap2Axis")]];
    axis.forEach(([yy,txt])=>{const te=svgEl("text",{x:l-6,y:yy+3,fill:"#79908f","font-size":9,"text-anchor":"end"});te.textContent=txt;annotationLayer.append(te);});
  }

  function renderOverview() {
    const chr = getChr();
    const loadedTracks = chr.tracks ? Object.values(chr.tracks).flat() : [];
    const heights = Array.from({length:100}, (_, i) => {
      if (!loadedTracks.length) return 8;
      const start = chr.length * i / 100, end = chr.length * (i + 1) / 100;
      const overlapping = loadedTracks.filter(s => s.end >= start && s.start <= end);
      if (!overlapping.length) return 8;
      const meanCoverage = overlapping.reduce((sum, s) => sum + (Number(s.coverage) || 0), 0) / overlapping.length;
      return clamp(8 + Math.sqrt(meanCoverage) * 87, 8, 95);
    });
    els["overview-bars"].innerHTML = heights.map(height => `<i class="overview-bar" style="height:${height}%;opacity:.76"></i>`).join("");
    const visiblePaths = new Set(getPaths().map(path => path.id));
    const offReference = Array.from({length:100}, (_, i) => {
      const start = chr.length * i / 100, end = chr.length * (i + 1) / 100;
      return (chr.offReferenceBins || []).filter(bin => bin.end >= start && bin.start <= end)
        .reduce((sum, bin) => sum + [...visiblePaths].reduce((subtotal, path) => subtotal + Number(bin.bpByPath?.[path] || 0), 0), 0);
    });
    const maxOffReference = Math.max(1, ...offReference);
    els["branch-overview-bars"].innerHTML = offReference.map(bp => {
      const height = bp ? clamp(8 + Math.log1p(bp) / Math.log1p(maxOffReference) * 87, 8, 95) : 3;
      return `<i class="overview-bar branch-bar" style="height:${height}%"></i>`;
    }).join("");
    const left = state.start/chr.length*100, width=(state.end-state.start)/chr.length*100;
    els["overview-window"].style.left=`${left}%`; els["overview-window"].style.width=`${width}%`;
    els["branch-overview-window"].style.left=`${left}%`; els["branch-overview-window"].style.width=`${width}%`;
    els["overview-length"].textContent=fmtMb(chr.length);
  }

  function renderEvents() {
    const chr=getChr(); const visiblePaths=new Set(getPaths().map(p=>p.id));
    const events=chr.variants.filter(v=>v.end>=state.start&&v.start<=state.end).filter(v=>v.support.some(p=>visiblePaths.has(p))).filter(v=>{
      if(v.type==="INV"&&!state.showInversions)return false;
      if(v.type==="UNCERTAIN"&&!state.showUncertain)return false;
      return state.showVariants;
    }).sort((a,b)=>a.start-b.start);
    els.events.innerHTML=events.length?events.map(v=>`<button class="event-row" data-event="${v.id}"><span class="event-pos">${fmtMb(v.start)}</span><span class="event-title">${eventLabel(v)}</span><span class="event-type">${v.type}</span></button>`).join(""):`<div class="hint">${t("noEvents")}</div>`;
    els.events.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>focusEvent(b.dataset.event)));
    els["metric-events"].textContent=String(events.length);
  }

  function focusEvent(id) {
    const v=getChr().variants.find(x=>x.id===id); if(!v)return;
    state.cursor=(v.start+v.end)/2;
    const pad=Math.max((v.end-v.start)*8, 1.2e6); setWindow(state.cursor-pad/2,state.cursor+pad/2);
  }

  function renderInspector() {
    const chr=getChr(); const paths=getPaths();
    els["metric-position"].textContent=fmtMb(state.cursor);
    els["metric-window"].textContent=fmtMb(state.end-state.start);
    els["metric-paths"].textContent=String(paths.length);
    const cards=paths.filter(p=>p.id.startsWith("CUN")).map(p=>{
      const parent=localParent(p.id,chr,state.cursor);
      const pc=PATHS.find(x=>x.id===parent);
      const confidence=Math.round(76+seeded(state.cursor/3e5 + (p.id==="CUNphKi"?3:8))*21);
      return `<div class="path-card"><div class="path-card-head"><span class="path-name"><i class="path-color" style="background:${p.color}"></i>${pathLabel(p)}</span><strong>${pc?pc.short:"—"}</strong></div><p>${parent?`${pathLabel(pc)}${t("nearest")}`:t("noParent")}</p><div class="confidence"><i style="width:${confidence}%"></i></div></div>`;
    }).join("");
    els["path-cards"].innerHTML=cards||`<div class="path-card"><p>${t("noMikan")}</p></div>`;
    const locus = state.traitData?.loci?.find(item => item.id === state.activeLocus);
    const literature = locus?.literature;
    const sources = literature?.sources || (locus?.source ? [{ label: { ja: t("sourcePaper"), en: t("sourcePaper") }, citation: locus.symbol, url: locus.source }] : []);
    const evidenceDetails = literature ? `
      <section class="literature-evidence">
        <h4>${t("literatureEvidence")}</h4>
        <div class="evidence-row"><span>${t("studySystem")}</span><p>${literature.studySystem?.[state.language] || "—"}</p></div>
        <div class="evidence-row"><span>${t("experiment")}</span><p>${literature.experiment?.[state.language] || "—"}</p></div>
        <div class="evidence-row"><span>${t("relevanceHere")}</span><p>${literature.scope?.[state.language] || "—"}</p></div>
        <div class="evidence-row mapping"><span>${t("mappingBasis")}</span><p>${literature.mapping?.[state.language] || t("mappedFrom")}</p></div>
      </section>` : `<p class="mapping-note">${t("mappedFrom")}</p>`;
    const sourceLinks = sources.length ? `
      <section class="source-list"><h4>${t("sources")}</h4>${sources.map(item => `
        <a href="${item.url}" target="_blank" rel="noopener"><span>${item.label?.[state.language] || t("sourcePaper")}</span><strong>${item.citation || locus.symbol}</strong><b>↗</b></a>`).join("")}</section>` : "";
    els["locus-details"].innerHTML = locus ? `
      <div class="locus-detail-head"><i style="background:${locus.color}"></i><span><small>${locus.trait[state.language]}</small><strong>${locus.symbol}</strong></span></div>
      <h3>${locus.title[state.language]}</h3>
      <span class="evidence-badge ${locus.evidence}">${locus.evidenceLabel[state.language]}</span>
      <p>${locus.description[state.language]}</p>
      <dl><div><dt>CUNphKi</dt><dd>${locus.genes.CUNphKi}</dd></div><div><dt>CUNphKu</dt><dd>${locus.genes.CUNphKu}</dd></div><div><dt>${t("geneInterval")}</dt><dd>${locus.chromosome}:${Math.round(locus.start).toLocaleString("en-US")}–${Math.round(locus.end).toLocaleString("en-US")}</dd></div><div><dt>${t("displayNeighborhood")}</dt><dd>${fmtMb(state.start)}–${fmtMb(state.end)}</dd></div></dl>
      ${evidenceDetails}${sourceLinks}` : "";
  }

  function renderHeader() {
    const chr=getChr(), paths=getPaths(), mode=MODES[state.mode];
    els["view-title"].textContent=`${chr.id} · ${modeLabel(state.mode)}`;
    els["view-subtitle"].textContent=`${fmtMb(state.start)}–${fmtMb(state.end)} · ${paths.length} paths`;
    els["mode-badge"].textContent=`${paths.length} paths`;
    els["window-badge"].textContent=`${fmtMb(state.end-state.start)} window`;
    els.coordinate.value=`${chr.id}:${Math.round(state.start).toLocaleString("en-US")}-${Math.round(state.end).toLocaleString("en-US")}`;
    document.querySelectorAll(".chr-button").forEach(b=>b.classList.toggle("active",b.dataset.chr===chr.id));
  }

  function render() { renderHeader(); renderTraitLoci(); renderGraph(); renderOverview(); renderLocalGraph(); renderSimilarity(); renderEvents(); renderInspector(); }

  function toast(message) { els.toast.textContent=message; els.toast.classList.add("show"); clearTimeout(toast.timer); toast.timer=setTimeout(()=>els.toast.classList.remove("show"),2600); }

  function validateData(data) {
    if(!data || data.schema!=="citrus-pathweaver/v1") throw new Error("対応するschemaではありません");
    if(!Array.isArray(data.paths)||!data.paths.length||!Array.isArray(data.chromosomes)||!data.chromosomes.length) throw new Error("pathsまたはchromosomesがありません");
    data.chromosomes.forEach(c=>{ if(!c.id||!Number.isFinite(c.length))throw new Error("染色体IDまたは長さが不正です"); c.variants=c.variants||[]; c.switchesKi=c.switchesKi||[]; c.switchesKu=c.switchesKu||[]; c.similarityKi=c.similarityKi||[]; c.similarityKu=c.similarityKu||[]; c.parentOrigin=c.parentOrigin||{}; c.tracks=c.tracks||{}; c.offReferenceBins=c.offReferenceBins||[]; c.graphBranches=c.graphBranches||[]; });
    return data;
  }

  async function loadFile(file) {
    try {
      activateData(validateData(JSON.parse(await file.text())), file.name);
      toast(`${file.name} を読み込みました`);
    } catch(err) { toast(`読み込み失敗：${err.message}`); }
  }

  function activateData(data, filename) {
      state.data=data; state.filename=filename;
      state.chromosome=data.chromosomes[0].id;
      state.start=Number.isFinite(data.chromosomes[0].viewStart)?data.chromosomes[0].viewStart:0;
      state.end=Number.isFinite(data.chromosomes[0].viewEnd)?data.chromosomes[0].viewEnd:data.chromosomes[0].length;
      state.cursor=state.start+(state.end-state.start)*.35;
      initChrButtons(); els["data-status"].textContent=filename === "Chr1–9 GFA" ? t("loaded") : (state.language === "ja" ? `${filename} を表示中` : `Showing ${filename}`);
      render();
  }

  async function loadBundledData() {
    try {
      const [response, traitResponse]=await Promise.all([fetch("data/citrus_ch1-ch9.viewer.json"), fetch("data/trait_loci.json?v=12")]);
      if(!response.ok||!traitResponse.ok)throw new Error(`HTTP ${response.status}/${traitResponse.status}`);
      state.traitData=await traitResponse.json();
      activateData(validateData(await response.json()), "Chr1–9 GFA");
      toast(t("loadToast"));
    } catch(err) { toast(`読み込み失敗：${err.message}`); }
  }

  document.querySelectorAll(".mode-button").forEach(b=>b.addEventListener("click",()=>setMode(b.dataset.mode)));
  document.getElementById("zoom-in").onclick=()=>zoom(.5);
  document.getElementById("zoom-out").onclick=()=>zoom(2);
  document.getElementById("pan-left").onclick=()=>pan(-.35);
  document.getElementById("pan-right").onclick=()=>pan(.35);
  document.getElementById("reset-view").onclick=()=>setWindow(0,getChr().length);
  els.coordinate.addEventListener("keydown",e=>{if(e.key==="Enter"){try{const p=parseCoordinate(els.coordinate.value);selectChromosome(p.chr);setWindow(p.start,p.end);}catch(err){toast(err.message);}}});
  ["variants","inversions","uncertain"].forEach(k=>document.getElementById(`toggle-${k}`).addEventListener("change",e=>{state[`show${k[0].toUpperCase()+k.slice(1)}`]=e.target.checked;render();}));
  els["file-input"].addEventListener("change",e=>{if(e.target.files[0])loadFile(e.target.files[0]);});
  ["dragenter","dragover"].forEach(ev=>els["drop-zone"].addEventListener(ev,e=>{e.preventDefault();els["drop-zone"].classList.add("drag");}));
  ["dragleave","drop"].forEach(ev=>els["drop-zone"].addEventListener(ev,e=>{e.preventDefault();els["drop-zone"].classList.remove("drag");}));
  els["drop-zone"].addEventListener("drop",e=>{const f=e.dataTransfer.files[0];if(f)loadFile(f);});
  document.getElementById("language-toggle").onclick=()=>{
    state.language=state.language==="ja"?"en":"ja";
    localStorage.setItem("citrus-language",state.language);
    document.documentElement.lang=state.language;
    document.getElementById("language-toggle").textContent=state.language==="ja"?"English":"日本語";
    document.querySelectorAll("[data-i18n]").forEach(element=>{element.textContent=t(element.dataset.i18n);});
    if(state.data){els["data-status"].textContent=state.filename==="Chr1–9 GFA"?t("loaded"):(state.language==="ja"?`${state.filename} を表示中`:`Showing ${state.filename}`);render();}
  };
  els["overview-track"].onclick=e=>{const r=els["overview-track"].getBoundingClientRect();const chr=getChr(),center=(e.clientX-r.left)/r.width*chr.length,width=state.end-state.start;setWindow(center-width/2,center+width/2);};
  els["branch-overview-track"].onclick=e=>{const r=els["branch-overview-track"].getBoundingClientRect();const chr=getChr(),center=(e.clientX-r.left)/r.width*chr.length,width=state.end-state.start;setWindow(center-width/2,center+width/2);};
  els.graph.addEventListener("pointerdown", e => {
    if (e.button !== 0 || e.isPrimary === false || e.target.closest(".event-mark,.switch-mark,.locus-marker,.path-label")) return;
    const rect = els.graph.getBoundingClientRect();
    const viewWidth = Math.max(720, rect.width || 900);
    const plotLeft = CHART_LAYOUT.left / viewWidth * rect.width;
    const plotRight = rect.width - CHART_LAYOUT.right / viewWidth * rect.width;
    const localX = e.clientX - rect.left;
    if (localX < plotLeft || localX > plotRight) return;
    if (windowAnimationFrame) cancelAnimationFrame(windowAnimationFrame);
    windowAnimationFrame = 0;
    graphDrag = {
      pointerId: e.pointerId,
      clientX: e.clientX,
      start: state.start,
      end: state.end,
      plotWidth: Math.max(1, plotRight - plotLeft),
      moved: false,
    };
    suppressGraphClick = false;
    hideTooltip();
    els.graph.classList.add("dragging");
    els.graph.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  els.graph.addEventListener("pointermove", e => {
    if (!graphDrag || graphDrag.pointerId !== e.pointerId) return;
    const deltaX = e.clientX - graphDrag.clientX;
    if (!graphDrag.moved && Math.abs(deltaX) < 4) return;
    graphDrag.moved = true;
    const chr = getChr();
    const width = graphDrag.end - graphDrag.start;
    const offset = -deltaX / graphDrag.plotWidth * width;
    const start = clamp(graphDrag.start + offset, 0, Math.max(0, chr.length - width));
    state.start = start;
    state.end = start + width;
    state.cursor = clamp(state.cursor, state.start, state.end);
    render();
    e.preventDefault();
  });
  const finishGraphDrag = (e, suppressClick) => {
    if (!graphDrag || graphDrag.pointerId !== e.pointerId) return;
    const moved = graphDrag.moved;
    graphDrag = null;
    els.graph.classList.remove("dragging");
    if (els.graph.hasPointerCapture(e.pointerId)) els.graph.releasePointerCapture(e.pointerId);
    if (moved && suppressClick) suppressGraphClick = true;
  };
  els.graph.addEventListener("pointerup", e => finishGraphDrag(e, true));
  els.graph.addEventListener("pointercancel", e => finishGraphDrag(e, false));
  els.graph.addEventListener("lostpointercapture", e => finishGraphDrag(e, false));
  els.graph.addEventListener("wheel",e=>{e.preventDefault();zoom(e.deltaY>0?1.25:.8);},{passive:false});
  window.addEventListener("resize",()=>render());
  window.addEventListener("keydown",e=>{if(e.target.matches("input"))return;if(e.key==="1")setMode("all");if(e.key==="2")setMode("kishu");if(e.key==="3")setMode("kunenbo");if(e.key==="+")zoom(.5);if(e.key==="-")zoom(2);});

  function registerWebMCP() {
    const ctx=document.modelContext; if(!ctx?.registerTool)return;
    const safe=fn=>input=>{try{return fn(input||{});}catch(err){throw new Error(err.message);}};
    Promise.resolve(ctx.registerTool({
      name:"set_view_mode",title:"比較セットを切り替える",description:"全6ハプロタイプ、紀州由来トリオ、九年母由来トリオの表示を切り替えます。",
      inputSchema:{type:"object",properties:{mode:{type:"string",enum:["all","kishu","kunenbo"]}},required:["mode"],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},
      execute:safe(({mode})=>{if(!MODES[mode])throw new Error("invalid mode");setMode(mode);return{mode,paths:getPaths().map(p=>p.id)};})
    })).catch(()=>{});
    Promise.resolve(ctx.registerTool({
      name:"navigate_locus",title:"染色体領域を開く",description:"指定した染色体座標へ移動して表示範囲を更新します。",
      inputSchema:{type:"object",properties:{chromosome:{type:"string"},start:{type:"number",minimum:0},end:{type:"number",minimum:1}},required:["chromosome","start","end"],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},
      execute:safe(({chromosome,start,end})=>{const chr=state.data.chromosomes.find(c=>c.id===chromosome);if(!chr||end<=start)throw new Error("invalid locus");state.chromosome=chromosome;setWindow(start,end);return{chromosome,start:state.start,end:state.end};})
    })).catch(()=>{});
    Promise.resolve(ctx.registerTool({
      name:"read_current_view",title:"現在の表示を読む",description:"現在選択されている比較セット、染色体、座標、パスを返します。",
      inputSchema:{type:"object",properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},
      execute:()=>({mode:state.mode,chromosome:state.chromosome,start:state.start,end:state.end,cursor:state.cursor,paths:getPaths().map(p=>p.id)})
    })).catch(()=>{});
  }

  document.documentElement.lang=state.language;
  registerWebMCP();
  loadBundledData();
})();
