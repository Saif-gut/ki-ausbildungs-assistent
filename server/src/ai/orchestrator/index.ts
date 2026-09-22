import { finalizeAnswer, cleanFinalText } from '../finalizer';
import { minimizeRequest } from '../privacy/minimize';
import { analystPrompt, draftingPrompt, reviewPrompt, systems } from '../prompts';
import { routeRequest } from '../router';
import { AIRequest, AIResponse, PipelineStage, ProviderName, ProviderRegistry } from '../types';

type OrchestratorOptions = { debug?: boolean; internalTestMode?: boolean };

export class AIOrchestrator {
  constructor(private readonly providers: ProviderRegistry) {}

  async run(originalRequest: AIRequest, options: OrchestratorOptions = {}): Promise<AIResponse> {
    const decision = routeRequest(originalRequest);
    const privacy = minimizeRequest(originalRequest, decision.task);
    const request = privacy.request;
    const executedPath: PipelineStage[] = [];
    const skippedProviders: ProviderName[] = [];
    let analysis = '';
    let draft = '';
    let critique = '';

    const available = (name: ProviderName) => this.providers[name].isConfigured();
    for (const stage of decision.intendedPath) {
      if (stage !== 'finalizer' && !available(stage)) skippedProviders.push(stage);
    }

    if (decision.intendedPath.includes('ollama') && available('ollama')) {
      const direct = decision.complexity === 'simple';
      const result = await this.providers.ollama.generate({
        system: direct ? systems.writer : systems.analyst,
        prompt: direct ? request.message : analystPrompt(request, decision.task),
        responseFormat: direct ? 'text' : 'json',
        maxTokens: direct ? 250 : 900,
      });
      executedPath.push('ollama');
      if (direct) draft = result.text;
      else analysis = result.text;
    }

    if (decision.intendedPath.includes('anthropic') && available('anthropic')) {
      const result = await this.providers.anthropic.generate({
        system: systems.writer,
        prompt: draftingPrompt(request, decision.task, analysis),
        maxTokens: decision.task === 'application' || decision.task === 'cv' ? 2200 : 1500,
      });
      executedPath.push('anthropic');
      draft = result.text;
    }

    // With no external key, Ollama becomes the safe local fallback for drafting.
    if (!draft && available('ollama')) {
      const result = await this.providers.ollama.generate({
        system: systems.writer,
        prompt: draftingPrompt(request, decision.task, analysis),
        maxTokens: 1600,
      });
      if (!executedPath.includes('ollama')) executedPath.push('ollama');
      draft = result.text;
    }

    if (decision.intendedPath.includes('gemini') && available('gemini') && draft) {
      const result = await this.providers.gemini.generate({
        system: systems.reviewer,
        prompt: reviewPrompt(request, decision.task, draft),
        responseFormat: 'json',
        maxTokens: 1000,
      });
      executedPath.push('gemini');
      critique = result.text;
    }

    if (!draft) {
      draft = 'Der AI-Orchestrator ist erreichbar, aber aktuell ist kein Textmodell konfiguriert. Bitte OLLAMA_MODEL setzen oder einen externen Provider serverseitig konfigurieren.';
    }

    if (decision.intendedPath.includes('finalizer')) {
      const finalProvider = available('anthropic') ? this.providers.anthropic : available('ollama') ? this.providers.ollama : null;
      if (finalProvider && critique) {
        try {
          draft = await finalizeAnswer(finalProvider, draft, critique);
          executedPath.push('finalizer');
        } catch {
          // A provider outage must not expose critique or partial internal output.
          draft = cleanFinalText(draft);
        }
      } else {
        draft = cleanFinalText(draft);
        executedPath.push('finalizer');
      }
    }

    const allowTrace = Boolean(options.debug && options.internalTestMode);
    return {
      answer: cleanFinalText(draft),
      ...(allowTrace ? { trace: {
        task: decision.task,
        complexity: decision.complexity,
        sensitivity: decision.sensitivity,
        intendedPath: decision.intendedPath,
        executedPath,
        skippedProviders: [...new Set(skippedProviders)],
        redactedFields: privacy.redactedFields,
      } } : {}),
    };
  }
}
