const TOTAL_QUESTIONS = 10;
const FAST_SECONDS = 6;
const stageModule = window.MathFitStages || {};
const stageNameConfig = stageModule.stageNames || {};
const stageConfigs = stageModule.stageConfigs || {};
const storageApi = window.MathFitStorage || {};
const storageKeys = storageApi.keys || {};
const STAGE_ONE_ADDITION_NAME = stageNameConfig.stageOneAddition || "Stage 1-1";
const STAGE_ONE_SUBTRACTION_NAME = stageNameConfig.stageOneSubtraction || "Stage 1-2";
const STAGE_ONE_MULTIPLICATION_NAME = stageNameConfig.stageOneMultiplication || "Stage 1-3";
const STAGE_ONE_DIVISION_NAME = stageNameConfig.stageOneDivision || "Stage 1-4";
const STAGE_ONE_NAME = stageNameConfig.stageOne || "Stage 1";
const CARRY_ADDITION_STAGE_NAME = stageNameConfig.carryAddition || "Stage 2-1";
const BORROW_SUBTRACTION_STAGE_NAME = stageNameConfig.borrowSubtraction || "Stage 2-2";
const CARRY_MULTIPLICATION_STAGE_NAME = stageNameConfig.carryMultiplication || "Stage 2-3";
const BORROW_DIVISION_STAGE_NAME = stageNameConfig.borrowDivision || "Stage 2-4";
const TWO_DIGIT_TWO_DIGIT_SUBTRACTION_STAGE_NAME = stageNameConfig.twoDigitTwoDigitSubtraction || "Stage 3";
const TWO_DIGIT_TWO_DIGIT_DIVISION_STAGE_NAME = stageNameConfig.twoDigitTwoDigitDivision || "Stage 4";
const TWO_DIGIT_MIX_STAGE_NAME = stageNameConfig.twoDigitMix || "Stage 5";
const TWO_DIGIT_TWIN_STAGE_NAME = stageNameConfig.twoDigitTwin || "Stage 6";
const THREE_DIGIT_JUMP_STAGE_NAME = stageNameConfig.threeDigitJump || "Stage 7";
const POWER_STAGE_NAME = stageNameConfig.power || "Stage 8";
const REVIEW_STAGE_NAME = stageNameConfig.review || "Test 1";

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
const missionNames = stageModule.getMissionNames?.() || {
  adaptive: "10問診断ミッション",
  stageOneAddition: "Stage 1-1 一桁たし算航路",
  stageOneSubtraction: "Stage 1-2 一桁ひき算航路",
  stageOneMultiplication: "Stage 1-3 一桁かけ算航路",
  stageOneDivision: "Stage 1-4 一桁わり算航路",
  carryAddition: "Stage 2-1 繰り上がりたし算航路",
  borrowSubtraction: "Stage 2-2 繰り下がりひき算航路",
  carryMultiplication: "Stage 2-3 繰り上がりかけ算航路",
  borrowDivision: "Stage 2-4 繰り下がりわり算航路",
  twoDigitTwoDigitSubtraction: "Stage 3 二桁どうしひき算航路",
  twoDigitTwoDigitDivision: "Stage 4 二桁どうしわり算航路",
  twoDigitMix: "Stage 5 二桁ミックス航路",
  twoDigitTwin: "Stage 6 二桁ツイン航路",
  threeDigitJump: "Stage 7 三桁ジャンプ航路",
  power: "Stage 8 同じ数かけ算航路",
  review: "Test 1 Stage 1-1〜5 復習診断",
};
const stageProgressModes = stageModule.getProgressModes?.() || [
  "stageOneAddition",
  "stageOneSubtraction",
  "stageOneMultiplication",
  "stageOneDivision",
  "carryAddition",
  "borrowSubtraction",
  "carryMultiplication",
  "borrowDivision",
  "twoDigitTwoDigitSubtraction",
  "twoDigitTwoDigitDivision",
  "twoDigitMix",
  "twoDigitTwin",
  "threeDigitJump",
  "power",
  "review",
];
const questionPoolsByMode = {};
const TAP_MOVE_LIMIT = 12;
const touchInputQuery = window.matchMedia("(hover: none) and (pointer: coarse)");
const SESSION_STORAGE_KEY = storageKeys.session || "mathfit-yuri-session-v1";
const SESSIONS_STORAGE_KEY = storageKeys.sessions || "mathfit-yuri-sessions-v2";
const PROFILE_STORAGE_KEY = storageKeys.profile || "mathfit-yuri-profile-v1";
const BGM_STORAGE_KEY = storageKeys.bgm || "mathfit-yuri-bgm-v1";
const STAGE_PROGRESS_STORAGE_KEY = storageKeys.stageProgress || "mathfit-yuri-stage-progress-v1";
const SAVE_EXPORT_VERSION = 1;

const yuriMoods = {
  wave: "assets/yuri/extra/actions/01_wave.png",
  focus: "assets/yuri/extra/actions/13_sparkle_pose.png",
  happy: "assets/yuri/extra/actions/02_happy_bounce.png",
  surprised: "assets/yuri/extra/actions/05_surprised.png",
  talk: "assets/yuri/extra/actions/06_talk.png",
  sleepy: "assets/yuri/extra/actions/03_sleepy.png",
  victory: "assets/yuri/extra/actions/16_victory_pose.png",
};

const rewardCatalog = window.MathFitRewards || {};
const growthRewards = rewardCatalog.growthRewards || [];
const titleRewardSlots = rewardCatalog.titleRewardSlots || [];

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
  missionStartedAt: 0,
  awaitingNextQuestion: false,
  timeLimitReached: false,
  newReward: null,
  totalTime: 0,
  history: [],
  questionDeck: [],
  answerRawInput: "",
  skills: createEmptySkills(),
};

const screens = {
  start: document.querySelector("#startScreen"),
  quiz: document.querySelector("#quizScreen"),
  pause: document.querySelector("#pauseScreen"),
  guide: document.querySelector("#guideScreen"),
  result: document.querySelector("#resultScreen"),
};
const screenBodyClasses = Object.keys(screens).map((name) => `screen-${name}`);

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
  answerPrettyDisplay: document.querySelector("#answerPrettyDisplay"),
  answerNotationHelp: document.querySelector("#answerNotationHelp"),
  answerSubmitButton: document.querySelector("#answerForm .answer-row button[type='submit']"),
  stopButton: document.querySelector("#stopButton"),
  numberPad: document.querySelector("#numberPad"),
  numberPadSubmitButton: document.querySelector("#numberPad [data-action='submit']"),
  backspaceButton: document.querySelector("#backspaceButton"),
  clearAnswerButton: document.querySelector("#clearAnswerButton"),
  missionButtonStack: document.querySelector("#missionButtonStack"),
  operationGuideButton: document.querySelector("#operationGuideButton"),
  resumeCard: document.querySelector("#resumeCard"),
  resumeTitle: document.querySelector("#resumeTitle"),
  resumeDetail: document.querySelector("#resumeDetail"),
  startResumeButton: document.querySelector("#startResumeButton"),
  clearSaveButton: document.querySelector("#clearSaveButton"),
  exportSaveButton: document.querySelector("#exportSaveButton"),
  importSaveButton: document.querySelector("#importSaveButton"),
  importSaveInput: document.querySelector("#importSaveInput"),
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
  titleRewardDisplay: document.querySelector("#titleRewardDisplay"),
  bgmToggleButton: document.querySelector("#bgmToggleButton"),
  bgmSelect: document.querySelector("#bgmSelect"),
  bgmVolumeSlider: document.querySelector("#bgmVolumeSlider"),
  bgmVolumeText: document.querySelector("#bgmVolumeText"),
};

renderStageButtons();

const stageProgressTargets = stageProgressModes.map((mode) => ({
  mode,
  button: getStageButton(mode),
}));

const bgmPlayer = window.MathFitBgmPlayer.createBgmPlayer({
  storageKey: BGM_STORAGE_KEY,
  controls: {
    toggleButton: elements.bgmToggleButton,
    select: elements.bgmSelect,
    volumeSlider: elements.bgmVolumeSlider,
    volumeText: elements.bgmVolumeText,
  },
  readJson,
  writeJson,
  usesTouchInput: () => touchInputQuery.matches,
  onBlocked: () => {
    setPilotMessage("BGMは最初の操作後に鳴るよ。もう一度BGMを押してね。", "talk");
  },
});

const resultMessages = window.MathFitResultMessages.createResultMessages({
  operationLabels,
  fastSeconds: FAST_SECONDS,
  formatTime,
});
const rewardMessages = window.MathFitRewardMessages.createRewardMessages({
  formatCorrectCount,
});
const soundEffects = window.MathFitSoundEffects.createSoundEffects();

let pendingPadPress = null;
let profile = loadProfile();
let stageProgress = loadStageProgress();

