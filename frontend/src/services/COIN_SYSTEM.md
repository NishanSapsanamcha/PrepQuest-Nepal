# PrepQuest Coin System

Real, user-specific gamification currency. Every coin is earned from an actually
completed learning activity and recorded in a transaction ledger. There are no
fake/static coin values anywhere.

## Architecture

- **`services/coinService.js`** is the single source of truth and the ONLY place
  that writes coin changes. Components/utils never mutate coin numbers directly.
- Transactions are stored in `localStorage` under **`prepquest_coin_transactions`**.
  This key (and the pending-popup key `prepquest_coin_reward_pending`) are in
  `storageUtils` `PER_ACCOUNT_KEYS`, so they are wiped when a different account
  logs in — coins, history, and popups can never leak between users.
- **Balance is derived** from the ledger: `getUserCoinBalance()` = sum of every
  transaction amount (earn `+`, spend `-`). A new user with no transactions has a
  balance of **0**. The legacy `user.coins` field is kept in sync after each
  change purely for older display code; it is never the source of truth.

### Transaction shape

```js
{
  id,              // == idempotencyKey
  idempotencyKey,  // stable, deterministic per reward
  userId,          // active account id
  amount,          // + for earn, - for spend
  direction,       // "earn" | "spend"
  source,          // see sources below
  sourceId,        // attemptId / badgeId / weekKey / date / milestone
  reason,          // human-readable, shown in popup + history
  metadata,        // optional extra context
  date,            // YYYY-MM-DD
  createdAt,       // ISO timestamp
}
```

### Public API

`getUserCoinBalance()`, `getUserCoinTransactions()`, `hasCoinTransaction(key)`,
`createCoinTransaction(tx)`, `awardCoins({...})`, `spendCoins({...})`,
`awardActivityCoins(components)`, `buildCoinRewardBreakdown(awards)`,
`queueCoinReward(breakdown)`, `consumePendingCoinReward()`,
`getCoinSourceLabel(source)`, plus `COIN_REWARDS` / `COIN_SOURCES`.

## Earning sources & amounts (current MVP)

| Source | Trigger | Amount |
| --- | --- | --- |
| `daily_quick_challenge` | complete daily quick challenge | +30 |
| `daily_quick_challenge` | score ≥ 80% | +20 bonus (once/day) |
| `practice_session` | practice score ≥ 80% | +20 |
| `recommended_practice` | complete recommended weak-subject practice | +20 |
| `subject_level_up` | a subject level increases | +30 (per new level) |
| `subject_mastery` | reach the final subject level ("Mastered") | +100 (once/subject) |
| `mock_test` | complete a mock test | +40 |
| `mock_test` | mock score ≥ 80% | +30 bonus |
| `streak_milestone` | 3 / 7 / 15 / 30-day streak | +50 / +150 / +250 / +500 (once each) |
| `friday_tournament` | participate / complete | +50 |
| `friday_tournament` | rank 1 / 2 / 3 | +500 / +300 / +150 |
| `badge_reward` | unlock a badge with a coin reward | badge-defined |

Spend sources (already in the app): `extra_mock_unlock` (100, after 3 free
mocks), `detailed_report_unlock` (80).

> **Daily-login coins are intentionally NOT implemented yet** — they are planned
> for a later milestone and are deliberately excluded from the "How to earn"
> guide and from all earning logic for now.

## Idempotency (duplicate prevention)

Every reward carries a deterministic `idempotencyKey`. `awardCoins` is a no-op if
that key already exists, so coins can never be double-credited. Keys (prefixed
with the active `userId`):

| Reward | Key |
| --- | --- |
| Daily complete | `…:daily_quick_challenge:<date>:complete` |
| Daily 80% bonus | `…:daily_quick_challenge:<date>:score_80_bonus` |
| Practice 80% bonus | `…:practice_session:<sessionId>:score_80_bonus` |
| Recommended bonus | `…:practice_session:<sessionId>:recommended_bonus` |
| Subject level-up | `…:subject_level_up:<subjectId>:<newLevel>` |
| Subject mastery | `…:subject_mastery:<subjectId>` |
| Mock complete | `…:mock_test:<attemptId>:complete` |
| Mock 80% bonus | `…:mock_test:<attemptId>:score_80_bonus` |
| Streak milestone | `…:streak_milestone:<milestone>` |
| Tournament participation | `…:<weekKey>:participation` |
| Tournament rank | `…:<weekKey>:finalRankReward` |
| Badge reward | `…:<badgeId>:coin_reward` |

Validation in `awardCoins`: source must be in `COIN_SOURCES`, amount must be a
positive number, and the idempotency key must be unused. Activities are also
guarded at their own layer (one attempt per day for the daily quiz,
`markSessionAsRewarded` for practice, `rewardsApplied`/existing-attempt checks
for mock & tournament), so coins are only awarded once the activity is genuinely
completed — never on page load or refresh.

## Coin Earned popup

- The activity-completion utils call `awardActivityCoins([...])`, which awards
  each component and **queues one combined breakdown** via `queueCoinReward`.
- `context/CoinRewardContext.jsx` (`CoinRewardProvider`, mounted in `App.jsx`)
  exposes `celebrateCoins()`. Each result page calls it on mount; it
  `consumePendingCoinReward()`s and shows `components/common/CoinEarnedPopup.jsx`
  once. Because the pending reward is cleared on consume, refreshing the result
  page shows nothing.
- Multiple rewards earned together (e.g. daily complete + 80% bonus + a streak
  milestone) appear as a single popup with a line-item breakdown.

Badge coin rewards are credited through `coinService` during badge sync and
surfaced by the existing badge unlock toast (which shows the coin reward text);
they are not double-counted in the activity popup.

## How to test duplicate prevention

1. Complete the daily quick challenge → +30 (and +20 if ≥80%) once; the popup
   shows the breakdown. Refresh the result page → no extra coins, no popup.
2. Reopen an old mock/tournament result (via history/leaderboard) → balance
   unchanged, no popup.
3. Double-click submit on any activity → still one award (idempotency key).
4. Level up a subject → +30 once; practising more at the same level grants no
   further level-up coins. Reaching "Mastered" grants +100 once.
5. Unlock a badge with a coin reward → credited once; re-syncing badges never
   re-credits (badge reward ledger + coin idempotency key).
6. New account → balance 0 and the empty state in Profile. Switching accounts
   shows only that user's balance/history (per-account storage wipe).

## Where things live

- Engine: `services/coinService.js`
- Popup: `components/common/CoinEarnedPopup.jsx` + `context/CoinRewardContext.jsx`
- Profile wallet (balance / how-to-earn / recent activity / empty state):
  `pages/Profile.jsx`
- Integration points: `utils/dailyQuizUtils.js`, `utils/practiceUtils.js`,
  `utils/mockTestUtils.js`, `utils/tournamentUtils.js`, `utils/badgeUtils.js`
