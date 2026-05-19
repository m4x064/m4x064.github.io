# Math Flight Roadmap

既存ゲームを壊さず、少しずつ育てるための段階メモです。

## Phase 1: 破綻防止

目的: どこを触ればよいか分かる状態にする。

- 問題生成を `src/data/problems.js` に寄せる。
- ステージ定義を `src/data/stages.js` に寄せる。
- ごほうびデータを `src/data/rewards.js` に寄せる。
- 診断計算を `src/logic/diagnosis.js` に寄せる。
- 結果文章を `src/logic/resultMessages.js` に寄せる。
- ごほうび文章を `src/logic/rewardMessages.js` に寄せる。
- 入力記法を `src/logic/inputNotation.js` に寄せる。
- 効果音を `src/logic/soundEffects.js` に寄せる。
- BGMを `src/logic/bgmPlayer.js` に寄せる。
- localStorage APIを `src/storage/progressStorage.js` に寄せる。
- docs を読める状態にする。

## Phase 2: 問題追加を楽にする

目的: 新ステージ追加で `script.js` を触る場所を減らす。

- `stageConfigs` をステージボタン、問題数、進捗表示の中心にする。
- `createQuestionDeck()` と問題数判定をステージ定義参照に寄せる。
- 通常ステージボタンを `src/data/stages.js` から自動生成する。
- 問題生成関数ごとの小さな確認を増やす。
- Stage 7 のような大きいプールは開始時生成とキャッシュを守る。

## Phase 3: 診断ロジック強化

目的: 正誤だけではなく、なぜ間違えたかを見えるようにする。

- `tags` を体系化する。
- `trap`, `viewpoint`, `solution` を問題データに増やす。
- `weakTags` と `mistakeTypes` をタグから計算する。
- 復習診断テストの出題比率を弱点に合わせる。
- 結果画面に「次に見る視点」を出す。

## Phase 4: 構造計算診断OS

目的: 計算問題を、数学の構造理解を診断する土台にする。

- 問題同士のつながりを `nextProblemIds` で表す。
- 苦手タグから次の問題候補を選ぶ。
- 記録をもとに復習セットを自動生成する。
- 途中式、考え方、誤答パターンを扱える形式へ育てる。

## Phase 5: 数学ゲーム化

目的: 学習進捗を、ゆーり世界観の成長として楽しく見せる。

- ごほうびアイテムをステージ進捗と結びつける。
- タイトル画面を取得済みアイテムで豪華にする。
- ミッション選択におすすめ、復習、挑戦を出す。
- BGM、効果音、演出を学習の邪魔にならない範囲で磨く。

## Phase 6: PDF教材・販売導線

目的: ゲーム内診断を教材やプリントへつなげる。

- 苦手タグからPDFプリント候補を出す。
- 診断結果から「今日の復習プリント」を作る。
- 問題データの `solution` を教材解説へ広げる。
- 販売導線やログインは最後に検討する。

## 次の小さな候補

- `script.js` の結果画面DOM更新を小さな描画関数へ分ける。
- `styles.css` に画面単位コメントを入れて整理する。
- `src/data/problems.js` の問題生成チェックをもう少し増やす。