configureInputMode();
if (typeof touchInputQuery.addEventListener === "function") {
  touchInputQuery.addEventListener("change", configureInputMode);
} else {
  touchInputQuery.addListener(configureInputMode);
}

getPlayableStageConfigs().forEach((config) => {
  const button = getStageButton(config.mode);
  if (button) {
    button.addEventListener("click", () => startOrResumeStage(config.mode));
  }
});
elements.operationGuideButton.addEventListener("click", showOperationGuide);
elements.startResumeButton.addEventListener("click", resumeSavedSession);
elements.clearSaveButton.addEventListener("click", clearSavedSessionFromStart);
elements.exportSaveButton.addEventListener("click", exportSaveData);
elements.importSaveButton.addEventListener("click", startImportSaveData);
elements.importSaveInput.addEventListener("change", importSaveData);
elements.resumeButton.addEventListener("click", resumeGame);
elements.backToTitleButton.addEventListener("click", returnToTitle);
elements.guideBackButton.addEventListener("click", returnToTitle);
elements.restartButton.addEventListener("click", () => startGame(state.mode));
elements.resultBackToTitleButton.addEventListener("click", returnToTitle);
elements.bgmToggleButton.addEventListener("click", toggleBgm);
elements.bgmSelect.addEventListener("change", changeBgmTrack);
elements.bgmVolumeSlider.addEventListener("input", changeBgmVolume);
elements.bgmVolumeSlider.addEventListener("change", changeBgmVolume);
elements.answerForm.addEventListener("submit", handleAnswer);
elements.answerInput.addEventListener("input", handleAnswerInputChange);
elements.stopButton.addEventListener("click", pauseGame);
elements.numberPad.addEventListener("pointerdown", beginNumberPadPress);
elements.numberPad.addEventListener("pointermove", trackNumberPadPress);
elements.numberPad.addEventListener("pointerup", finishNumberPadPress);
elements.numberPad.addEventListener("pointercancel", cancelNumberPadPress);
elements.numberPad.addEventListener("pointerleave", cancelNumberPadPress);
document.addEventListener("keydown", handleKeydown);
document.addEventListener("pointerdown", primeSound, { once: true });
document.addEventListener("keydown", primeSound, { once: true });
document.addEventListener("touchstart", primeSound, { once: true, passive: true });
document.addEventListener("click", primeSound, { once: true });
document.addEventListener("dblclick", preventDoubleTapZoom, { passive: false });
document.addEventListener("visibilitychange", handleBgmVisibilityChange);
window.addEventListener("focus", () => ensureBgmContinuity("focus"));
window.addEventListener("pageshow", () => ensureBgmContinuity("pageshow"));
window.addEventListener("beforeunload", saveSession);
window.addEventListener("resize", updateAnswerInputFit);
setActiveScreenClass("start");
setPilotMessage("今日の計算航路を選んでね。ゆーりが横で見てるよ。", "wave");
setupBgmControls();
startBgmKeepAlive();
renderProfile();
renderResumeCard();
renderStageProgress();

function configureInputMode() {
  const usesTouchInput = touchInputQuery.matches;

  document.body.classList.toggle("touch-input", usesTouchInput);
  document.body.classList.toggle("keyboard-input", !usesTouchInput);
  elements.answerInput.readOnly = true;
  elements.answerInput.inputMode = usesTouchInput ? "none" : "text";
  elements.numberPad.setAttribute("aria-hidden", String(!usesTouchInput));
  updateAnswerInputFit();
}

function setSubmitButton(label, disabled = false) {
  elements.answerSubmitButton.disabled = disabled;
  elements.answerSubmitButton.textContent = label;
  elements.numberPadSubmitButton.disabled = disabled;
  elements.numberPadSubmitButton.textContent = label;
}

function setActiveScreenClass(name) {
  document.body.classList.remove(...screenBodyClasses);
  document.body.classList.add(`screen-${name}`);
}

function preventDoubleTapZoom(event) {
  if (touchInputQuery.matches) {
    event.preventDefault();
  }
}

function setupBgmControls() {
  bgmPlayer.setupControls();
}

function toggleBgm() {
  bgmPlayer.toggle();
}

function changeBgmTrack() {
  bgmPlayer.changeTrack();
}

function changeBgmVolume() {
  bgmPlayer.changeVolume();
}

function startBgmKeepAlive() {
  bgmPlayer.startKeepAlive();
}

function handleBgmVisibilityChange() {
  bgmPlayer.handleVisibilityChange();
}

function ensureBgmContinuity() {
  bgmPlayer.ensureContinuity();
}

function updateBgmControls() {
  bgmPlayer.updateControls();
}

function primeSound() {
  soundEffects.prime();
}

function playAnswerSound(isCorrect) {
  soundEffects.playAnswer(isCorrect);
}

function loadProfile() {
  const savedProfile = storageApi.loadProfile?.() || readJson(PROFILE_STORAGE_KEY);
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
  if (storageApi.saveProfile) {
    try {
      storageApi.saveProfile(profile);
      return;
    } catch {
      showStorageError();
      return;
    }
  }
  writeJson(PROFILE_STORAGE_KEY, profile);
}

