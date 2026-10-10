<img width="1515" height="1100" alt="ui-preview-mobile-dark-light" src="https://github.com/user-attachments/assets/07fb85b9-8913-4538-9932-5b71589883e5" />

<img width="1402" height="760" alt="ui-preview-desktop-dark-light" src="https://github.com/user-attachments/assets/bd3185a1-78d9-43a1-8b87-1d49b8c20f46" />

# VELoop Rewards - Daily Streak (MERN)

## Run
1. Start MongoDB locally (or put your Atlas URI in `.env` -> `MONGO_URI`).
2. `npm run install-all`
3. `npm run seed`   (rewards + config + demo user `demo@veloop.in` / `Demo@123`)
4. `npm run dev`    (API :5000, React :5173)

## Structure
app.js, config/, models/, routes/, services/ (streak logic), middleware/, seed/, public/images/, client/ (React + Vite, Bootstrap, CSS Modules)

## How it works
- The server decides everything: `services/streak.service.js` (`compute` = day, lock, nextClaimAt, missed-reset). Interval, window and rewards live in MongoDB (`StreakConfig`, `StreakReward`).
- Claim = atomic conditional update on `StreakState` (one concurrent request wins) + unique index `userId+cycleNo+day` + wallet `$inc` + `WalletTransaction` + `AuditLog`.
- Client `day/reward/streak/userId` are ignored (a wrong `day` is rejected). The user comes from the JWT.
- Countdown uses the `serverTime` offset; at 0 the UI re-fetches from the backend.
- Missed: no claim within `claimIntervalHours + claimWindowHours` -> server resets to Day 1 (status `RESET`).
- Test a miss: in Mongo set `streakstates.lastClaimAt` to 3 days ago, reload the page.

## API
GET /api/daily-streak, GET /status, POST /claim, GET /history, POST /api/auth/login | register

## Added
- Signup/Login page (toggle), logout button, Streak history modal (Streak Calendar button).
- Dev-only `/api/dev/shift` + `/api/dev/reset`, `scripts/concurrency-test.js`, `docs/`, `postman/`.
- docs/: DATABASE, SECURITY, DEPLOYMENT, DEMO_SCRIPT; render.yaml; client/vercel.json; MISSED card status; assets auto-loader (client/src/assets).
- scripts/record-demo.py: Playwright script that recorded the demo video (needs running API + client).
- UI polish: design tokens, glass sticky header, staggered animations, cycle progress bar, premium login; verified no horizontal overflow at 320-1920px.
- Theme: obsidian black + emerald + amber (violet removed); verified at 14 widths with no horizontal overflow.
- UI v3: clean fintech design (light default + dark toggle), emerald accent, line icons, countdown card; verified at 14 widths in both themes.
- scripts/record-demo-*.py: Playwright scripts that recorded demo video v2 (desktop, tablet, mobile). Run with API + client running.
- UI v4: follows the supplied reference (dark violet+gold). Artwork in client/src/assets was cut from the reference images in the PDF; replace files of the same name with the originals from the Drive folder for best quality. Light/dark toggle removed (reference is dark-only). Demo-recording scripts in scripts/ target the previous UI and need updating before reuse.
- UI v5 (futuristic): obsidian + electric-lime/ice aurora, glass surfaces, streak orbit ring, 7-day journey (vertical timeline on mobile, featured Ultimate card on desktop). Demo-recording scripts in scripts/ target an older UI.
- UI v6: dark/light theme switch (persisted), reward-unlocked reveal, add-to-calendar reminder (.ics), share streak, streak levels, count-up numbers, tilt cards, mobile claim dock, navbar streak badge. Demo-recording scripts in scripts/ target an older UI.
