import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { uploadResume, saveJobApplication } from '@/lib/job-applications';
import { ApplicationFormData, ApplicantInfo, ApplicationContext } from '@/types/jobs';
import { debugLog, debugError } from '@/lib/debug-logger';

export const dynamic = 'force-dynamic';

// Rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

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
  const maxRequests = 10; // 10 applications per hour per IP

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

export async function POST(request: Request) {
  try {
    // Get client IP for rate limiting
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';

    // Check rate limit
    if (!(await checkRateLimit(ip))) {
      return NextResponse.json(
        { error: 'Too many applications. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const resumeFile = formData.get('resume') as File | null;
    const jobSlug = formData.get('job_slug') as string;
    const jobTitle = formData.get('job_title') as string;
    const dataString = formData.get('data') as string;

    if (!resumeFile || !jobSlug || !jobTitle || !dataString) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Parse form data
    let data: ApplicationFormData;
    try {
      data = JSON.parse(dataString);
    } catch {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }

    // Validate required fields
    if (!data.first_name || !data.last_name || !data.email || !data.phone) {
      return NextResponse.json({ error: 'Name, email, and phone are required' }, { status: 400 });
    }

    if (!data.search_intensity || !data.pipeline_scale || !data.application_speed) {
      return NextResponse.json({ error: 'Please answer all required questions' }, { status: 400 });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Validate resume file
    if (resumeFile.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Resume must be a PDF file' }, { status: 400 });
    }

    if (resumeFile.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Resume must be less than 5MB' }, { status: 400 });
    }

    debugLog('Processing job application:', {
      jobSlug,
      applicantEmail: data.email,
      resumeSize: resumeFile.size,
    });

    // Upload resume to Firebase Storage
    const resumeBuffer = Buffer.from(await resumeFile.arrayBuffer());
    const { url: resumeUrl } = await uploadResume(
      resumeBuffer,
      resumeFile.name,
      jobSlug,
      resumeFile.type
    );

    // Prepare applicant info
    const applicant: ApplicantInfo = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone || '',
      resume_url: resumeUrl,
      resume_filename: resumeFile.name,
    };

    // Prepare application context
    const context: ApplicationContext = {
      search_intensity: data.search_intensity as ApplicationContext['search_intensity'],
      pipeline_scale: data.pipeline_scale as ApplicationContext['pipeline_scale'],
      application_speed: data.application_speed as ApplicationContext['application_speed'],
      strategy_sophistication: data.strategy_sophistication || [],
      tool_payment: data.tool_payment || [],
    };

    // Save application to Firestore
    const applicationId = await saveJobApplication(jobSlug, jobTitle, applicant, context);

    debugLog('Job application saved successfully:', { applicationId });

    return NextResponse.json({
      success: true,
      applicationId,
      message: 'Application submitted successfully',
    });
  } catch (error) {
    debugError('Failed to process job application:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Job application error:', errorMessage);
    return NextResponse.json(
      {
        error: 'Failed to submit application. Please try again.',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
