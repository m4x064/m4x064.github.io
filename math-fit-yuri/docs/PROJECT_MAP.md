# Math Flight Project Map

今後 Codex が迷わず小さく触るための地図です。ゲーム本体はまだ `script.js` が中心ですが、問題、診断、入力、音、保存は少しずつ `src/` に分けています。

## 主要ファイル

- `index.html`
  - タイトル、クイズ、ポーズ、ガイド、結果画面の DOM を持ちます。
  - ステージボタン本体は `#missionButtonStack` に JS が自動生成します。

- `styles.css`
  - 全画面の見た目、PC/スマホ調整、入力欄、ステージ進捗、BGM UI を担当します。

- `script.js`
  - 画面遷移、ゲーム状態、DOM更新、回答判定、結果表示の中心です。
  - 今後は新しいデータやロジックをなるべくここへ増やさず、`src/` 側へ寄せます。

- `src/data/stages.js`
  - ステージ名、ボタン表示、問題数、問題プール、進捗保存対象を定義します。
  - 通常のステージ追加では、まずここを触ります。

- `src/data/problems.js`
  - 各ステージの問題プール生成を担当します。
  - `operation`, `answer`, `text`, `stage` を持つ既存形式を維持します。

- `src/data/rewards.js`
  - 正解数に応じた YURI Lv とごほうびアイテムを定義します。

- `src/logic/inputNotation.js`
  - `p -> π`, `r...\\ -> √(...)` などの入力記法を扱います。
  - 表示用 pretty input と判定用 input を分ける場所です。

- `src/logic/diagnosis.js`
  - 正答率、平均時間、強み、弱み、注意タグ、次の一手を計算します。

- `src/logic/resultMessages.js`
  - 結果画面の文章を生成します。

- `src/logic/rewardMessages.js`
  - ごほうび解放や成長表示の文章を生成します。

- `src/logic/soundEffects.js`
  - 正解音、不正解音、音声アンロックを担当します。

- `src/logic/bgmPlayer.js`
  - BGM一覧、音量保存、フェード付きループ、画面遷移後の継続再生を担当します。

- `src/storage/progressStorage.js`
  - localStorage のキーと読み書きを担当します。
  - `script.js` は直接 localStorage を触らず、このAPIを入口にします。

- `tools/check-stage-summary.js`
  - ステージ定義と問題数の確認用スクリプトです。

## ゲームの流れ

1. `index.html` が `src/` の補助ファイルを読みます。
2. `script.js` が DOM を取得し、イベントを登録します。
3. `renderStageButtons()` が `src/data/stages.js` からステージボタンを作ります。
4. タイトルでステージを選ぶと `startGame(mode)` が走ります。
5. `createQuestionDeck(mode)` がステージ定義を見て問題デッキを作ります。
6. `nextQuestion()` が問題を表示します。
7. 入力欄やボタンは raw input を保持し、pretty input を別表示します。
8. `handleAnswer()` が `parseAnswer()` で数値化し、正誤を判定します。
9. 正誤、時間、連続正解、スキル、進捗、保存データを更新します。
10. 終了時に `showResults()` が診断と結果文を表示します。

## 問題追加で触る場所

優先:

- `src/data/stages.js`
- `src/data/problems.js`

通常のデッキ型ステージなら、`script.js` や `index.html` へ手書きボタンを足さないでください。
追加後は `node .\tools\check-stage-summary.js` を実行します。

## 診断ロジックを変える場所

- 計算: `src/logic/diagnosis.js`
- 結果文章: `src/logic/resultMessages.js`
- 結果画面の DOM 反映だけ必要な場合: `script.js`

## UIを変える場所

- DOM構造: `index.html`
- 見た目: `styles.css`
- 画面遷移や表示値: `script.js`
- 入力表示のルート上線: `styles.css` の `.sqrt-expression`, `.sqrt-radicand`

## 保存を変える場所

- キーと保存API: `src/storage/progressStorage.js`
- 保存内容の組み立て: `script.js` の `saveSession()`, `saveProfile()`, `saveStageProgress()`
- BGM保存: `src/logic/bgmPlayer.js`

既存の localStorage キー名は勝手に変えないでください。

## 破綻しやすい場所

- `script.js` がまだ大きく、画面遷移と状態管理が集まっています。
- `styles.css` も大きいので、次に大きなUI変更をする前に画面単位コメントや分割を考えます。
- 問題データは分離済みですが、診断用の `trap`, `viewpoint`, `solution` はまだ育成途中です。
- Stage 7 は問題数が多いので、スマホ向けには開始時生成やキャッシュ方針を守ります。