function renderProfile() {
  const currentReward = getCurrentReward();
  const nextReward = getNextReward();
  const progressStart = currentReward.correct;
  const progressEnd = nextReward ? nextReward.correct : currentReward.correct;
  const progressRange = Math.max(1, progressEnd - progressStart);
  const progressValue = nextReward ? ((profile.totalCorrect - progressStart) / progressRange) * 100 : 100;
  const unlockedCount = getUnlockedRewardCount();

  elements.growthIcon.src = currentReward.icon;
  elements.growthLevelText.textContent = `YURI Lv ${currentReward.level} / ${currentReward.title}`;
  elements.totalCorrectText.textContent = `\u7d2f\u8a08\u6b63\u89e3 ${formatCorrectCount(profile.totalCorrect)}`;
  elements.growthProgressBar.style.width = `${Math.max(0, Math.min(100, progressValue))}%`;
  elements.nextRewardText.textContent = rewardMessages.createGrowthProgressText({
    unlockedCount,
    rewardTotal: growthRewards.length,
    nextReward,
    totalCorrect: profile.totalCorrect,
  });

  elements.rewardList.innerHTML = "";
  growthRewards.slice(1).forEach((reward) => {
    const item = document.createElement("li");
    const icon = document.createElement("img");
    const textNode = document.createElement("span");
    const name = document.createElement("strong");
    const detail = document.createElement("small");
    const unlocked = reward.correct <= profile.totalCorrect;

    icon.src = reward.icon;
    icon.alt = "";
    name.textContent = unlocked ? reward.item : rewardMessages.createLockedRewardName(reward);
    detail.textContent = unlocked ? reward.title : reward.item;
    textNode.append(name, detail);
    item.className = unlocked ? "is-unlocked" : "is-locked";
    if (nextReward && reward.item === nextReward.item) {
      item.classList.add("is-next");
    }
    if (reward.correct >= 10000) {
      item.classList.add("is-grand");
    }
    item.append(icon, textNode);
    elements.rewardList.append(item);
  });
  renderTitleRewardDisplay();
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

function getUnlockedRewardCount() {
  return growthRewards.filter((reward) => reward.correct <= profile.totalCorrect).length;
}

function renderTitleRewardDisplay() {
  if (!elements.titleRewardDisplay) {
    return;
  }

  const unlockedRewards = growthRewards.filter((reward) => reward.correct <= profile.totalCorrect);
  elements.titleRewardDisplay.innerHTML = "";

  unlockedRewards.slice(0, titleRewardSlots.length).forEach((reward, index) => {
    const slot = titleRewardSlots[index];
    const item = document.createElement("img");

    item.src = reward.icon;
    item.alt = "";
    item.className = "title-reward-item";
    if (reward.correct >= 10000) {
      item.classList.add("is-grand");
    }
    item.style.setProperty("--reward-x", `${slot.x}%`);
    item.style.setProperty("--reward-y", `${slot.y}%`);
    item.style.setProperty("--reward-size", `${slot.size}px`);
    item.style.setProperty("--reward-rotate", `${slot.rotate}deg`);
    item.style.setProperty("--reward-delay", `${(index % 6) * -0.42}s`);
    elements.titleRewardDisplay.append(item);
  });
}

function formatCorrectCount(count) {
  return Number(count).toLocaleString("ja-JP");
}

function readJson(key) {
  try {
    return storageApi.loadJson ? storageApi.loadJson(key) : null;
  } catch {
    return null;
  }
}

function writeJson(key, value) {
  try {
    if (storageApi.saveJson) {
      storageApi.saveJson(key, value);
    }
  } catch {
    showStorageError();
  }
}

function showStorageError() {
  setPilotMessage("保存容量が足りないみたい。進行保存は未確認だよ。", "surprised");
}

function normalizeSavedSessions(value) {
  if (!value) {
    return {};
  }
  const sessions = value.sessions && typeof value.sessions === "object" ? value.sessions : value;
  return Object.entries(sessions || {}).reduce((normalized, [mode, session]) => {
    if (session?.currentQuestion && missionNames[session.mode || mode]) {
      normalized[session.mode || mode] = {
        ...session,
        mode: session.mode || mode,
      };
    }
    return normalized;
  }, {});
}

function loadSavedSessions() {
  let sessions = {};
  if (storageApi.loadSessions) {
    try {
      sessions = normalizeSavedSessions(storageApi.loadSessions());
    } catch {
      sessions = {};
    }
  } else {
    sessions = normalizeSavedSessions(readJson(SESSIONS_STORAGE_KEY));
  }
  if (Object.keys(sessions).length === 0) {
    const legacySession = storageApi.loadSession?.() || readJson(SESSION_STORAGE_KEY);
    if (legacySession?.currentQuestion) {
      sessions[legacySession.mode] = legacySession;
    }
  }
  return sessions;
}

function saveSavedSessions(sessions) {
  try {
    if (storageApi.saveSessions) {
      storageApi.saveSessions(sessions);
    } else {
      writeJson(SESSIONS_STORAGE_KEY, { version: 2, savedAt: Date.now(), sessions });
    }
  } catch {
    showStorageError();
  }
}

function getLatestSavedSession(sessions = loadSavedSessions()) {
  return Object.values(sessions)
    .filter((session) => session?.currentQuestion && missionNames[session.mode])
    .sort((a, b) => Number(b.savedAt || 0) - Number(a.savedAt || 0))[0] || null;
}

function createEmptyStageProgress() {
  return stageProgressModes.reduce((progress, mode) => {
    progress[mode] = {
      attempts: 0,
      bestAnswered: 0,
      bestScore: 0,
      bestAccuracy: 0,
      totalAnswered: 0,
      totalCorrect: 0,
      questionTotal: getQuestionTotalForMode(mode),
      lastPlayedAt: null,
    };
    return progress;
  }, {});
}

function loadStageProgress() {
  return normalizeStageProgress(storageApi.loadStageProgress?.() || readJson(STAGE_PROGRESS_STORAGE_KEY));
}

function normalizeStageProgress(savedProgress = {}) {
  const progress = createEmptyStageProgress();

  stageProgressModes.forEach((mode) => {
    const saved = savedProgress?.[mode] || {};
    const questionTotal = getQuestionTotalForMode(mode);
    const bestScore = Math.max(0, Number(saved.bestScore || 0));
    const bestAnswered = Math.max(bestScore, Number(saved.bestAnswered || 0));
    const totalAnswered = Math.max(0, Number(saved.totalAnswered || 0));
    const totalCorrect = Math.max(0, Number(saved.totalCorrect || 0));
    const attempts = Math.max(0, Number(saved.attempts || 0));
    const savedAccuracy = Number(saved.bestAccuracy || 0);

    progress[mode] = {
      attempts: Number.isFinite(attempts) ? attempts : 0,
      bestAnswered: Number.isFinite(bestAnswered) ? Math.min(bestAnswered, questionTotal) : 0,
      bestScore: Number.isFinite(bestScore) ? Math.min(bestScore, questionTotal) : 0,
      bestAccuracy: Number.isFinite(savedAccuracy) ? Math.max(0, Math.min(100, savedAccuracy)) : 0,
      totalAnswered: Number.isFinite(totalAnswered) ? totalAnswered : 0,
      totalCorrect: Number.isFinite(totalCorrect) ? totalCorrect : 0,
      questionTotal,
      lastPlayedAt: saved.lastPlayedAt || null,
    };
  });

  return progress;
}

function saveStageProgress() {
  if (storageApi.saveStageProgress) {
    try {
      storageApi.saveStageProgress(stageProgress);
      return;
    } catch {
      showStorageError();
      return;
    }
  }
  writeJson(STAGE_PROGRESS_STORAGE_KEY, stageProgress);
}

function updateStageProgressAfterResult(questionTotal, accuracy) {
  saveStageProgressSnapshot({ completed: true, questionTotal, accuracy });
}

function saveStageProgressSnapshot({ completed = false, questionTotal = getQuestionTotal(), accuracy = null } = {}) {
  if (!stageProgressModes.includes(state.mode)) {
    return;
  }

  const progress = stageProgress[state.mode] || createEmptyStageProgress()[state.mode];
  const answeredCount = state.history.length;
  if (answeredCount === 0 && !completed) {
    return;
  }
  const currentAccuracy = accuracy ?? (answeredCount > 0 ? Math.round((state.score / answeredCount) * 100) : 0);

  if (completed) {
    progress.attempts += 1;
    progress.totalAnswered += answeredCount;
    progress.totalCorrect += state.score;
  }
  progress.bestAnswered = Math.max(progress.bestAnswered || 0, answeredCount);
  progress.bestScore = Math.max(progress.bestScore || 0, state.score);
  progress.bestAccuracy = Math.max(progress.bestAccuracy || 0, currentAccuracy);
  progress.questionTotal = questionTotal;
  progress.lastPlayedAt = new Date().toISOString();
  stageProgress[state.mode] = progress;

  saveStageProgress();
  renderStageProgress();
}

function renderStageProgress() {
  const savedSessions = loadSavedSessions();

  stageProgressTargets.forEach(({ mode, button }) => {
    if (!button) {
      return;
    }

    const progress = stageProgress[mode] || createEmptyStageProgress()[mode];
    const questionTotal = progress.questionTotal || getQuestionTotalForMode(mode);
    const percent = questionTotal > 0
      ? Math.min(100, Math.round(((progress.bestAnswered || progress.bestScore || 0) / questionTotal) * 100))
      : 0;

    button.classList.add("stage-progress-button");
    button.style.setProperty("--stage-progress", `${percent}%`);
    const percentLabel = percent > 0 ? `${percent}%` : "0%";
    button.dataset.progressLabel = percentLabel;
    const savedSession = savedSessions[mode];
    if (savedSession) {
      const visibleQuestion = Math.min(savedSession.questionIndex || 1, questionTotal);
      button.dataset.progressLabel = percentLabel;
      button.title = `${missionNames[mode]}: ${visibleQuestion}/${questionTotal}問目から続き、最高正解 ${progress.bestScore || 0}問`;
    } else {
      button.title = `${missionNames[mode]}: 進捗 ${progress.bestAnswered || 0}/${questionTotal}問、最高正解 ${progress.bestScore || 0}問`;
    }
  });
}

function exportSaveData() {
  const exportData = {
    version: SAVE_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    profile,
    stageProgress,
    savedSessions: loadSavedSessions(),
    savedSession: loadSavedSession(),
    bgmState: bgmPlayer.getExportState(),
  };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

  link.href = url;
  link.download = `math-fit-yuri-save-${stamp}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
  setPilotMessage("保存データを書き出したよ。別の場所でも読み込める航行ログだよ。", "happy");
}

function startImportSaveData() {
  elements.importSaveInput.value = "";
  elements.importSaveInput.click();
}

function importSaveData(event) {
  const [file] = event.target.files || [];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const imported = JSON.parse(String(reader.result || "{}"));

      if (imported.profile) {
        if (storageApi.saveProfile) {
          storageApi.saveProfile(imported.profile);
        } else {
          writeJson(PROFILE_STORAGE_KEY, imported.profile);
        }
        profile = loadProfile();
      }

      if (imported.stageProgress) {
        stageProgress = normalizeStageProgress(imported.stageProgress);
        saveStageProgress();
      }

      if (imported.savedSessions || imported.savedSession) {
        const importedSessions = normalizeSavedSessions(imported.savedSessions || {});
        if (imported.savedSession?.currentQuestion) {
          importedSessions[imported.savedSession.mode] = imported.savedSession;
        }
        saveSavedSessions(importedSessions);
      }

      if (imported.bgmState) {
        bgmPlayer.importState(imported.bgmState);
      }

      renderProfile();
      renderResumeCard();
      renderStageProgress();
      updateBgmControls();
      setPilotMessage("保存データを読み込んだよ。タイトルの進捗も更新したよ。", "happy");
    } catch {
      setPilotMessage("保存データを読み込めなかったよ。JSONファイルか確認してね。", "surprised");
    }
  });
  reader.readAsText(file);
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
  clearSavedSession(mode);
  state.mode = mode;
  state.level = 1;
  state.score = 0;
  state.streak = 0;
  state.questionIndex = 0;
  state.currentQuestion = null;
  state.totalTime = 0;
  state.history = [];
  state.answerRawInput = "";
  state.pauseStartedAt = 0;
  state.missionStartedAt = isTimeLimitedMode(mode) ? performance.now() : 0;
  state.isPaused = false;
  state.awaitingNextQuestion = false;
  state.timeLimitReached = false;
  state.newReward = null;
  state.questionDeck = createQuestionDeck(mode);
  setPilotMessage(createStartComms(mode), "focus");

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

function startOrResumeStage(mode) {
  const savedSession = loadSavedSession(mode);
  if (savedSession) {
    resumeSavedSession(mode);
    return;
  }
  startGame(mode);
}

function showScreen(name) {
  Object.values(screens).forEach((screen) => {
    screen.classList.remove("is-active");
  });
  screens[name].classList.add("is-active");
  setActiveScreenClass(name);
  ensureBgmContinuity("screen");

  requestAnimationFrame(() => {
    document.querySelector(".game-panel").scrollIntoView({ block: "start" });
    ensureBgmContinuity("screen-frame");
  });
}

function saveSession() {
  if (!state.currentQuestion || screens.result.classList.contains("is-active")) {
    return;
  }

  const sessionData = {
    version: 1,
    mode: state.mode,
    level: state.level,
    score: state.score,
    streak: state.streak,
    questionIndex: state.questionIndex,
    currentQuestion: state.currentQuestion,
    questionDeck: state.questionDeck,
    totalTime: state.totalTime,
    missionElapsed: getMissionElapsedSeconds(),
    history: state.history,
    skills: state.skills,
    awaitingNextQuestion: state.awaitingNextQuestion,
    timeLimitReached: state.timeLimitReached,
    answerRawValue: state.answerRawInput,
    answerValue: elements.answerInput.value,
    feedbackText: elements.feedbackText.textContent,
    feedbackClassName: elements.feedbackText.className,
    questionElapsed: state.currentQuestion && !state.awaitingNextQuestion ? getElapsedSeconds() : 0,
    savedAt: Date.now(),
  };
  const sessions = loadSavedSessions();
  sessions[state.mode] = sessionData;
  saveSavedSessions(sessions);
  renderResumeCard();
  renderStageProgress();
}

function loadSavedSession(mode) {
  const sessions = loadSavedSessions();
  let savedSession = mode ? sessions[mode] : getLatestSavedSession(sessions);
  if (!savedSession && !mode) {
    savedSession = storageApi.loadSession?.() || readJson(SESSION_STORAGE_KEY);
  }
  if (!savedSession?.currentQuestion || !missionNames[savedSession.mode]) {
    return null;
  }

  return savedSession;
}

function clearSavedSession(mode) {
  try {
    if (storageApi.removeSession) {
      storageApi.removeSession(mode);
    } else if (mode) {
      const sessions = loadSavedSessions();
      delete sessions[mode];
      saveSavedSessions(sessions);
    } else if (storageApi.removeJson) {
      storageApi.removeJson(SESSION_STORAGE_KEY);
      storageApi.removeJson(SESSIONS_STORAGE_KEY);
    } else {
      return;
    }
  } catch {
    return;
  }
  renderResumeCard();
  renderStageProgress();
}

function clearSavedSessionFromStart() {
  clearSavedSession();
  setPilotMessage("保存していた航路を全部消したよ。新しいミッションを選べるよ。", "wave");
}

function renderResumeCard() {
  const sessions = loadSavedSessions();
  const savedSession = getLatestSavedSession(sessions);
  const sessionCount = Object.keys(sessions).length;
  elements.resumeCard.hidden = !savedSession;

  if (!savedSession) {
    return;
  }

  const questionTotal = getQuestionTotalForMode(savedSession.mode);
  const visibleQuestion = Math.min(savedSession.questionIndex || 1, questionTotal);
  elements.resumeTitle.textContent = `${missionNames[savedSession.mode]}を保存中`;
  const countText = sessionCount > 1 ? `、保存中 ${sessionCount}ステージ` : "";
  elements.resumeDetail.textContent = `${visibleQuestion} / ${questionTotal}問目、正解 ${savedSession.score || 0}、連続 ${savedSession.streak || 0}${countText}`;
}

function resumeSavedSession(mode) {
  const savedSession = loadSavedSession(mode);
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
  state.missionStartedAt = isTimeLimitedMode(state.mode)
    ? performance.now() - Math.max(0, Number(savedSession.missionElapsed || 0)) * 1000
    : 0;
  state.history = Array.isArray(savedSession.history) ? savedSession.history : [];
  state.skills = normalizeSavedSkills(savedSession.skills);
  state.awaitingNextQuestion = Boolean(savedSession.awaitingNextQuestion);
  state.timeLimitReached = Boolean(savedSession.timeLimitReached);
  state.isPaused = false;
  state.pauseStartedAt = 0;
  state.newReward = null;
  state.questionStartedAt = performance.now() - Math.max(0, Number(savedSession.questionElapsed || 0)) * 1000;

  showScreen("quiz");
  elements.operationText.textContent = operationLabels[state.currentQuestion.operation];
  elements.questionText.textContent = state.currentQuestion.text;
  setAnswerRawInput(savedSession.answerRawValue ?? savedSession.answerValue ?? "");
  elements.answerInput.disabled = state.awaitingNextQuestion;
  setSubmitButton(state.awaitingNextQuestion ? "次へ" : "答える");
  elements.feedbackText.textContent = savedSession.feedbackText || "";
  elements.feedbackText.className = savedSession.feedbackClassName || "feedback";
  updateStats();
  updateTimer();

  if (screens.result.classList.contains("is-active")) {
    return;
  }

  if (!state.awaitingNextQuestion) {
    state.timerId = setInterval(updateTimer, 100);
    elements.answerInput.focus();
    setPilotMessage(`保存していた${missionNames[state.mode]}へ戻ったよ。続きからいこう。`, "focus");
  } else {
    if (isTimeLimitedMode()) {
      state.timerId = setInterval(updateTimer, 100);
    }
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

  if (isTimeLimitedMode() && getRemainingSeconds() <= 0) {
    finishTimeLimitedStage();
    return;
  }

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
  setAnswerRawInput("");
  elements.answerInput.disabled = false;
  setSubmitButton("答える");
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
  if (window.MathFitProblems?.createStageOneQuestionPool) {
    return window.MathFitProblems.createStageOneQuestionPool();
  }

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

function createStageOneAdditionQuestionPool() {
  return createStageOneOperationQuestionPool("addition", "+", STAGE_ONE_ADDITION_NAME);
}

function createStageOneSubtractionQuestionPool() {
  return createStageOneOperationQuestionPool("subtraction", "-", STAGE_ONE_SUBTRACTION_NAME);
}

function createStageOneMultiplicationQuestionPool() {
  return createStageOneOperationQuestionPool("multiplication", "×", STAGE_ONE_MULTIPLICATION_NAME);
}

function createStageOneDivisionQuestionPool() {
  return createStageOneOperationQuestionPool("division", "÷", STAGE_ONE_DIVISION_NAME);
}

function createStageOneOperationQuestionPool(operation, symbol, stage) {
  const pool = [];

  for (let a = 0; a <= 9; a += 1) {
    for (let b = 0; b <= 9; b += 1) {
      if (operation === "addition") {
        addStageOneQuestion(pool, operation, a, b, a + b, symbol, stage);
      }

      if (operation === "subtraction") {
        addStageOneQuestion(pool, operation, a, b, a - b, symbol, stage);
      }

      if (operation === "multiplication") {
        addStageOneQuestion(pool, operation, a, b, a * b, symbol, stage);
      }

      if (operation === "division" && b !== 0 && a % b === 0) {
        addStageOneQuestion(pool, operation, a, b, a / b, symbol, stage);
      }
    }
  }

  return pool;
}

function createCarryQuestionPool() {
  if (window.MathFitProblems?.createCarryQuestionPool) {
    return window.MathFitProblems.createCarryQuestionPool();
  }

  return [
    ...createCarryAdditionQuestionPool(),
    ...createCarryMultiplicationQuestionPool(),
  ];
}

function createCarryAdditionQuestionPool() {
  if (window.MathFitProblems?.createCarryAdditionQuestionPool) {
    return window.MathFitProblems.createCarryAdditionQuestionPool();
  }

  const pool = [];

  for (let a = 0; a <= 9; a += 1) {
    for (let b = 0; b <= 9; b += 1) {
      if (a + b >= 10) {
        addDeckQuestion(pool, "addition", a, b, a + b, "+", CARRY_ADDITION_STAGE_NAME);
      }
    }
  }

  return pool;
}

function createCarryMultiplicationQuestionPool() {
  if (window.MathFitProblems?.createCarryMultiplicationQuestionPool) {
    return window.MathFitProblems.createCarryMultiplicationQuestionPool();
  }

  const pool = [];

  for (let a = 0; a <= 9; a += 1) {
    for (let b = 0; b <= 9; b += 1) {
      if (a * b >= 10) {
        addDeckQuestion(pool, "multiplication", a, b, a * b, "×", CARRY_MULTIPLICATION_STAGE_NAME);
      }
    }
  }

  return pool;
}

function createTwoDigitOneDigitQuestionPool() {
  if (window.MathFitProblems?.createTwoDigitOneDigitQuestionPool) {
    return window.MathFitProblems.createTwoDigitOneDigitQuestionPool();
  }

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
  if (window.MathFitProblems?.createBorrowSubtractionQuestionPool) {
    return window.MathFitProblems.createBorrowSubtractionQuestionPool();
  }

  const pool = [];

  for (let a = 10; a <= 99; a += 1) {
    for (let b = 0; b <= 9; b += 1) {
      const answer = a - b;
      if (answer >= 0 && answer <= 9) {
        addDeckQuestion(pool, "subtraction", a, b, answer, "-", BORROW_SUBTRACTION_STAGE_NAME);
      }
    }
  }

  return pool;
}

function createBorrowDivisionQuestionPool() {
  if (window.MathFitProblems?.createBorrowDivisionQuestionPool) {
    return window.MathFitProblems.createBorrowDivisionQuestionPool();
  }

  const pool = [];

  for (let a = 10; a <= 99; a += 1) {
    for (let b = 1; b <= 9; b += 1) {
      if (a % b !== 0) {
        continue;
      }

      const answer = a / b;
      if (answer >= 0 && answer <= 9) {
        addDeckQuestion(pool, "division", a, b, answer, "÷", BORROW_DIVISION_STAGE_NAME);
      }
    }
  }

  return pool;
}

function createTwoDigitTwoDigitQuestionPool() {
  if (window.MathFitProblems?.createTwoDigitTwoDigitQuestionPool) {
    return window.MathFitProblems.createTwoDigitTwoDigitQuestionPool();
  }

  return [
    ...createTwoDigitTwoDigitSubtractionQuestionPool(),
    ...createTwoDigitTwoDigitDivisionQuestionPool(),
  ];
}

function createTwoDigitTwoDigitSubtractionQuestionPool() {
  if (window.MathFitProblems?.createTwoDigitTwoDigitSubtractionQuestionPool) {
    return window.MathFitProblems.createTwoDigitTwoDigitSubtractionQuestionPool();
  }

  const pool = [];

  for (let a = 10; a <= 99; a += 1) {
    for (let b = 10; b <= 99; b += 1) {
      const answer = a - b;
      if (answer >= 0 && answer <= 9) {
        addDeckQuestion(pool, "subtraction", a, b, answer, "-", TWO_DIGIT_TWO_DIGIT_SUBTRACTION_STAGE_NAME);
      }
    }
  }

  return pool;
}

function createTwoDigitTwoDigitDivisionQuestionPool() {
  if (window.MathFitProblems?.createTwoDigitTwoDigitDivisionQuestionPool) {
    return window.MathFitProblems.createTwoDigitTwoDigitDivisionQuestionPool();
  }

  const pool = [];

  for (let a = 10; a <= 99; a += 1) {
    for (let b = 10; b <= 99; b += 1) {
      if (a % b !== 0) {
        continue;
      }

      const answer = a / b;
      if (answer >= 1 && answer <= 9) {
        addDeckQuestion(pool, "division", a, b, answer, "÷", TWO_DIGIT_TWO_DIGIT_DIVISION_STAGE_NAME);
      }
    }
  }

  return pool;
}

function createTwoDigitMixQuestionPool() {
  if (window.MathFitProblems?.createTwoDigitMixQuestionPool) {
    return window.MathFitProblems.createTwoDigitMixQuestionPool();
  }

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

  addDeckQuestion(pool, operation, a, b, answer, symbol, TWO_DIGIT_MIX_STAGE_NAME);
}

function createTwoDigitTwinQuestionPool() {
  if (window.MathFitProblems?.createTwoDigitTwinQuestionPool) {
    return window.MathFitProblems.createTwoDigitTwinQuestionPool();
  }

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

  addDeckQuestion(pool, operation, a, b, answer, symbol, TWO_DIGIT_TWIN_STAGE_NAME);
}

function createThreeDigitJumpQuestionPool() {
  if (window.MathFitProblems?.createThreeDigitJumpQuestionPool) {
    return window.MathFitProblems.createThreeDigitJumpQuestionPool();
  }

  const pool = [];

  for (let a = 10; a <= 99; a += 1) {
    for (let b = 10; b <= 99; b += 1) {
      const answer = a + b;
      if (answer >= 100 && answer <= 999) {
        addDeckQuestion(pool, "addition", a, b, answer, "+", THREE_DIGIT_JUMP_STAGE_NAME);
      }
    }
  }

  for (let a = 100; a <= 999; a += 1) {
    for (let b = 10; b <= 99; b += 1) {
      const answer = a - b;
      if (answer >= 10 && answer <= 99) {
        addDeckQuestion(pool, "subtraction", a, b, answer, "-", THREE_DIGIT_JUMP_STAGE_NAME);
      }
    }
  }

  for (let a = 10; a <= 99; a += 1) {
    for (let b = 1; b <= 9; b += 1) {
      const answer = a * b;
      if (answer >= 100 && answer <= 999) {
        addDeckQuestion(pool, "multiplication", a, b, answer, "×", THREE_DIGIT_JUMP_STAGE_NAME);
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
        addDeckQuestion(pool, "division", a, b, answer, "÷", THREE_DIGIT_JUMP_STAGE_NAME);
      }
    }
  }

  return pool;
}

function createPowerQuestionPool() {
  if (window.MathFitProblems?.createPowerQuestionPool) {
    return window.MathFitProblems.createPowerQuestionPool();
  }

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
  pool.push({
    operation: "multiplication",
    answer: Math.pow(base, factorCount),
    text: Array(factorCount).fill(base).join(" × "),
    stage: POWER_STAGE_NAME,
  });
}

function addStageOneQuestion(pool, operation, a, b, answer, symbol, stage = STAGE_ONE_NAME) {
  if (!Number.isInteger(answer) || answer < 0 || answer > 9) {
    return;
  }

  pool.push({
    operation,
    answer,
    text: `${a} ${symbol} ${b}`,
    stage,
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

function getStageConfig(mode) {
  return stageModule.getStageConfig?.(mode) || stageConfigs[mode] || null;
}

function getStageConfigs() {
  if (stageModule.getStageConfigs) {
    return stageModule.getStageConfigs();
  }

  return Object.values(stageConfigs);
}

function getPlayableStageConfigs() {
  return getStageConfigs().filter((config) => config.buttonId);
}

function renderStageButtons() {
  const stack = elements.missionButtonStack;
  if (!stack) {
    return;
  }

  stack.querySelectorAll("[data-stage-mode]").forEach((button) => button.remove());

  const fragment = document.createDocumentFragment();
  getPlayableStageConfigs().forEach((config) => {
    const button = document.createElement("button");
    button.id = config.buttonId;
    button.type = "button";
    button.className = config.buttonClass || (config.mode === "adaptive" ? "primary-button" : "secondary-button");
    button.textContent = config.title;
    button.dataset.stageMode = config.mode;
    if (config.description) {
      button.title = config.description;
    }
    fragment.append(button);
  });

  stack.insertBefore(fragment, elements.operationGuideButton || null);
}

function getStageButton(mode) {
  const config = getStageConfig(mode);
  if (!config?.buttonId) {
    return null;
  }

  return document.querySelector(`#${config.buttonId}`);
}

function createQuestionPoolForStage(config) {
  const moduleFactory = window.MathFitProblems?.[config.poolFactory];
  if (typeof moduleFactory === "function") {
    return moduleFactory();
  }

  const fallbackFactories = {
    stageOne: createStageOneQuestionPool,
    stageOneAddition: createStageOneAdditionQuestionPool,
    stageOneSubtraction: createStageOneSubtractionQuestionPool,
    stageOneMultiplication: createStageOneMultiplicationQuestionPool,
    stageOneDivision: createStageOneDivisionQuestionPool,
    carry: createCarryQuestionPool,
    carryAddition: createCarryAdditionQuestionPool,
    borrowSubtraction: createBorrowSubtractionQuestionPool,
    carryMultiplication: createCarryMultiplicationQuestionPool,
    borrowDivision: createBorrowDivisionQuestionPool,
    twoDigitOneDigit: createTwoDigitOneDigitQuestionPool,
    twoDigitOneDigitSubtraction: createTwoDigitOneDigitSubtractionQuestionPool,
    twoDigitOneDigitDivision: createTwoDigitOneDigitDivisionQuestionPool,
    twoDigitTwoDigit: createTwoDigitTwoDigitQuestionPool,
    twoDigitTwoDigitSubtraction: createTwoDigitTwoDigitSubtractionQuestionPool,
    twoDigitTwoDigitDivision: createTwoDigitTwoDigitDivisionQuestionPool,
    twoDigitMix: createTwoDigitMixQuestionPool,
    twoDigitTwin: createTwoDigitTwinQuestionPool,
    threeDigitJump: createThreeDigitJumpQuestionPool,
    power: createPowerQuestionPool,
  };
  const fallbackFactory = fallbackFactories[config.mode];
  return typeof fallbackFactory === "function" ? fallbackFactory() : [];
}

function hasCachedQuestionPool(mode) {
  return Object.prototype.hasOwnProperty.call(questionPoolsByMode, mode);
}

function getQuestionPoolForMode(mode) {
  if (hasCachedQuestionPool(mode)) {
    return questionPoolsByMode[mode];
  }

  const config = getStageConfig(mode);
  questionPoolsByMode[mode] = config?.poolFactory ? createQuestionPoolForStage(config) : [];
  return questionPoolsByMode[mode];
}

function createQuestionDeck(mode) {
  const config = getStageConfig(mode);
  if (!config?.usesDeck) {
    return [];
  }

  if (config.deckType === "review") {
    return createReviewQuestionDeck(mode);
  }

  return shuffleQuestions(getQuestionPoolForMode(mode));
}

function usesQuestionDeck(mode = state.mode) {
  return Boolean(getStageConfig(mode)?.usesDeck);
}

function createReviewQuestionDeck(mode = "review") {
  const sourceModes = getStageConfig(mode)?.reviewSourceModes || [
    "stageOneAddition",
    "stageOneSubtraction",
    "stageOneMultiplication",
    "stageOneDivision",
    "carryAddition",
    "borrowSubtraction",
    "carryMultiplication",
    "borrowDivision",
    "twoDigitTwoDigitSubtraction",
    "twoDigitTwoDigitDivision",
    "twoDigitMix",
  ];
  const stagePools = sourceModes
    .map((sourceMode) => getQuestionPoolForMode(sourceMode))
    .filter((pool) => pool.length > 0);
  if (stagePools.length === 0) {
    return [];
  }

  const questionTotal = getQuestionTotalForMode(mode);
  const questionsPerStage = Math.floor(questionTotal / stagePools.length);
  const extraQuestions = questionTotal % stagePools.length;
  const reviewQuestions = [];

  stagePools.forEach((pool, index) => {
    const count = questionsPerStage + (index < extraQuestions ? 1 : 0);
    reviewQuestions.push(...shuffleQuestions(pool).slice(0, count));
  });

  return shuffleQuestions(reviewQuestions);
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

  if (isTimeLimitedMode() && getRemainingSeconds() <= 0) {
    finishTimeLimitedStage();
    return;
  }

  const rawAnswer = getAnswerRawInput().trim();
  if (rawAnswer === "") {
    return;
  }

  const userAnswer = parseAnswer(rawAnswer);
  if (userAnswer === null) {
    elements.feedbackText.textContent = "今の問題は、数字・分数・π・e・√を使った式で答えてください。";
    elements.feedbackText.className = "feedback is-wrong";
    elements.answerInput.select();
    return;
  }

  const elapsedSeconds = getElapsedSeconds();
  const isCorrect = Math.abs(userAnswer - state.currentQuestion.answer) < 0.001;
  const skill = state.skills[state.currentQuestion.operation];

  clearInterval(state.timerId);
  elements.answerInput.disabled = true;
  setSubmitButton("答える", true);
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

  saveStageProgressSnapshot();
  adjustLevel(isCorrect, elapsedSeconds, state.currentQuestion.operation);
  updateStats();
  playAnswerSound(isCorrect);
  showFeedback(isCorrect, elapsedSeconds);

  state.awaitingNextQuestion = true;
  setSubmitButton("次へ");
  elements.answerSubmitButton.focus();
  if (isTimeLimitedMode()) {
    updateTimer();
    state.timerId = setInterval(updateTimer, 100);
  }
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

  if (button.dataset.key || button.dataset.rawKey) {
    insertAnswerText(button.dataset.rawKey || button.dataset.key);
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

  const token = normalizeAnswerInputToken(text);
  if (token === "") {
    return;
  }

  const input = elements.answerInput;
  const replacesAll = input.selectionStart === 0
    && input.selectionEnd === input.value.length
    && input.value.length > 0;
  setAnswerRawInput(replacesAll ? token : `${state.answerRawInput}${token}`);
  saveSession();
}

function clearAnswer() {
  if (elements.answerInput.disabled) {
    return;
  }

  setAnswerRawInput("");
  saveSession();
}

function backspaceAnswer() {
  if (elements.answerInput.disabled) {
    return;
  }

  const input = elements.answerInput;
  const clearsAll = input.selectionStart === 0
    && input.selectionEnd === input.value.length
    && input.value.length > 0;

  if (clearsAll) {
    setAnswerRawInput("");
    saveSession();
    return;
  }

  if (state.answerRawInput.length === 0) {
    return;
  }

  setAnswerRawInput(state.answerRawInput.slice(0, -1));
  saveSession();
}

function handleKeydown(event) {
  if (handleAnswerInputKeydown(event)) {
    return;
  }

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

function handleAnswerInputKeydown(event) {
  if (document.activeElement !== elements.answerInput || elements.answerInput.disabled) {
    return false;
  }

  if (event.ctrlKey || event.altKey || event.metaKey) {
    return false;
  }

  if (event.key === "Backspace" || event.key === "Delete") {
    event.preventDefault();
    backspaceAnswer();
    return true;
  }

  if (event.key.length !== 1) {
    return false;
  }

  const token = normalizeAnswerInputToken(event.key);
  if (token === "") {
    return false;
  }

  event.preventDefault();
  insertAnswerText(token);
  return true;
}

function handleAnswerInputChange() {
  setAnswerRawInput(elements.answerInput.value);
  saveSession();
}

function getAnswerRawInput() {
  return state.answerRawInput || elements.answerInput.value || "";
}

function setAnswerRawInput(rawInput) {
  state.answerRawInput = String(rawInput || "");
  elements.answerInput.value = formatGameInput(state.answerRawInput);
  renderAnswerPrettyDisplay();
  updateAnswerInputFit();
  if (!elements.answerInput.disabled && screens.quiz.classList.contains("is-active")) {
    elements.answerInput.focus({ preventScroll: true });
    const cursorPosition = elements.answerInput.value.length;
    elements.answerInput.setSelectionRange(cursorPosition, cursorPosition);
  }
}

function updateAnswerInputFit() {
  const visibleText = elements.answerPrettyDisplay?.textContent || elements.answerInput.value || "";
  const valueLength = Array.from(visibleText === "?" ? "" : visibleText).length;
  const usesTouchInput = touchInputQuery.matches;
  const baseSize = usesTouchInput ? 3.2 : 5.2;
  const minimumSize = usesTouchInput ? 1.05 : 1.35;
  const lengthBudget = usesTouchInput ? 17 : 27;
  const nextSize = valueLength > 0
    ? Math.max(minimumSize, Math.min(baseSize, lengthBudget / valueLength))
    : baseSize;

  elements.answerInput.style.setProperty("--answer-font-size", `${nextSize.toFixed(2)}rem`);
  elements.answerPrettyDisplay?.style.setProperty("--answer-font-size", `${nextSize.toFixed(2)}rem`);
  elements.answerInput.classList.toggle("is-long-answer", valueLength >= 12);
  elements.answerInput.classList.toggle("is-very-long-answer", valueLength >= 20);
  elements.answerPrettyDisplay?.classList.toggle("is-long-answer", valueLength >= 12);
  elements.answerPrettyDisplay?.classList.toggle("is-very-long-answer", valueLength >= 20);
  elements.answerInput.title = visibleText === "?" ? "" : visibleText;
}

function renderAnswerPrettyDisplay() {
  if (!elements.answerPrettyDisplay) {
    return;
  }

  elements.answerPrettyDisplay.innerHTML = "";
  elements.answerPrettyDisplay.classList.toggle("is-placeholder", state.answerRawInput === "");

  if (state.answerRawInput === "") {
    elements.answerPrettyDisplay.textContent = "?";
    return;
  }

  createGameInputDisplayParts(state.answerRawInput).forEach((part) => {
    if (part.type === "text") {
      elements.answerPrettyDisplay.append(document.createTextNode(part.text));
      return;
    }

    if (!part.closed) {
      elements.answerPrettyDisplay.append(document.createTextNode(`√(${part.text}`));
      return;
    }

    const root = document.createElement("span");
    const symbol = document.createElement("span");
    const radicand = document.createElement("span");

    root.className = "sqrt-expression";
    symbol.className = "sqrt-symbol";
    radicand.className = "sqrt-radicand";
    symbol.textContent = "√";
    radicand.textContent = part.text;
    root.append(symbol, radicand);
    elements.answerPrettyDisplay.append(root);
  });
}

function normalizeAnswerInputToken(token) {
  if (window.MathFitInputNotation?.normalizeToken) {
    return window.MathFitInputNotation.normalizeToken(token);
  }

  const replacements = {
    "π": "p",
    "Π": "p",
    "√": "r",
    "×": "*",
    "÷": "/",
    "−": "-",
    "－": "-",
    "＋": "+",
    "．": ".",
    "（": "(",
    "）": ")",
  };
  const value = replacements[token] || token;

  if (/^[0-9+\-*/^.()\\exypr]$/i.test(value)) {
    return value.length === 1 ? value.toLowerCase() : value;
  }

  return "";
}

function formatGameInput(rawInput) {
  if (window.MathFitInputNotation?.formatRawInput) {
    return window.MathFitInputNotation.formatRawInput(rawInput);
  }

  return formatGameInputWithOptions(rawInput, { rootParentheses: "display" });
}

function formatGameInputForParsing(rawInput) {
  if (window.MathFitInputNotation?.formatForParsing) {
    return window.MathFitInputNotation.formatForParsing(rawInput);
  }

  return formatGameInputWithOptions(rawInput, { rootParentheses: "always" });
}

function formatGameInputWithOptions(rawInput, { rootParentheses }) {
  const source = String(rawInput || "");
  let pretty = "";
  let rootBuffer = null;

  const appendToken = (token) => {
    if (rootBuffer !== null) {
      rootBuffer += token;
      return;
    }
    pretty += token;
  };

  const flushRoot = (closed = true) => {
    if (rootBuffer === null) {
      return;
    }
    pretty += formatRootPretty(rootBuffer, closed, rootParentheses);
    rootBuffer = null;
  };

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];

    if (char === "√") {
      flushRoot(true);
      if (source[index + 1] === "(") {
        rootBuffer = "";
        index += 1;
        continue;
      }

      rootBuffer = "";
      continue;
    }

    const normalized = normalizeAnswerInputToken(char) || char;

    if (normalized === "p") {
      appendToken("π");
      continue;
    }

    if (normalized === "r") {
      flushRoot(true);
      rootBuffer = "";
      continue;
    }

    if (normalized === "\\") {
      flushRoot(true);
      continue;
    }

    if (normalized === ")" && rootBuffer !== null) {
      flushRoot(true);
      continue;
    }

    appendToken(normalized);
  }

  flushRoot(rootParentheses === "always");
  return pretty;
}

function formatRootPretty(content, closed, rootParentheses) {
  if (content === "") {
    return rootParentheses === "always" ? (closed ? "√()" : "√(") : closed ? "√" : "√(";
  }

  if (rootParentheses === "always") {
    return `√(${content}${closed ? ")" : ""}`;
  }

  if (!closed) {
    return `√(${content}`;
  }

  return `√${content}`;
}

function createGameInputDisplayParts(rawInput) {
  if (window.MathFitInputNotation?.createDisplayParts) {
    return window.MathFitInputNotation.createDisplayParts(rawInput);
  }

  const source = String(rawInput || "");
  const parts = [];
  let rootBuffer = null;
  let textBuffer = "";

  const appendText = (text) => {
    if (rootBuffer !== null) {
      rootBuffer += text;
      return;
    }
    textBuffer += text;
  };

  const flushText = () => {
    if (textBuffer === "") {
      return;
    }
    parts.push({ type: "text", text: textBuffer });
    textBuffer = "";
  };

  const startRoot = () => {
    flushRoot(true);
    flushText();
    rootBuffer = "";
  };

  const flushRoot = (closed) => {
    if (rootBuffer === null) {
      return;
    }
    parts.push({ type: "root", text: rootBuffer, closed });
    rootBuffer = null;
  };

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];

    if (char === "√") {
      startRoot();
      if (source[index + 1] === "(") {
        index += 1;
      }
      continue;
    }

    const normalized = normalizeAnswerInputToken(char) || char;

    if (normalized === "p") {
      appendText("π");
      continue;
    }

    if (normalized === "r") {
      startRoot();
      continue;
    }

    if (normalized === "\\") {
      flushRoot(true);
      continue;
    }

    if (normalized === ")" && rootBuffer !== null) {
      flushRoot(true);
      continue;
    }

    appendText(normalized);
  }

  flushRoot(false);
  flushText();
  return parts;
}

