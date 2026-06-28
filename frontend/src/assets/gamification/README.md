# Gamification artwork

Drop the premium badge art here and it is used automatically (no code changes).

## Exact filenames to add (case-sensitive)

| File (in this folder) | Used for |
| --- | --- |
| `xp-badge.png` | Total XP stat (Practice summary strip) |
| `coin-star.png` | Coins stat |
| `streak-flame.png` | Current Streak stat |
| `badge-earned.png` | Badges Earned stat |
| `nepali-language-badge.png` | Nepali subject card icon |
| `subjects/<subjectId>.png` | Any other subject badge (optional) |

`<subjectId>` values: `general-knowledge`, `constitution`, `current-affairs`,
`general-ability-iq`, `governance-basics`, `public-administration-basics`,
`nepali`, `english`.

`.png`, `.webp`, `.svg`, `.jpg`, and `.avif` are all accepted (same base name).

## How it works

`index.js` loads these with Vite `import.meta.glob`. When a file is present it is
imported and shown; when absent, the UI falls back to the built-in CSS gem/hex
icon. Recommended source size ~256–512px square with a transparent background.
