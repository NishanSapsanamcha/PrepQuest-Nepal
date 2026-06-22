const SOUND_KEY = "prepquest_sound_muted";

const SOUND_PATHS = {
  correct: "/audio/correct.mp3",
  wrong: "/audio/wrong.mp3",
  click: "/audio/click.mp3",
  levelUp: "/audio/level-up.mp3",
  complete: "/audio/complete.mp3",
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

    audio.volume = 0.45;
    audio.currentTime = 0;
    audio.onerror = fallback;
    audio.play().catch(fallback);
  } catch {
    playGeneratedSound(soundName);
  }
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
        { frequency: 660, start: 0, duration: 0.09, type: "sine", gain: 0.07 },
        { frequency: 880, start: 0.08, duration: 0.13, type: "sine", gain: 0.075 },
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
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      const startTime = now + note.start;
      const endTime = startTime + note.duration;

      oscillator.type = note.type;
      oscillator.frequency.setValueAtTime(note.frequency, startTime);
      gainNode.gain.setValueAtTime(0.0001, startTime);
      gainNode.gain.exponentialRampToValueAtTime(note.gain, startTime + 0.012);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, endTime);

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      oscillator.start(startTime);
      oscillator.stop(endTime + 0.02);
    });
  } catch {
    // Sound is an enhancement; practice mode must continue silently if audio is unavailable.
  }
}
