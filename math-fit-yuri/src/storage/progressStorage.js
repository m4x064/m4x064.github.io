(() => {
  "use strict";

  const keys = {
    session: "mathfit-yuri-session-v1",
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

  function loadSession() {
    return loadJson(keys.session);
  }

  function saveSession(session) {
    saveJson(keys.session, session);
  }

  function removeSession() {
    removeJson(keys.session);
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