function pauseGame() {
  if (!state.currentQuestion || state.isPaused || state.awaitingNextQuestion) {
    return;
  }

  clearPendingNextQuestion();
  clearInterval(state.timerId);
  state.isPaused = true;
  state.pauseStartedAt = performance.now();
  saveStageProgressSnapshot();
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

  const pauseDuration = performance.now() - state.pauseStartedAt;
  state.questionStartedAt += pauseDuration;
  if (isTimeLimitedMode()) {
    state.missionStartedAt += pauseDuration;
  }
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
  saveStageProgressSnapshot();
  state.isPaused = false;
  state.awaitingNextQuestion = false;
  state.currentQuestion = null;
  state.missionStartedAt = 0;
  state.timeLimitReached = false;
  setAnswerRawInput("");
  setSubmitButton("答える");
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
  state.missionStartedAt = 0;
  state.timeLimitReached = false;
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
  const nextText = isTimeLimitedMode() ? "Enterで次へ。残り時間は進むよ。" : "Enterで次へ。";

  if (isCorrect) {
    elements.feedbackText.textContent = `正解。${timeText}で回答しました。${nextText}`;
    elements.feedbackText.classList.add("is-correct");
    if (state.newReward) {
      setPilotMessage(rewardMessages.createUnlockComms(state.newReward), "victory");
      return;
    }
    const mood = state.streak >= 3 ? "victory" : "happy";
    const streakText = state.streak >= 2 ? `${state.streak}連続成功。` : "";
    setPilotMessage(`${streakText}きれいな航行計算だったよ。`, mood);
    return;
  }

  elements.feedbackText.textContent = `答えは ${correctAnswer}。${nextText}`;
  elements.feedbackText.classList.add("is-wrong");
  setPilotMessage(`答えは ${correctAnswer}。この記録を見て、次の航路で取り返そう。`, "surprised");
}

