import { AIRequest, RouteDecision, TaskType } from '../types';

const includesAny = (value: string, terms: string[]) => terms.some((term) => value.includes(term));

export function detectTask(message: string): TaskType {
  const text = message.toLocaleLowerCase('de-DE').trim();
  if (/^(hallo|hi|hey|guten (morgen|tag|abend))[!.\s]*$/.test(text)) return 'greeting';
  if (includesAny(text, ['lebenslauf', 'cv'])) return 'cv';
  if (includesAny(text, ['bewerbung', 'anschreiben', 'bewirb'])) return 'application';
  if (includesAny(text, ['vorstellungsgespräch', 'interview', 'trainiere mit mir'])) return 'interview';
  if (includesAny(text, ['passe ich', 'profil zu', 'anforderungen erfülle', 'geeignet für'])) return 'profile_match';
  if (includesAny(text, ['was macht', 'berufsbild', 'zukunftsperspektive', 'ausbildungsberuf'])) return 'career_info';
  if (includesAny(text, ['stelle', 'gehalt', 'verdienst', 'vergütung', 'voraussetzung', 'aufgaben'])) return 'job_question';
  return 'unknown';
}

function detectSensitivity(request: AIRequest) {
  const promptLooksSensitive = /\b(?:[\w.+-]+@[\w.-]+\.[a-z]{2,}|\+?\d[\d\s/()-]{7,}|straße|strasse|geburtsdatum|telefonnummer)\b/i.test(request.message);
  const profileKeys = Object.keys(request.profile ?? {}).map((key) => key.toLowerCase());
  const hasDirectIdentifiers = profileKeys.some((key) => ['firstname', 'lastname', 'name', 'email', 'phone', 'address', 'street', 'birthdate', 'photo'].includes(key));
  return promptLooksSensitive ? 'sensitive' as const : hasDirectIdentifiers ? 'personal' as const : 'low' as const;
}

export function routeRequest(request: AIRequest): RouteDecision {
  const task = detectTask(request.message);
  const sensitivity = detectSensitivity(request);

  if (task === 'greeting') return { task, sensitivity, complexity: 'simple', intendedPath: ['ollama'], reason: 'Kurze Begrüßung ohne externen Qualitätsbedarf.' };
  if (task === 'career_info' || task === 'job_question') return { task, sensitivity, complexity: 'normal', intendedPath: request.job ? ['ollama', 'anthropic'] : ['anthropic'], reason: 'Normale Ausbildungsfrage; Stellenkontext wird bei Bedarf lokal strukturiert.' };
  if (task === 'application' || task === 'cv') return { task, sensitivity, complexity: 'complex', intendedPath: ['ollama', 'anthropic', 'gemini', 'finalizer'], reason: 'Dokument benötigt Datenminimierung, hochwertigen Entwurf und Faktenprüfung.' };
  if (task === 'profile_match' || task === 'interview') return { task, sensitivity, complexity: 'complex', intendedPath: ['ollama', 'anthropic', 'gemini', 'finalizer'], reason: 'Profilbezug oder Training benötigt Analyse und Qualitätskontrolle.' };
  return { task, sensitivity, complexity: 'normal', intendedPath: ['ollama', 'anthropic'], reason: 'Unklare Anfrage wird lokal eingeordnet und anschließend verständlich beantwortet.' };
}

