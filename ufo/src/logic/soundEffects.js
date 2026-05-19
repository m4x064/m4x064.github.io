(() => {
  "use strict";

  function createSoundEffects() {
    let soundContext = null;
    let soundUnlocked = false;
    const answerSoundPlayers = {
      correct: null,
      wrong: null,
    };

    function prime() {
      const context = getSoundContext();
      prepareAnswerSoundPlayers();

      if (!context || soundUnlocked) {
        return;
      }

      const unlock = () => {
        playTone(context, 440, 0, 0.02, "sine", 0.0008);
        soundUnlocked = true;
      };

      if (context.state === "suspended") {
        context.resume().then(unlock).catch(() => undefined);
        return;
      }

      unlock();
    }

    function playAnswer(isCorrect) {
      const audio = getAnswerSoundPlayer(isCorrect);

      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => playSynthAnswerSound(isCorrect));
        return;
      }

      playSynthAnswerSound(isCorrect);
    }

    function prepareAnswerSoundPlayers() {
      getAnswerSoundPlayer(true);
      getAnswerSoundPlayer(false);
    }

    function getSoundContext() {
      const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;

      if (!AudioContextConstructor) {
        return null;
      }

      if (!soundContext) {
        soundContext = new AudioContextConstructor();
      }

      if (soundContext.state === "suspended") {
        soundContext.resume().catch(() => undefined);
      }

      return soundContext;
    }

    function getAnswerSoundPlayer(isCorrect) {
      const key = isCorrect ? "correct" : "wrong";

      if (answerSoundPlayers[key]) {
        return answerSoundPlayers[key];
      }

      if (typeof Audio !== "function") {
        return null;
      }

      const notes = isCorrect
        ? [
            { frequency: 659.25, start: 0, duration: 0.11, volume: 0.46 },
            { frequency: 880, start: 0.09, duration: 0.12, volume: 0.5 },
            { frequency: 1174.66, start: 0.2, duration: 0.18, volume: 0.42 },
          ]
        : [
            { frequency: 246.94, start: 0, duration: 0.16, volume: 0.46 },
            { frequency: 174.61, start: 0.14, duration: 0.23, volume: 0.4 },
          ];
      const audio = new Audio(createWaveDataUri(notes, isCorrect ? 0.46 : 0.4));

      audio.preload = "auto";
      answerSoundPlayers[key] = audio;
      return audio;
    }

    function createWaveDataUri(notes, totalDuration) {
      const sampleRate = 22050;
      const sampleCount = Math.ceil(totalDuration * sampleRate);
      const dataSize = sampleCount * 2;
      const buffer = new ArrayBuffer(44 + dataSize);
      const view = new DataView(buffer);

      writeWaveString(view, 0, "RIFF");
      view.setUint32(4, 36 + dataSize, true);
      writeWaveString(view, 8, "WAVE");
      writeWaveString(view, 12, "fmt ");
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeWaveString(view, 36, "data");
      view.setUint32(40, dataSize, true);

      for (let index = 0; index < sampleCount; index += 1) {
        const time = index / sampleRate;
        const sample = notes.reduce((value, note) => value + createNoteSample(note, time), 0);
        view.setInt16(44 + index * 2, Math.max(-1, Math.min(1, sample)) * 0x7fff, true);
      }

      return `data:audio/wav;base64,${arrayBufferToBase64(buffer)}`;
    }

    function createNoteSample(note, time) {
      const elapsed = time - note.start;

      if (elapsed < 0 || elapsed > note.duration) {
        return 0;
      }

      const attack = Math.min(0.018, note.duration / 4);
      const release = Math.min(0.07, note.duration / 2);
      const attackGain = Math.min(1, elapsed / attack);
      const releaseGain = Math.min(1, (note.duration - elapsed) / release);
      const envelope = Math.max(0, Math.min(attackGain, releaseGain));

      return Math.sin(2 * Math.PI * note.frequency * elapsed) * note.volume * envelope;
    }

    function writeWaveString(view, offset, text) {
      for (let index = 0; index < text.length; index += 1) {
        view.setUint8(offset + index, text.charCodeAt(index));
      }
    }

    function arrayBufferToBase64(buffer) {
      let binary = "";
      const bytes = new Uint8Array(buffer);

      bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
      });

      return btoa(binary);
    }

    function playSynthAnswerSound(isCorrect) {
      const context = getSoundContext();

      if (!context) {
        return;
      }

      if (context.state === "suspended") {
        context.resume().then(() => playAnswer(isCorrect)).catch(() => undefined);
        return;
      }

      soundUnlocked = true;

      if (isCorrect) {
        playTone(context, 659.25, 0, 0.12, "sine", 0.18);
        playTone(context, 880, 0.1, 0.12, "sine", 0.2);
        playTone(context, 1174.66, 0.2, 0.18, "triangle", 0.16);
        return;
      }

      playTone(context, 246.94, 0, 0.16, "triangle", 0.18);
      playTone(context, 174.61, 0.14, 0.22, "sine", 0.14);
    }

    function playTone(context, frequency, delay, duration, type, volume) {
      const startTime = context.currentTime + delay;
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, startTime);
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(startTime);
      oscillator.stop(startTime + duration + 0.03);
    }

    return {
      prime,
      playAnswer,
    };
  }

  window.MathFitSoundEffects = {
    createSoundEffects,
  };
})();