function createQuestionComms(question) {
  const operation = operationLabels[question.operation];

  if (state.mode === "stageOne") {
    return `Stage 1 スター航路 ${state.questionIndex}/${getQuestionTotal()}。${operation}の小さな星を回収しよう。`;
  }

  if (state.mode === "carryAddition") {
    return `Stage 2-1 たし算航路 ${state.questionIndex}/${getQuestionTotal()}。繰り上がりの反応を見ていくよ。`;
  }

  if (state.mode === "borrowSubtraction") {
    return `Stage 2-2 ひき算航路 ${state.questionIndex}/${getQuestionTotal()}。繰り下がりの反応を見ていくよ。`;
  }

  if (state.mode === "carryMultiplication") {
    return `Stage 2-3 かけ算航路 ${state.questionIndex}/${getQuestionTotal()}。繰り上がりの反応を見ていくよ。`;
  }

  if (state.mode === "borrowDivision") {
    return `Stage 2-4 わり算航路 ${state.questionIndex}/${getQuestionTotal()}。繰り下がりの反応を見ていくよ。`;
  }

  if (state.mode === "twoDigitTwoDigitSubtraction") {
    return `Stage 3 ひき算航路 ${state.questionIndex}/${getQuestionTotal()}。二桁どうしで、ひき算の信号を一桁に着地させよう。`;
  }

  if (state.mode === "twoDigitTwoDigitDivision") {
    return `Stage 4 わり算航路 ${state.questionIndex}/${getQuestionTotal()}。二桁どうしで、わり算の信号を一桁に着地させよう。`;
  }

  if (state.mode === "twoDigitMix") {
    return `Stage 5 ミックス航路 ${state.questionIndex}/${getQuestionTotal()}。二桁と一桁を組み替えて、${operation}を二桁に着地させよう。`;
  }

  if (state.mode === "twoDigitTwin") {
    return `Stage 6 ツイン航路 ${state.questionIndex}/${getQuestionTotal()}。二桁どうしで、${operation}を二桁に着地させよう。`;
  }

  if (state.mode === "threeDigitJump") {
    return `Stage 7 三桁ジャンプ ${state.questionIndex}/${getQuestionTotal()}。${operation}で、二桁と三桁の境目を飛びこえよう。`;
  }

  if (state.mode === "power") {
    return `Stage 8 同じ数かけ算 ${state.questionIndex}/${getQuestionTotal()}。同じ数をくり返しかけて、地図を明るくしよう。`;
  }

  if (state.mode === "review") {
    return `${REVIEW_STAGE_NAME} ${state.questionIndex}/${getQuestionTotal()}。${question.stage}からランダム出題。残り${formatTime(getRemainingSeconds())}。`;
  }

  return `診断ミッション ${state.questionIndex}/${getQuestionTotal()}。今回は${operation}の信号だよ。`;
}

