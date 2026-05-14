const TOTAL_QUESTIONS = 10;
const FAST_SECONDS = 6;
const STAGE_ONE_NAME = "一桁どうし基礎";
const CARRY_STAGE_NAME = "繰り上がり入口";
const TWO_DIGIT_ONE_DIGIT_STAGE_NAME = "二桁一桁スリム";
const TWO_DIGIT_TWO_DIGIT_STAGE_NAME = "二桁どうしペア";

const operationLabels = {
  addition: "たし算",
  subtraction: "ひき算",
  multiplication: "かけ算",
  division: "わり算",
  fraction: "分数",
  percent: "割合",
  algebra: "文字式",
};

const baseSkills = Object.keys(operationLabels);
const stageOneQuestionPool = createStageOneQuestionPool();
const carryQuestionPool = createCarryQuestionPool();
const twoDigitOneDigitQuestionPool = createTwoDigitOneDigitQuestionPool();
const twoDigitTwoDigitQuestionPool = createTwoDigitTwoDigitQuestionPool();
const TAP_MOVE_LIMIT = 12;
const touchInputQuery = window.matchMedia("(hover: none) and (pointer: coarse)");
const SESSION_STORAGE_KEY = "mathfit-yuri-session-v1";
const PROFILE_STORAGE_KEY = "mathfit-yuri-profile-v1";

const yuriMoods = {
  wave: "assets/yuri/extra/actions/01_wave.png",
  focus: "assets/yuri/extra/actions/13_sparkle_pose.png",
  happy: "assets/yuri/extra/actions/02_happy_bounce.png",
  surprised: "assets/yuri/extra/actions/05_surprised.png",
  talk: "assets/yuri/extra/actions/06_talk.png",
  sleepy: "assets/yuri/extra/actions/03_sleepy.png",
  victory: "assets/yuri/extra/actions/16_victory_pose.png",
};

const missionNames = {
  adaptive: "10問診断ミッション",
  stageOne: "一桁スター航路",
  carry: "繰り上がりジャンプ航路",
  twoDigitOneDigit: "二桁スリム航路",
  twoDigitTwoDigit: "二桁ペア航路",
};

const growthRewards = [
  {
    correct: 0,
    level: 1,
    title: "星の見習い",
    item: "スター航行証",
    icon: "assets/yuri/extra/items/15_friendship_heart.png",
  },
  {
    correct: 5,
    level: 2,
    title: "星くず集め",
    item: "スターコイン",
    icon: "assets/yuri/extra/items/22_star_coin.png",
  },
  {
    correct: 15,
    level: 3,
    title: "月のおやつ係",
    item: "ムーンクッキー",
    icon: "assets/yuri/extra/items/02_moon_cookie.png",
  },
  {
    correct: 30,
    level: 4,
    title: "リボン整備士",
    item: "リボンアンテナ",
    icon: "assets/yuri/extra/items/06_bow_ribbon.png",
  },
  {
    correct: 50,
    level: 5,
    title: "航行バッテリー担当",
    item: "ラベンダーバッテリー",
    icon: "assets/yuri/extra/items/04_lavender_battery.png",
  },
  {
    correct: 80,
    level: 6,
    title: "きらめき観測士",
    item: "きらめきクリスタル",
    icon: "assets/yuri/extra/items/07_sparkle_crystal.png",
  },
  {
    correct: 120,
    level: 7,
    title: "小惑星ナビゲーター",
    item: "ミニ惑星トイ",
    icon: "assets/yuri/extra/items/10_mini_planet_toy.png",
  },
  {
    correct: 180,
    level: 8,
    title: "数式ステーション長",
    item: "数式ワンド",
    icon: "assets/yuri/extra/items/24_magic_wand.png",
  },
];

const state = {
  mode: "adaptive",
  level: 1,
  score: 0,
  streak: 0,
  questionIndex: 0,
  currentQuestion: null,
  questionStartedAt: 0,
  pauseStartedAt: 0,
  isPaused: false,
  timerId: null,
  nextQuestionTimerId: null,
  awaitingNextQuestion: false,
  newReward: null,
  totalTime: 0,
  history: [],
  questionDeck: [],
  skills: createEmptySkills(),
};

const screens = {
  start: document.querySelector("#startScreen"),
  quiz: document.querySelector("#quizScreen"),
  pause: document.querySelector("#pauseScreen"),
  guide: document.querySelector("#guideScreen"),
  result: document.querySelector("#resultScreen"),
};

