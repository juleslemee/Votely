'use client';

import { useState, FormEvent } from 'react';
import {
  ApplicationFormData,
  SearchIntensity,
  PipelineScale,
  ApplicationSpeed,
  StrategySophistication,
  ToolPayment,
} from '@/types/jobs';

interface Props {
  jobSlug: string;
  jobTitle: string;
}

const initialFormData: ApplicationFormData = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  search_intensity: '',
  pipeline_scale: '',
  application_speed: '',
  strategy_sophistication: [],
  tool_payment: [],
};

export default function JobApplicationForm({ jobSlug, jobTitle }: Props) {
  const [formData, setFormData] = useState<ApplicationFormData>(initialFormData);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (
    name: 'strategy_sophistication' | 'tool_payment',
    value: string,
    checked: boolean
  ) => {
    setFormData((prev) => {
      const currentValues = prev[name] as string[];
      if (checked) {
        return { ...prev, [name]: [...currentValues, value] };
      } else {
        return { ...prev, [name]: currentValues.filter((v) => v !== value) };
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Resume must be less than 5MB');
        return;
      }
      if (file.type !== 'application/pdf') {
        setError('Resume must be a PDF file');
        return;
      }
      setError(null);
      setResumeFile(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!resumeFile) {
        throw new Error('Please upload your resume');
      }

      // Validate phone has at least 9 digits
      const phoneDigits = formData.phone.replace(/\D/g, '');
      if (phoneDigits.length < 9) {
        throw new Error('Please enter a valid phone number (at least 9 digits)');
      }

      if (!formData.search_intensity || !formData.pipeline_scale || !formData.application_speed) {
        throw new Error('Please answer all required questions');
      }

      if (formData.strategy_sophistication.length === 0) {
        throw new Error('Please select at least one option for how you prepare for roles');
      }

      if (formData.tool_payment.length === 0) {
        throw new Error('Please select at least one option for tools/resources used');
      }

      const submitData = new FormData();
      submitData.append('resume', resumeFile);
      submitData.append('job_slug', jobSlug);
      submitData.append('job_title', jobTitle);
      submitData.append('data', JSON.stringify(formData));

      const response = await fetch('/api/jobs/apply', {
        method: 'POST',
        body: submitData,
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to submit application');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">&#10003;</div>
        <h3 className="text-xl font-ubuntu font-semibold text-green-800 mb-2">
          Application Submitted!
        </h3>
        <p className="text-green-700 font-noto">
          Thank you for applying to {jobTitle}. We&apos;ll review your application and get back to you
          soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} method="POST" className="max-w-[680px]">
      {/* Section 1: Personal Information */}
      <div className="mb-10">
        <h3 className="text-lg font-ubuntu font-semibold text-foreground mb-6">
          Personal Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-foreground mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              autoComplete="given-name"
              required
              placeholder="Jane"
              value={formData.first_name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-noto bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
            />
          </div>
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-foreground mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              autoComplete="family-name"
              required
              placeholder="Doe"
              value={formData.last_name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-noto bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            required
            placeholder="jane.doe@email.com"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-noto bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            autoComplete="tel"
            required
            placeholder="(555) 123-4567"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-noto bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
          />
        </div>

        <div>
          <label htmlFor="resume" className="block text-sm font-medium text-foreground mb-2">
            Resume (PDF) <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            id="resume"
            name="resume"
            accept=".pdf,application/pdf"
            required
            onChange={handleFileChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-noto bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
          />
          {resumeFile && (
            <p className="mt-2 text-sm text-gray-600">Selected: {resumeFile.name}</p>
          )}
        </div>
      </div>

      {/* Section 2: Application Context */}
      <div className="mb-10">
        <h3 className="text-lg font-ubuntu font-semibold text-foreground mb-2">
          A Few Quick Questions
        </h3>
        <p className="text-sm text-gray-600 font-noto mb-6">
          These help us understand where you are in your search and tailor our process accordingly.
        </p>

        {/* Q1: Search Intensity */}
        <fieldset className="mb-8">
          <legend className="text-sm font-medium text-foreground mb-3">
            How actively are you job searching? <span className="text-red-500">*</span>
          </legend>
          <div className="space-y-2">
            {([
              { value: 'daily', label: 'Actively applying every day' },
              { value: 'weekly', label: 'Applying a few times per week' },
              { value: 'selective', label: 'Only applying to select roles' },
            ] as const).map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="radio"
                  name="search_intensity"
                  value={option.value}
                  checked={formData.search_intensity === option.value}
                  onChange={() => handleRadioChange('search_intensity', option.value)}
                  className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-foreground font-noto">{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Q2: Pipeline Scale */}
        <fieldset className="mb-8">
          <legend className="text-sm font-medium text-foreground mb-3">
            How many roles are you applying to this cycle? <span className="text-red-500">*</span>
          </legend>
          <div className="space-y-2">
            {([
              { value: '1_to_30', label: '1–30' },
              { value: '30_to_100', label: '30–100' },
              { value: '100_to_500', label: '100–500' },
              { value: 'more_than_500', label: '500+' },
            ] as const).map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="radio"
                  name="pipeline_scale"
                  value={option.value}
                  checked={formData.pipeline_scale === option.value}
                  onChange={() => handleRadioChange('pipeline_scale', option.value)}
                  className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-foreground font-noto">{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Q3: Application Speed */}
        <fieldset className="mb-8">
          <legend className="text-sm font-medium text-foreground mb-3">
            When do you typically apply after discovering a new role? <span className="text-red-500">*</span>
          </legend>
          <div className="space-y-2">
            {([
              { value: 'same_day', label: 'Same day (within hours)' },
              { value: 'within_2_days', label: 'Within 1–2 days' },
              { value: 'within_week', label: 'Within a week' },
              { value: 'whenever', label: 'Whenever I get to it' },
            ] as const).map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="radio"
                  name="application_speed"
                  value={option.value}
                  checked={formData.application_speed === option.value}
                  onChange={() => handleRadioChange('application_speed', option.value)}
                  className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-foreground font-noto">{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Q4: Strategy Sophistication */}
        <fieldset className="mb-8">
          <legend className="text-sm font-medium text-foreground mb-3">
            Which best describes how you&apos;re preparing for competitive roles? <span className="text-red-500">*</span>{' '}
            <span className="text-gray-500 font-normal">(select all that apply)</span>
          </legend>
          <div className="space-y-2">
            {([
              { value: 'projects', label: 'Targeted personal or technical projects' },
              { value: 'leetcode', label: 'LeetCode / technical interview prep' },
              { value: 'networking', label: 'Networking and referrals' },
              { value: 'tools', label: 'Resume / interview tools' },
              { value: 'no_strategy', label: 'I mainly apply without a structured prep strategy' },
            ] as const).map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  name="strategy_sophistication"
                  value={option.value}
                  checked={formData.strategy_sophistication.includes(option.value)}
                  onChange={(e) =>
                    handleCheckboxChange('strategy_sophistication', option.value, e.target.checked)
                  }
                  className="w-5 h-5 text-purple-600 focus:ring-purple-500 rounded"
                />
                <span className="text-foreground font-noto">{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Q5: Tool Payment Proxy */}
        <fieldset className="mb-8">
          <legend className="text-sm font-medium text-foreground mb-3">
            Which tools or resources have you used during your job search? <span className="text-red-500">*</span>{' '}
            <span className="text-gray-500 font-normal">(select all that apply)</span>
          </legend>
          <div className="space-y-2">
            {([
              { value: 'linkedin_premium', label: 'LinkedIn Premium' },
              { value: 'job_alerts', label: 'Job alerts / tracking tools' },
              { value: 'resume_tools', label: 'Resume or interview prep tools (e.g. VMock)' },
              { value: 'application_tools', label: 'Application management tools (e.g. Simplify)' },
              { value: 'spreadsheets', label: 'Spreadsheets / Notion / custom systems' },
              { value: 'none', label: 'None of the above' },
            ] as const).map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  name="tool_payment"
                  value={option.value}
                  checked={formData.tool_payment.includes(option.value)}
                  onChange={(e) =>
                    handleCheckboxChange('tool_payment', option.value, e.target.checked)
                  }
                  className="w-5 h-5 text-purple-600 focus:ring-purple-500 rounded"
                />
                <span className="text-foreground font-noto">{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-noto text-sm">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 text-lg font-ubuntu font-semibold rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Application'}
      </button>
    </form>
  );
}
