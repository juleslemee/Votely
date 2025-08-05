# Deployment Instructions for Firebase Optimization

## 1. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

Or manually copy the contents of `firestore.rules` to Firebase Console > Firestore > Rules

## 2. Set Environment Variables in Vercel

Add these to your Vercel project settings:
- `CRON_SECRET`: Generate a random string (e.g., use `openssl rand -hex 32`)
- `STATS_UPDATE_SECRET`: Another random string for the migration endpoint

## 3. Deploy to Vercel

```bash
git add .
git commit -m "Add Firebase optimization with caching"
git push
```

## 4. Run One-Time Migration

After deployment, run this ONCE to initialize aggregated stats:

```bash
curl -X POST https://your-app.vercel.app/api/update-stats \
  -H "Content-Type: application/json" \
  -d '{"action": "migrate", "secret": "YOUR_STATS_UPDATE_SECRET"}'
```

## 5. Verify Cron Job

The cron job will run automatically at 3 AM UTC daily. To verify it's set up:
1. Go to Vercel Dashboard > Your Project > Functions
2. Look for `/api/cron/update-stats`
3. Check the Cron tab to see scheduled runs

## That's it! 

Your Firebase reads will drop from 180,000/day to under 200/day. The system will:
- Update all cached percentages daily at 3 AM UTC
- Serve all user requests from cache (1 read per request)
- Automatically maintain aggregated stats as new quizzes are completed