# BGM を Suno で作る（迎撃ロード・Million March 共通）

> **2026-09-27 組み込み済み**：6曲を Suno で作り（2パターンのうち長いほう）、`tools/bgm_loop.py` でループに加工して `assets/bgm/` に入れた。以下は作り直すときの手順メモ。

今のBGMは、プログラムがその場で鳴らすピコピコ音（`Snd` の `SONGS`）。これを Suno の曲に置き換える。
2つのゲームは景色の分け方が同じなので、**6曲作れば両方に入る**。

## 作る曲（6曲）

| ファイル名 | 使う場面 | 雰囲気 |
|---|---|---|
| `valley.mp3` | 1・2面「翠緑の遺跡」／タイトル・マップ | 明るく勇ましい行進曲 |
| `desert.mp3` | 3・4面「黄金の砂漠」 | エキゾチック・中東風 |
| `snow.mp3` | 5・6面「氷雪の神殿」 | 静かで神秘的、鈴の音 |
| `volcano.mp3` | 7・8面「灼熱の要塞」 | 速くて重い、緊迫感 |
| `sky.mp3` | 9・10面「天空の聖域」 | 壮大で高らか、最終決戦 |
| `bonus.mp3` | 宝物庫（ボーナス面） | 弾む・速い・ごほうび感 |

## Suno に入れる指示（Style of Music 欄）

**どれも「Instrumental（歌なし）」をオンにする。** 歌詞欄は空でよい。

- valley: `heroic orchestral march, bright major key, snare drums, brass fanfare, strings, mobile game battle music, energetic, 132 bpm, instrumental, loopable`
- desert: `epic middle eastern adventure, oud, darbuka, exotic phrygian scale, strings and brass, mobile game battle music, 120 bpm, instrumental, loopable`
- snow: `mystical ice temple, celesta and glockenspiel, soft choir pads, strings, cold and tense but calm, fantasy game music, 112 bpm, instrumental, loopable`
- volcano: `intense epic battle, heavy taiko drums, low brass, fast strings ostinato, dark minor key, boss fortress, mobile game music, 150 bpm, instrumental, loopable`
- sky: `triumphant epic orchestral, soaring brass and choir, heroic final battle, major key, cinematic fantasy game music, 138 bpm, instrumental, loopable`
- bonus: `upbeat bouncy game bonus stage, playful pizzicato, marimba, claps, cheerful major key, treasure fever, 160 bpm, instrumental, loopable`

## 選び方のコツ

- Suno は1回で2曲できる。**始まりからすぐ盛り上がる方**を選ぶ（長いイントロや静かな始まりは、ゲームだと物足りない）
- 長さは気にしなくてよい（こちらで60〜90秒に切って、切れ目なくループするように加工する）
- 迷ったら2曲とも渡してOK（`valley_a.mp3` / `valley_b.mp3` のように）

## 渡し方（GitHub 経由）

公開ページに元の大きな mp3 が出ないよう、**`main` ではなく `bgm-raw` ブランチ**に置く。

1. このリポジトリで `bgm-raw` ブランチを作る（`git checkout -b bgm-raw`）
2. `bgm_raw/` フォルダに上の名前で mp3 を入れる（ファイル名に空白を入れない）
3. commit して `git push -u origin bgm-raw`
4. 終わったら `git checkout main` に戻しておく

受け取った側（4th PC）で、切り出し・圧縮・ループ加工をして `assets/bgm/` に入れ、ゲームに組み込む。読み込むまでと、読めなかったときは今のピコピコBGMを鳴らす。
