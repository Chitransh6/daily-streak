# Database (MongoDB / Mongoose)
| Collection | Purpose | Key fields |
|---|---|---|
| users | account + wallet | email (unique), passwordHash, wallet.VES |
| streakconfigs | rules | claimIntervalHours, claimWindowHours |
| streakrewards | reward per day | day (unique), rewardType, currency, amount, title, subtitle, assetType, badge, active, metadata |
| streakstates | one doc per user = current cycle | userId (unique), cycleNo, lastDay, lastClaimAt, status ACTIVE/COMPLETED/RESET, missedDay |
| streakclaims | claim history | userId+cycleNo+day (UNIQUE), rewardId, referenceId, transactionId, claimedAt |
| wallettransactions | ledger | referenceId (unique), amount, currency, source=DAILY_STREAK, streakDay, balanceBefore/After, status |
| auditlogs | security trail | event, userId, meta, ip |
Trace: streakclaims.referenceId = wallettransactions.referenceId; transaction.balanceAfter = users.wallet.VES.
Cycle: 7 days = 1 cycle. Day 7 claimed -> COMPLETED; after the interval a new cycle starts at Day 1 (cycleNo+1). A miss sets status RESET and `missedDay`.
