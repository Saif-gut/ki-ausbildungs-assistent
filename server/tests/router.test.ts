import assert from 'node:assert/strict';
import test from 'node:test';
import { routeRequest } from '../src/ai/router';

const cases = [
  { message: 'Hallo', task: 'greeting', path: ['ollama'] },
  { message: 'Was macht ein Fachinformatiker für Systemintegration?', task: 'career_info', path: ['anthropic'] },
  { message: 'Passe ich mit meinem Profil zu dieser Stelle?', task: 'profile_match', path: ['ollama', 'anthropic', 'gemini', 'finalizer'] },
  { message: 'Erstelle mir eine Bewerbung für diese Ausbildungsstelle.', task: 'application', path: ['ollama', 'anthropic', 'gemini', 'finalizer'] },
  { message: 'Trainiere mit mir ein Vorstellungsgespräch.', task: 'interview', path: ['ollama', 'anthropic', 'gemini', 'finalizer'] },
] as const;

for (const scenario of cases) {
  test(`route: ${scenario.message}`, () => {
    const decision = routeRequest({ message: scenario.message });
    assert.equal(decision.task, scenario.task);
    assert.deepEqual(decision.intendedPath, scenario.path);
  });
}

test('sensible Angaben werden als solche erkannt', () => {
  const decision = routeRequest({ message: 'Meine E-Mail ist mira@example.de. Schreibe eine Bewerbung.' });
  assert.equal(decision.sensitivity, 'sensitive');
});

