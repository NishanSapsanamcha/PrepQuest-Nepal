import { createContext, useCallback, useContext, useMemo, useState } from "react";
import BadgeUnlockToast from "../components/badges/BadgeUnlockToast";
import { consumeNewlyEarnedBadges, syncBadges } from "../utils/badgeUtils";

// App-wide badge celebration. Mounted once at the root so the unlock toast can
// fire from any screen (quiz / mock / tournament result pages, the Badges page,
// etc.). Badges earned anywhere are detected the next time `celebrate()` runs.
const BadgeCelebrationContext = createContext({
  celebrate: () => {},
  previewBadge: () => {},
});

export function BadgeCelebrationProvider({ children }) {
  const [queue, setQueue] = useState([]);

  // Re-evaluate badges, claim any newly earned, and enqueue them (rarest
  // first, already ordered by consumeNewlyEarnedBadges).
  const celebrate = useCallback(() => {
    const newly = consumeNewlyEarnedBadges(syncBadges());
    if (newly.length) setQueue((current) => [...current, ...newly]);
  }, []);

  // Replay a specific badge's unlock animation (e.g. the Badges preview button).
  const previewBadge = useCallback((badge) => {
    if (badge) setQueue((current) => [...current, badge]);
  }, []);

  const dismiss = useCallback(() => setQueue((current) => current.slice(1)), []);

  const value = useMemo(() => ({ celebrate, previewBadge }), [celebrate, previewBadge]);

  return (
    <BadgeCelebrationContext.Provider value={value}>
      {children}
      <BadgeUnlockToast badge={queue[0] || null} onClose={dismiss} />
    </BadgeCelebrationContext.Provider>
  );
}

export function useBadgeCelebration() {
  return useContext(BadgeCelebrationContext);
}

export default BadgeCelebrationContext;
