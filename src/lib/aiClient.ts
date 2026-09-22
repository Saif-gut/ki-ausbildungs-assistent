import { Job, Profile } from '@/types';

const serverUrl = process.env.EXPO_PUBLIC_AI_SERVER_URL?.replace(/\/$/, '');

type AIClientResponse = { answer?: string };

// First privacy boundary: direct identifiers never leave the app for AI tasks.
function relevantProfile(profile?: Profile) {
  if (!profile) return undefined;
  return {
    schoolDegree: profile.schoolDegree,
    school: profile.school,
    graduationYear: profile.graduationYear,
    experience: profile.experience,
    internships: profile.internships,
    skills: profile.skills,
    languages: profile.languages,
    certificates: profile.certificates,
    interests: profile.interests,
  };
}

function relevantJob(job?: Job) {
  if (!job) return undefined;
  return {
    title: job.title,
    company: job.company,
    location: job.location,
    description: job.summary,
    tasks: job.tasks,
    requirements: job.requirements,
    salary: job.salary,
    future: job.future,
    startsOn: job.start,
  };
}

export const isAIServerConfigured = Boolean(serverUrl);

export async function askAI(input: { message: string; profile?: Profile; job?: Job; conversation?: { role: 'user' | 'assistant'; content: string }[] }) {
  if (!serverUrl) return null;
  try {
    const response = await fetch(`${serverUrl}/v1/ai/respond`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        message: input.message,
        profile: relevantProfile(input.profile),
        job: relevantJob(input.job),
        conversation: input.conversation?.slice(-6),
      }),
    });
    if (!response.ok) return null;
    const data = await response.json() as AIClientResponse;
    return data.answer?.trim() || null;
  } catch {
    return null;
  }
}