const elements = {
  levelText: document.querySelector("#levelText"),
  progressText: document.querySelector("#progressText"),
  scoreText: document.querySelector("#scoreText"),
  streakText: document.querySelector("#streakText"),
  timerText: document.querySelector("#timerText"),
  operationText: document.querySelector("#operationText"),
  questionText: document.querySelector("#questionText"),
  feedbackText: document.querySelector("#feedbackText"),
  answerForm: document.querySelector("#answerForm"),
  answerInput: document.querySelector("#answerInput"),
  answerSubmitButton: document.querySelector("#answerForm .answer-row button[type='submit']"),
  stopButton: document.querySelector("#stopButton"),
  numberPad: document.querySelector("#numberPad"),
  backspaceButton: document.querySelector("#backspaceButton"),
  clearAnswerButton: document.querySelector("#clearAnswerButton"),
  diagnosisStartButton: document.querySelector("#diagnosisStartButton"),
  stageOneStartButton: document.querySelector("#stageOneStartButton"),
  carryStartButton: document.querySelector("#carryStartButton"),
  twoDigitOneDigitStartButton: document.querySelector("#twoDigitOneDigitStartButton"),
  twoDigitTwoDigitStartButton: document.querySelector("#twoDigitTwoDigitStartButton"),
  operationGuideButton: document.querySelector("#operationGuideButton"),
  resumeCard: document.querySelector("#resumeCard"),
  resumeTitle: document.querySelector("#resumeTitle"),
  resumeDetail: document.querySelector("#resumeDetail"),
  startResumeButton: document.querySelector("#startResumeButton"),
  clearSaveButton: document.querySelector("#clearSaveButton"),
  growthIcon: document.querySelector("#growthIcon"),
  growthLevelText: document.querySelector("#growthLevelText"),
  totalCorrectText: document.querySelector("#totalCorrectText"),
  growthProgressBar: document.querySelector("#growthProgressBar"),
  nextRewardText: document.querySelector("#nextRewardText"),
  rewardList: document.querySelector("#rewardList"),
  resumeButton: document.querySelector("#resumeButton"),
  backToTitleButton: document.querySelector("#backToTitleButton"),
  guideBackButton: document.querySelector("#guideBackButton"),
  restartButton: document.querySelector("#restartButton"),
  resultBackToTitleButton: document.querySelector("#resultBackToTitleButton"),
  pilotMessage: document.querySelector("#pilotMessage"),
  yuriAvatar: document.querySelector("#yuriAvatar"),
  resultTitle: document.querySelector("#resultTitle"),
  resultSummary: document.querySelector("#resultSummary"),
  accuracyText: document.querySelector("#accuracyText"),
  finalLevelText: document.querySelector("#finalLevelText"),
  averageTimeText: document.querySelector("#averageTimeText"),
  currentPositionText: document.querySelector("#currentPositionText"),
  strengthText: document.querySelector("#strengthText"),
  watchText: document.querySelector("#watchText"),
  nextStepText: document.querySelector("#nextStepText"),
  resultRewardText: document.querySelector("#resultRewardText"),
  skillList: document.querySelector("#skillList"),
};

let pendingPadPress = null;
let profile = loadProfile();

configureInputMode();
if (typeof touchInputQuery.addEventListener === "function") {
  touchInputQuery.addEventListener("change", configureInputMode);
} else {
  touchInputQuery.addListener(configureInputMode);
}

elements.diagnosisStartButton.addEventListener("click", () => startGame("adaptive"));
elements.stageOneStartButton.addEventListener("click", () => startGame("stageOne"));
elements.carryStartButton.addEventListener("click", () => startGame("carry"));
elements.twoDigitOneDigitStartButton.addEventListener("click", () => startGame("twoDigitOneDigit"));
elements.twoDigitTwoDigitStartButton.addEventListener("click", () => startGame("twoDigitTwoDigit"));
elements.operationGuideButton.addEventListener("click", showOperationGuide);
elements.startResumeButton.addEventListener("click", resumeSavedSession);
elements.clearSaveButton.addEventListener("click", clearSavedSessionFromStart);
elements.resumeButton.addEventListener("click", resumeGame);
elements.backToTitleButton.addEventListener("click", returnToTitle);
elements.guideBackButton.addEventListener("click", returnToTitle);
elements.restartButton.addEventListener("click", () => startGame(state.mode));
elements.resultBackToTitleButton.addEventListener("click", returnToTitle);
elements.answerForm.addEventListener("submit", handleAnswer);
elements.answerInput.addEventListener("input", saveSession);
elements.stopButton.addEventListener("click", pauseGame);
elements.numberPad.addEventListener("pointerdown", beginNumberPadPress);
elements.numberPad.addEventListener("pointermove", trackNumberPadPress);
elements.numberPad.addEventListener("pointerup", finishNumberPadPress);
elements.numberPad.addEventListener("pointercancel", cancelNumberPadPress);
elements.numberPad.addEventListener("pointerleave", cancelNumberPadPress);
document.addEventListener("keydown", handleKeydown);
window.addEventListener("beforeunload", saveSession);
setPilotMessage("今日の計算航路を選んでね。ゆーりが横で見てるよ。", "wave");
renderProfile();
renderResumeCard();

function configureInputMode() {
  const usesTouchInput = touchInputQuery.matches;

  document.body.classList.toggle("touch-input", usesTouchInput);
  document.body.classList.toggle("keyboard-input", !usesTouchInput);
  elements.answerInput.readOnly = usesTouchInput;
  elements.answerInput.inputMode = usesTouchInput ? "none" : "decimal";
  elements.numberPad.setAttribute("aria-hidden", String(!usesTouchInput));
}

function loadProfile() {
  const savedProfile = readJson(PROFILE_STORAGE_KEY);
  const totalCorrect = Number(savedProfile?.totalCorrect || 0);

  return {
    totalCorrect: Number.isFinite(totalCorrect) ? Math.max(0, totalCorrect) : 0,
    unlockedRewards: Array.isArray(savedProfile?.unlockedRewards) ? savedProfile.unlockedRewards : [],
    lastPlayedAt: savedProfile?.lastPlayedAt || null,
  };
}

function saveProfile() {
  profile.unlockedRewards = growthRewards
    .filter((reward) => reward.correct <= profile.totalCorrect)
    .map((reward) => reward.item);
  profile.lastPlayedAt = Date.now();
  writeJson(PROFILE_STORAGE_KEY, profile);
}

