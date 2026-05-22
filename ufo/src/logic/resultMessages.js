(() => {
  "use strict";

  function createResultMessages({ operationLabels, fastSeconds, formatTime }) {
    function createResultComms({ accuracy, weakSkill }) {
      if (accuracy >= 90) {
        return "ミッション大成功。ゆーりの航行ログにも、かなり安定して記録しておくね。";
      }

      if (weakSkill) {
        return `${operationLabels[weakSkill]}の信号が少し揺れてるよ。次はそこを短く復習しよう。`;
      }

      return "ミッション完了。次の一段が見えてきたよ。ログを見て整えていこう。";
    }

    function getResultTitle({ accuracy, level }) {
      if (accuracy >= 90 && level >= 5) {
        return "発展航路に進めるレベル";
      }
      if (accuracy >= 70) {
        return "基礎航路が安定しているレベル";
      }
      if (accuracy >= 50) {
        return "もう少し航行練習で伸びるレベル";
      }
      return "基礎ステーションから整えたいレベル";
    }

    function createResultSummary({ accuracy, averageTime, weakSkill }) {
      const pace = averageTime <= fastSeconds ? "テンポよく" : "じっくり";

      if (!weakSkill) {
        return `正答率は${accuracy}%でした。全体的に${pace}答えられています。計算の入口をバランスよく確認できています。`;
      }

      return `正答率は${accuracy}%でした。${pace}取り組めています。次は${operationLabels[weakSkill]}を重点的に練習すると、さらに安定します。`;
    }

    function createTimeLimitResultSummary({ accuracy, weakSkill, answeredCount, questionTotal, timeLimitSeconds }) {
      const weakText = weakSkill ? ` 特に${operationLabels[weakSkill]}を短く復習すると安定しそうです。` : "";

      return `${formatTime(timeLimitSeconds)}で${answeredCount}/${questionTotal}問に挑戦し、正答率は${accuracy}%でした。時間制限つきの復習ログです。${weakText}`;
    }

    function createCurrentPositionText({ accuracy, averageTime, level }) {
      if (accuracy >= 80 && level >= 5 && averageTime <= fastSeconds) {
        return "小学校高学年から中学入口の内容まで、速さと正確さがかなり安定しています。次は文章題や複合問題に進めます。";
      }

      if (accuracy >= 70) {
        return "基本計算はおおむね安定しています。小数・割合・文字式の入口を混ぜても、落ち着いて処理できる段階です。";
      }

      if (accuracy >= 50) {
        return "基本計算は部分的にできています。急に種類が変わると迷いやすいので、短い復習で土台を固める段階です。";
      }

      return "まずは整数のたし算・ひき算・かけ算・わり算を短く復習する段階です。正確さを優先して進めると伸びやすいです。";
    }

    function createStrengthText({ strongSkills }) {
      if (strongSkills.length === 0) {
        return "今回は、はっきり得意と言える分野はまだ少なめです。次回は正答率80%以上で安定する分野を増やしましょう。";
      }

      return `${strongSkills.map((name) => operationLabels[name]).join("・")}は安定しています。正答率と解答スピードの両方がよく、次のレベルへ進める候補です。`;
    }

    function createWatchText({ watchSkills }) {
      if (watchSkills.length === 0) {
        return "大きく崩れている分野はありません。未出題の分野がある場合は、次回そこで確認すると診断精度が上がります。";
      }

      return `${watchSkills.map((name) => operationLabels[name]).join("・")}は少し注意です。不正解、または時間がかかった問題があるため、基礎問題で確認するとよさそうです。`;
    }

    function createNextStepText({ accuracy, weakSkill, watchSkills, level }) {
      const target = weakSkill || watchSkills[0];

      if (target) {
        return `次は${operationLabels[target]}を、正確さ優先で3問連続正解するところから始めましょう。慣れたら8秒以内を目標にすると、次の段に進みやすくなります。`;
      }

      if (accuracy >= 80 && level >= 5) {
        return "次は分数・割合・文字式が混ざる問題に進みましょう。解き方を切り替える速さが、次の伸びしろになります。";
      }

      if (accuracy >= 70) {
        return "次は少しだけ数字を大きくして、同じ正確さを保つ練習です。速さよりも、見直しなしで当てることを目標にしましょう。";
      }

      return "次は整数のたし算・ひき算・かけ算を短く復習しましょう。土台がそろうと、小数や割合もかなり楽になります。";
    }

    return {
      createResultComms,
      getResultTitle,
      createResultSummary,
      createTimeLimitResultSummary,
      createCurrentPositionText,
      createStrengthText,
      createWatchText,
      createNextStepText,
    };
  }

  window.MathFitResultMessages = {
    createResultMessages,
  };
})();