function createResultComms(accuracy, weakSkill) {
  return resultMessages.createResultComms({ accuracy, weakSkill });
}

function createStartComms(mode) {
  const config = getStageConfig(mode);
  const questionTotal = getQuestionTotalForMode(mode);
  if (config?.timeLimitSeconds) {
    const detail = config.startDetail || "時間内に落ち着いて進めよう。";
    return `${missionNames[mode]}、${formatTime(config.timeLimitSeconds)}で${questionTotal}問。${detail}`;
  }

  if (config?.startDetail) {
    return `${missionNames[mode]}、${questionTotal}問。${config.startDetail}`;
  }

  return `${missionNames[mode]}、出発準備完了。最初の問題へ行くよ。`;
}

function isTimeLimitedMode(mode = state.mode) {
  return Boolean(getStageConfig(mode)?.timeLimitSeconds);
}

function getTimeLimitSecondsForMode(mode = state.mode) {
  return getStageConfig(mode)?.timeLimitSeconds || null;
}

function getMissionElapsedSeconds() {
  if (!isTimeLimitedMode() || !state.missionStartedAt) {
    return 0;
  }

  return Math.max(0, (performance.now() - state.missionStartedAt) / 1000);
}

function getRemainingSeconds() {
  const limit = getTimeLimitSecondsForMode();

  if (!limit) {
    return 0;
  }

  return Math.max(0, limit - getMissionElapsedSeconds());
}

