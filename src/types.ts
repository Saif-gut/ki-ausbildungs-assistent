export type RequirementState = 'met' | 'open' | 'missing';

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  distance: string;
  start: string;
  logo: string;
  color: string;
  tags: string[];
  summary: string;
  tasks: string[];
  salary: string;
  future: string;
  requirements: { label: string; state: RequirementState; evidence?: string }[];
};

export type ApplicationStatus = 'Entwurf' | 'Bewerbung fertig' | 'Gesendet' | 'Vorstellungsgespräch' | 'Zusage' | 'Absage';

export type Application = {
  jobId: string;
  status: ApplicationStatus;
  updatedAt: string;
};

export type Profile = {
  firstName: string;
  lastName: string;
  city: string;
  email: string;
  phone: string;
  birthDate: string;
  schoolDegree: string;
  school: string;
  graduationYear: string;
  experience: string;
  internships: string;
  skills: string;
  languages: string;
  certificates: string;
  interests: string;
};
