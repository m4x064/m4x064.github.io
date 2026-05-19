(() => {
  "use strict";

  /**
   * @typedef {Object} DiagnosisResult
   * @property {number} total
   * @property {number} correct
   * @property {number} accuracy
   * @property {number} averageTime
   * @property {string[]} strongTags
   * @property {string[]} weakTags
   * @property {string[]} mistakeTypes
   * @property {number} currentLevel
   * @property {string} nextStep
   * @property {string} comment
   */

  function buildDiagnosisResult({
    score,
    questionTotal,
    totalTime,
    timeLimitReached,
    history,
    skills,
    level,
    fastSeconds,
    operationLabels,
  }) {
    const answeredCount = Array.isArray(history) ? history.length : 0;
    const total = Math.max(1, Number(questionTotal || answeredCount || 1));
    const correct = Number(score || 0);
    const averageTimeDivisor = timeLimitReached ? Math.max(1, answeredCount) : total;
    const averageTime = Number(totalTime || 0) / averageTimeDivisor;
    const strongTags = getStrongTags(skills, fastSeconds);
    const weakTags = getWeakTags(skills, 1);
    const mistakeTypes = getMistakeTypes(skills, fastSeconds);
    const accuracy = Math.round((correct / total) * 100);
    const nextStep = createNextStep({ weakTags, mistakeTypes, operationLabels, accuracy, level, fastSeconds });

    return {
      total,
      correct,
      accuracy,
      averageTime,
      strongTags,
      weakTags,
      mistakeTypes,
      currentLevel: Number(level || 1),
      nextStep,
      comment: createComment({ accuracy, averageTime, weakTags, operationLabels, fastSeconds }),
    };
  }

  function getWeakTags(skills = {}, minTotal = 1) {
    let weakest = null;
    let weakestRate = 1;

    Object.entries(skills).forEach(([name, skill]) => {
      if (Number(skill.total || 0) < minTotal) {
        return;
      }

      const rate = Number(skill.correct || 0) / Math.max(1, Number(skill.total || 0));
      if (rate < weakestRate) {
        weakest = name;
        weakestRate = rate;
      }
    });

    return weakest !== null && weakestRate < 0.8 ? [weakest] : [];
  }

  function getStrongTags(skills = {}, fastSeconds = 6) {
    return Object.entries(skills)
      .filter(([, skill]) => Number(skill.total || 0) > 0)
      .filter(([, skill]) => {
        const total = Math.max(1, Number(skill.total || 0));
        const rate = Number(skill.correct || 0) / total;
        const average = Number(skill.time || 0) / total;
        return rate >= 0.8 && average <= fastSeconds;
      })
      .map(([name]) => name);
  }

  function getMistakeTypes(skills = {}, fastSeconds = 6) {
    return Object.entries(skills)
      .filter(([, skill]) => Number(skill.total || 0) > 0)
      .filter(([, skill]) => {
        const total = Math.max(1, Number(skill.total || 0));
        const rate = Number(skill.correct || 0) / total;
        const average = Number(skill.time || 0) / total;
        return rate < 0.7 || average > fastSeconds + 2;
      })
      .map(([name]) => name);
  }

  function createComment({ accuracy, averageTime, weakTags, operationLabels, fastSeconds }) {
    const pace = averageTime <= fastSeconds ? "テンポよく" : "じっくり";
    const weakTag = weakTags[0];

    if (!weakTag) {
      return `正答率は${accuracy}%でした。全体的に${pace}答えられています。`;
    }

    return `正答率は${accuracy}%でした。次は${operationLabels[weakTag]}を重点的に練習すると安定します。`;
  }

  function createNextStep({ weakTags, mistakeTypes, operationLabels, accuracy, level, fastSeconds }) {
    const target = weakTags[0] || mistakeTypes[0];

    if (target) {
      return `次は${operationLabels[target]}を、正確さ優先で3問連続正解するところから始めましょう。慣れたら${fastSeconds}秒以内を目標にします。`;
    }

    if (accuracy >= 80 && level >= 5) {
      return "次は分数・割合・文字式が混ざる問題に進みましょう。";
    }

    if (accuracy >= 70) {
      return "次は少しだけ数字を大きくして、同じ正確さを保つ練習です。";
    }

    return "次は整数のたし算・ひき算・かけ算を短く反復しましょう。";
  }

  window.MathFitDiagnosis = {
    buildDiagnosisResult,
    getWeakTags,
    getStrongTags,
    getMistakeTypes,
  };
})();