function renderProfile() {
  const currentReward = getCurrentReward();
  const nextReward = getNextReward();
  const progressStart = currentReward.correct;
  const progressEnd = nextReward ? nextReward.correct : currentReward.correct;
  const progressRange = Math.max(1, progressEnd - progressStart);
  const progressValue = nextReward ? ((profile.totalCorrect - progressStart) / progressRange) * 100 : 100;

  elements.growthIcon.src = currentReward.icon;
  elements.growthLevelText.textContent = `YURI Lv ${currentReward.level} / ${currentReward.title}`;
  elements.totalCorrectText.textContent = `累計正解 ${profile.totalCorrect}`;
  elements.growthProgressBar.style.width = `${Math.max(0, Math.min(100, progressValue))}%`;
  elements.nextRewardText.textContent = nextReward
    ? `あと${nextReward.correct - profile.totalCorrect}問正解で「${nextReward.item}」を解放。`
    : "今あるごほうびは全部解放済み。次の航路を作ろう。";

  elements.rewardList.innerHTML = "";
  growthRewards.slice(1).forEach((reward) => {
    const item = document.createElement("li");
    const icon = document.createElement("img");
    const text = document.createElement("span");
    const unlocked = reward.correct <= profile.totalCorrect;

    icon.src = reward.icon;
    icon.alt = "";
    text.textContent = unlocked ? reward.item : `${reward.correct}問で解放`;
    item.className = unlocked ? "is-unlocked" : "is-locked";
    item.append(icon, text);
    elements.rewardList.append(item);
  });
}

function recordCorrectAnswer() {
  const beforeReward = getCurrentReward();
  profile.totalCorrect += 1;
  saveProfile();
  renderProfile();

  const afterReward = getCurrentReward();
  return beforeReward.item !== afterReward.item ? afterReward : null;
}

function getCurrentReward() {
  return growthRewards.reduce((current, reward) => {
    return reward.correct <= profile.totalCorrect ? reward : current;
  }, growthRewards[0]);
}

function getNextReward() {
  return growthRewards.find((reward) => reward.correct > profile.totalCorrect) || null;
}

function readJson(key) {
  try {
    const rawValue = localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch {
    return null;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    setPilotMessage("保存容量が足りないみたい。進行保存は未確認だよ。", "surprised");
  }
}

function createEmptySkills() {
  return baseSkills.reduce((skills, name) => {
    skills[name] = { correct: 0, total: 0, time: 0, level: 1 };
    return skills;
  }, {});
}

function normalizeSavedSkills(savedSkills = {}) {
  const skills = createEmptySkills();

  Object.entries(skills).forEach(([name, skill]) => {
    const savedSkill = savedSkills[name] || {};
    skill.correct = Number(savedSkill.correct || 0);
    skill.total = Number(savedSkill.total || 0);
    skill.time = Number(savedSkill.time || 0);
    skill.level = Number(savedSkill.level || 1);
  });

  return skills;
}

function startGame(mode = "adaptive") {
  clearPendingNextQuestion();
  clearSavedSession();
  state.mode = mode;
  state.level = 1;
  state.score = 0;
  state.streak = 0;
  state.questionIndex = 0;
  state.currentQuestion = null;
  state.totalTime = 0;
  state.history = [];
  state.pauseStartedAt = 0;
  state.isPaused = false;
  state.awaitingNextQuestion = false;
  state.newReward = null;
  state.questionDeck = createQuestionDeck(mode);
  setPilotMessage(`${missionNames[mode]}、出発準備完了。最初の問題へ行くよ。`, "focus");

  Object.values(state.skills).forEach((skill) => {
    skill.correct = 0;
    skill.total = 0;
    skill.time = 0;
    skill.level = 1;
  });

  showScreen("quiz");
  updateStats();
  nextQuestion();
}

function showScreen(name) {
  Object.values(screens).forEach((screen) => {
    screen.classList.remove("is-active");
  });
  screens[name].classList.add("is-active");

  requestAnimationFrame(() => {
    document.querySelector(".game-panel").scrollIntoView({ block: "start" });
  });
}

function saveSession() {
  if (!state.currentQuestion || screens.result.classList.contains("is-active")) {
    return;
  }

  writeJson(SESSION_STORAGE_KEY, {
    version: 1,
    mode: state.mode,
    level: state.level,
    score: state.score,
    streak: state.streak,
    questionIndex: state.questionIndex,
    currentQuestion: state.currentQuestion,
    questionDeck: state.questionDeck,
    totalTime: state.totalTime,
    history: state.history,
    skills: state.skills,
    awaitingNextQuestion: state.awaitingNextQuestion,
    answerValue: elements.answerInput.value,
    feedbackText: elements.feedbackText.textContent,
    feedbackClassName: elements.feedbackText.className,
    questionElapsed: state.currentQuestion && !state.awaitingNextQuestion ? getElapsedSeconds() : 0,
    savedAt: Date.now(),
  });
  renderResumeCard();
}

function loadSavedSession() {
  const savedSession = readJson(SESSION_STORAGE_KEY);
  if (!savedSession?.currentQuestion || !missionNames[savedSession.mode]) {
    return null;
  }

  return savedSession;
}

function clearSavedSession() {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    return;
  }
  renderResumeCard();
}

function clearSavedSessionFromStart() {
  clearSavedSession();
  setPilotMessage("保存していた航路を消したよ。新しいミッションを選べるよ。", "wave");
}

function renderResumeCard() {
  const savedSession = loadSavedSession();
  elements.resumeCard.hidden = !savedSession;

  if (!savedSession) {
    return;
  }

  const questionTotal = getQuestionTotalForMode(savedSession.mode);
  const visibleQuestion = Math.min(savedSession.questionIndex || 1, questionTotal);
  elements.resumeTitle.textContent = `${missionNames[savedSession.mode]}を保存中`;
  elements.resumeDetail.textContent = `${visibleQuestion} / ${questionTotal}問目、正解 ${savedSession.score || 0}、連続 ${savedSession.streak || 0}`;
}

