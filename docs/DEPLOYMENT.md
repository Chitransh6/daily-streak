# Deployment
1. **MongoDB Atlas**: create a free cluster, add a DB user, allow network access, copy the URI.
2. **Seed**: locally set `MONGO_URI` to the Atlas URI in `.env`, run `npm run seed` (adds rewards/config/demo user).
3. **Backend (Render)**: New Web Service from the repo (uses `render.yaml`). Set `MONGO_URI`, `CLIENT_URL` (your Vercel URL), `JWT_SECRET`, `NODE_ENV=production`.
4. **Frontend (Vercel/Netlify)**: root dir `client`, build `npm run build`, output `dist`, env `VITE_API_URL=https://<render-app>.onrender.com/api` (`vercel.json` handles SPA routing).
5. Verify: open the live site, sign up, claim Day 1, refresh, log out/in.
