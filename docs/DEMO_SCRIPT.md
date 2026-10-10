# Demo video script (~3 min, record with OBS / Loom)
1. Sign up a new user; show loader + skeleton. 2. Claim Day 1 (CPA demo -> Claimed, wallet +5, Day 2 countdown).
3. Refresh + logout/login: state persists. 4. DevTools: edit React state/clock: nothing changes.
5. Postman: fake day 7 -> 400, fake reward ignored, no token -> 401. 6. `node scripts/concurrency-test.js` -> 1 success.
7. `/dev/shift` 24h -> claim Day 2; shift 60h -> reset notice + MISSED card. 8. Show MongoDB: claim -> transaction -> wallet -> auditlogs.
