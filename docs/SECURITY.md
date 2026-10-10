# Security
- Identity only from JWT (`middleware/auth.js`); body/query `userId` ignored. Passwords bcrypt-hashed.
- Server is the source of truth: day, lock state, reward, amount, currency, timer, reset. Client `day` is only cross-checked (mismatch -> 400); `reward/streak/amount/userId` ignored.
- Server time only (`Date.now()` on API); device clock changes have no effect. UI re-fetches when timer hits 0.
- Concurrency/duplicates: conditional atomic `findOneAndUpdate` on streakstates + unique index userId+cycleNo+day; wallet via atomic `$inc`; manual rollback on failure.
- Rate limits: claim 20/min, auth 30/15min. JSON body limit 10kb. Errors sanitized (no Mongo/Cast errors leak).
- Audit events: STREAK_CLAIM_REQUEST/SUCCESS/REJECTED, INVALID_CLAIM, DUPLICATE_CLAIM, STREAK_RESET.
- `/api/dev/*` only mounted when NODE_ENV != production. Never commit `.env`; set a strong JWT_SECRET in production.
- Known limits: no refresh tokens, JWT in localStorage, no email verification, gift cards are recorded as PENDING_FULFILLMENT (no real payout).
