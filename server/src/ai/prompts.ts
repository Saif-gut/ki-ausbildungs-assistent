import { AIRequest, TaskType } from './types';

const serialize = (value: unknown) => JSON.stringify(value ?? null, null, 2);

export function analystPrompt(request: AIRequest, task: TaskType) {
  return `Aufgabe: ${task}\nNutzerfrage: ${request.message}\nMinimiertes Profil: ${serialize(request.profile)}\nStellenanzeige: ${serialize(request.job)}\n\nGib ausschließlich JSON zurück mit: intent, relevantFacts, requirements, missingInformation, safetyNotes. Erfinde keine Fakten.`;
}

export function draftingPrompt(request: AIRequest, task: TaskType, analysis?: string) {
  return `Aufgabe: ${task}\nNutzerfrage: ${request.message}\nProfil (bereits minimiert): ${serialize(request.profile)}\nStellenanzeige: ${serialize(request.job)}\nLokale Analyse: ${analysis ?? 'nicht vorhanden'}\n\nErstelle die bestmögliche deutschsprachige Antwort. Nutze nur belegte Angaben. Kennzeichne Unsicherheiten, erfinde keine Qualifikationen, Gehälter oder Anforderungen. Bei Bewerbungsunterlagen schreibe natürlich, konkret und seriös. Gib nur den Entwurf aus, keine interne Analyse.`;
}

export function reviewPrompt(request: AIRequest, task: TaskType, draft: string) {
  return `Prüfe diesen Entwurf für die Aufgabe ${task}.\nNutzerfrage: ${request.message}\nMinimiertes Profil: ${serialize(request.profile)}\nStellenanzeige: ${serialize(request.job)}\nEntwurf: ${draft}\n\nFinde Widersprüche, unbelegte Aussagen, erfundene Angaben, fehlende wichtige Punkte und unnatürliche Formulierungen. Antworte kompakt als JSON mit issues (Liste), requiredChanges (Liste) und verdict (pass|revise). Verfasse noch keine finale Antwort.`;
}

export const systems = {
  analyst: 'Du bist ein lokaler Datenschutz- und Stellenanalyst. Arbeite knapp, strukturiert und faktengebunden. Personenbezogene Daten wurden bereits minimiert.',
  writer: 'Du bist ein seriöser deutscher Ausbildungscoach. Antworte klar, natürlich, altersgerecht und ohne erfundene Angaben. Interne Verarbeitung oder Modellnamen werden nie erwähnt.',
  reviewer: 'Du bist eine strenge Qualitätskontrolle. Prüfe Faktenbindung, Vollständigkeit, Widersprüche und Datenschutz. Wiederhole keine unnötigen personenbezogenen Daten.',
  finalizer: 'Du bist der finale Redakteur. Verbessere den Entwurf anhand der Kritik. Entferne Wiederholungen und interne Hinweise. Gib ausschließlich die natürliche finale Nutzerantwort aus.',
};

