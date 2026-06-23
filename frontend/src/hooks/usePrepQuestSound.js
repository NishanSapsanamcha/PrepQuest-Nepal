import { useCallback, useState } from "react";
import { getSoundMuted, playSound, toggleSoundMuted } from "../utils/soundUtils";

function usePrepQuestSound() {
  const [isMuted, setIsMuted] = useState(getSoundMuted);

  const play = useCallback((soundName) => {
    playSound(soundName);
  }, []);

  const toggleMute = useCallback(() => {
    const nextMuted = toggleSoundMuted();
    setIsMuted(nextMuted);
    if (!nextMuted) playSound("click");
    return nextMuted;
  }, []);

  return {
    isMuted,
    toggleMute,
    playClick: useCallback(() => play("click"), [play]),
    playCorrect: useCallback(() => play("correct"), [play]),
    playWrong: useCallback(() => play("wrong"), [play]),
    playComplete: useCallback(() => play("complete"), [play]),
    playLevelUp: useCallback(() => play("levelUp"), [play]),
  };
}

export default usePrepQuestSound;

