const SOUND_KEY = "prepquest_sound_muted";

const SOUND_PATHS = {
  correct: "/audio/correct-clap.mp3",
  wrong: "/audio/wrong.mp3",
  click: "/audio/click.mp3",
  levelUp: "/audio/level-up.mp3",
  complete: "/audio/complete.mp3",
};

const SOUND_VOLUME = {
  correct: 0.35,
  wrong: 0.38,
  click: 0.45,
  complete: 0.45,
  levelUp: 0.45,
};

const SOUND_MAX_DURATION_MS = {
  correct: 1800,
};

let audioContext;

export function getSoundMuted() {
  return localStorage.getItem(SOUND_KEY) === "true";
}

export function setSoundMuted(value) {
  localStorage.setItem(SOUND_KEY, String(Boolean(value)));
}

export function toggleSoundMuted() {
  const nextValue = !getSoundMuted();
  setSoundMuted(nextValue);
  return nextValue;
}

export function playSound(soundName) {
  if (getSoundMuted()) return;

  const path = SOUND_PATHS[soundName];
  if (!path) return;

  try {
    const audio = new Audio(path);
    let usedFallback = false;
    const fallback = () => {
      if (usedFallback || getSoundMuted()) return;
      usedFallback = true;
      playGeneratedSound(soundName);
    };

    audio.volume = SOUND_VOLUME[soundName] ?? 0.45;
    audio.currentTime = 0;
    audio.onerror = fallback;
    capPlayback(audio, soundName);
    audio.play().catch(fallback);
  } catch {
    playGeneratedSound(soundName);
  }
}

function capPlayback(audio, soundName) {
  const maxDuration = SOUND_MAX_DURATION_MS[soundName];
  if (!maxDuration) return;

  window.setTimeout(() => {
    if (audio.paused) return;

    const fadeSteps = 6;
    const fadeIntervalMs = 45;
    const startVolume = audio.volume;
    let step = 0;
    const fadeTimer = window.setInterval(() => {
      step += 1;
      audio.volume = Math.max(0, startVolume * (1 - step / fadeSteps));

      if (step >= fadeSteps) {
        window.clearInterval(fadeTimer);
        audio.pause();
        audio.currentTime = 0;
      }
    }, fadeIntervalMs);
  }, maxDuration);
}

function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  audioContext = audioContext || new AudioContextClass();
  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }
  return audioContext;
}

function playGeneratedSound(soundName) {
  if (getSoundMuted()) return;

  try {
    const context = getAudioContext();
    if (!context) return;

    const now = context.currentTime;
    const sounds = {
      click: [
        { frequency: 620, start: 0, duration: 0.035, type: "triangle", gain: 0.045 },
      ],
      correct: [
        { frequency: 760, start: 0, duration: 0.035, type: "square", gain: 0.035, noise: true },
        { frequency: 720, start: 0.09, duration: 0.04, type: "square", gain: 0.032, noise: true },
        { frequency: 840, start: 0.18, duration: 0.035, type: "square", gain: 0.03, noise: true },
        { frequency: 690, start: 0.28, duration: 0.04, type: "square", gain: 0.028, noise: true },
        { frequency: 810, start: 0.39, duration: 0.035, type: "square", gain: 0.026, noise: true },
      ],
      wrong: [
        { frequency: 220, start: 0, duration: 0.16, type: "sine", gain: 0.055 },
      ],
      complete: [
        { frequency: 523.25, start: 0, duration: 0.1, type: "sine", gain: 0.065 },
        { frequency: 659.25, start: 0.09, duration: 0.1, type: "sine", gain: 0.07 },
        { frequency: 783.99, start: 0.18, duration: 0.16, type: "sine", gain: 0.075 },
      ],
      levelUp: [
        { frequency: 523.25, start: 0, duration: 0.08, type: "triangle", gain: 0.065 },
        { frequency: 659.25, start: 0.075, duration: 0.08, type: "triangle", gain: 0.07 },
        { frequency: 783.99, start: 0.15, duration: 0.1, type: "triangle", gain: 0.075 },
        { frequency: 1046.5, start: 0.245, duration: 0.16, type: "sine", gain: 0.08 },
      ],
    };

    (sounds[soundName] || sounds.click).forEach((note) => {
      const gainNode = context.createGain();
      const startTime = now + note.start;
      const endTime = startTime + note.duration;

      gainNode.gain.setValueAtTime(0.0001, startTime);
      gainNode.gain.exponentialRampToValueAtTime(note.gain, startTime + 0.012);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, endTime);

      const source = note.noise ? createNoiseSource(context, note.duration) : context.createOscillator();
      if (!note.noise) {
        source.type = note.type;
        source.frequency.setValueAtTime(note.frequency, startTime);
      }
      source.connect(gainNode);
      gainNode.connect(context.destination);
      source.start(startTime);
      source.stop(endTime + 0.02);
    });
  } catch {
    // Sound is an enhancement; practice mode must continue silently if audio is unavailable.
  }
}

function createNoiseSource(context, duration) {
  const sampleRate = context.sampleRate;
  const frameCount = Math.max(1, Math.floor(sampleRate * duration));
  const buffer = context.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);

  for (let index = 0; index < frameCount; index += 1) {
    data[index] = (Math.random() * 2 - 1) * (1 - index / frameCount);
  }

  const source = context.createBufferSource();
  source.buffer = buffer;
  return source;
}
