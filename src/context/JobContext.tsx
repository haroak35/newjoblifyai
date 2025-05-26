import React, { createContext, useState, useContext, ReactNode } from 'react';

interface JobContextType {
  // Job Info
  jobId?: string;
  jobTitle: string;
  setJobTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  remoteAllowed: boolean;
  setRemoteAllowed: (value: boolean) => void;
  employmentType: string;
  setEmploymentType: (value: string) => void;
  experienceLevel: string;
  setExperienceLevel: (value: string) => void;
  jobCode?: string;
  status?: string;
  setStatus: (value: string) => void;
  createdAt?: string;
  
  // Application Settings
  requireCaptcha: boolean;
  setRequireCaptcha: (value: boolean) => void;
  maxApplicants: number;
  setMaxApplicants: (value: number) => void;
  applicationStart: string;
  setApplicationStart: (value: string) => void;
  applicationDeadline: string;
  setApplicationDeadline: (value: string) => void;
  
  // AI Matching
  mustHaveSkills: string[];
  setMustHaveSkills: (skills: string[]) => void;
  preferredBackground: string;
  setPreferredBackground: (value: string) => void;
  niceToHaveSkills: string[];
  setNiceToHaveSkills: (skills: string[]) => void;
  priorities: string[];
  setPriorities: (priorities: string[]) => void;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

interface JobProviderProps {
  children: ReactNode;
  initialJob?: {
    id?: string;
    title?: string;
    description?: string;
    location?: string;
    remote?: boolean;
    type?: string;
    experience_level?: string;
    code?: string;
    status?: string;
    created_at?: string;
    must_have_skills?: string[];
    preferred_background?: string;
    nice_to_have_skills?: string[];
    priorities?: string[];
    application_start?: string;
    application_deadline?: string;
  };
}

export const JobProvider: React.FC<JobProviderProps> = ({ children, initialJob }) => {
  // Job Info
  const [jobId] = useState(initialJob?.id);
  const [jobTitle, setJobTitle] = useState(initialJob?.title || '');
  const [description, setDescription] = useState(initialJob?.description || '');
  const [location, setLocation] = useState(initialJob?.location || '');
  const [remoteAllowed, setRemoteAllowed] = useState(initialJob?.remote || false);
  const [employmentType, setEmploymentType] = useState(initialJob?.type || 'full-time');
  const [experienceLevel, setExperienceLevel] = useState(initialJob?.experience_level || 'mid');
  const [jobCode] = useState(initialJob?.code);
  const [status, setStatus] = useState(initialJob?.status || 'draft');
  const [createdAt] = useState(initialJob?.created_at);
  
  // Application Settings
  const [requireCaptcha, setRequireCaptcha] = useState(true);
  const [maxApplicants, setMaxApplicants] = useState(100);
  const [applicationStart, setApplicationStart] = useState(initialJob?.application_start || '');
  const [applicationDeadline, setApplicationDeadline] = useState(initialJob?.application_deadline || '');
  
  // AI Matching
  const [mustHaveSkills, setMustHaveSkills] = useState<string[]>(initialJob?.must_have_skills || []);
  const [preferredBackground, setPreferredBackground] = useState(initialJob?.preferred_background || '');
  const [niceToHaveSkills, setNiceToHaveSkills] = useState<string[]>(initialJob?.nice_to_have_skills || []);
  const [priorities, setPriorities] = useState<string[]>(initialJob?.priorities || []);

  const value = {
    jobId,
    jobTitle,
    setJobTitle,
    description,
    setDescription,
    location,
    setLocation,
    remoteAllowed,
    setRemoteAllowed,
    employmentType,
    setEmploymentType,
    experienceLevel,
    setExperienceLevel,
    jobCode,
    status,
    setStatus,
    createdAt,
    requireCaptcha,
    setRequireCaptcha,
    maxApplicants,
    setMaxApplicants,
    applicationStart,
    setApplicationStart,
    applicationDeadline,
    setApplicationDeadline,
    mustHaveSkills,
    setMustHaveSkills,
    preferredBackground,
    setPreferredBackground,
    niceToHaveSkills,
    setNiceToHaveSkills,
    priorities,
    setPriorities
  };

  return <JobContext.Provider value={value}>{children}</JobContext.Provider>;
};

export const useJobContext = (): JobContextType => {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error('useJobContext must be used within a JobProvider');
  }
  return context;
};