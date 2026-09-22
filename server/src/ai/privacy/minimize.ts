import { AIRequest, PrivacyResult, TaskType } from '../types';

const DIRECT_IDENTIFIERS = new Set([
  'name', 'firstname', 'first_name', 'lastname', 'last_name', 'fullname', 'full_name',
  'email', 'phone', 'telephone', 'mobile', 'address', 'street', 'postalcode', 'postal_code',
  'zip', 'birthdate', 'birth_date', 'dateofbirth', 'photo', 'photopath', 'photo_path',
]);

const TASK_FIELDS: Record<TaskType, Set<string>> = {
  greeting: new Set(),
  career_info: new Set(['interests']),
  job_question: new Set(['schooldegree', 'school_degree', 'experience', 'skills', 'languages', 'interests']),
  profile_match: new Set(['schooldegree', 'school_degree', 'graduationyear', 'graduation_year', 'experience', 'skills', 'languages', 'interests']),
  application: new Set(['schooldegree', 'school_degree', 'graduationyear', 'graduation_year', 'school', 'experience', 'skills', 'languages', 'interests']),
  cv: new Set(['schooldegree', 'school_degree', 'graduationyear', 'graduation_year', 'school', 'experience', 'skills', 'languages', 'interests']),
  interview: new Set(['schooldegree', 'school_degree', 'experience', 'skills', 'languages', 'interests']),
  unknown: new Set(['schooldegree', 'school_degree', 'experience', 'skills', 'interests']),
};

const normalizedKey = (key: string) => key.replace(/[-\s]/g, '').toLowerCase();
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function scrubFreeText(value: string) {
  const rules: { label: string; pattern: RegExp }[] = [
    { label: 'prompt.email', pattern: /[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi },
    { label: 'prompt.phone', pattern: /\+?\d[\d\s/()-]{7,}\d/g },
    { label: 'prompt.birthDate', pattern: /\b(?:geburtsdatum|geboren\s+am)\s*:?\s*\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b/gi },
    { label: 'prompt.address', pattern: /\b[A-ZÄÖÜ][A-Za-zÄÖÜäöüß-]*(?:straße|strasse|weg|allee|platz)\s+\d+[a-z]?\b/gi },
  ];
  const labels: string[] = [];
  let text = value;
  for (const rule of rules) {
    if (rule.pattern.test(text)) labels.push(rule.label);
    rule.pattern.lastIndex = 0;
    text = text.replace(rule.pattern, '[PERSONENBEZOGENE ANGABE ENTFERNT]');
  }
  return { text, labels };
}

export function minimizeRequest(request: AIRequest, task: TaskType): PrivacyResult {
  const sourceProfile = request.profile ?? {};
  const selectedProfile: Record<string, unknown> = {};
  const redactedFields: string[] = [];
  const allowed = TASK_FIELDS[task];
  let message = request.message;
  let conversation = request.conversation?.slice(-6).map((entry) => ({ ...entry }));
  const identifierValues: string[] = [];

  for (const [key, value] of Object.entries(sourceProfile)) {
    const keyNormalized = normalizedKey(key);
    const isIdentifier = DIRECT_IDENTIFIERS.has(keyNormalized);
    const isAllowed = allowed.has(keyNormalized);
    if (isAllowed && !isIdentifier) selectedProfile[key] = value;
    else redactedFields.push(key);

    // Remove known direct identifiers even when the user pasted them into the prompt.
    if (isIdentifier && typeof value === 'string' && value.trim().length >= 3) identifierValues.push(value.trim());
  }

  for (const identifier of identifierValues) {
    const pattern = new RegExp(escapeRegex(identifier), 'gi');
    message = message.replace(pattern, '[PERSONENBEZOGENE ANGABE ENTFERNT]');
    conversation = conversation?.map((entry) => ({ ...entry, content: entry.content.replace(pattern, '[PERSONENBEZOGENE ANGABE ENTFERNT]') }));
  }

  const scrubbedMessage = scrubFreeText(message);
  message = scrubbedMessage.text;
  redactedFields.push(...scrubbedMessage.labels);
  conversation = conversation?.map((entry) => {
    const scrubbed = scrubFreeText(entry.content);
    redactedFields.push(...scrubbed.labels.map((label) => `conversation.${label.replace('prompt.', '')}`));
    return { ...entry, content: scrubbed.text };
  });

  return {
    request: {
      message,
      ...(Object.keys(selectedProfile).length ? { profile: selectedProfile } : {}),
      ...(request.job ? { job: request.job } : {}),
      // History is deliberately capped and contains no extra profile object.
      ...(conversation?.length ? { conversation } : {}),
    },
    redactedFields: [...new Set(redactedFields)].sort(),
  };
}
