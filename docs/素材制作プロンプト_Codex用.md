# 素材制作プロンプト（Codex 用）

ゲーム `million_march.html`（Million March）の画像素材を作るための指示書。
この Markdown をまるごと Codex に渡せば、そのまま作業できるように書いてある。

---

## Codex への指示（ここから下をそのまま渡す）

あなたはゲーム用の2D画像素材を作るアシスタントです。
下の「共通スタイル」を必ず全素材に適用し、「素材リスト」の順に画像を生成して保存してください。

### 作業ルール

1. 保存先は、このファイルがあるフォルダの1つ上の `assets/` フォルダ（なければ作る）
2. ファイル名は素材リストの指定どおり。半角英数字と `_` だけ、空白は入れない
3. **背景は透過 PNG**。透過で出力できない場合は、背景を単色 `#00FF00`（クロマキー緑）で生成し、あとで緑を抜いて透過 PNG にする（素材の中に緑を使わないこと）
4. キャラと武器は、**画像の中央に置き、足元（または持ち手）を下端から 4% の位置にそろえる**。余白は上下左右に約6%
5. 同じ種類の素材（兵士の走り2コマ、巨人の3ポーズなど）は、**大きさ・位置・色・線の太さを完全にそろえる**。1枚目を参照画像として2枚目以降を作る
6. 1素材ずつ生成 → 目で確認 → ズレがあれば作り直す。最後に `assets/一覧.md` に「ファイル名・サイズ・できた/作り直し」を表にして書く
7. 文字（ロゴ以外）は画像に入れない

### 共通スタイル（全素材のプロンプト先頭に付ける）

```
Stylized 2D mobile game art, clean flat shapes with soft cel shading,
one-direction light from the upper left, subtle thick dark-brown outline (#241c18),
warm earthy palette: sand stone #c9bca1, dark stone #a2937a, jade green #2e7d6e,
gold #e0a83c, ally blue #2b4c8c, enemy red #b23a32, ogre green #7d8c4f.
Chunky, friendly, slightly toy-like proportions, readable at small sizes.
No text, no watermark, no background scenery, isolated on transparent background.
```

---

### 素材リスト（優先度順）

#### ★優先度A：これだけで見た目が大きく変わる

| # | ファイル名 | サイズ(px) | 内容 |
|---|---|---|---|
| A1 | `giant_idle.png` | 1024×1024 | 巨人・正面・棍棒を下げて立つ |
| A2 | `giant_raise.png` | 1024×1024 | 巨人・棍棒を頭上に振りかぶる |
| A3 | `giant_slam.png` | 1024×1024 | 巨人・棍棒を前に叩きつけた瞬間 |
| A4 | `giant_king_idle.png` | 1024×1024 | 巨人王（王冠・金の飾り）・立ち |
| A5 | `giant_king_raise.png` | 1024×1024 | 巨人王・振りかぶり |
| A6 | `giant_king_slam.png` | 1024×1024 | 巨人王・叩きつけ |
| A7 | `ally_run_1.png` / `ally_run_2.png` | 256×256 | 味方兵・**背中側から見た**走り2コマ |
| A8 | `enemy_stand_1.png` / `enemy_stand_2.png` | 256×256 | 敵兵・**正面向き**・構えて足踏み2コマ |
| A9 | `weapon_1_club.png` 〜 `weapon_6_hammer.png` | 256×256 | 武器6種（下の表） |

**A1〜A3 巨人のプロンプト**
```
[共通スタイル]
A huge green ogre giant, front view facing the viewer, full body.
Barrel-shaped belly, thick legs, small head with two curved ivory horns,
tiny glowing yellow eyes, two small tusks, brown leather loincloth,
a diagonal leather strap across the chest, belt with a gold buckle.
Holds a massive wooden club studded with ivory spikes in the right hand.
Pose: {idle: club hanging down at the side, relaxed menacing stance |
raise: club lifted high over the head with both arms, about to smash |
slam: club smashed down in front of the body, leaning forward, dust at the club tip}.
Keep exactly the same character design, size and framing in all three poses.
```

