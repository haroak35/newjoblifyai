export type JobStatus = 'draft' | 'live' | 'review' | 'ended';

export interface Job {
  id: string;
  code: string;
  user_id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  type: string;
  remote: boolean;
  status: JobStatus;
  experience_level?: string;
  must_have_skills?: string[];
  preferred_background?: string;
  nice_to_have_skills?: string[];
  priorities?: string[];
  application_start?: string;
  application_deadline?: string;
  created_at: string;
}