function resumeSavedSession() {
  const savedSession = loadSavedSession();
  if (!savedSession) {
    renderResumeCard();
    setPilotMessage("保存された航路は見つからなかったよ。新しく始めよう。", "surprised");
    return;
  }

  clearPendingNextQuestion();
  clearInterval(state.timerId);
  state.mode = savedSession.mode;
  state.level = savedSession.level || 1;
  state.score = savedSession.score || 0;
  state.streak = savedSession.streak || 0;
  state.questionIndex = savedSession.questionIndex || 1;
  state.currentQuestion = savedSession.currentQuestion;
  state.questionDeck = Array.isArray(savedSession.questionDeck) ? savedSession.questionDeck : createQuestionDeck(state.mode);
  state.totalTime = savedSession.totalTime || 0;
  state.history = Array.isArray(savedSession.history) ? savedSession.history : [];
  state.skills = normalizeSavedSkills(savedSession.skills);
  state.awaitingNextQuestion = Boolean(savedSession.awaitingNextQuestion);
  state.isPaused = false;
  state.pauseStartedAt = 0;
  state.newReward = null;
  state.questionStartedAt = performance.now() - Math.max(0, Number(savedSession.questionElapsed || 0)) * 1000;

  showScreen("quiz");
  elements.operationText.textContent = operationLabels[state.currentQuestion.operation];
  elements.questionText.textContent = state.currentQuestion.text;
  elements.answerInput.value = savedSession.answerValue || "";
  elements.answerInput.disabled = state.awaitingNextQuestion;
  elements.answerSubmitButton.disabled = false;
  elements.answerSubmitButton.textContent = state.awaitingNextQuestion ? "次へ" : "答える";
  elements.feedbackText.textContent = savedSession.feedbackText || "";
  elements.feedbackText.className = savedSession.feedbackClassName || "feedback";
  updateStats();
  updateTimer();

  if (!state.awaitingNextQuestion) {
    state.timerId = setInterval(updateTimer, 100);
    elements.answerInput.focus();
    setPilotMessage(`保存した${missionNames[state.mode]}へ戻ったよ。続きからいこう。`, "focus");
  } else {
    elements.answerSubmitButton.focus();
    setPilotMessage("確認待ちのところから戻ったよ。Enterで次へ進めるよ。", "talk");
  }

  saveSession();
}

function nextQuestion() {
  clearPendingNextQuestion();
  clearInterval(state.timerId);
  state.awaitingNextQuestion = false;
  state.newReward = null;

  if (state.questionIndex >= getQuestionTotal()) {
    showResults();
    return;
  }

  state.currentQuestion = createQuestion(state.level);
  state.questionStartedAt = performance.now();
  state.isPaused = false;
  state.questionIndex += 1;

  elements.operationText.textContent = operationLabels[state.currentQuestion.operation];
  elements.questionText.textContent = state.currentQuestion.text;
  setPilotMessage(createQuestionComms(state.currentQuestion), "focus");
  elements.answerInput.value = "";
  elements.answerInput.disabled = false;
  elements.answerSubmitButton.disabled = false;
  elements.answerSubmitButton.textContent = "答える";
  elements.feedbackText.textContent = "";
  elements.feedbackText.className = "feedback";
  elements.answerInput.focus();

  updateStats();
  updateTimer();
  state.timerId = setInterval(updateTimer, 100);
  saveSession();
}

function createQuestion(level) {
  if (usesQuestionDeck() && state.questionDeck.length > 0) {
    return drawFromStageOneDeck();
  }

  const operation = chooseNextOperation(level);
  const skillLevel = Math.max(level, state.skills[operation].level);
  const max = getNumberMax(skillLevel);
  let a = randomInt(2, max);
  let b = randomInt(2, max);
  let answer = 0;
  let text = "";

  if (operation === "addition") {
    answer = a + b;
    text = `${a} + ${b}`;
  }

  if (operation === "subtraction") {
    if (b > a) {
      [a, b] = [b, a];
    }
    answer = a - b;
    text = `${a} - ${b}`;
  }

  if (operation === "multiplication") {
    const multiplierMax = Math.min(12, Math.max(4, skillLevel + 5));
    a = randomInt(2, multiplierMax);
    b = randomInt(2, multiplierMax);
    answer = a * b;
    text = `${a} × ${b}`;
  }

  if (operation === "division") {
    const divisor = randomInt(2, Math.min(12, skillLevel + 5));
    const quotient = randomInt(2, Math.min(12, skillLevel + 7));
    a = divisor * quotient;
    b = divisor;
    answer = quotient;
    text = `${a} ÷ ${b}`;
  }

  if (operation === "fraction") {
    const denominator = randomInt(3, Math.min(12, skillLevel + 5));
    const first = randomInt(1, denominator - 1);
    const second = randomInt(1, denominator - first);
    answer = (first + second) / denominator;
    text = `${first}/${denominator} + ${second}/${denominator}`;
  }

  if (operation === "percent") {
    const percents = [10, 20, 25, 50];
    if (skillLevel >= 5) {
      percents.push(5, 75);
    }
    const percent = percents[randomInt(0, percents.length - 1)];
    const whole = randomInt(2, 12) * 10;
    answer = (whole * percent) / 100;
    text = `${whole} の ${percent}%`;
  }

  if (operation === "algebra") {
    const x = randomInt(2, Math.min(14, skillLevel + 7));
    const offset = randomInt(2, Math.min(18, skillLevel + 10));
    const coefficient = skillLevel >= 5 ? randomInt(2, 4) : 1;
    answer = x;
    text = coefficient === 1 ? `x + ${offset} = ${x + offset}` : `${coefficient}x + ${offset} = ${coefficient * x + offset}`;
  }

  return { operation, answer, text };
}

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
        addDeckQuestion(pool, "addition", a, b, a + b, "+", CARRY_STAGE_NAME);
      }

      if (a * b >= 10) {
        addDeckQuestion(pool, "multiplication", a, b, a * b, "×", CARRY_STAGE_NAME);
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
        addDeckQuestion(pool, "subtraction", a, b, answer, "-", TWO_DIGIT_ONE_DIGIT_STAGE_NAME);
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
        addDeckQuestion(pool, "division", a, b, answer, "÷", TWO_DIGIT_ONE_DIGIT_STAGE_NAME);
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
        addDeckQuestion(pool, "subtraction", a, b, answer, "-", TWO_DIGIT_TWO_DIGIT_STAGE_NAME);
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
        addDeckQuestion(pool, "division", a, b, answer, "÷", TWO_DIGIT_TWO_DIGIT_STAGE_NAME);
      }
    }
  }

  return pool;
}

