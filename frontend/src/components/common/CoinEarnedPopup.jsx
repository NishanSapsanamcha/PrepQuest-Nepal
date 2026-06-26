import { useEffect } from "react";
import { CoinIcon } from "./Coin";
import "./CoinEarnedPopup.css";

/**
 * Combined "Coins Earned!" popup. Pass a `reward` breakdown to show it; pass
 * `null` to hide. One popup per activity, even when several coin rewards land at
 * once (daily complete + 80% bonus + streak milestone all show in one list).
 *
 * @param {{ total:number, items:Array<{label:string, amount:number}>, balance?:number }} reward
 */
function CoinEarnedPopup({ reward, onClose }) {
  useEffect(() => {
    if (!reward) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reward, onClose]);

  if (!reward || !reward.total) return null;

  return (
    <div className="coin-popup-overlay" role="dialog" aria-modal="true" aria-label="Coins earned" onClick={onClose}>
      <div className="coin-popup-card" onClick={(event) => event.stopPropagation()}>
        <div className="coin-popup-burst" aria-hidden="true">
          <CoinIcon size="xl" className="coin-popup-icon" />
        </div>

        <p className="coin-popup-kicker">Coins Earned!</p>
        <div className="coin-popup-total">
          <CoinIcon size="md" />
          <strong>+{reward.total.toLocaleString()}</strong>
        </div>

        {reward.items?.length > 0 && (
          <div className="coin-popup-breakdown">
            <span className="coin-popup-breakdown-title">Breakdown</span>
            <ul>
              {reward.items.map((item, index) => (
                <li key={`${item.label}-${index}`}>
                  <span className="coin-popup-reason">{item.label}</span>
                  <span className="coin-popup-amount">
                    <CoinIcon size="xs" /> +{item.amount.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {Number.isFinite(reward.balance) && (
          <div className="coin-popup-balance">
            <span>New balance</span>
            <span className="coin-popup-balance-value">
              <CoinIcon size="sm" /> {reward.balance.toLocaleString()}
            </span>
          </div>
        )}

        <button className="btn btn-full coin-popup-continue" type="button" onClick={onClose} autoFocus>
          Continue
        </button>
      </div>
    </div>
  );
}

export default CoinEarnedPopup;
