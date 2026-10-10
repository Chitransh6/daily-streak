# API (base: http://localhost:5000/api) — all `/daily-streak/*` need `Authorization: Bearer <JWT>`
| Method | Path | Notes |
|---|---|---|
| POST | /auth/register | `{name,email,password}` → `{token,user}` (201) |
| POST | /auth/login | `{email,password}` → `{token,user}` |
| GET | /auth/me | profile + wallet |
| GET | /daily-streak | full state: `serverTime`, `streak{currentStreak,currentDay,checkedIn,totalRewards,canClaim,nextClaimAt,nextReward,wasReset}`, `rewards[{day,status,reward}]`, `ultimateReward`, `wallet` |
| GET | /daily-streak/status | light: `serverTime,currentDay,canClaim,nextClaimAt` (used when timer hits 0) |
| POST | /daily-streak/claim | body ignored except `day`, which must equal the server's current day. 200 / 400 INVALID_DAY / 403 LOCKED / 409 ALREADY_CLAIMED / 429 |
| GET | /daily-streak/history | last 50 claims |
| POST | /dev/shift, /dev/reset | NON-production only: `{hours}` moves lastClaimAt back; reset deletes streak state |
Day status: CLAIMED · TODAY (claimable) · LOCKED.