function addStageOneQuestion(pool, operation, a, b, answer, symbol) {
  if (!Number.isInteger(answer) || answer < 0 || answer > 9) {
    return;
  }

  pool.push({
    operation,
    answer,
    text: `${a} ${symbol} ${b}`,
    stage: STAGE_ONE_NAME,
  });
}

function addDeckQuestion(pool, operation, a, b, answer, symbol, stage) {
  pool.push({
    operation,
    answer,
    text: `${a} ${symbol} ${b}`,
    stage,
  });
}

function drawFromStageOneDeck() {
  const recentOperations = state.history.slice(-2).map((item) => item.operation);
  const repeatedOperation = recentOperations.length === 2 && recentOperations[0] === recentOperations[1]
    ? recentOperations[0]
    : null;
  const preferredIndex = repeatedOperation === null
    ? 0
    : state.questionDeck.findIndex((question) => question.operation !== repeatedOperation);
  const nextIndex = preferredIndex >= 0 ? preferredIndex : 0;
  const [question] = state.questionDeck.splice(nextIndex, 1);

  return question;
}

function shuffleQuestions(questions) {
  const shuffled = questions.map((question) => ({ ...question }));

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(0, index);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function createQuestionDeck(mode) {
  if (mode === "stageOne") {
    return shuffleQuestions(stageOneQuestionPool);
  }

  if (mode === "carry") {
    return shuffleQuestions(carryQuestionPool);
  }

  if (mode === "twoDigitOneDigit") {
    return shuffleQuestions(twoDigitOneDigitQuestionPool);
  }

  if (mode === "twoDigitTwoDigit") {
    return shuffleQuestions(twoDigitTwoDigitQuestionPool);
  }

  return [];
}

function usesQuestionDeck() {
  return state.mode === "stageOne" || state.mode === "carry" || state.mode === "twoDigitOneDigit" || state.mode === "twoDigitTwoDigit";
}

function chooseNextOperation(level) {
  const operations = avoidRepeatedOperations(getOperationsForLevel(level));
  const weakOperation = getWeakSkill(1);

  if (weakOperation && operations.includes(weakOperation) && Math.random() < 0.45) {
    return weakOperation;
  }

  const leastPracticed = operations
    .slice()
    .sort((first, second) => state.skills[first].total - state.skills[second].total)[0];

  if (leastPracticed && state.skills[leastPracticed].total === 0 && Math.random() < 0.7) {
    return leastPracticed;
  }

  return operations[randomInt(0, operations.length - 1)];
}

function avoidRepeatedOperations(operations) {
  const recentOperations = state.history.slice(-2).map((item) => item.operation);
  const isRepeating = recentOperations.length === 2 && recentOperations[0] === recentOperations[1];

  if (!isRepeating) {
    return operations;
  }

  const filtered = operations.filter((operation) => operation !== recentOperations[0]);
  return filtered.length > 0 ? filtered : operations;
}

function getOperationsForLevel(level) {
  if (level <= 2) {
    return ["addition", "subtraction", "fraction"];
  }
  if (level <= 4) {
    return ["addition", "subtraction", "multiplication", "fraction", "percent"];
  }
  return ["addition", "subtraction", "multiplication", "division", "fraction", "percent", "algebra"];
}

function getNumberMax(level) {
  return 10 + level * 8;
}

function handleAnswer(event) {
  event.preventDefault();

  if (state.awaitingNextQuestion) {
    nextQuestion();
    return;
  }

  if (state.isPaused) {
    return;
  }

  const rawAnswer = elements.answerInput.value.trim();
  if (rawAnswer === "") {
    return;
  }

  const userAnswer = parseAnswer(rawAnswer);
  if (userAnswer === null) {
    elements.feedbackText.textContent = "数字、または 1/2 のような分数で答えてください。";
    elements.feedbackText.className = "feedback is-wrong";
    elements.answerInput.select();
    return;
  }

  const elapsedSeconds = getElapsedSeconds();
  const isCorrect = Math.abs(userAnswer - state.currentQuestion.answer) < 0.001;
  const skill = state.skills[state.currentQuestion.operation];

  clearInterval(state.timerId);
  elements.answerInput.disabled = true;
  elements.answerSubmitButton.disabled = true;
  state.totalTime += elapsedSeconds;
  skill.total += 1;
  skill.time += elapsedSeconds;

  if (isCorrect) {
    state.score += 1;
    state.streak += 1;
    skill.correct += 1;
    state.newReward = recordCorrectAnswer();
  } else {
    state.streak = 0;
    state.newReward = null;
  }

  state.history.push({
    operation: state.currentQuestion.operation,
    correct: isCorrect,
    seconds: elapsedSeconds,
    level: state.level,
  });

  adjustLevel(isCorrect, elapsedSeconds, state.currentQuestion.operation);
  updateStats();
  showFeedback(isCorrect, elapsedSeconds);

  state.awaitingNextQuestion = true;
  elements.answerSubmitButton.disabled = false;
  elements.answerSubmitButton.textContent = "次へ";
  elements.answerSubmitButton.focus();
  saveSession();
}

function beginNumberPadPress(event) {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }

  pendingPadPress = {
    button,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    moved: false,
  };
}

