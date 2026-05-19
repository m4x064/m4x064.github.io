(() => {
  "use strict";

  function createRewardMessages({ formatCorrectCount }) {
    function createGrowthProgressText({ unlockedCount, rewardTotal, nextReward, totalCorrect }) {
      if (!nextReward) {
        return `ごほうび ${unlockedCount}/${rewardTotal}個。1万問のグランドオービットまで解放済み。`;
      }

      return `ごほうび ${unlockedCount}/${rewardTotal}個。あと${formatCorrectCount(nextReward.correct - totalCorrect)}問正解で「${nextReward.item}」を解放。`;
    }

    function createLockedRewardName(reward) {
      return `${formatCorrectCount(reward.correct)}問で解放`;
    }

    function createUnlockComms(reward) {
      return `ごほうび解放。「${reward.item}」を手に入れたよ。`;
    }

    function createRewardResultText({ totalCorrect, currentReward, nextReward }) {
      const nextText = nextReward
        ? `次はあと${formatCorrectCount(nextReward.correct - totalCorrect)}問正解で「${nextReward.item}」。`
        : "1万問までのごほうびは全部解放済みです。";

      return `累計正解は${formatCorrectCount(totalCorrect)}問。ゆーりは YURI Lv ${currentReward.level}「${currentReward.title}」になっています。${nextText}`;
    }

    return {
      createGrowthProgressText,
      createLockedRewardName,
      createUnlockComms,
      createRewardResultText,
    };
  }

  window.MathFitRewardMessages = {
    createRewardMessages,
  };
})();
