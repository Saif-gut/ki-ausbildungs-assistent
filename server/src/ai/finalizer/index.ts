import { AIProvider } from '../types';
import { systems } from '../prompts';

export function cleanFinalText(value: string) {
  return value
    .replace(/```(?:text|markdown)?\s*/gi, '')
    .replace(/```/g, '')
    .replace(/^\s*(?:finale antwort|final answer)\s*:\s*/i, '')
    .trim();
}

export async function finalizeAnswer(provider: AIProvider, draft: string, critique: string) {
  const result = await provider.generate({
    system: systems.finalizer,
    prompt: `Entwurf:\n${draft}\n\nQualitätsprüfung:\n${critique}\n\nErzeuge jetzt ausschließlich die überarbeitete finale Antwort.`,
    maxTokens: 1800,
  });
  return cleanFinalText(result.text);
}