function trackNumberPadPress(event) {
  if (!pendingPadPress || pendingPadPress.pointerId !== event.pointerId) {
    return;
  }

  const movedX = Math.abs(event.clientX - pendingPadPress.startX);
  const movedY = Math.abs(event.clientY - pendingPadPress.startY);
  if (movedX > TAP_MOVE_LIMIT || movedY > TAP_MOVE_LIMIT) {
    pendingPadPress.moved = true;
  }
}

function finishNumberPadPress(event) {
  if (!pendingPadPress || pendingPadPress.pointerId !== event.pointerId) {
    return;
  }

  const button = pendingPadPress.button;
  const shouldActivate = !pendingPadPress.moved;
  pendingPadPress = null;

  if (!shouldActivate) {
    return;
  }

  if (button.dataset.key) {
    insertAnswerText(button.dataset.key);
    return;
  }

  if (button.id === "backspaceButton") {
    backspaceAnswer();
    return;
  }

  if (button.id === "clearAnswerButton") {
    clearAnswer();
    return;
  }

  if (button.dataset.action === "submit") {
    elements.answerForm.requestSubmit();
  }
}

function cancelNumberPadPress() {
  pendingPadPress = null;
}

function insertAnswerText(text) {
  if (elements.answerInput.disabled) {
    return;
  }

  const input = elements.answerInput;
  input.value = `${input.value}${text}`;
  saveSession();
}

function clearAnswer() {
  if (elements.answerInput.disabled) {
    return;
  }

  elements.answerInput.value = "";
  saveSession();
}

function backspaceAnswer() {
  if (elements.answerInput.disabled) {
    return;
  }

  const input = elements.answerInput;
  input.value = input.value.slice(0, -1);
  saveSession();
}

function handleKeydown(event) {
  if (event.key === "Enter" && state.awaitingNextQuestion) {
    event.preventDefault();
    nextQuestion();
    return;
  }

  if (event.key !== "Escape") {
    return;
  }

  if (screens.quiz.classList.contains("is-active")) {
    pauseGame();
    return;
  }

  if (screens.pause.classList.contains("is-active")) {
    resumeGame();
  }
}

function pauseGame() {
  if (!state.currentQuestion || state.isPaused || state.awaitingNextQuestion) {
    return;
  }

  clearPendingNextQuestion();
  clearInterval(state.timerId);
  state.isPaused = true;
  state.pauseStartedAt = performance.now();
  setPilotMessage("ステーションで待機中。落ち着いたら航路に戻ろう。", "sleepy");
  showScreen("pause");
  saveSession();
}

function resumeGame() {
  if (!state.currentQuestion || !state.isPaused) {
    showScreen("quiz");
    elements.answerInput.focus();
    return;
  }

  state.questionStartedAt += performance.now() - state.pauseStartedAt;
  state.isPaused = false;
  setPilotMessage("再開するね。次の計算、ゆっくり見れば大丈夫。", "focus");
  showScreen("quiz");
  updateTimer();
  state.timerId = setInterval(updateTimer, 100);
  elements.answerInput.focus();
  saveSession();
}

function returnToTitle() {
  clearPendingNextQuestion();
  clearInterval(state.timerId);
  state.isPaused = false;
  state.awaitingNextQuestion = false;
  state.currentQuestion = null;
  elements.answerSubmitButton.disabled = false;
  elements.answerSubmitButton.textContent = "答える";
  elements.feedbackText.textContent = "";
  elements.feedbackText.className = "feedback";
  setPilotMessage("今日の計算航路を選んでね。ゆーりが横で見てるよ。", "wave");
  showScreen("start");
  renderResumeCard();
}

function showOperationGuide() {
  clearPendingNextQuestion();
  clearInterval(state.timerId);
  state.isPaused = false;
  state.awaitingNextQuestion = false;
  setPilotMessage("四則演算エンジンの点検ログを開いたよ。基本の動きを確認しよう。", "talk");
  showScreen("guide");
}

function adjustLevel(isCorrect, elapsedSeconds, operation) {
  const skill = state.skills[operation];

  if (isCorrect && (elapsedSeconds <= FAST_SECONDS || state.streak >= 2)) {
    state.level = Math.min(6, state.level + 1);
    skill.level = Math.min(6, skill.level + 1);
    return;
  }

  if (!isCorrect) {
    state.level = Math.max(1, state.level - 1);
    skill.level = Math.max(1, skill.level - 1);
  }
}

function showFeedback(isCorrect, elapsedSeconds) {
  const correctAnswer = state.currentQuestion.answer;
  const timeText = formatTime(elapsedSeconds);

  if (isCorrect) {
    elements.feedbackText.textContent = `正解。${timeText}で回答しました。Enterで次へ。`;
    elements.feedbackText.classList.add("is-correct");
    if (state.newReward) {
      setPilotMessage(`ごほうび解放。「${state.newReward.item}」を手に入れたよ。`, "victory");
      return;
    }
    const mood = state.streak >= 3 ? "victory" : "happy";
    const streakText = state.streak >= 2 ? `${state.streak}連続成功。` : "";
    setPilotMessage(`${streakText}きれいな軌道計算だったよ。`, mood);
    return;
  }

  elements.feedbackText.textContent = `答えは ${correctAnswer}。確認したらEnterで次へ。`;
  elements.feedbackText.classList.add("is-wrong");
  setPilotMessage(`答えは ${correctAnswer}。ここは記録して、次の航路で取り返そう。`, "surprised");
}

