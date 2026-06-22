const SOUND_KEY = "prepquest_sound_muted";

const SOUND_PATHS = {
  correct: "/audio/correct.mp3",
  wrong: "/audio/wrong.mp3",
  click: "/audio/click.mp3",
  levelUp: "/audio/level-up.mp3",
  complete: "/audio/complete.mp3",
};

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
    audio.volume = 0.45;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch {
    // Missing or blocked audio should never interrupt practice mode.
  }
}
