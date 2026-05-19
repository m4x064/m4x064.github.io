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
    const pool = [];

    for (let a = 0; a <= 9; a += 1) {
      for (let b = 0; b <= 9; b += 1) {
        addStageOneQuestion(pool, "addition", a, b, a + b, "+");
        addStageOneQuestion(pool, "subtraction", a, b, a - b, "-");
        addStageOneQuestion(pool, "multiplication", a, b, a * b, "×");

        if (b !== 0 && a % b === 0) {
          addStageOneQuestion(pool, "division", a, b, a / b, "÷");
        }
      }
    }

    return pool;
  }

  function createCarryQuestionPool() {
    const pool = [];

    for (let a = 0; a <= 9; a += 1) {
      for (let b = 0; b <= 9; b += 1) {
        if (a + b >= 10) {
          addDeckQuestion(pool, "addition", a, b, a + b, "+", stageNames.carry);
        }

        if (a * b >= 10) {
          addDeckQuestion(pool, "multiplication", a, b, a * b, "×", stageNames.carry);
        }
      }
    }

    return pool;
  }

  function createTwoDigitOneDigitQuestionPool() {
    const pool = [];

    for (let a = 10; a <= 99; a += 1) {
      for (let b = 0; b <= 9; b += 1) {
        const answer = a - b;
        if (answer >= 0 && answer <= 9) {
          addDeckQuestion(pool, "subtraction", a, b, answer, "-", stageNames.twoDigitOneDigit);
        }
      }
    }

    for (let a = 10; a <= 99; a += 1) {
      for (let b = 1; b <= 9; b += 1) {
        if (a % b !== 0) {
          continue;
        }

        const answer = a / b;
        if (answer >= 0 && answer <= 9) {
          addDeckQuestion(pool, "division", a, b, answer, "÷", stageNames.twoDigitOneDigit);
        }
      }
    }

    return pool;
  }

  function createTwoDigitTwoDigitQuestionPool() {
    const pool = [];

    for (let a = 10; a <= 99; a += 1) {
      for (let b = 10; b <= 99; b += 1) {
        const answer = a - b;
        if (answer >= 0 && answer <= 9) {
          addDeckQuestion(pool, "subtraction", a, b, answer, "-", stageNames.twoDigitTwoDigit);
        }
      }
    }

    for (let a = 10; a <= 99; a += 1) {
      for (let b = 10; b <= 99; b += 1) {
        if (a % b !== 0) {
          continue;
        }

        const answer = a / b;
        if (answer >= 1 && answer <= 9) {
          addDeckQuestion(pool, "division", a, b, answer, "÷", stageNames.twoDigitTwoDigit);
        }
      }
    }

    return pool;
  }

  function createTwoDigitMixQuestionPool() {
    const pool = [];

    for (let twoDigit = 10; twoDigit <= 99; twoDigit += 1) {
      for (let oneDigit = 0; oneDigit <= 9; oneDigit += 1) {
        addTwoDigitMixQuestions(pool, twoDigit, oneDigit);
        addTwoDigitMixQuestions(pool, oneDigit, twoDigit);
      }
    }

    return pool;
  }

  function addTwoDigitMixQuestions(pool, a, b) {
    addTwoDigitAnswerQuestion(pool, "addition", a, b, a + b, "+");
    addTwoDigitAnswerQuestion(pool, "subtraction", a, b, a - b, "-");
    addTwoDigitAnswerQuestion(pool, "multiplication", a, b, a * b, "×");

    if (b !== 0 && a % b === 0) {
      addTwoDigitAnswerQuestion(pool, "division", a, b, a / b, "÷");
    }
  }

  function addTwoDigitAnswerQuestion(pool, operation, a, b, answer, symbol) {
    if (!Number.isInteger(answer) || answer < 10 || answer > 99) {
      return;
    }

    addDeckQuestion(pool, operation, a, b, answer, symbol, stageNames.twoDigitMix);
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

  function addStageOneQuestion(pool, operation, a, b, answer, symbol) {
    if (!Number.isInteger(answer) || answer < 0 || answer > 9) {
      return;
    }

    addDeckQuestion(pool, operation, a, b, answer, symbol, stageNames.stageOne);
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
    createCarryQuestionPool,
    createTwoDigitOneDigitQuestionPool,
    createTwoDigitTwoDigitQuestionPool,
    createTwoDigitMixQuestionPool,
    createTwoDigitTwinQuestionPool,
    createThreeDigitJumpQuestionPool,
    createPowerQuestionPool,
  };
})();