**A4〜A6 巨人王**：A1〜A3 の説明に次を足す
```
The king of the giants: wears a golden crown, gold shoulder plates,
a red cape behind, the club is darker iron-banded wood with gold spikes.
Looks bigger and more armored than the normal giant.
```

**A7 味方兵（背中側）**
```
[共通スタイル]
A small cute soldier seen from BEHIND (back view), running away from the viewer
toward the top of the image. Blue tunic #2b4c8c, darker blue pants, simple round
blue helmet, skin-tone hands, no weapon in hands (weapons are added separately).
Frame {1: left leg forward | 2: right leg forward}. Same size and position in both frames.
```

**A8 敵兵（正面）**
```
[共通スタイル]
A small cute enemy soldier seen from the FRONT, facing the viewer, ready to fight.
Red tunic #b23a32, dark red pants, round red helmet with a small crest,
angry but cute face. Empty hands. Frame {1: weight on left foot | 2: weight on right foot}.
```

**A9 武器（6種）**：どれも「持ち手を左下、先端を右上に向けた45度」で統一
```
[共通スタイル]
A single {WEAPON} game item icon, diagonal 45 degrees, handle at the bottom-left,
tip at the top-right, centered, consistent scale with the other weapon icons.
```

| ファイル名 | {WEAPON} に入れる文 | ゲーム内の名前 |
|---|---|---|
| `weapon_1_club.png` | rough wooden club with a knot at the top | 棍棒 |
| `weapon_2_dagger.png` | short steel dagger with a gold crossguard | 短剣 |
| `weapon_3_longsword.png` | long steel sword with a gold crossguard and blue grip | 長剣 |
| `weapon_4_spear.png` | long wooden spear with a shiny steel leaf-shaped tip | 槍 |
| `weapon_5_axe.png` | heavy battle axe with a wide curved steel blade | 戦斧 |
| `weapon_6_hammer.png` | legendary thunder hammer, pale gold head crackling with small lightning sparks | 雷槌 |

#### 優先度B：ステージの雰囲気づくり

| # | ファイル名 | サイズ(px) | 内容・プロンプト追記 |
|---|---|---|---|
| B1 | `bg_mountains.png` | 2048×512 | 遠景の岩山パノラマ。**左右の端がつながる（横ループできる）**。`misty teal-blue rocky mountains silhouette, soft haze at the bottom, seamless horizontally tileable` ※これだけ透過不要・空は描かない |
| B2 | `temple_goal.png` | 1024×1024 | ゴールの神殿（正面）。`ancient sandstone temple gate with stairs, gold trim, seen from the front` |
| B3 | `blade_trap.png` | 512×512 | 回転刃（正面）。`four-bladed spinning steel saw trap, gold hub, on a short stone post` |
| B4 | `pillar.png` | 256×768 | 道の両脇の石柱。`weathered sandstone pillar with a flat capstone` |
| B5 | `gate_frame.png` | 1024×512 | ゲートの枠（左右2つの窓がある石の門）。**窓の中は完全透過**。`stone archway with two empty rectangular openings side by side, gold keystone` |

#### 優先度C：UI・宣伝

| # | ファイル名 | サイズ(px) | 内容 |
|---|---|---|---|
| C1 | `logo_title.png` | 1600×600 | タイトルロゴ「MILLION MARCH」（タイトル確定済み）。`bold chunky gold game logo text "MILLION MARCH", dark brown outline, small army marching silhouette under the letters` |
| C2 | `icon_app.png` | 512×512 | アプリアイコン。巨人の前に青い兵の群れ。透過なし・角丸なしの正方形 |
| C3 | `ad_banner.png` | 1200×630 | 宣伝用。兵の大群が巨人に突撃する場面・透過なし。左に文字を置く空きを作る |
| C4 | `fx_dust.png` / `fx_spark.png` / `fx_shockwave.png` | 256×256 | 土煙・キラキラ・衝撃波の輪（エフェクト用・各1枚） |

---

### 最後にやること

- `assets/一覧.md` に全素材の状況を表でまとめる
- 作れなかった素材・スタイルがそろわなかった素材は、理由とともに書く
