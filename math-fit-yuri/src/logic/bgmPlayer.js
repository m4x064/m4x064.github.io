(() => {
  "use strict";

  const DEFAULT_VOLUME_TOUCH = 0.12;
  const DEFAULT_VOLUME_KEYBOARD = 0.32;
  const LOOP_FADE_SECONDS = 1.6;
  const LOOP_RESTART_SECONDS = 0.08;
  const KEEP_ALIVE_MS = 1800;

  const tracks = [
    {
      label: "Moon Glitter",
      src: "bgm/brown_moon_glitter_loop.wav",
    },
    {
      label: "Comet Dust",
      src: "bgm/brown_comet_dust_loop.wav",
    },
    {
      label: "Orbit Music Box",
      src: "bgm/brown_orbit_music_box_loop.wav",
    },
    {
      label: "Snow Starfall",
      src: "bgm/brown_snow_starfall_loop.wav",
    },
    {
      label: "Starlight Chimes",
      src: "bgm/brown_starlight_chimes_loop.wav",
    },
    {
      label: "Crystal Focus",
      src: "bgm/brown_crystal_focus_loop.wav",
    },
    {
      label: "Focus Room",
      src: "bgm/brown_focus_room_loop.wav",
    },
    {
      label: "Soft Rain",
      src: "bgm/brown_soft_rain_drone_loop.wav",
    },
  ];

  function createBgmPlayer({
    storageKey,
    controls,
    readJson,
    writeJson,
    usesTouchInput,
    onBlocked,
  }) {
    let audio = null;
    let state = loadState();
    let fadeAnimationId = null;
    let loopFadeActive = false;
    let keepAliveTimerId = null;
    let resumeInFlight = false;

    function setupControls() {
      if (controls.select) {
        controls.select.innerHTML = "";
        tracks.forEach((track, index) => {
          const option = document.createElement("option");
          option.value = String(index);
          option.textContent = track.label;
          controls.select.append(option);
        });
      }

      updateControls();
    }

    function loadState() {
      const savedState = readJson(storageKey) || {};
      const trackIndex = Number(savedState.trackIndex);
      const savedVolume = Number(savedState.volume);
      const defaultVolume = getDefaultVolume();

      return {
        enabled: false,
        trackIndex: Number.isInteger(trackIndex) && tracks[trackIndex] ? trackIndex : 0,
        volume: Number.isFinite(savedVolume) ? clamp(savedVolume) : defaultVolume,
      };
    }

    function saveState() {
      writeJson(storageKey, state);
    }

    function getExportState() {
      return readJson(storageKey) || { ...state };
    }

    function importState(importedState = {}) {
      const importedTrackIndex = Number(importedState.trackIndex);
      const importedVolume = Number(importedState.volume);

      state = {
        ...loadState(),
        ...importedState,
        trackIndex: Number.isInteger(importedTrackIndex) && tracks[importedTrackIndex] ? importedTrackIndex : 0,
        volume: Number.isFinite(importedVolume) ? clamp(importedVolume) : getDefaultVolume(),
      };
      state.enabled = false;
      saveState();
      updateControls();
    }

    function toggle() {
      if (state.enabled) {
        pause();
        return;
      }

      state.enabled = true;
      saveState();
      playCurrent();
    }

    function changeTrack() {
      const nextIndex = Number(controls.select?.value);
      state.trackIndex = Number.isInteger(nextIndex) && tracks[nextIndex] ? nextIndex : 0;
      saveState();

      if (state.enabled) {
        playCurrent();
      } else {
        updateControls();
      }
    }

    function changeVolume() {
      const nextVolume = Number(controls.volumeSlider?.value) / 100;
      state.volume = Number.isFinite(nextVolume) ? clamp(nextVolume) : getDefaultVolume();
      saveState();
      updateControls();

      if (audio && state.enabled && !loopFadeActive) {
        audio.volume = getTargetVolume();
      }
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        cancelFade();
        loopFadeActive = false;
        if (audio && state.enabled) {
          audio.volume = getTargetVolume();
        }
        return;
      }

      ensureContinuity();
    }

    function startKeepAlive() {
      if (keepAliveTimerId !== null) {
        return;
      }

      keepAliveTimerId = window.setInterval(() => {
        ensureContinuity();
      }, KEEP_ALIVE_MS);
    }

    function ensureContinuity() {
      if (!state.enabled || resumeInFlight) {
        return;
      }

      const track = getCurrentTrack();
      if (!track) {
        return;
      }

      const currentAudio = getAudio();
      currentAudio.loop = true;
      if (!currentAudio.src.endsWith(track.src)) {
        currentAudio.src = track.src;
        currentAudio.load();
      }

      if (!document.hidden && loopFadeActive && currentAudio.paused) {
        loopFadeActive = false;
      }

      if (document.hidden) {
        currentAudio.volume = getTargetVolume();
        return;
      }

      if (!currentAudio.paused && !currentAudio.ended && currentAudio.readyState > 0) {
        if (!loopFadeActive) {
          currentAudio.volume = getTargetVolume();
        }
        return;
      }

      cancelFade();
      loopFadeActive = false;
      resumeInFlight = true;
      currentAudio.volume = Math.min(currentAudio.volume || 0, getTargetVolume());
      currentAudio.play()
        .then(() => {
          resumeInFlight = false;
          updateControls();
          fadeTo(getTargetVolume(), 500);
        })
        .catch(() => {
          resumeInFlight = false;
          updateControls();
        });
    }

    function updateControls() {
      const track = getCurrentTrack();
      const volumePercent = Math.round(getTargetVolume() * 100);

      if (controls.toggleButton) {
        controls.toggleButton.textContent = state.enabled ? "BGM ON" : "BGM OFF";
        controls.toggleButton.classList.toggle("is-on", state.enabled);
        controls.toggleButton.title = track ? `BGM: ${track.label}` : "BGM";
      }

      if (controls.select) {
        controls.select.value = String(state.trackIndex);
      }

      if (controls.volumeSlider) {
        controls.volumeSlider.value = String(volumePercent);
      }

      if (controls.volumeText) {
        controls.volumeText.textContent = `${volumePercent}%`;
      }
    }

    function getDefaultVolume() {
      return usesTouchInput() ? DEFAULT_VOLUME_TOUCH : DEFAULT_VOLUME_KEYBOARD;
    }

    function getTargetVolume() {
      return Number.isFinite(Number(state?.volume))
        ? clamp(Number(state.volume))
        : getDefaultVolume();
    }

    function getCurrentTrack() {
      return tracks[state.trackIndex] || tracks[0];
    }

    function getAudio() {
      if (!audio) {
        audio = new Audio();
        audio.loop = true;
        audio.volume = getTargetVolume();
        audio.preload = "auto";
        audio.addEventListener("timeupdate", handleLoopFade);
        audio.addEventListener("ended", handleEnded);
      }

      return audio;
    }

    function playCurrent() {
      const track = getCurrentTrack();
      const currentAudio = getAudio();
      const sourceChanged = !currentAudio.src.endsWith(track.src);
      currentAudio.loop = true;

      if (sourceChanged) {
        currentAudio.src = track.src;
        currentAudio.load();
      }

      cancelFade();
      loopFadeActive = false;
      if (sourceChanged || currentAudio.paused) {
        currentAudio.volume = 0;
      }

      resumeInFlight = true;
      currentAudio.play()
        .then(() => {
          state.enabled = true;
          resumeInFlight = false;
          saveState();
          updateControls();
          fadeTo(getTargetVolume(), 800);
        })
        .catch(() => {
          resumeInFlight = false;
          state.enabled = false;
          saveState();
          updateControls();
          onBlocked?.();
        });
    }

    function pause() {
      if (audio) {
        cancelFade();
        loopFadeActive = false;
        resumeInFlight = false;
        audio.pause();
      }
      state.enabled = false;
      saveState();
      updateControls();
    }

    function handleLoopFade() {
      const currentAudio = getAudio();
      if (!state.enabled || loopFadeActive || currentAudio.paused) {
        return;
      }

      if (document.hidden) {
        currentAudio.volume = getTargetVolume();
        return;
      }

      if (!Number.isFinite(currentAudio.duration) || currentAudio.duration <= LOOP_FADE_SECONDS + 0.4) {
        return;
      }

      const remainingSeconds = currentAudio.duration - currentAudio.currentTime;
      if (remainingSeconds > LOOP_FADE_SECONDS) {
        return;
      }

      loopFadeActive = true;
      fadeTo(0, LOOP_FADE_SECONDS * 1000, () => {
        if (!state.enabled) {
          loopFadeActive = false;
          return;
        }

        currentAudio.currentTime = LOOP_RESTART_SECONDS;
        currentAudio.volume = 0;
        resumeInFlight = true;
        currentAudio.play()
          .then(() => {
            resumeInFlight = false;
            fadeTo(getTargetVolume(), LOOP_FADE_SECONDS * 1000, () => {
              loopFadeActive = false;
            });
          })
          .catch(() => {
            resumeInFlight = false;
            loopFadeActive = false;
          });
      });
    }

    function handleEnded() {
      if (!state.enabled) {
        return;
      }

      const currentAudio = getAudio();
      cancelFade();
      loopFadeActive = true;
      resumeInFlight = true;
      currentAudio.currentTime = LOOP_RESTART_SECONDS;
      currentAudio.volume = 0;
      currentAudio.play()
        .then(() => {
          fadeTo(getTargetVolume(), LOOP_FADE_SECONDS * 1000, () => {
            loopFadeActive = false;
            resumeInFlight = false;
          });
        })
        .catch(() => {
          loopFadeActive = false;
          resumeInFlight = false;
        });
    }

    function fadeTo(targetVolume, durationMs, onDone = null) {
      const currentAudio = getAudio();
      const startVolume = currentAudio.volume;
      const safeTarget = clamp(targetVolume);
      const startedAt = performance.now();

      cancelFade();

      if (document.hidden) {
        currentAudio.volume = safeTarget;
        onDone?.();
        return;
      }

      if (durationMs <= 0) {
        currentAudio.volume = safeTarget;
        onDone?.();
        return;
      }

      const step = (now) => {
        const progress = Math.min(1, (now - startedAt) / durationMs);
        currentAudio.volume = startVolume + (safeTarget - startVolume) * progress;

        if (progress < 1) {
          fadeAnimationId = requestAnimationFrame(step);
          return;
        }

        fadeAnimationId = null;
        onDone?.();
      };

      fadeAnimationId = requestAnimationFrame(step);
    }

    function cancelFade() {
      if (fadeAnimationId !== null) {
        cancelAnimationFrame(fadeAnimationId);
        fadeAnimationId = null;
      }
    }

    function clamp(value) {
      return Math.max(0, Math.min(1, Number(value)));
    }

    return {
      setupControls,
      toggle,
      changeTrack,
      changeVolume,
      handleVisibilityChange,
      startKeepAlive,
      ensureContinuity,
      updateControls,
      getExportState,
      importState,
    };
  }

  window.MathFitBgmPlayer = {
    createBgmPlayer,
    tracks,
  };
})();
