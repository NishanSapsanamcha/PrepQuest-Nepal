import { createContext, useCallback, useContext, useMemo, useState } from "react";
import CoinEarnedPopup from "../components/common/CoinEarnedPopup";
import { consumePendingCoinReward, getUserCoinBalance } from "../services/coinService";

/**
 * App-wide coin reward popup. Mounted once at the root so any result screen can
 * surface the combined "Coins Earned!" popup. Coins are awarded inside the
 * activity-completion utils (which queue a pending breakdown); result pages just
 * call `celebrateCoins()` on mount to claim and show it once.
 */
const CoinRewardContext = createContext({
  celebrateCoins: () => {},
  showCoinReward: () => {},
  showCoinEarnedPopup: () => {},
});

export function CoinRewardProvider({ children }) {
  const [reward, setReward] = useState(null);

  // Claim any reward queued by the activity that just completed, and show it
  // once. Returns nothing visible on refresh because the pending reward is
  // consumed (cleared) the first time.
  const celebrateCoins = useCallback(() => {
    const pending = consumePendingCoinReward();
    if (pending && pending.total > 0) setReward(pending);
  }, []);

  // Imperatively show a breakdown (used if a caller already has one in hand).
  const showCoinReward = useCallback((breakdown) => {
    if (breakdown && breakdown.total > 0) {
      setReward({ ...breakdown, balance: Number.isFinite(breakdown.balance) ? breakdown.balance : getUserCoinBalance() });
    }
  }, []);

  const dismiss = useCallback(() => setReward(null), []);

  const value = useMemo(
    () => ({ celebrateCoins, showCoinReward, showCoinEarnedPopup: showCoinReward }),
    [celebrateCoins, showCoinReward]
  );

  return (
    <CoinRewardContext.Provider value={value}>
      {children}
      <CoinEarnedPopup reward={reward} onClose={dismiss} />
    </CoinRewardContext.Provider>
  );
}

export function useCoinReward() {
  return useContext(CoinRewardContext);
}

export default CoinRewardContext;
