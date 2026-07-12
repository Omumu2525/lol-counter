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
  $("#source-badge").textContent =
    `📊 集計データ: op.gg（ランク: プラチナ以上 / 地域: 全世界）`;
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
// 一覧→詳細のマスター/詳細レイアウト。
//   デスクトップ: 左に候補一覧(対面勝率のみ)、右に選択中の詳細を表示
//   モバイル(<=560px): 行をタップでその場にアコーディオン展開(右ペインは非表示)

// 対面勝率を 0〜50%(50%=五分) の固定スケールで可視化するバー(恣意的しきい値は使わない)
function wrBar(gameWr) {
  const w = Math.max(0, Math.min(100, (gameWr / 50) * 100));
  return `<span class="wr-bar"><i style="width:${w.toFixed(0)}%"></i></span>`;
}

// 1カウンターの詳細(バッジ + 理由 + 対策)。詳細ペインと行内展開で共用
function counterDetailHTML(name, c) {
  const chips = [];
  if (typeof c.gameWr === "number") {
    chips.push(`<span class="badge badge-game">🏆 ${name}の対面勝率 ${c.gameWr.toFixed(1)}%</span>`);
  }
  if (typeof c.laneWr === "number") {
    chips.push(`<span class="badge badge-lane">⚔ ${name}のレーン戦キル率 ${c.laneWr.toFixed(1)}%</span>`);
  }
  // 旧データ(wr=カウンター側勝率)が残っている場合は反転して暫定表示
  if (!chips.length && typeof c.wr === "number") {
    chips.push(`<span class="wr-label">${name}の勝率 ${(100 - c.wr).toFixed(1)}%</span>`);
  }
  // サンプル数(集計の信頼性の目安)
  if (typeof c.games === "number") {
    chips.push(`<span class="wr-label">サンプル ${c.games}戦</span>`);
  }
  const meta = chips.length ? `<div class="counter-meta">${chips.join("")}</div>` : "";
  return `
    <div class="cd-head">
      <img src="${champImg(c.id)}" alt="${champName(c.id)}"
           onerror="this.style.visibility='hidden'">
      <span class="cd-name">${champName(c.id)}</span>
    </div>
    ${meta}
    <h3 class="reason-title">⚔ カウンターとなる理由</h3>
    <p>${c.reason}</p>
    <h3 class="plan-title">🛡 ${name}側の対策(被害を最小限に抑えるには)</h3>
    <p>${c.plan}</p>
    ${evidenceBadge(c.ev)}`;
}

// 実データ補強済みエントリの出典表示(未補強＝キットのみはバッジ無しで正直に区別)
function evidenceBadge(ev) {
  if (!ev || !Array.isArray(ev.sites) || ev.sites.length === 0) return "";
  const srcs = ev.sites.map((s) => `<span class="ev-src">${s}</span>`).join("・");
  const patch = ev.patch ? ` <span class="ev-patch">patch ${ev.patch}</span>` : "";
  const stale = ev.stale ? ` <span class="ev-stale">旧ソース</span>` : "";
  return `<div class="ev-badge" title="この対策は実在の攻略ソースの記述で裏付けられています">📎 対策の裏付け: ${srcs}${patch}${stale}</div>`;
}

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
    list.innerHTML = `<div class="empty-note">${name} は、このパッチの採用基準(対面100戦以上・選択チャンピオン側の勝率50%未満)を満たす明確なカウンターがいません(支配的なチャンピオンです)。</div>`;
    return;
  }

  const master = document.createElement("div");
  master.className = "cl-master";
  const detail = document.createElement("div");
  detail.className = "cl-detail counter-body";

  function selectItem(item) {
    master.querySelectorAll(".cl-item.open").forEach((el) => el.classList.remove("open"));
    item.classList.add("open");
  }

  champ.counters.forEach((c, i) => {
    const item = document.createElement("div");
    item.className = "cl-item" + (i === 0 ? " open" : "");

    // 副情報: レーンキル率(あれば) · サンプル数(あれば)。対面勝率を軸に保つため小さく muted
    const sub = [];
    if (typeof c.laneWr === "number") sub.push(`レーン戦キル率 ${c.laneWr.toFixed(1)}%`);
    if (typeof c.games === "number") sub.push(`${c.games}戦`);
    const subLine = sub.length ? `<span class="cl-sub">${sub.join(" · ")}</span>` : "";

    const wrCell =
      typeof c.gameWr === "number"
        ? `<span class="cl-wr"><b>${c.gameWr.toFixed(1)}%</b>${wrBar(c.gameWr)}${subLine}</span>`
        : typeof c.wr === "number"
        ? `<span class="cl-wr"><b>${(100 - c.wr).toFixed(1)}%</b>${subLine}</span>`
        : `<span class="cl-wr">${subLine}</span>`;

    const row = document.createElement("button");
    row.type = "button";
    row.className = "cl-row";
    row.innerHTML = `
      <img class="cl-thumb" src="${champImg(c.id)}" alt="${champName(c.id)}" loading="lazy"
           onerror="this.style.visibility='hidden'">
      <span class="cl-name">${champName(c.id)}</span>
      ${wrCell}
      <span class="cl-chev" aria-hidden="true">▾</span>`;

    const inline = document.createElement("div");
    inline.className = "cl-inline counter-body";
    inline.innerHTML = counterDetailHTML(name, c);

    row.addEventListener("click", () => {
      const mobile = window.matchMedia("(max-width: 560px)").matches;
      if (mobile) {
        // アコーディオン: 開いていれば閉じる、そうでなければ単一展開
        if (item.classList.contains("open")) {
          item.classList.remove("open");
        } else {
          selectItem(item);
        }
      } else {
        // マスター/詳細: 選択して右ペインを差し替え
        selectItem(item);
        detail.innerHTML = counterDetailHTML(name, c);
      }
    });

    item.appendChild(row);
    item.appendChild(inline);
    master.appendChild(item);
  });

  detail.innerHTML = counterDetailHTML(name, champ.counters[0]);
  list.appendChild(master);
  list.appendChild(detail);
}

renderPatchBadge();
renderLanes();
