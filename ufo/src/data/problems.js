(() => {
  "use strict";

  const stageNames = window.MathFitStages?.stageNames || {};

  /**
   * @typedef {Object} Problem
   * @property {string} id
   * @property {string=} title
   * @property {string} question
   * @property {string} answer
   * @property {number} level
   * @property {string} topic
   * @property {string[]} tags
   * @property {string=} trap
   * @property {string=} viewpoint
   * @property {string=} hint
   * @property {string[]=} solution
   * @property {string[]=} nextProblemIds
   */

  function createStageOneQuestionPool() {
    return [
      ...createStageOneOperationQuestionPool("addition", "+", stageNames.stageOne),
      ...createStageOneOperationQuestionPool("subtraction", "-", stageNames.stageOne),
      ...createStageOneOperationQuestionPool("multiplication", "×", stageNames.stageOne),
      ...createStageOneOperationQuestionPool("division", "÷", stageNames.stageOne),
    ];
  }

  function createStageOneAdditionQuestionPool() {
    return createStageOneOperationQuestionPool("addition", "+", stageNames.stageOneAddition);
  }

  function createStageOneSubtractionQuestionPool() {
    return createStageOneOperationQuestionPool("subtraction", "-", stageNames.stageOneSubtraction);
  }

  function createStageOneMultiplicationQuestionPool() {
    return createStageOneOperationQuestionPool("multiplication", "×", stageNames.stageOneMultiplication);
  }

  function createStageOneDivisionQuestionPool() {
    return createStageOneOperationQuestionPool("division", "÷", stageNames.stageOneDivision);
  }

  function createStageOneMultiplicationDivisionQuestionPool() {
    return [
      ...createStageOneMultiplicationQuestionPool(),
      ...createStageOneOperationQuestionPool("division", "÷", stageNames.stageOneMultiplication),
    ];
  }

  function createStageOneOperationQuestionPool(operation, symbol, stage) {
    const pool = [];

    for (let a = 0; a <= 9; a += 1) {
      for (let b = 0; b <= 9; b += 1) {
        if (operation === "addition") {
          if (a === 0 || b === 0) {
            continue;
          }

          addStageOneQuestion(pool, operation, a, b, a + b, symbol, stage);
        }

        if (operation === "subtraction") {
          if (a === 0 || b === 0 || a - b === 0) {
            continue;
          }

          addStageOneQuestion(pool, operation, a, b, a - b, symbol, stage);
        }

        if (operation === "multiplication") {
          if (a <= 1 || b <= 1) {
            continue;
          }

          addStageOneQuestion(pool, operation, a, b, a * b, symbol, stage);
        }

        if (operation === "division" && a > 1 && b > 1 && a !== b && a % b === 0) {
          addStageOneQuestion(pool, operation, a, b, a / b, symbol, stage);
        }
      }
    }

    return pool;
  }

  function createCarryQuestionPool() {
    return [
      ...createCarryAdditionQuestionPool(),
      ...createCarryMultiplicationQuestionPool(),
    ];
  }

  function createCarryAdditionQuestionPool() {
    const pool = [];

    for (let a = 0; a <= 9; a += 1) {
      for (let b = 0; b <= 9; b += 1) {
        if (a + b >= 10) {
          addDeckQuestion(pool, "addition", a, b, a + b, "+", stageNames.carryAddition);
        }
      }
    }

    return pool;
  }

  function createCarryMultiplicationQuestionPool() {
    const pool = [];

    for (let a = 0; a <= 9; a += 1) {
      for (let b = 0; b <= 9; b += 1) {
        if (a * b >= 10) {
          addDeckQuestion(pool, "multiplication", a, b, a * b, "×", stageNames.carryMultiplication);
        }
      }
    }

    return pool;
  }

  function createTwoDigitOneDigitQuestionPool() {
    return [
      ...createBorrowSubtractionQuestionPool(),
      ...createBorrowDivisionQuestionPool(),
    ];
  }

  function createTwoDigitOneDigitSubtractionQuestionPool() {
    return createBorrowSubtractionQuestionPool();
  }

  function createTwoDigitOneDigitDivisionQuestionPool() {
    return createBorrowDivisionQuestionPool();
  }

  function createBorrowSubtractionQuestionPool() {
    const pool = [];

    for (let a = 10; a <= 99; a += 1) {
      for (let b = 0; b <= 9; b += 1) {
        const answer = a - b;
        if (answer >= 0 && answer <= 9) {
          addDeckQuestion(pool, "subtraction", a, b, answer, "-", stageNames.borrowSubtraction);
        }
      }
    }

    return pool;
  }

  function createBorrowDivisionQuestionPool() {
    const pool = [];

    for (let a = 10; a <= 99; a += 1) {
      for (let b = 1; b <= 9; b += 1) {
        if (a % b !== 0) {
          continue;
        }

        const answer = a / b;
        if (answer >= 0 && answer <= 9) {
          addDeckQuestion(pool, "division", a, b, answer, "÷", stageNames.borrowDivision);
        }
      }
    }

    return pool;
  }

  function createTwoDigitTwoDigitQuestionPool() {
    return [
      ...createTwoDigitTwoDigitSubtractionQuestionPool(),
      ...createTwoDigitTwoDigitDivisionQuestionPool(),
    ];
  }

  function createTwoDigitTwoDigitSubtractionQuestionPool() {
    const pool = [];

    for (let a = 10; a <= 99; a += 1) {
      for (let b = 10; b <= 99; b += 1) {
        const answer = a - b;
        if (answer >= 0 && answer <= 9 && Math.floor(a / 10) !== Math.floor(b / 10)) {
          addDeckQuestion(pool, "subtraction", a, b, answer, "-", stageNames.twoDigitTwoDigitSubtraction);
        }
      }
    }

    return pool;
  }

  function createTwoDigitTwoDigitDivisionQuestionPool() {
    const pool = [];

    for (let a = 10; a <= 99; a += 1) {
      for (let b = 10; b <= 99; b += 1) {
        if (a % b !== 0) {
          continue;
        }

        const answer = a / b;
        if (answer >= 2 && answer <= 9 && !hasRoundTenOrRepdigit(a, b)) {
          addDeckQuestion(pool, "division", a, b, answer, "÷", stageNames.twoDigitTwoDigitDivision);
        }
      }
    }

    return pool;
  }

  function createTwoDigitMixQuestionPool() {
    return [
      ...createTwoDigitMixAdditionQuestionPool(),
      ...createTwoDigitMixSubtractionQuestionPool(),
      ...createTwoDigitMixMultiplicationQuestionPool(),
      ...createTwoDigitMixDivisionQuestionPool(),
    ];
  }

  function createTwoDigitMixAdditionQuestionPool(stage = stageNames.twoDigitMixAddition) {
    return createTwoDigitMixOperationQuestionPool("addition", stage);
  }

  function createTwoDigitMixSubtractionQuestionPool(stage = stageNames.twoDigitMixSubtraction) {
    return createTwoDigitMixOperationQuestionPool("subtraction", stage);
  }

  function createTwoDigitMixMultiplicationQuestionPool(stage = stageNames.twoDigitMixMultiplication) {
    return createTwoDigitMixOperationQuestionPool("multiplication", stage);
  }

  function createTwoDigitMixDivisionQuestionPool(stage = stageNames.twoDigitMixDivision) {
    return createTwoDigitMixOperationQuestionPool("division", stage);
  }

  function createTwoDigitMixOperationQuestionPool(operation, stage = getTwoDigitMixStageName(operation)) {
    const pool = [];

    for (let twoDigit = 10; twoDigit <= 99; twoDigit += 1) {
      for (let oneDigit = 0; oneDigit <= 9; oneDigit += 1) {
        if (operation === "addition") {
          if (oneDigit === 0 || (twoDigit % 10) + oneDigit < 10) {
            continue;
          }

          addTwoDigitMixQuestions(pool, twoDigit, oneDigit, operation, stage);
          continue;
        }

        if (operation === "subtraction") {
          if (oneDigit === 0 || (twoDigit % 10) >= oneDigit) {
            continue;
          }

          addTwoDigitMixQuestions(pool, twoDigit, oneDigit, operation, stage);
          continue;
        }

        if (operation === "multiplication") {
          if (oneDigit <= 1) {
            continue;
          }

          addTwoDigitMixQuestions(pool, twoDigit, oneDigit, operation, stage);
          continue;
        }

        if (operation === "division") {
          if (oneDigit <= 1) {
            continue;
          }

          addTwoDigitMixQuestions(pool, twoDigit, oneDigit, operation, stage);
          continue;
        }

        addTwoDigitMixQuestions(pool, twoDigit, oneDigit, operation, stage);
        addTwoDigitMixQuestions(pool, oneDigit, twoDigit, operation, stage);
      }
    }

    return pool;
  }

  function hasRoundTenOrRepdigit(a, b) {
    return isRoundTen(a) || isRoundTen(b) || isRepdigit(a) || isRepdigit(b);
  }

  function isRoundTen(value) {
    return value % 10 === 0;
  }

  function isRepdigit(value) {
    return Math.floor(value / 10) === value % 10;
  }

  function addTwoDigitMixQuestions(pool, a, b, targetOperation = null, stage = getTwoDigitMixStageName(targetOperation)) {
    if (!targetOperation || targetOperation === "addition") {
      addTwoDigitAnswerQuestion(pool, "addition", a, b, a + b, "+", stage);
    }

    if (!targetOperation || targetOperation === "subtraction") {
      addTwoDigitAnswerQuestion(pool, "subtraction", a, b, a - b, "-", stage);
    }

    if (!targetOperation || targetOperation === "multiplication") {
      addTwoDigitAnswerQuestion(pool, "multiplication", a, b, a * b, "×", stage);
    }

    if ((!targetOperation || targetOperation === "division") && b !== 0 && a % b === 0) {
      addTwoDigitAnswerQuestion(pool, "division", a, b, a / b, "÷", stage);
    }
  }

  function getTwoDigitMixStageName(operation) {
    const stageByOperation = {
      addition: stageNames.twoDigitMixAddition,
      subtraction: stageNames.twoDigitMixSubtraction,
      multiplication: stageNames.twoDigitMixMultiplication,
      division: stageNames.twoDigitMixDivision,
    };
    return stageByOperation[operation] || stageNames.twoDigitMixAddition || "Stage 5";
  }

  function addTwoDigitAnswerQuestion(pool, operation, a, b, answer, symbol, stage = getTwoDigitMixStageName(operation)) {
    if (!Number.isInteger(answer) || answer < 10 || answer > 99) {
      return;
    }

    addDeckQuestion(pool, operation, a, b, answer, symbol, stage);
  }

  function createTwoDigitTwinQuestionPool() {
    const pool = [];

    for (let a = 10; a <= 99; a += 1) {
      for (let b = 10; b <= 99; b += 1) {
        addTwoDigitTwinQuestion(pool, "addition", a, b, a + b, "+");
        addTwoDigitTwinQuestion(pool, "subtraction", a, b, a - b, "-");
        addTwoDigitTwinQuestion(pool, "multiplication", a, b, a * b, "×");

        if (a % b === 0) {
          addTwoDigitTwinQuestion(pool, "division", a, b, a / b, "÷");
        }
      }
    }

    return pool;
  }

  function addTwoDigitTwinQuestion(pool, operation, a, b, answer, symbol) {
    if (!Number.isInteger(answer) || answer < 10 || answer > 99) {
      return;
    }

    addDeckQuestion(pool, operation, a, b, answer, symbol, stageNames.twoDigitTwin);
  }

  function createThreeDigitJumpQuestionPool() {
    const pool = [];

    for (let a = 10; a <= 99; a += 1) {
      for (let b = 10; b <= 99; b += 1) {
        const answer = a + b;
        if (answer >= 100 && answer <= 999) {
          addDeckQuestion(pool, "addition", a, b, answer, "+", stageNames.threeDigitJump);
        }
      }
    }

    for (let a = 100; a <= 999; a += 1) {
      for (let b = 10; b <= 99; b += 1) {
        const answer = a - b;
        if (answer >= 10 && answer <= 99) {
          addDeckQuestion(pool, "subtraction", a, b, answer, "-", stageNames.threeDigitJump);
        }
      }
    }

    for (let a = 10; a <= 99; a += 1) {
      for (let b = 1; b <= 9; b += 1) {
        const answer = a * b;
        if (answer >= 100 && answer <= 999) {
          addDeckQuestion(pool, "multiplication", a, b, answer, "×", stageNames.threeDigitJump);
        }
      }
    }

    for (let a = 100; a <= 999; a += 1) {
      for (let b = 1; b <= 9; b += 1) {
        if (a % b !== 0) {
          continue;
        }

        const answer = a / b;
        if (answer >= 10 && answer <= 99) {
          addDeckQuestion(pool, "division", a, b, answer, "÷", stageNames.threeDigitJump);
        }
      }
    }

    return pool;
  }

  function createPowerQuestionPool() {
    const pool = [];

    for (let base = 0; base <= 100; base += 1) {
      addPowerQuestion(pool, base, 2);
    }

    for (let base = 0; base <= 10; base += 1) {
      addPowerQuestion(pool, base, 3);
      addPowerQuestion(pool, base, 4);
    }

    return pool;
  }

  function addPowerQuestion(pool, base, factorCount) {
    pushProblem(pool, {
      operation: "multiplication",
      answer: Math.pow(base, factorCount),
      text: Array(factorCount).fill(base).join(" × "),
      stage: stageNames.power,
      level: 8,
      tags: ["power", `${factorCount}-factors`],
      viewpoint: "同じ数を何回かかける構造を見る",
    });
  }

  function addStageOneQuestion(pool, operation, a, b, answer, symbol, stage) {
    if (!Number.isInteger(answer) || answer < 0 || answer > 9) {
      return;
    }

    addDeckQuestion(pool, operation, a, b, answer, symbol, stage || stageNames.stageOne);
  }

  function addDeckQuestion(pool, operation, a, b, answer, symbol, stage) {
    pushProblem(pool, {
      operation,
      answer,
      text: `${a} ${symbol} ${b}`,
      stage,
      level: inferLevel(stage),
      tags: [operation, stage || "diagnosis"].filter(Boolean),
      viewpoint: inferViewpoint(operation),
    });
  }

  function pushProblem(pool, question) {
    const problem = {
      id: createProblemId(question),
      title: question.stage,
      question: question.text,
      answer: String(question.answer),
      level: question.level || 1,
      topic: question.operation,
      tags: question.tags || [question.operation],
      trap: question.trap,
      viewpoint: question.viewpoint,
      hint: question.hint,
      solution: question.solution,
      nextProblemIds: question.nextProblemIds,
      operation: question.operation,
      text: question.text,
      stage: question.stage,
    };
    problem.numericAnswer = question.answer;
    problem.answer = question.answer;
    pool.push(problem);
  }

  function createProblemId(question) {
    return [
      question.stage || "adaptive",
      question.operation,
      question.text,
    ]
      .join("|")
      .replace(/\s+/g, "")
      .replace(/[^\w\u3040-\u30ff\u3400-\u9fff-]+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();
  }

  function inferLevel(stage) {
    const entries = Object.entries(stageNames);
    const foundIndex = entries.findIndex(([, name]) => name === stage);
    return foundIndex >= 0 ? foundIndex + 1 : 1;
  }

  function inferViewpoint(operation) {
    const viewpoints = {
      addition: "数を合わせる",
      subtraction: "差と残りを見る",
      multiplication: "同じまとまりを見る",
      division: "同じ大きさに分ける",
    };
    return viewpoints[operation] || "計算構造を見る";
  }

  window.MathFitProblems = {
    createStageOneQuestionPool,
    createStageOneAdditionQuestionPool,
    createStageOneSubtractionQuestionPool,
    createStageOneMultiplicationQuestionPool,
    createStageOneDivisionQuestionPool,
    createStageOneMultiplicationDivisionQuestionPool,
    createCarryQuestionPool,
    createCarryAdditionQuestionPool,
    createCarryMultiplicationQuestionPool,
    createBorrowSubtractionQuestionPool,
    createBorrowDivisionQuestionPool,
    createTwoDigitOneDigitQuestionPool,
    createTwoDigitOneDigitSubtractionQuestionPool,
    createTwoDigitOneDigitDivisionQuestionPool,
    createTwoDigitTwoDigitQuestionPool,
    createTwoDigitTwoDigitSubtractionQuestionPool,
    createTwoDigitTwoDigitDivisionQuestionPool,
    createTwoDigitMixQuestionPool,
    createTwoDigitMixAdditionQuestionPool,
    createTwoDigitMixSubtractionQuestionPool,
    createTwoDigitMixMultiplicationQuestionPool,
    createTwoDigitMixDivisionQuestionPool,
    createTwoDigitTwinQuestionPool,
    createThreeDigitJumpQuestionPool,
    createPowerQuestionPool,
  };
})();
