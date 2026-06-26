# Badge System — Integration Map & Manual Test Checklist

The badge system is **data-driven**, not hardcoded. Earned state, progress, and
earned date are computed at runtime from real stored activity. Nothing in the
catalog (`data/gamificationMockData.js → mockBadges`) is pre-marked as earned.

## Architecture

| Concern | Location |
| --- | --- |
| Badge catalog (definitions, target, reward, visuals) | `data/gamificationMockData.js` → `mockBadges` |
| Unlock conditions (id → progress value) | `utils/badgeUtils.js` → `EVALUATORS` |
| Extra unlock gates (e.g. accuracy) | `utils/badgeUtils.js` → `ELIGIBILITY` |
| Real stats from stored activity | `utils/badgeUtils.js` → `buildBadgeStats()` |
| Sync / persist / dedupe / reward | `utils/badgeUtils.js` → `syncBadges()` |
| Unlock toast queue | `context/BadgeCelebrationContext.jsx` + `components/badges/BadgeUnlockToast.jsx` |

### Storage keys (all per-account, reset on account switch)
- `prepquest_earned_badges` — `{ [id]: { earnedAt } }` (permanent once earned)
- `prepquest_badge_unseen` — `[id]` queue awaiting a celebration toast
- `prepquest_badge_rewards` — reward ledger, one record set per badge (applied once)

## Public engine API (`utils/badgeUtils.js`)
- `syncBadges()` → enriched catalog with `{ value, progress, percent, status, earnedAt }`
- `checkAndUnlockBadges()` → `{ badges, newlyUnlocked }`
- `getBadgeProgress(badge|id)` → `{ value, target, progress, percent }`
- `isBadgeUnlocked(badge|id)` → boolean
- `getEarnedBadges()` / `getLockedBadges()` / `getNextBadge()`
- `applyBadgeReward(badge)` / `getBadgeRewardLog()` — idempotent reward recording
- `consumeNewlyEarnedBadges()` — pop the unseen queue (used by `celebrate()`)

## Flow
```
activity completes (session page saves attempt to storage)
  → result page mounts → useBadgeCelebration().celebrate()
  → syncBadges() recomputes progress from real stored stats
  → newly earned ids persisted + reward recorded once + queued unseen
  → BadgeUnlockToast plays them rarest-first; queue prevents skips/dupes
  → Badges page reflects earned/locked + real progress
```

## Integration points (verified wired)
- Practice → `pages/practice/PracticeResultPage.jsx`
- Daily Quiz → `pages/daily-quiz/DailyQuizResultPage.jsx`
- Mock Test → `pages/mock-tests/MockTestResultPage.jsx`
- Tournament → `pages/tournament/TournamentResultPage.jsx`
- Badges page (catch-up) → `pages/Badges.jsx`

## Manual test checklist

Reset first via Profile/account switch or `localStorage.clear()` for a clean run.

1. New user: only `First Step` etc. that are *truly* met show earned; everything
   else locked with real 0/target progress. ✅ no pre-earned badges.
2. Complete first practice → **First Step Badge** unlocks, toast appears once.
3. Complete first Constitution practice → **Constitution Starter** unlocks.
4. Complete first mock test → **Mock Beginner** unlocks.
5. Complete 3 daily quizzes → **Daily Learner** unlocks (1/3 → 2/3 → earned).
6. Reach a 7-day streak → **7-Day Warrior** unlocks.
7. Complete 10 mock tests → **Mock Master** unlocks (progress climbs 3/10 etc.).
8. Finish #1 in a Friday tournament → **Friday Champion** unlocks (only if real rank === 1).
9. Reach 20,000 total XP → **PrepQuest Legend** unlocks.
10. Master all active subjects → **Omnischolar** unlocks (e.g. 2/8 shown meanwhile).
11. Master 25 wrong answers → **Review Hero** unlocks (8/25 shown meanwhile).
12. Toast appears **only** on the run a badge is newly earned.
13. Refresh / revisit Badges page → earned badges do **not** re-toast.
14. Refresh → `prepquest_badge_rewards` has exactly one record set per earned badge
    (no duplicate reward entries).
15. Badges page updates immediately after earning (no manual refresh needed).
16. Locked badges display real progress, never fake placeholder values.
17. Mythic badges stay locked until their real requirement is met.
18. "Preview unlock animation" button plays the toast but does **not** mark the
    badge earned (no new entry in `prepquest_earned_badges`).

### Flawless Mind (Mythic) — special gate
- Progress bar fills with **questions answered** toward 500.
- Unlocks only when questions ≥ 500 **AND** overall accuracy ≥ 95%.
- An early wrong answer no longer makes it permanently impossible (fixed from the
  old literal-zero-mistakes rule).

## Quick dev console probes
```js
import { syncBadges, getBadgeRewardLog, checkAndUnlockBadges } from "./utils/badgeUtils";
syncBadges().filter(b => b.status === "earned");      // what is earned + when
syncBadges().map(b => `${b.name}: ${b.progress}/${b.target}`); // real progress
checkAndUnlockBadges().newlyUnlocked;                  // unlocked on this run
getBadgeRewardLog();                                   // one record set per badge
```

## Reward application (current wiring)
The reward **ledger** (`prepquest_badge_rewards`) records each badge's reward
exactly once and is the source of truth for idempotency.

| Reward type | Behaviour |
| --- | --- |
| **Coins** | ✅ Credited live — one `badge_reward` entry in `coinTransactions` and `user.coins` increased once. Safe because no badge unlock gates on coins. |
| **XP** | Recorded only. **Not** added to live total XP (would risk circular unlocks for XP/rank badges like PrepQuest Legend, Public Service Master, Loksewa Warrior). |
| **Cosmetic** (titles/frames/themes/auras) | Recorded only. Awaits a profile inventory/equip system. |

### Coin transaction shape (`utils/badgeUtils.js → creditBadgeCoins`)
```js
{ id: "badge_reward_<badgeId>", userId, amount, type: "badge_reward",
  source: "badge", sourceId: badgeId, description: "Badge reward: <Name>",
  date, createdAt }
```
Idempotency: stable `id` (one transaction per badge) + the reward-ledger guard
in `applyBadgeReward`. Going-forward only — badges earned before this wiring are
not retro-credited (avoids surprise balance jumps).

### Coin-reward tests
- C1. Unlock a coin-reward badge (e.g. 7-Day Warrior +150 coins) → exactly one
  `type: "badge_reward"` entry in `coinTransactions`; `user.coins` +150 once.
- C2. Refresh / revisit Badges page → coins do **not** increase again.
- C3. Run `checkAndUnlockBadges()` again → no new coin transaction.
- C4. XP-only badge (e.g. First Step +20 XP) → ledger entry `rewardType:"xp",
  applied:false`; live total XP unchanged.
- C5. Cosmetic badge (e.g. PrepQuest Legend theme) → ledger entry
  `rewardType:"cosmetic", applied:false`; no profile change.
- C6. `getBadgeRewardLog()` shows exactly one record set per earned badge.
