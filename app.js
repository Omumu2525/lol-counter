// ---------------------------------------------------------------
// LoL カウンターピック検索 — UI ロジック
// データソース: data/core.js (COUNTERS/LANES), data/champions.js
// (CHAMPION_NAMES), data/meta.js (META)
// ---------------------------------------------------------------

const state = { lane: null, champ: null };

// Data Dragon (バージョン非依存のタイル画像URL)
const champImg = (id) =>
  `https://ddragon.leagueoflegends.com/cdn/img/champion/tiles/${id}_0.jpg`;

const champName = (id) => CHAMPION_NAMES[id] || id;

const $ = (sel) => document.querySelector(sel);

// ---- ヘッダー: 分析基準パッチの表示 ----
function renderPatchBadge() {
  $("#patch-badge").textContent =
    `分析基準: パッチ ${META.patch}(${META.patchDate} リリース)/ データ更新日: ${META.updated}`;
}

// ---- STEP 1: レーンボタン ----
function renderLanes() {
  const wrap = $("#lane-buttons");
  wrap.innerHTML = "";
  LANES.forEach((lane) => {
    const btn = document.createElement("button");
    btn.className = "lane-btn" + (state.lane === lane.id ? " active" : "");
    btn.innerHTML = `
      <span class="lane-icon">${lane.icon}</span>
      <span>${lane.label}</span>
      <span class="lane-en">${lane.en}</span>`;
    btn.addEventListener("click", () => selectLane(lane.id));
    wrap.appendChild(btn);
  });
}

function selectLane(laneId) {
  state.lane = laneId;
  state.champ = null;
  renderLanes();
  renderChamps();
  $("#champ-section").hidden = false;
  $("#result-section").hidden = true;
  $("#champ-section").scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---- STEP 2: チャンピオングリッド ----
function renderChamps() {
  const grid = $("#champ-grid");
  grid.innerHTML = "";
  const champs = [...(COUNTERS[state.lane] || [])]
    .sort((a, b) => champName(a.id).localeCompare(champName(b.id), "ja"));

  champs.forEach((champ) => {
    const card = document.createElement("div");
    card.className = "champ-card" + (state.champ === champ.id ? " active" : "");
    card.innerHTML = `
      <img src="${champImg(champ.id)}" alt="${champName(champ.id)}" loading="lazy"
           onerror="this.style.display='none'">
      <span class="champ-name">${champName(champ.id)}</span>`;
    card.addEventListener("click", () => selectChamp(champ));
    grid.appendChild(card);
  });
}

function selectChamp(champ) {
  state.champ = champ.id;
  renderChamps();
  renderResult(champ);
  $("#result-section").hidden = false;
  $("#result-section").scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---- STEP 3: カウンター結果 ----
function renderResult(champ) {
  const laneLabel = LANES.find((l) => l.id === state.lane)?.label ?? "";
  const name = champName(champ.id);

  $("#result-header").innerHTML = `
    <img src="${champImg(champ.id)}" alt="${name}"
         onerror="this.style.display='none'">
    <div>
      <div class="vs-label">${laneLabel} — このチャンピオンへのカウンター</div>
      <div class="target-name">${name}</div>
    </div>`;

  const list = $("#counter-list");
  list.innerHTML = "";

  if (!champ.counters || champ.counters.length === 0) {
    list.innerHTML = `<div class="empty-note">このチャンピオンのカウンターデータは未登録です。data/ 配下のロール別ファイルに追記することで拡張できます。</div>`;
    return;
  }

  champ.counters.forEach((c) => {
    const card = document.createElement("article");
    card.className = "counter-card";
    card.innerHTML = `
      <div class="portrait">
        <img src="${champImg(c.id)}" alt="${champName(c.id)}" loading="lazy"
             onerror="this.style.display='none'">
        <span class="counter-name">${champName(c.id)}</span>
      </div>
      <div class="counter-body">
        <h3 class="reason-title">⚔ カウンターとなる理由</h3>
        <p>${c.reason}</p>
        <h3 class="plan-title">🛡 ${name}側の対策(被害を最小限に抑えるには)</h3>
        <p>${c.plan}</p>
      </div>`;
    list.appendChild(card);
  });
}

renderPatchBadge();
renderLanes();
