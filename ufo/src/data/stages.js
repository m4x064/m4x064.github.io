(() => {
  "use strict";

  const stageNames = {
    stageOne: "Stage 1 一桁どうし基礎",
    carry: "Stage 2 繰り上がり入口",
    twoDigitOneDigit: "Stage 3 二桁一桁スリム",
    twoDigitTwoDigit: "Stage 4 二桁どうしペア",
    twoDigitMix: "Stage 5 二桁一桁ミックス",
    twoDigitTwin: "Stage 6 二桁どうしツイン",
    threeDigitJump: "Stage 7 三桁ジャンプ",
    power: "Stage 8 同じ数かけ算",
    review: "Test 1 Stage 1-5 復習診断",
  };

  const stageOrder = [
    "adaptive",
    "stageOne",
    "carry",
    "twoDigitOneDigit",
    "twoDigitTwoDigit",
    "twoDigitMix",
    "twoDigitTwin",
    "threeDigitJump",
    "power",
    "review",
  ];

  const stageConfigs = {
    adaptive: {
      mode: "adaptive",
      title: "10問診断ミッション",
      description: "分数・割合・文字式の入口までを短く診断します。",
      buttonId: "diagnosisStartButton",
      buttonClass: "primary-button",
      usesDeck: false,
      trackProgress: false,
      questionTotal: 10,
    },
    stageOne: {
      mode: "stageOne",
      title: "Stage 1 一桁スター航路",
      dataName: stageNames.stageOne,
      description: "一桁どうし、答えが一桁に収まる四則演算。",
      buttonId: "stageOneStartButton",
      buttonClass: "secondary-button",
      usesDeck: true,
      trackProgress: true,
      questionTotal: "pool",
      expectedPoolSize: 184,
      poolFactory: "createStageOneQuestionPool",
    },
    carry: {
      mode: "carry",
      title: "Stage 2 繰り上がりジャンプ航路",
      dataName: stageNames.carry,
      description: "一桁どうしで繰り上がり・二桁答えになる入口。",
      buttonId: "carryStartButton",
      buttonClass: "secondary-button",
      usesDeck: true,
      trackProgress: true,
      questionTotal: "pool",
      expectedPoolSize: 103,
      poolFactory: "createCarryQuestionPool",
    },
    twoDigitOneDigit: {
      mode: "twoDigitOneDigit",
      title: "Stage 3 二桁スリム航路",
      dataName: stageNames.twoDigitOneDigit,
      description: "二桁と一桁のひき算・わり算で答えが一桁。",
      buttonId: "twoDigitOneDigitStartButton",
      buttonClass: "secondary-button",
      usesDeck: true,
      trackProgress: true,
      questionTotal: "pool",
      expectedPoolSize: 103,
      poolFactory: "createTwoDigitOneDigitQuestionPool",
    },
    twoDigitTwoDigit: {
      mode: "twoDigitTwoDigit",
      title: "Stage 4 二桁ペア航路",
      dataName: stageNames.twoDigitTwoDigit,
      description: "二桁どうしのひき算・わり算で答えが一桁。",
      buttonId: "twoDigitTwoDigitStartButton",
      buttonClass: "secondary-button",
      usesDeck: true,
      trackProgress: true,
      questionTotal: "pool",
      expectedPoolSize: 1051,
      poolFactory: "createTwoDigitTwoDigitQuestionPool",
    },
    twoDigitMix: {
      mode: "twoDigitMix",
      title: "Stage 5 二桁ミックス航路",
      dataName: stageNames.twoDigitMix,
      description: "二桁と一桁、一桁と二桁の四則演算で答えが二桁。",
      buttonId: "twoDigitMixStartButton",
      buttonClass: "secondary-button",
      usesDeck: true,
      trackProgress: true,
      questionTotal: "pool",
      expectedPoolSize: 3153,
      poolFactory: "createTwoDigitMixQuestionPool",
    },
    twoDigitTwin: {
      mode: "twoDigitTwin",
      title: "Stage 6 二桁ツイン航路",
      dataName: stageNames.twoDigitTwin,
      description: "二桁どうしの四則演算で答えが二桁。",
      buttonId: "twoDigitTwinStartButton",
      buttonClass: "secondary-button",
      usesDeck: true,
      trackProgress: true,
      questionTotal: "pool",
      expectedPoolSize: 6480,
      poolFactory: "createTwoDigitTwinQuestionPool",
    },
    threeDigitJump: {
      mode: "threeDigitJump",
      title: "Stage 7 三桁ジャンプ航路",
      dataName: stageNames.threeDigitJump,
      description: "二桁から三桁、三桁から二桁へまたぐ四則演算。",
      buttonId: "threeDigitJumpStartButton",
      buttonClass: "secondary-button",
      usesDeck: true,
      trackProgress: true,
      questionTotal: "pool",
      expectedPoolSize: 10948,
      poolFactory: "createThreeDigitJumpQuestionPool",
    },
    power: {
      mode: "power",
      title: "Stage 8 同じ数かけ算航路",
      dataName: stageNames.power,
      description: "0〜100の二乗、0〜10の三乗・四乗。",
      buttonId: "powerStartButton",
      buttonClass: "secondary-button",
      usesDeck: true,
      trackProgress: true,
      questionTotal: "pool",
      expectedPoolSize: 123,
      poolFactory: "createPowerQuestionPool",
      startDetail: "式は「12 × 12」みたいに出すよ。",
    },
    review: {
      mode: "review",
      title: "Test 1 Stage 1-5 復習診断",
      dataName: stageNames.review,
      description: "Stage 1〜5から時間制限つきでランダム10問。",
      buttonId: "reviewStartButton",
      buttonClass: "secondary-button stage-test-button",
      usesDeck: true,
      trackProgress: true,
      questionTotal: 10,
      deckType: "review",
      reviewSourceModes: ["stageOne", "carry", "twoDigitOneDigit", "twoDigitTwoDigit", "twoDigitMix"],
      timeLimitSeconds: 60,
      startDetail: "Stage 1〜5の信号を混ぜて出すよ。",
    },
  };

  function getStageConfig(mode) {
    return stageConfigs[mode] || null;
  }

  function getStageConfigs() {
    return stageOrder.map(getStageConfig).filter(Boolean);
  }

  function getMissionNames() {
    return getStageConfigs().reduce((names, config) => {
      names[config.mode] = config.title;
      return names;
    }, {});
  }

  function getProgressModes() {
    return getStageConfigs()
      .filter((config) => config.trackProgress)
      .map((config) => config.mode);
  }

  function getDeckModes() {
    return getStageConfigs()
      .filter((config) => config.usesDeck)
      .map((config) => config.mode);
  }

  window.MathFitStages = {
    stageNames,
    stageOrder,
    stageConfigs,
    getStageConfig,
    getStageConfigs,
    getMissionNames,
    getProgressModes,
    getDeckModes,
  };
})();
