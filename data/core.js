// =====================================================================
// カウンターデータの登録基盤
// ---------------------------------------------------------------------
// 各ロールのデータファイル(top-a.js 等)はこの registerCounters() を
// 呼んで自分のエントリを登録する。ファイルを増やすだけで拡張できる。
//
// カウンター1件のスキーマ (op.gg Emerald+ / patch 16.13 ベースで再構築):
//   id     : Data Dragon ID (champions.js に存在すること)
//   gameWr : 選択チャンピオン視点の対面勝率% (50未満ほど不利 = 相手が強カウンター)
//   laneWr : 選択チャンピオン視点のレーンキル率% (レーン内のキル取り分。jungle は null)
//   games  : その対面の集計サンプル数 (信頼性の目安。150以上で採用)
//   reason : カウンターとなる理由
//   plan   : カウンターされる側の対策
// ※ 旧スキーマ (type / wr) のロールデータも当面は app.js 側の後方互換で表示できる
// =====================================================================

const COUNTERS = { top: [], jungle: [], mid: [], adc: [], support: [] };

function registerCounters(lane, entries) {
  if (!COUNTERS[lane]) {
    console.error(`registerCounters: unknown lane "${lane}"`);
    return;
  }
  COUNTERS[lane].push(...entries);
}

// ---------------------------------------------------------------------
// A側(ロール内母集団)の統計 — rank / tier(0=OP..5) / winRate / pickRate / banRate
// op.gg Emerald+ の当該ロール集計。表示の補助情報として保持する。
// TIERLIST[lane][championId] = { rank, tier, winRate, pickRate, banRate }
// ---------------------------------------------------------------------
const TIERLIST = { top: {}, jungle: {}, mid: {}, adc: {}, support: {} };

function registerTierlist(lane, stats) {
  if (!TIERLIST[lane]) {
    console.error(`registerTierlist: unknown lane "${lane}"`);
    return;
  }
  Object.assign(TIERLIST[lane], stats);
}

const LANES = [
  { id: "top", label: "トップ", en: "TOP", icon: "⚔️" },
  { id: "jungle", label: "ジャングル", en: "JUNGLE", icon: "🌲" },
  { id: "mid", label: "ミッド", en: "MID", icon: "🔮" },
  { id: "adc", label: "ボット (ADC)", en: "BOT", icon: "🏹" },
  { id: "support", label: "サポート", en: "SUPPORT", icon: "🛡️" },
];
