# Math Flight Coding Rules

Codex が今後この数学ゲームを触るときの約束です。

## 基本

- 既存機能を壊さない。
- 大規模な作り直しをしない。
- 1回の変更で触る責務を絞る。
- データ形式と localStorage キーを勝手に変えない。
- 外部ライブラリ追加、npm install、Git操作はユーザーが頼んだときだけ。
- 変更前に関連ファイルを読む。
- 変更後は可能な範囲で `node --check` と確認スクリプトを回す。

## 1回の変更で触る範囲

- ステージ追加: `src/data/stages.js`, `src/data/problems.js`
- ごほうびデータ: `src/data/rewards.js`
- ごほうび文章: `src/logic/rewardMessages.js`
- 診断計算: `src/logic/diagnosis.js`
- 結果文章: `src/logic/resultMessages.js`
- 入力記法: `src/logic/inputNotation.js`
- 効果音: `src/logic/soundEffects.js`
- BGM: `src/logic/bgmPlayer.js`
- 保存: `src/storage/progressStorage.js`
- DOM: `index.html`
- CSS: `styles.css`
- 画面遷移や状態管理: `script.js`

複数領域を触るときは、なぜ必要かを作業報告に書きます。

## 問題データ

既存ゲームが使う最小形式:

```js
{
  operation: "addition",
  answer: 7,
  text: "3 + 4",
  stage: "Stage 1 一桁スター航路"
}
```

将来育てたい形式:

```js
{
  id: "stage-1-addition-3-4",
  title: "Stage 1 一桁スター航路",
  question: "3 + 4",
  answer: "7",
  level: 1,
  topic: "addition",
  tags: ["addition", "stage-1"],
  trap: "",
  viewpoint: "数を合わせる",
  hint: "",
  solution: [],
  nextProblemIds: []
}
```

現状は互換性のため `answer` を数値として扱う箇所があります。文字列へ変える場合は `parseAnswer()`, `handleAnswer()`, `showResults()` と保存互換性を確認します。

## ステージ追加

- まず `src/data/stages.js` にステージ定義を追加します。
- 問題生成は `src/data/problems.js` に追加します。
- 通常ステージでは `index.html` にボタンを手書きしません。
- `script.js` の `missionNames`, `stageProgressModes`, `createQuestionDeck()` へ直接足さない方針です。
- 追加後は `node .\tools\check-stage-summary.js` を通します。

## localStorage

- キーは `src/storage/progressStorage.js` の `keys` に集約します。
- キー名を勝手に変更しません。
- `script.js` から直接 `localStorage` を呼びません。

使う入口:

```js
MathFitStorage.loadSession()
MathFitStorage.saveSession(session)
MathFitStorage.removeSession()
MathFitStorage.loadProfile()
MathFitStorage.saveProfile(profile)
MathFitStorage.loadStageProgress()
MathFitStorage.saveStageProgress(stageProgress)
MathFitStorage.loadProgress()
MathFitStorage.saveProgress(progress)
MathFitStorage.resetProgress()
MathFitStorage.loadJson(key)
MathFitStorage.saveJson(key, value)
MathFitStorage.removeJson(key)
```

## 数式入力記法

- raw input は `state.answerRawInput` に保持します。
- 表示用 pretty input と判定用 input を分けます。
- 記法変更は `src/logic/inputNotation.js` から始めます。
- 既存仕様:
  - `p` は `π`
  - `r` はルート開始
  - `\` はルート終了
  - ルートを閉じる前は `√(` を見せ、閉じた後はカッコを消して上線で表します。
- 将来拡張:
  - `^` は累乗
  - `/` は分数表示
  - ネストしたルート

## CSS

- 既存クラス名をできるだけ再利用します。
- 状態クラスは `is-` で始めます。
- 画面単位の調整は `body.screen-quiz` のような画面クラスを使います。
- ボタン分類は `data-key-type="digit|symbol|action"` を使います。
- カードを入れ子にしすぎず、スマホで文字がはみ出ないことを確認します。

## 確認コマンド

```powershell
node --check .\script.js
node --check .\src\data\stages.js
node --check .\src\data\problems.js
node --check .\src\data\rewards.js
node --check .\src\logic\inputNotation.js
node --check .\src\logic\diagnosis.js
node --check .\src\logic\resultMessages.js
node --check .\src\logic\rewardMessages.js
node --check .\src\logic\soundEffects.js
node --check .\src\logic\bgmPlayer.js
node --check .\src\storage\progressStorage.js
node .\tools\check-stage-summary.js
```

手動確認:

- タイトル画面が開く
- ステージが開始できる
- PC入力とスマホ入力が崩れない
- `r23\` がルート表示になる
- 正解、不正解、次へが動く
- Escやタイトル戻りで進捗が保存される
- 結果画面からタイトルに戻れる
- 保存データの書き出し、読み込みが動く
