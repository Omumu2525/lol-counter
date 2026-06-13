# LoL カウンターピック検索

レーンとチャンピオンを選ぶと「カウンターとなるチャンピオン」「カウンターとなる理由」「カウンターされる側の対策」を表示する静的Webアプリ。ビルド不要、サーバーに置くだけで動く。

## 起動方法

静的ファイルなので任意のHTTPサーバーで配信する。このリポジトリでは
`.claude/launch.json` の `lol-counter` 設定(PowerShell製 serve.ps1、ポート4173)を使用。

## ファイル構成

```
lol-counter/
├── index.html          ページ構造(データファイルの読み込み順もここで管理)
├── style.css           テーマ
├── app.js              UIロジック(データには触れない)
└── data/
    ├── core.js         COUNTERS レジストリ + registerCounters() + レーン定義
    ├── meta.js         ★分析基準パッチ番号・更新日・更新履歴
    ├── champions.js    ★Data Dragon ID → 日本語名(全チャンピオン)
    ├── top-a.js        トップ A〜K
    ├── top-b.js        トップ M〜Z
    ├── top-c.js        トップ 追加分(1%基準棚卸し)
    ├── jungle-a.js     ジャングル A〜L
    ├── jungle-b.js     ジャングル L〜Z
    ├── jungle-c.js     ジャングル 追加分(オフロール系JG等)
    ├── mid-a.js        ミッド A〜L
    ├── mid-b.js        ミッド M〜Z
    ├── mid-c.js        ミッド 追加分
    ├── adc.js          ボット(ADC)
    ├── adc-b.js        ボット 追加分(メイジボット等)
    ├── support-a.js    サポート A〜N
    ├── support-b.js    サポート N〜Z
    └── support-c.js    サポート 追加分
```

## 収録基準

**当該ロールでのピック率 1.0% 以上**(op.gg Emerald+ 集計、`meta.js` の `pickRateThreshold`)。
基準未満に落ちたチャンピオンも、一度収録したものは原則残す。
棚卸し時は op.gg の各ポジション統計(`https://www.op.gg/lol/champions?position=<role>&tier=emerald_plus`)と突き合わせる。

## データ形式

```js
registerCounters("top", [
  {
    id: "Aatrox",                       // Data Dragon ID (champions.js に存在すること)
    counters: [
      {
        id: "Fiora",                    // カウンターのID
        type: "both",                   // "lane"=レーン戦で優位 / "game"=ゲーム全体勝率で優位 / "both"
        wr: 53.6,                        // カウンター側の対面勝率% (op.gg Emerald+)。取得不可なら省略可
        reason: "カウンターとなる理由",
        plan: "カウンターされる側の対策",
      },
    ],
  },
]);
```

- 表示名・画像は `id` から自動解決される(名前をデータに書かない)
- 解説は「パッチに依存しにくいスキル構造上の相性」を中心に書く方針
- `type` / `wr` は op.gg Emerald+ の対面勝率と照合して付与:
  カウンター側勝率 ≥ 51% を「相性成立」とし、レーン戦由来の優位は `lane`/`both`、
  スケール・集団戦由来は `game`。`wr` はカウンター側から見たマッチアップ勝率(=100−対象側勝率)

## パッチ更新時の手順

1. **`data/meta.js`** の `patch` / `patchDate` / `updated` を更新し、`changelog` に1行追加
2. メタの変動が大きいチャンピオンについて、該当レーンファイルのエントリを修正
   (チャンピオンは id で grep すれば見つかる。例: `Grep "id: \"Aatrox\"" data/`)
3. **新チャンピオン追加時**: `data/champions.js` に `Id: "日本語名",` を1行追加し、
   該当レーンのファイル(またはファイル新設)に `registerCounters` でエントリ追加。
   ファイルを新設した場合は `index.html` に `<script>` を1行追加
   - 予定: パッチ26.13で新チャンピオン「Locke」(ミッドAPアサシン)が追加予定

## クレジット

Champion images: Riot Games Data Dragon (バージョン非依存URL `cdn/img/champion/tiles/<Id>_0.jpg`)。
This project is not endorsed by Riot Games.
