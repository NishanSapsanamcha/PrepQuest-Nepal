# Practice UI — Visual QA Checklist

How to verify the Practice section matches the 3 reference images after running it
locally. (No browser screenshot diff is automated — this is a manual pass.)

## Run it

```bash
cd frontend
npm run dev          # opens the app
```

Then visit:

- **Subject Overview** → `/practice`
- **Practice Modes** → `/practice/general-knowledge`
- **Question Screen** → `/practice/general-knowledge/session`

### Layout debug overlay (dev only)

Append `?debugPracticeLayout=true` to any Practice URL in the dev server, e.g.
`/practice?debugPracticeLayout=true`. Major sections get a dashed teal outline
and a small label (Summary Strip, Subject Grid, Hero Summary, Mode Cards, …).
This only renders when `import.meta.env.DEV` is true, so it never ships to prod.

## Where to tune

All the common visual values are CSS variables at the **top of
`PracticePage.css`** (the `--practice-*` design tokens). Change one value there
and it updates across all three Practice pages. Blocks most likely to need
adjustment are marked with `/* TUNE: ... */` comments in the CSS.

| Want to change… | Token / location |
| --- | --- |
| Card background / gradient | `--practice-card-grad-top` / `--practice-card-grad-bottom` |
| Card / strip border glow | `--practice-card-border`, `--practice-card-border-teal` |
| Accent + button gradient | `--practice-accent`, `--practice-button-gradient` |
| Glow strength | `--practice-glow-soft`, `--practice-glow-strong`, `--practice-progress-glow` |
| Corner radius | `--practice-radius-lg` / `-md` / `-sm` |
| Subject card grid gap | `--practice-subject-gap` |
| Mode card grid gap | `--practice-mode-gap` |
| Subject icon size | `--practice-icon-lg` |
| Mode icon size | `--practice-icon-mode` |
| Summary badge icon size | `--practice-badge-icon` |
| Progress bar height | `--practice-progress-h` |
| Button height | `--practice-button-h` |
| Question card padding | `--practice-question-pad` |
| Right session panel width | `--practice-panel-col` |
| Session header height | `--practice-header-h` |

---

## Premium icon art (optional, drop-in)

Summary-strip and subject icons use built-in CSS gem/hex badges by default. To
swap in premium artwork (e.g. the XP gem, flame, coin, Nepal-flag badges): drop
image files into **`frontend/public/assets/practice/`** and map them in
**`frontend/src/data/practiceIconAssets.js`** (`STAT_ICON_ASSETS` /
`SUBJECT_ICON_ASSETS`). Unmapped icons keep the CSS fallback — no 404s.

## 1. Practice Subject Overview (`/practice`)

Section order (top → bottom): **Header → Summary strip → Subjects grid →
Recommended Practice → Review & Mistakes → How XP & Gamification Works**.

- [ ] **No "Welcome back …" line** anywhere in the header.
- [ ] Header: "Choose Your Practice Subject" + subtitle, compact (not tall).
- [ ] Top-right Exam Track + Language chips + Change Preferences present.
- [ ] Summary strip is **one wide glowing card**, not too tall (~1 row).
- [ ] Subjects grid appears **before** Recommended Practice.
- [ ] "How XP & Gamification Works" shows 6 compact cards at the bottom.
- [ ] Strip shows 4 blocks: Total XP, Coins, Current Streak, Badges Earned, each
      with a gem/coin/flame/shield-style badge + label + value + helper.
- [ ] Subject grid is **4 columns** on desktop (1366 / 1440 / 1536 / 1920).
- [ ] Each subject card: hexagon icon, name, `Level N · Name` chip, `X / Y XP`,
      `% to Lvl`, glowing progress bar, Accuracy / Solved / Mistakes, Practice Now.
- [ ] Icon size looks like a strong emblem (≈58px), not a tiny square.
- [ ] Card glow/gradient visible (not a flat plain card).
- [ ] Progress bar readable; Accuracy green, Mistakes red.
- [ ] "Practice Now" button is bright green and obviously clickable.
- [ ] New / not-started subject shows `0 / 200 XP`, Accuracy `—`, Solved/Mistakes `0`.

## 2. Subject Practice Modes (`/practice/general-knowledge`)

- [ ] Subject header: chip + "… Practice Modes" + subtitle.
- [ ] Hero is **one horizontal card** split into 4 zones with dividers:
      Current Level (hex badge), Subject XP Progress (bar + %), Validated
      Questions, Next Unlock (+ "Need X more XP").
- [ ] 6 mode cards in a **3-column × 2-row** grid.
- [ ] Mode icons are large colored hexagons (rocket teal, target blue, layers
      purple, shield gold, trophy green, crown red).
- [ ] Unlocked card (Quick Practice) has teal glow + green "Start Quick Practice".
- [ ] Locked cards show a "Locked" pill, "Unlocks at Level X", and a progress bar
      in the mode's accent color.
- [ ] "How Subject Practice Works" row sits at the bottom with 4 steps.
- [ ] Validated Question Bank note shows the **real** count and is compact.

## 3. Practice Question Screen (`/practice/general-knowledge/session`)

- [ ] Header is compact: left = subject + "Level N: Name".
- [ ] Center = "Question X of 10" + circular numbered stepper; current node is a
      green ring (outline), not filled.
- [ ] Right = +10 XP chip, streak chip, sound button, Exit Practice button.
- [ ] Question count is **not repeated** in many places (header + panel only).
- [ ] Two-column layout: large question card left, compact panel right.
- [ ] Question card: difficulty chip, topic chip, large question, 4 options with
      A/B/C/D letter boxes; selected option has a teal border/glow.
- [ ] Skip + Submit at the bottom; Submit is the green primary.
- [ ] Right panel is **one card divided into Your Progress / Session / Streak**.
- [ ] Streak section shows the orange hexagon count badge.
- [ ] "Need a Hint?" card at the bottom (clicking shows "Hints are coming soon.").
- [ ] No long coach paragraphs, no duplicate XP bars, no visual overload.

## Responsive desktop check

Resize the window (or use devtools responsive mode) and confirm nothing breaks,
overflows, or becomes cramped at:

- [ ] 1366 px — subject grid still 4-up, cards not cramped.
- [ ] 1440 px
- [ ] 1536 px
- [ ] 1920 px — cards comfortable, no huge empty gaps.

## Data integrity

- [ ] Every number is real (XP, coins, streak, badges, accuracy, solved,
      mistakes, validated count, session XP/correct/wrong, level progress).
- [ ] No hardcoded values copied from the reference screenshots.
- [ ] Missing data shows safe defaults (`0`, `0%`, `Not Started`, `0 / requirement`).
