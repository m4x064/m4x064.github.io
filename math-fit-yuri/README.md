# Math Fit | UFOゆーりの数式ステーション

静的な HTML/CSS/JavaScript だけで動く、UFOゆーり世界観つきの数学ゲームです。
PCではキーボード入力、スマホでは画面上の入力ボタンを使います。

## 遊び方

`index.html` をブラウザで開き、タイトル画面からミッションを選びます。

PowerShell でローカルサーバーを使う場合:

```powershell
cd ..
python -m http.server 5173
```

その後、ブラウザで `http://localhost:5173/math-game-portable/` を開きます。

## 入力

- PC: キーボードで入力して Enter で回答します。
- スマホ: 画面内の数字・記号ボタンで入力します。
- `p` は `π`、`r` は `√(`、`\` はルートを閉じる入力として扱います。
- 例: `r23\` は表示上 `√23`、判定用には `√(23)` として扱います。

## ステージ

- 10問診断ミッション
- Stage 1 一桁スター航路
- Stage 2 繰り上がりジャンプ航路
- Stage 3 二桁スリム航路
- Stage 4 二桁ペア航路
- Stage 5 二桁ミックス航路
- Stage 6 二桁ツイン航路
- Stage 7 三桁ジャンプ航路
- Stage 8 同じ数かけ算航路
- Test 1 Stage 1-5 復習診断
- 四則演算ナビ

ステージ定義は `src/data/stages.js`、問題生成は `src/data/problems.js` にあります。

## ファイル構成

- `index.html`: 画面の DOM 構造
- `styles.css`: 見た目とレスポンシブ調整
- `script.js`: 画面遷移、ゲーム状態、DOM 描画の中心
- `src/data/`: ステージ、問題、ごほうびデータ
- `src/logic/`: 診断、結果文、入力記法、BGM、効果音、ごほうび文
- `src/storage/progressStorage.js`: localStorage のキーと保存API
- `tools/check-stage-summary.js`: ステージ定義と問題数の確認
- `docs/`: 今後のCodex用の地図、ルール、ロードマップ

## 保存

進行中ミッション、ステージ進捗、ゆーり成長ログ、BGM設定は `localStorage` に保存します。
直接 `localStorage` を触らず、基本的に `src/storage/progressStorage.js` の `MathFitStorage` API を使います。

主なAPI:

- `loadSession()`, `saveSession(session)`, `removeSession()`
- `loadProfile()`, `saveProfile(profile)`
- `loadStageProgress()`, `saveStageProgress(stageProgress)`
- `loadProgress()`, `saveProgress(progress)`, `resetProgress()`
- `loadJson(key)`, `saveJson(key, value)`, `removeJson(key)`

## 確認

ステージ追加後や整理後は、最低限この確認をします。

```powershell
node --check .\script.js
node --check .\src\data\stages.js
node --check .\src\data\problems.js
node --check .\src\storage\progressStorage.js
node .\tools\check-stage-summary.js
```
