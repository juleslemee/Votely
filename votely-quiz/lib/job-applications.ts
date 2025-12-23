import { adminDb, getAdminStorage, serverTimestamp } from './firebase-admin';
import { JobApplication, ApplicantInfo, ApplicationContext } from '@/types/jobs';
import { debugLog, debugError } from './debug-logger';

const COLLECTION_NAME = 'job_applications';
const STORAGE_BUCKET = 'votely-survey.firebasestorage.app';

export async function uploadResume(
  file: Buffer,
  filename: string,
  jobSlug: string,
  contentType: string
): Promise<{ url: string; path: string }> {
  try {
    const storage = getAdminStorage();
    const bucket = storage.bucket(STORAGE_BUCKET);

    // Create a unique filename
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `resumes/${jobSlug}/${timestamp}-${sanitizedFilename}`;

    const fileRef = bucket.file(storagePath);

    await fileRef.save(file, {
      metadata: {
        contentType: contentType,
      },
    });

    // Make the file publicly accessible
    await fileRef.makePublic();

    const publicUrl = `https://storage.googleapis.com/${STORAGE_BUCKET}/${storagePath}`;

    debugLog('Resume uploaded successfully:', { path: storagePath, url: publicUrl });

    return {
      url: publicUrl,
      path: storagePath,
    };
  } catch (error) {
    debugError('Failed to upload resume:', error);
    throw error;
  }
}

export async function saveJobApplication(
  jobSlug: string,
  jobTitle: string,
  applicant: ApplicantInfo,
  context: ApplicationContext
): Promise<string> {
  try {
    const application: Omit<JobApplication, 'id'> = {
      job_slug: jobSlug,
      job_title: jobTitle,
      applicant,
      context,
      submitted_at: serverTimestamp(),
      status: 'new',
    };

    const docRef = await adminDb.collection(COLLECTION_NAME).add(application);

    debugLog('Job application saved successfully:', { id: docRef.id, jobSlug });

    return docRef.id;
  } catch (error) {
    debugError('Failed to save job application:', error);
    throw error;
  }
}

export async function getApplicationsByJob(jobSlug: string): Promise<JobApplication[]> {
  try {
    const snapshot = await adminDb
      .collection(COLLECTION_NAME)
      .where('job_slug', '==', jobSlug)
      .orderBy('submitted_at', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as JobApplication[];
  } catch (error) {
    debugError('Failed to get applications:', error);
    throw error;
  }
}
