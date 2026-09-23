# 別のPC（3rd PC など）でゲームを直せるようにする手順

このリポジトリを clone すれば、どのPCからでも2つのゲームを直せる。1回だけの準備が3ステップ、あとは毎回2ステップ。

---

## 1回だけの準備

### ステップ1：入っているものを確認する

そのPCで PowerShell（またはターミナル）を開いて、次を1行ずつ実行する。

```powershell
git --version; python --version
```

- 両方バージョンが出れば、ステップ2へ
- 「認識されていません」と出たものは、次で入れる

### ステップ2：足りないものを入れる

```powershell
winget install --id Git.Git -e
```

```powershell
winget install --id Python.Python.3.12 -e
```

入れたあとは PowerShell を開き直す（開き直さないと使えない）。

Claude のデスクトップアプリは、入っていなければ https://claude.ai/download から入れる。

### ステップ3：コードを取ってくる

置き場所はどこでもよいが、OneDrive の同期フォルダは避ける（gitと相性が悪い）。例としてデスクトップ直下に置く。

```powershell
cd $env:USERPROFILE\Desktop; git clone https://github.com/mitsukenn/ad-games.git
```

- GitHub のログインを求められたら、ブラウザが開くので、いつものアカウント（mitsukenn）でログインする
- 素材が約50MBあるので、少し時間がかかる
- 終わると `Desktop\ad-games` ができる

最後に、自分の名前を設定しておく（誰が直したか記録に残る）。

```powershell
cd $env:USERPROFILE\Desktop\ad-games; git config user.name "mitsukenn"; git config user.email "m.arakaki2009@gmail.com"
```

---

## 毎回の作業

### 始めるとき：最新にする

Claude のデスクトップアプリで `ad-games` フォルダを開き、最初にこう頼む。

> 最新にして。git pull してから始めて。

手でやるなら:

```powershell
cd $env:USERPROFILE\Desktop\ad-games; git pull
```

**これを忘れると、別のPCで直した内容を巻き戻してしまう。** 必ず最初にやる。

### 直したあと：GitHubに上げる

> 変更をコミットして push して。

手でやるなら:

```powershell
cd $env:USERPROFILE\Desktop\ad-games; git add -A; git commit -m "変更の内容"; git push
```

push が `rejected`（拒否）と出たら、ほかのPCが先に上げている。

```powershell
git pull --rebase; git push
```

公開ページ（https://machino-ai.jp/ad-games/ ）には、push から1〜2分で反映される。

### 遊んで確かめる

```powershell
cd $env:USERPROFILE\Desktop\ad-games; python -m http.server 8797
```

ブラウザで http://localhost:8797/select.html を開く。止めるときは PowerShell で Ctrl+C。

Claude Code なら「アプリを起動して」と頼めば、`.claude/launch.json` の設定で立ち上げてくれる。

---

## 気をつけること

- **同時に同じファイルを触らない。** 別PC・別セッションでも同じファイルを直していることがある。始める前に「今これを直す」と伝え、終わったら「上げた」と伝える
- **こまめに push する。** 手元に長く抱えるほど、ぶつかったときの整理が大変になる
- **Million March の原本もこのリポジトリ。** 4th PC の `40_広告ゲーム_自分が向かう` は古い作業場所なので触らない
- **ランキングのデプロイはオーナーのGoogleアカウントで。** サーバー側（`ranking-gas.js`）を直したときは、Apps Script への貼り直しと再デプロイが要る（`CLAUDE.md` のランキングの項）
- 素材（`assets/`）は重いので、新しい画像を足すときは WebP か JPEG にして、必要なサイズまで縮めてから入れる

## 困ったとき

| 症状 | 対処 |
|---|---|
| `git pull` で「競合（conflict）」と出た | Claude に「競合を直して」と頼む。中身を見て、両方の変更を残す形に直す |
| push が rejected | `git pull --rebase` してから push |
| ゲーム画面が真っ暗 | ブラウザのコンソールにエラーが出ていないか見る。素材の読み込みに失敗していることが多い |
| 公開ページに反映されない | push できているか確認（`git log origin/main -1`）。1〜2分待ってから、ブラウザを強制再読み込み（Ctrl+Shift+R） |
