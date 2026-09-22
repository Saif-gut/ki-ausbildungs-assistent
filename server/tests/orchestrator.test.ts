import assert from 'node:assert/strict';
import test from 'node:test';
import { AIOrchestrator } from '../src/ai/orchestrator';
import { AIProvider, ProviderInput, ProviderName } from '../src/ai/types';

class FakeProvider implements AIProvider {
  constructor(readonly name: ProviderName, readonly model: string) {}
  isConfigured() { return true; }
  async generate(input: ProviderInput) {
    const text = this.name === 'ollama' && input.responseFormat === 'json'
      ? '{"intent":"application","relevantFacts":[],"requirements":[],"missingInformation":[],"safetyNotes":[]}'
      : this.name === 'gemini'
        ? '{"issues":[],"requiredChanges":[],"verdict":"pass"}'
        : 'Natürliche finale Testantwort.';
    return { provider: this.name, model: this.model, text };
  }
}

const providers = {
  ollama: new FakeProvider('ollama', 'local-test'),
  anthropic: new FakeProvider('anthropic', 'claude-test'),
  gemini: new FakeProvider('gemini', 'gemini-test'),
};

test('komplexer Pfad wird ausgeführt, aber nur im internen Testmodus offengelegt', async () => {
  const orchestrator = new AIOrchestrator(providers);
  const visible = await orchestrator.run({ message: 'Erstelle mir eine Bewerbung.', profile: { firstName: 'Mira', skills: ['Teamarbeit'] } }, { debug: true, internalTestMode: true });
  assert.deepEqual(visible.trace?.executedPath, ['ollama', 'anthropic', 'gemini', 'finalizer']);
  assert.ok(visible.trace?.redactedFields.includes('firstName'));
  assert.equal(visible.answer, 'Natürliche finale Testantwort.');

  const hidden = await orchestrator.run({ message: 'Erstelle mir eine Bewerbung.' }, { debug: true, internalTestMode: false });
  assert.equal(hidden.trace, undefined);
});

test('Begrüßung bleibt vollständig lokal', async () => {
  const orchestrator = new AIOrchestrator(providers);
  const result = await orchestrator.run({ message: 'Hallo' }, { debug: true, internalTestMode: true });
  assert.deepEqual(result.trace?.executedPath, ['ollama']);
});
