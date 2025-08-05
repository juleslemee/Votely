import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { adminDb, serverTimestamp } from '../../../lib/firebase-admin';

export const dynamic = 'force-dynamic';

// Rate limiting: Simple in-memory store (consider Redis for production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now();
  rateLimitStore.forEach((value, key) => {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  });
}, 60 * 60 * 1000);

async function checkRateLimit(ip: string): Promise<boolean> {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = 5; // 5 requests per hour per IP

  const userLimit = rateLimitStore.get(ip);
  
  if (!userLimit || userLimit.resetTime < now) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userLimit.count >= maxRequests) {
    return false;
  }

  userLimit.count++;
  return true;
}

async function sendEmailNotification(feedbackData: any) {
  // If using Vercel, you can use their Email API
  // Or integrate with services like Resend, SendGrid, etc.
  
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Votely Feedback <feedback@votely.app>',
          to: process.env.FEEDBACK_EMAIL || 'contact@juleslemee.com',
          subject: 'New Votely Quiz Feedback',
          html: `
            <h2>New Feedback from Votely Quiz</h2>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; background: #f5f5f5; padding: 16px; border-radius: 8px;">
              ${feedbackData.feedback}
            </p>
            <hr style="margin: 24px 0; border: none; border-top: 1px solid #e0e0e0;">
            <p><strong>User wants reply:</strong> ${feedbackData.wantsReply ? 'Yes' : 'No'}</p>
            ${feedbackData.wantsReply && feedbackData.email ? 
              `<p><strong>Reply to:</strong> <a href="mailto:${feedbackData.email}">${feedbackData.email}</a></p>` : 
              ''}
            <p><strong>Sent at:</strong> ${new Date(feedbackData.timestamp).toLocaleString()}</p>
            <p><strong>Feedback ID:</strong> ${feedbackData.id}</p>
          `,
        }),
      });

      if (!response.ok) {
        console.error('Failed to send email:', await response.text());
      }
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }
}

export async function POST(request: Request) {
  console.log('Feedback API route called');
  
  try {
    // Check if Firebase Admin is properly configured
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      console.error('FIREBASE_SERVICE_ACCOUNT_KEY is not set');
      return NextResponse.json(
        { error: 'Server configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    // Get client IP for rate limiting
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 
               headersList.get('x-real-ip') || 
               'unknown';

    // Check rate limit
    const isAllowed = await checkRateLimit(ip);
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { feedback, wantsReply, email } = await request.json();

    // Validate input
    if (!feedback || typeof feedback !== 'string' || feedback.trim().length === 0) {
      return NextResponse.json(
        { error: 'Feedback is required' },
        { status: 400 }
      );
    }

    if (feedback.length > 5000) {
      return NextResponse.json(
        { error: 'Feedback is too long (max 5000 characters)' },
        { status: 400 }
      );
    }

    if (wantsReply && email) {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email address' },
          { status: 400 }
        );
      }
    }

    // Prepare feedback data
    const feedbackData: any = {
      feedback: feedback.trim(),
      wantsReply: Boolean(wantsReply),
      email: wantsReply && email ? email.trim() : null,
      timestamp: serverTimestamp(),
      ip: ip,
      userAgent: request.headers.get('user-agent') || 'unknown',
      processed: false,
      createdAt: new Date().toISOString(),
    };

    // Store in Firestore
    try {
      console.log('Attempting to save feedback to Firestore...');
      
      const docRef = await adminDb.collection('feedback').add(feedbackData);
      feedbackData.id = docRef.id;
      
      // Update with ID
      await docRef.update({ id: docRef.id });
      console.log('Feedback saved successfully with ID:', docRef.id);
    } catch (error: any) {
      console.error('Error saving to Firestore:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        stack: error.stack
      });
      
      // Try to provide more specific error messages
      if (error.code === 'permission-denied') {
        return NextResponse.json(
          { error: 'Database permission error. Admin SDK may not be properly authenticated.' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to save feedback',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          code: error.code
        },
        { status: 500 }
      );
    }

    // Send email notification (non-blocking)
    sendEmailNotification(feedbackData).catch(error => {
      console.error('Failed to send email notification:', error);
    });

    // Log for monitoring
    console.log(`New feedback received: ${feedbackData.id}`);

    return NextResponse.json({ 
      success: true,
      message: 'Thank you for your feedback!'
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });

  } catch (error: any) {
    console.error('Error processing feedback:', error);
    console.error('Error stack:', error.stack);
    
    // Always return valid JSON, even on unexpected errors
    return NextResponse.json(
      { 
        error: 'Failed to process feedback',
        message: error.message || 'Unknown error',
        type: error.name || 'Error'
      },
      { status: 500 }
    );
  }
}

// Handle GET requests
export async function GET() {
  return NextResponse.json({ 
    message: 'Feedback API is working',
    method: 'GET',
    hasFirebaseKey: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
    timestamp: new Date().toISOString()
  });
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}