function finishTimeLimitedStage() {
  if (!isTimeLimitedMode() || state.timeLimitReached || screens.result.classList.contains("is-active")) {
    return;
  }

  state.timeLimitReached = true;
  state.awaitingNextQuestion = false;
  clearInterval(state.timerId);
  clearPendingNextQuestion();
  elements.answerInput.disabled = true;
  setSubmitButton("答える", true);
  setPilotMessage(`${formatTime(getTimeLimitSecondsForMode())}終了。ここまでの航行ログで診断するね。`, "surprised");
  showResults();
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
  if (isTimeLimitedMode()) {
    const remainingSeconds = getRemainingSeconds();
    elements.timerText.textContent = `残り${formatTime(remainingSeconds)}`;

    if (remainingSeconds <= 0) {
      finishTimeLimitedStage();
    }
    return;
  }

  elements.timerText.textContent = formatTime(getElapsedSeconds());
}

function getElapsedSeconds() {
  return (performance.now() - state.questionStartedAt) / 1000;
}

function showResults() {
  clearInterval(state.timerId);
  clearSavedSession(state.mode);
  showScreen("result");

  const questionTotal = getQuestionTotal();
  const diagnosis = window.MathFitDiagnosis?.buildDiagnosisResult
    ? window.MathFitDiagnosis.buildDiagnosisResult({
      score: state.score,
      questionTotal,
      totalTime: state.totalTime,
      timeLimitReached: state.timeLimitReached,
      history: state.history,
      skills: state.skills,
      level: state.level,
      fastSeconds: FAST_SECONDS,
      operationLabels,
    })
    : null;
  const accuracy = diagnosis?.accuracy ?? Math.round((state.score / questionTotal) * 100);
  const averageTimeDivisor = state.timeLimitReached ? Math.max(1, state.history.length) : questionTotal;
  const averageTime = diagnosis?.averageTime ?? (state.totalTime / averageTimeDivisor);
  const weakSkill = diagnosis?.weakTags?.[0] || getWeakSkill(1);
  const strongSkills = diagnosis?.strongTags || getStrongSkills();
  const watchSkills = diagnosis?.mistakeTypes || getWatchSkills();
  const title = state.timeLimitReached ? "タイムアップ診断完了" : getResultTitle(accuracy, state.level);

  updateStageProgressAfterResult(questionTotal, accuracy);
  elements.resultTitle.textContent = title;
  elements.resultSummary.textContent = state.timeLimitReached
    ? createTimeLimitResultSummary(accuracy, weakSkill)
    : createResultSummary(accuracy, averageTime, weakSkill);
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
  return resultMessages.getResultTitle({ accuracy, level });
}

