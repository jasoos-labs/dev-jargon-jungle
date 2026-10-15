# Dev Jargon Jungle

**Journey through the jargon. Juggle the terms. Jump into dev-team life.**

Dev Jargon Jungle is a free, local-first PWA that helps early-career software developers get comfortable with the language and situations of a real software team. Learners follow the **Dev Talk Trail** from Kathmandu toward Everest, with flashcards at its center and games along the way. It accompanies the **Taming the AI Dragon** learning series.

This is not a programming course or interview cram app. The goal is to make workplace conversations less mysterious through games, lookup, and steady practice.

## Version 1.0.0

- 32 curated first-90-days vocabulary concepts, with aliases kept on the same record.
- Central flashcard trail with self-rated term progress and a plain-language field guide.
- Five playable side games: Bingo, Survival, Match Pieces, Jeopardy, and Scenario.
- Eight guided trail stops from Kathmandu to a Summit Challenge.
- Easy Trek, Trail Trek, and Summit Trek; level selection changes eligible terms and question depth.
- Journey events, camps, and review detours. Wrong answers never erase learned terms.
- Password-protected local learner profiles. Progress is encrypted in browser storage and never uploaded.
- Saved font-size control available throughout the app.
- Optional browser speech input in Bingo; microphone permission is never required.
- Responsive layout, install manifest, and offline service worker.
- Flashcards are the main learning path; each game uses the same shared vocabulary.

Profiles and progress are stored in this browser on this device. There are no server accounts, servers, cloud sync, or telemetry. Profile data is encrypted with a password-derived key; a forgotten password cannot be recovered. Clearing browser data can remove profiles and progress.

The full glossary remains searchable. Trail-assigned terms feed the guided path and games; existing core terms use their learning sequence as a temporary route until trail assignments are added. The vocabulary contract keeps term difficulty separate from answer depth (recognize, responsibility, result, explain, apply). Vocabulary items can later link to story IDs, YouTube episodes, and 9E context. The current framing is **9E: 4E Value Chain + 5E Solution Chain**.

## Run locally

Requires Node.js 22.12 or newer.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. To verify, build, and test the production PWA locally:

```sh
npm test
npm run build
npm run preview
```

## GitHub Pages

The workflow at `.github/workflows/pages.yml` tests and builds the app on pushes to `main`, then deploys `dist` to GitHub Pages. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.

Vite uses relative asset paths, so the same build works at the root or under the repository path `https://jasoos-labs.github.io/dev-jargon-jungle/`.

## Private production files

Place unpublished slides, scripts, and working notes in `/private`. It is ignored by Git and is not needed to build or run the PWA. Public vocabulary and app assets belong in the repository.

## Main structure

```text
src/data/terms.ts       Shared vocabulary inventory
src/domain/types.ts     Vocabulary, progress, settings, and game contracts
src/domain/judge.ts     Local answer judge
src/domain/progress.ts  Progress rules and learner levels
src/domain/profiles.ts  Password-derived encryption for local profiles
src/domain/trail.ts     Route stops, difficulty tiers, and reached terms
src/domain/game.ts      Shared Bingo round rules
src/components/         Shared navigation and Bingo screen
src/features/           Park, flashcards, games, term guide, and progress
src/app/App.tsx           App routing and local state
public/                 PWA manifest, icon, and service worker
```

## License

Copyright © 2026 Pradeep Arora. No license has been added yet; do not assume reuse permission without checking the repository owner.
