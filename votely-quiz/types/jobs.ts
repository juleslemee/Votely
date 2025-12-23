// Job posting data structure
export interface Job {
  slug: string;
  title: string;
  department: string;
  location: string;
  locationType: 'remote' | 'hybrid' | 'onsite';
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  compensation: {
    type: 'hourly' | 'salary';
    min: number;
    max: number;
    currency: string;
    period?: string; // e.g., "per month" for context
  };
  sections: JobSection[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobSection {
  title: string;
  content?: string; // Plain text content
  bullets?: string[]; // Bullet point list
}

// Application form data - Section 1 (Core fields)
export interface ApplicantInfo {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  resume_url: string;
  resume_filename: string;
}

// Application form data - Section 2 (Context questions)
export type SearchIntensity = 'daily' | 'weekly' | 'selective';
export type PipelineScale = '1_to_30' | '30_to_100' | '100_to_500' | 'more_than_500';
export type ApplicationSpeed = 'same_day' | 'within_2_days' | 'within_week' | 'whenever';
export type StrategySophistication = 'projects' | 'leetcode' | 'networking' | 'tools' | 'no_strategy';
export type ToolPayment = 'linkedin_premium' | 'job_alerts' | 'resume_tools' | 'application_tools' | 'spreadsheets' | 'none';

export interface ApplicationContext {
  search_intensity: SearchIntensity;
  pipeline_scale: PipelineScale;
  application_speed: ApplicationSpeed;
  strategy_sophistication: StrategySophistication[];
  tool_payment: ToolPayment[];
}

// Complete job application
export interface JobApplication {
  id?: string;
  job_slug: string;
  job_title: string;
  applicant: ApplicantInfo;
  context: ApplicationContext;
  submitted_at: string;
  status: 'new' | 'reviewed' | 'contacted' | 'rejected';
}

// Form state for client-side handling
export interface ApplicationFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  search_intensity: SearchIntensity | '';
  pipeline_scale: PipelineScale | '';
  application_speed: ApplicationSpeed | '';
  strategy_sophistication: StrategySophistication[];
  tool_payment: ToolPayment[];
}
