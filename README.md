# 広告ゲーム工房（ad-games）

スマホ広告でよく見るゲームを、ブラウザで遊べるように再現したゲーム集です。

遊ぶ：https://machino-ai.jp/ad-games/

| ゲーム | ファイル | 内容 |
|---|---|---|
| 増殖ゲート | `zoushoku_gate.html` | 軍勢を率いて進み、ゲートで兵を増やして敵軍と巨人を倒すランナー |
| 迎撃ロード | `geigeki_road.html` | その場で撃ち続け、3レーンに流れてくる門・宝・敵・巨人を迎え撃つ防衛ゲーム |
| Million March | `million_march.html` | 増殖ゲートの発展版。上限なしで増える軍勢の行進・巨人戦・ボーナスステージ・エンドレス |

- どれも1ファイルで動く HTML（Canvas 描画・WebAudio の効果音）
- 画像素材は `assets/` にまとめて、ゲーム間で共有
  - `assets/prepared/`：兵士・巨人・武器・小物のスプライトシート（`catalog.js` に切り出し位置）
  - `assets/backgrounds/`：ステージ別の背景5枚
  - `assets/sprite_kit.js`・`assets/sprite_bounds.js`：スプライト描画の共通部品
  - `assets/ancient-valley.png`：背景が読めないときの予備
