(() => {
  "use strict";

  const keys = {
    session: "mathfit-yuri-session-v1",
    sessions: "mathfit-yuri-sessions-v2",
    profile: "mathfit-yuri-profile-v1",
    bgm: "mathfit-yuri-bgm-v1",
    stageProgress: "mathfit-yuri-stage-progress-v1",
  };

  function loadJson(key) {
    try {
      const rawValue = localStorage.getItem(key);
      return rawValue ? JSON.parse(rawValue) : null;
    } catch {
      return null;
    }
  }

  function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function removeJson(key) {
    localStorage.removeItem(key);
  }

  function normalizeSessions(value) {
    if (!value) {
      return {};
    }
    if (value.sessions && typeof value.sessions === "object") {
      return value.sessions;
    }
    return typeof value === "object" ? value : {};
  }

  function loadSessions() {
    return normalizeSessions(loadJson(keys.sessions));
  }

  function saveSessions(sessions) {
    saveJson(keys.sessions, {
      version: 2,
      savedAt: Date.now(),
      sessions: sessions || {},
    });
  }

  function getLatestSession(sessions) {
    return Object.values(sessions || {})
      .filter((session) => session?.currentQuestion)
      .sort((a, b) => Number(b.savedAt || 0) - Number(a.savedAt || 0))[0] || null;
  }

  function loadSession(mode) {
    const sessions = loadSessions();
    const session = mode ? sessions[mode] : getLatestSession(sessions);
    if (session) {
      return session;
    }
    return mode ? null : loadJson(keys.session);
  }

  function saveSession(session) {
    const mode = session?.mode;
    if (!mode) {
      return;
    }
    const sessions = loadSessions();
    sessions[mode] = session;
    saveSessions(sessions);
  }

  function removeSession(mode) {
    if (!mode) {
      removeJson(keys.session);
      removeJson(keys.sessions);
      return;
    }
    const sessions = loadSessions();
    delete sessions[mode];
    saveSessions(sessions);
  }

  function loadProfile() {
    return loadJson(keys.profile);
  }

  function saveProfile(profile) {
    saveJson(keys.profile, profile);
  }

  function loadStageProgress() {
    return loadJson(keys.stageProgress);
  }

  function saveStageProgress(stageProgress) {
    saveJson(keys.stageProgress, stageProgress);
  }

  function loadProgress() {
    return {
      profile: loadProfile(),
      stageProgress: loadStageProgress(),
      savedSession: loadSession(),
      savedSessions: loadSessions(),
      bgmState: loadJson(keys.bgm),
    };
  }

  function saveProgress(progress) {
    if (Object.prototype.hasOwnProperty.call(progress, "profile")) {
      saveProfile(progress.profile);
    }
    if (Object.prototype.hasOwnProperty.call(progress, "stageProgress")) {
      saveStageProgress(progress.stageProgress);
    }
    if (Object.prototype.hasOwnProperty.call(progress, "savedSession")) {
      saveSession(progress.savedSession);
    }
    if (Object.prototype.hasOwnProperty.call(progress, "savedSessions")) {
      saveSessions(progress.savedSessions);
    }
    if (Object.prototype.hasOwnProperty.call(progress, "bgmState")) {
      saveJson(keys.bgm, progress.bgmState);
    }
  }

  function resetProgress() {
    removeJson(keys.session);
    removeJson(keys.profile);
    removeJson(keys.stageProgress);
    removeJson(keys.bgm);
  }

  window.MathFitStorage = {
    keys,
    loadJson,
    saveJson,
    removeJson,
    loadSessions,
    saveSessions,
    loadSession,
    saveSession,
    removeSession,
    loadProfile,
    saveProfile,
    loadStageProgress,
    saveStageProgress,
    loadProgress,
    saveProgress,
    resetProgress,
  };
})();
