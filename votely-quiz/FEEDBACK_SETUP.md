# Feedback System Setup Guide

This guide walks you through setting up the production-ready feedback system for Votely Quiz.

## Overview

The feedback system now includes:
- **Firebase Firestore** for persistent storage
- **Email notifications** via Resend (or other providers)
- **Rate limiting** to prevent spam (5 submissions per hour per IP)
- **Input validation** and sanitization
- **Error handling** and logging

## Setup Steps

### 1. Firebase Admin SDK

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Project Settings** > **Service Accounts**
4. Click **Generate new private key**
5. Save the downloaded JSON file securely
6. Convert the JSON to a single-line string and add to your environment variables:

```bash
# In your .env.local file (for local development)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
```

### 2. Email Service Setup

#### Option A: Resend (Recommended for Vercel)

1. Sign up at [Resend](https://resend.com)
2. Create an API key
3. Add your domain and verify it
4. Add to environment variables:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
FEEDBACK_EMAIL=your-email@example.com
```

#### Option B: SendGrid

1. Sign up at [SendGrid](https://sendgrid.com)
2. Create an API key with "Mail Send" permissions
3. Verify your sender identity
4. Update the code in `/app/api/feedback/route.ts` to use SendGrid

### 3. Deploy Firestore Rules

Deploy the updated Firestore rules to secure the feedback collection:

```bash
firebase deploy --only firestore:rules
```

### 4. Vercel Environment Variables

Add these environment variables in your Vercel dashboard:

1. Go to your project settings in Vercel
2. Navigate to **Environment Variables**
3. Add the following:

```
FIREBASE_SERVICE_ACCOUNT_KEY = [your service account JSON as single line]
RESEND_API_KEY = [your Resend API key]
FEEDBACK_EMAIL = [email to receive notifications]
```

### 5. Test the System

1. Submit test feedback through the form
2. Check Firestore to verify data is stored
3. Verify email notifications are received
4. Test rate limiting by submitting multiple times

## Security Considerations

1. **Service Account Key**: Keep your Firebase service account key secure. Never commit it to version control.
2. **Rate Limiting**: The current implementation uses in-memory storage. For multiple instances, consider using Redis or Vercel KV.
3. **Email Validation**: Basic validation is included. Consider adding more robust validation if needed.
4. **CORS**: The API route automatically handles CORS for your domain.

## Monitoring

- Check Vercel logs for any errors
- Monitor Firestore usage in Firebase Console
- Track email delivery in your email service dashboard

## Troubleshooting

### Feedback not saving to Firestore
- Check that `FIREBASE_SERVICE_ACCOUNT_KEY` is properly formatted
- Verify the service account has write permissions
- Check Vercel function logs for errors

### Emails not sending
- Verify `RESEND_API_KEY` is correct
- Check that your domain is verified in Resend
- Look for email errors in Vercel logs

### Rate limiting issues
- The limit resets every hour
- Consider implementing user-based limits if needed
- For production with multiple instances, use Redis

## Future Enhancements

1. **Admin Dashboard**: Build a UI to view and manage feedback
2. **Analytics**: Track feedback trends and sentiment
3. **Auto-replies**: Send automated responses to users who request replies
4. **Slack/Discord Integration**: Get instant notifications for new feedback