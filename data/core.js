// =====================================================================
// カウンターデータの登録基盤
// ---------------------------------------------------------------------
// 各レーンのデータファイル(top-a.js 等)はこの registerCounters() を
// 呼んで自分のエントリを登録する。ファイルを増やすだけで拡張できる。
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