function createQuestionComms(question) {
  const operation = operationLabels[question.operation];

  if (state.mode === "stageOne") {
    return `スター航路 ${state.questionIndex}/${getQuestionTotal()}。${operation}の小さな星を回収しよう。`;
  }

  if (state.mode === "carry") {
    return `ジャンプ航路 ${state.questionIndex}/${getQuestionTotal()}。くり上がりと二桁の反応を見ていくよ。`;
  }

  if (state.mode === "twoDigitOneDigit") {
    return `スリム航路 ${state.questionIndex}/${getQuestionTotal()}。二桁から一桁へ、${operation}の信号をしぼっていくよ。`;
  }

  if (state.mode === "twoDigitTwoDigit") {
    return `ペア航路 ${state.questionIndex}/${getQuestionTotal()}。二桁どうしで、${operation}の信号を一桁に着地させよう。`;
  }

  return `診断ミッション ${state.questionIndex}/${getQuestionTotal()}。今回は${operation}の信号だよ。`;
}

function createResultComms(accuracy, weakSkill) {
  if (accuracy >= 90) {
    return "ミッション大成功。ゆーりの航行ログにも、かなり安定って記録しておくね。";
  }

  if (weakSkill) {
    return `${operationLabels[weakSkill]}の信号が少し揺れてるよ。次はそこを短く反復しよう。`;
  }

  return "ミッション完了。次の一段が見えてきたよ。ログを見て整えていこう。";
}

function clearPendingNextQuestion() {
  if (state.nextQuestionTimerId === null) {
    return;
  }

  clearTimeout(state.nextQuestionTimerId);
  state.nextQuestionTimerId = null;
}

function setPilotMessage(message, mood = "wave") {
  elements.pilotMessage.textContent = message;
  elements.yuriAvatar.src = yuriMoods[mood] || yuriMoods.wave;
}

function updateStats() {
  const visibleQuestionNumber = state.questionIndex === 0 ? 1 : state.questionIndex;

  elements.levelText.textContent = state.level;
  elements.progressText.textContent = `${Math.min(visibleQuestionNumber, getQuestionTotal())} / ${getQuestionTotal()}`;
  elements.scoreText.textContent = state.score;
  elements.streakText.textContent = state.streak;
}

function updateTimer() {
  elements.timerText.textContent = formatTime(getElapsedSeconds());
}

function getElapsedSeconds() {
  return (performance.now() - state.questionStartedAt) / 1000;
}

function showResults() {
  clearInterval(state.timerId);
  clearSavedSession();
  showScreen("result");

  const questionTotal = getQuestionTotal();
  const accuracy = Math.round((state.score / questionTotal) * 100);
  const averageTime = state.totalTime / questionTotal;
  const weakSkill = getWeakSkill(1);
  const strongSkills = getStrongSkills();
  const watchSkills = getWatchSkills();
  const title = getResultTitle(accuracy, state.level);

  elements.resultTitle.textContent = title;
  elements.resultSummary.textContent = createResultSummary(accuracy, averageTime, weakSkill);
  elements.accuracyText.textContent = `${accuracy}%`;
  elements.finalLevelText.textContent = state.level;
  elements.averageTimeText.textContent = formatTime(averageTime);
  elements.currentPositionText.textContent = createCurrentPositionText(accuracy, averageTime);
  elements.strengthText.textContent = createStrengthText(strongSkills);
  elements.watchText.textContent = createWatchText(watchSkills);
  elements.nextStepText.textContent = createNextStepText(accuracy, weakSkill, watchSkills);
  elements.resultRewardText.textContent = createRewardResultText();
  setPilotMessage(createResultComms(accuracy, weakSkill), "victory");
  renderSkillList();
}

function getResultTitle(accuracy, level) {
  if (accuracy >= 90 && level >= 5) {
    return "発展星域に進めるレベル";
  }
  if (accuracy >= 70) {
    return "基礎軌道が安定しているレベル";
  }
  if (accuracy >= 50) {
    return "もう少し航行練習で伸びるレベル";
  }
  return "基礎ステーションから整えたいレベル";
}

function createResultSummary(accuracy, averageTime, weakSkill) {
  const pace = averageTime <= FAST_SECONDS ? "テンポよく" : "じっくり";

  if (!weakSkill) {
    return `正答率は${accuracy}%でした。全体的に${pace}答えられていて、計算・分数・割合・文字式の入口をバランスよく確認できています。`;
  }

  return `正答率は${accuracy}%でした。${pace}取り組めています。次は${operationLabels[weakSkill]}を重点的に練習すると、さらに安定します。`;
}

function createRewardResultText() {
  const currentReward = getCurrentReward();
  const nextReward = getNextReward();
  const nextText = nextReward
    ? `次はあと${nextReward.correct - profile.totalCorrect}問正解で「${nextReward.item}」。`
    : "今あるごほうびは全部解放済みです。";

  return `累計正解は${profile.totalCorrect}問。ゆーりは YURI Lv ${currentReward.level}「${currentReward.title}」になっています。${nextText}`;
}

