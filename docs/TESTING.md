# Testing (use Postman collection in /postman or curl)
1. **Normal claim**: login → POST /claim → 200, wallet +5, Day 1 CLAIMED.
2. **Duplicate / already claimed**: claim again → 403 LOCKED, no extra reward.
3. **Locked / timer**: GET /daily-streak shows `nextClaimAt`. Changing the PC clock changes nothing (server time).
4. **Unlock**: POST /dev/shift `{"hours":24}` → claim Day 2 succeeds.
5. **Missed day**: claim Day 1, POST /dev/shift `{"hours":60}`, GET /daily-streak → `wasReset:true`, currentDay 1, `STREAK_RESET` in auditlogs.
6. **Fake day**: `{"day":7}` while on Day 2 → 400 INVALID_DAY. **Fake reward/streak/userId**: extra body fields ignored.
7. **Concurrent**: `node scripts/concurrency-test.js` → exactly 1 success.
8. **Unauthorized**: no/invalid token → 401.
9. **Refresh / logout-login / 2 tabs**: state always reloaded from MongoDB; 2nd tab claim → rejected.
10. **DB trace**: `streakclaims` → `wallettransactions` (same `referenceId`) → `users.wallet.VES`.
