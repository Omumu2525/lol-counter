// =====================================================================
// カウンターデータの登録基盤
// ---------------------------------------------------------------------
// 各ロールのデータファイル(top-a.js 等)はこの registerCounters() を
// 呼んで自分のエントリを登録する。ファイルを増やすだけで拡張できる。
//
// カウンター1件のスキーマ:
//   id     : Data Dragon ID (champions.js に存在すること)
//   type   : "lane"(レーン戦フェーズで優位) / "game"(ゲーム全体勝率で優位) / "both"
//   wr     : カウンター側の対面勝率% (op.gg Emerald+)。データ取得不可の場合は省略
//   reason : カウンターとなる理由
//   plan   : カウンターされる側の対策
// =====================================================================

const COUNTERS = { top: [], jungle: [], mid: [], adc: [], support: [] };

function registerCounters(lane, entries) {
  if (!COUNTERS[lane]) {
    console.error(`registerCounters: unknown lane "${lane}"`);
    return;
  }
  COUNTERS[lane].push(...entries);
}

const LANES = [
  { id: "top", label: "トップ", en: "TOP", icon: "⚔️" },
  { id: "jungle", label: "ジャングル", en: "JUNGLE", icon: "🌲" },
  { id: "mid", label: "ミッド", en: "MID", icon: "🔮" },
  { id: "adc", label: "ボット (ADC)", en: "BOT", icon: "🏹" },
  { id: "support", label: "サポート", en: "SUPPORT", icon: "🛡️" },
];