function createResultSummary(accuracy, averageTime, weakSkill) {
  return resultMessages.createResultSummary({ accuracy, averageTime, weakSkill });
}

function createTimeLimitResultSummary(accuracy, weakSkill) {
  return resultMessages.createTimeLimitResultSummary({
    accuracy,
    weakSkill,
    answeredCount: state.history.length,
    questionTotal: getQuestionTotal(),
    timeLimitSeconds: getTimeLimitSecondsForMode(),
  });
}

function createCurrentPositionText(accuracy, averageTime) {
  return resultMessages.createCurrentPositionText({
    accuracy,
    averageTime,
    level: state.level,
  });
}

function createStrengthText(strongSkills) {
  return resultMessages.createStrengthText({ strongSkills });
}

function createWatchText(watchSkills) {
  return resultMessages.createWatchText({ watchSkills });
}

function createNextStepText(accuracy, weakSkill, watchSkills) {
  return resultMessages.createNextStepText({
    accuracy,
    weakSkill,
    watchSkills,
    level: state.level,
  });
}

function createRewardResultText() {
  return rewardMessages.createRewardResultText({
    totalCorrect: profile.totalCorrect,
    currentReward: getCurrentReward(),
    nextReward: getNextReward(),
  });
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
  const config = getStageConfig(mode);
  if (typeof config?.questionTotal === "number") {
    return config.questionTotal;
  }

  if (hasCachedQuestionPool(mode)) {
    return getQuestionPoolForMode(mode).length || TOTAL_QUESTIONS;
  }

  if (Number.isFinite(Number(config?.expectedPoolSize))) {
    return Number(config.expectedPoolSize);
  }

  if (config?.questionTotal === "pool" || config?.poolFactory) {
    return getQuestionPoolForMode(mode).length || TOTAL_QUESTIONS;
  }

  return TOTAL_QUESTIONS;
}

function parseAnswer(rawAnswer) {
  const normalized = normalizeAnswer(formatGameInputForParsing(rawAnswer));
  const expressionValue = parseNumericExpression(normalized);

  if (expressionValue !== null) {
    return expressionValue;
  }

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
  return String(rawAnswer || "")
    .trim()
    .replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .replace(/[＋]/g, "+")
    .replace(/[−－]/g, "-")
    .replace(/[．]/g, ".")
    .replace(/[／÷]/g, "/")
    .replace(/[＼￥]/g, "\\")
    .replace(/[×]/g, "*")
    .replace(/[πΠpP]/g, "π")
    .replace(/[√rR]/g, "√")
    .replace(/\s/g, "");
}

function parseNumericExpression(expression) {
  if (expression === "" || /[xy]/i.test(expression)) {
    return null;
  }

  const parser = {
    text: expression,
    index: 0,
    parseExpression(stopChar = null) {
      let value = this.parseTerm(stopChar);
      if (value === null) {
        return null;
      }

      while (!this.isDone(stopChar)) {
        const operator = this.peek();
        if (operator !== "+" && operator !== "-") {
          break;
        }

        this.index += 1;
        const nextValue = this.parseTerm(stopChar);
        if (nextValue === null) {
          return null;
        }
        value = operator === "+" ? value + nextValue : value - nextValue;
      }

      return value;
    },
    parseTerm(stopChar) {
      let value = this.parseFactor(stopChar);
      if (value === null) {
        return null;
      }

      while (!this.isDone(stopChar)) {
        const operator = this.peek();
        if (operator !== "*" && operator !== "×" && operator !== "/" && operator !== "÷") {
          break;
        }

        this.index += 1;
        const nextValue = this.parseFactor(stopChar);
        if (nextValue === null || ((operator === "/" || operator === "÷") && nextValue === 0)) {
          return null;
        }
        value = operator === "*" || operator === "×" ? value * nextValue : value / nextValue;
      }

      return value;
    },
    parseFactor(stopChar) {
      const char = this.peek();

      if (char === "+" || char === "-") {
        this.index += 1;
        const value = this.parseFactor(stopChar);
        return value === null ? null : (char === "-" ? -value : value);
      }

      if (char === "√") {
        this.index += 1;
        const rootStopChar = this.peek() === "(" ? ")" : "\\";
        if (this.peek() === "(") {
          this.index += 1;
        }
        const value = this.parseExpression(rootStopChar);
        if (value === null || value < 0 || this.peek() !== rootStopChar) {
          return null;
        }
        this.index += 1;
        return Math.sqrt(value);
      }

      if (char === "(") {
        this.index += 1;
        const value = this.parseExpression(")");
        if (value === null || this.peek() !== ")") {
          return null;
        }
        this.index += 1;
        return value;
      }

      if (char === "π") {
        this.index += 1;
        return Math.PI;
      }

      if (char === "e") {
        this.index += 1;
        return Math.E;
      }

      return this.parseNumber();
    },
    parseNumber() {
      const start = this.index;

      while (/[0-9.]/.test(this.peek())) {
        this.index += 1;
      }

      if (start === this.index) {
        return null;
      }

      const rawNumber = this.text.slice(start, this.index);
      if ((rawNumber.match(/\./g) || []).length > 1) {
        return null;
      }

      const value = Number(rawNumber);
      return Number.isFinite(value) ? value : null;
    },
    peek() {
      return this.text[this.index] || "";
    },
    isDone(stopChar = null) {
      return this.index >= this.text.length || (stopChar !== null && this.peek() === stopChar);
    },
  };

  const value = parser.parseExpression();
  if (value === null || parser.index !== parser.text.length || !Number.isFinite(value)) {
    return null;
  }

  return value;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