function createCurrentPositionText(accuracy, averageTime) {
  if (accuracy >= 80 && state.level >= 5 && averageTime <= FAST_SECONDS) {
    return "小学校高学年から中学入口の内容まで、速さと正確さがかなり安定しています。次は文章題や複合問題に進めます。";
  }

  if (accuracy >= 70) {
    return "基本計算はおおむね安定しています。分数・割合・文字式の入口を混ぜても、落ち着いて処理できる段階です。";
  }

  if (accuracy >= 50) {
    return "基本計算は部分的にできています。急に分野が変わると迷いやすいので、短い反復で土台を固める段階です。";
  }

  return "まずは整数の四則演算と、分数・割合の意味を確認する段階です。正確さを優先して進めると伸びやすいです。";
}

function createStrengthText(strongSkills) {
  if (strongSkills.length === 0) {
    return "今回ははっきり得意と言い切れる分野はまだ少なめです。次回は正答率80%以上かつ平均6秒以内の分野を増やしていきましょう。";
  }

  return `${strongSkills.map((name) => operationLabels[name]).join("、")}は安定しています。正答率と解答スピードの両方がよく、次のレベルへ進める候補です。`;
}

function createWatchText(watchSkills) {
  if (watchSkills.length === 0) {
    return "大きく崩れている分野はありません。未出題の分野がある場合は、次回そこまで確認すると診断精度が上がります。";
  }

  return `${watchSkills.map((name) => operationLabels[name]).join("、")}は少し注意です。不正解、または時間がかかった問題があるため、基礎問題で確認するとよさそうです。`;
}

function createNextStepText(accuracy, weakSkill, watchSkills) {
  const target = weakSkill || watchSkills[0];

  if (target) {
    return `次は${operationLabels[target]}を、正確さ優先で3問連続正解するところから始めましょう。慣れたら6秒以内を目標にすると、次の段に進みやすくなります。`;
  }

  if (accuracy >= 80 && state.level >= 5) {
    return "次は分数・割合・文字式が混ざる問題に進みましょう。解き方を切り替える速さが、次の伸びしろになります。";
  }

  if (accuracy >= 70) {
    return "次は少しだけ数字を大きくして、同じ正確さを保つ練習です。速さよりも、見直しなしで当てることを目標にしましょう。";
  }

  return "次は整数のたし算・ひき算・かけ算を短く反復しましょう。土台がそろうと、分数や割合もかなり楽になります。";
}

function getWeakSkill(minTotal) {
  let weakest = null;
  let weakestRate = 1;

  Object.entries(state.skills).forEach(([name, skill]) => {
    if (skill.total < minTotal) {
      return;
    }

    const rate = skill.correct / skill.total;
    if (rate < weakestRate) {
      weakest = name;
      weakestRate = rate;
    }
  });

  return weakestRate < 0.8 ? weakest : null;
}

function getStrongSkills() {
  return Object.entries(state.skills)
    .filter(([, skill]) => skill.total > 0)
    .filter(([, skill]) => {
      const rate = skill.correct / skill.total;
      const average = skill.time / skill.total;
      return rate >= 0.8 && average <= FAST_SECONDS;
    })
    .map(([name]) => name);
}

function getWatchSkills() {
  return Object.entries(state.skills)
    .filter(([, skill]) => skill.total > 0)
    .filter(([, skill]) => {
      const rate = skill.correct / skill.total;
      const average = skill.time / skill.total;
      return rate < 0.7 || average > FAST_SECONDS + 2;
    })
    .map(([name]) => name);
}

function renderSkillList() {
  elements.skillList.innerHTML = "";

  Object.entries(state.skills).forEach(([name, skill]) => {
    const item = document.createElement("li");
    const label = document.createElement("strong");
    const result = document.createElement("span");
    const percent = skill.total === 0 ? 0 : Math.round((skill.correct / skill.total) * 100);
    const average = skill.total === 0 ? 0 : skill.time / skill.total;

    label.textContent = operationLabels[name];
    result.textContent = skill.total === 0 ? "未出題" : `${skill.correct}/${skill.total} (${percent}%, ${formatTime(average)})`;
    item.append(label, result);
    elements.skillList.append(item);
  });
}

function formatTime(seconds) {
  const totalSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const restSeconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${restSeconds}秒`;
  }

  return `${minutes}分${String(restSeconds).padStart(2, "0")}秒`;
}

function getQuestionTotal() {
  return getQuestionTotalForMode(state.mode);
}

function getQuestionTotalForMode(mode) {
  if (mode === "stageOne") {
    return stageOneQuestionPool.length || TOTAL_QUESTIONS;
  }

  if (mode === "carry") {
    return carryQuestionPool.length || TOTAL_QUESTIONS;
  }

  if (mode === "twoDigitOneDigit") {
    return twoDigitOneDigitQuestionPool.length || TOTAL_QUESTIONS;
  }

  if (mode === "twoDigitTwoDigit") {
    return twoDigitTwoDigitQuestionPool.length || TOTAL_QUESTIONS;
  }

  return TOTAL_QUESTIONS;
}

function parseAnswer(rawAnswer) {
  const normalized = normalizeAnswer(rawAnswer);

  if (normalized.includes("/")) {
    const parts = normalized.split("/");
    if (parts.length !== 2) {
      return null;
    }

    const numerator = Number(parts[0]);
    const denominator = Number(parts[1]);
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
      return null;
    }

    return numerator / denominator;
  }

  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

function normalizeAnswer(rawAnswer) {
  return rawAnswer
    .trim()
    .replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .replace(/[＋－．／]/g, (char) => {
      const replacements = {
        "＋": "+",
        "－": "-",
        "．": ".",
        "／": "/",
      };
      return replacements[char];
    })
    .replace(/\s/g, "");
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
