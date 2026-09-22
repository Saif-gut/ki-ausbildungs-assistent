import { BaseProvider, ProviderError } from '../base';
import { ProviderInput, ProviderResponse } from '../../types';

type OllamaTags = { models?: Array<{ name: string; model?: string; size?: number; details?: Record<string, unknown> }> };
type OllamaChatResponse = { message?: { content?: string }; model?: string };

export class OllamaProvider extends BaseProvider {
  readonly name = 'ollama' as const;
  readonly model: string;
  readonly baseUrl: string;

  constructor(config: { baseUrl?: string; model?: string } = {}) {
    super();
    this.baseUrl = (config.baseUrl ?? process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434').replace(/\/$/, '');
    this.model = config.model ?? process.env.OLLAMA_MODEL ?? '';
  }

  isConfigured() { return Boolean(this.baseUrl && this.model); }

  async listModels() {
    const data = await this.requestJson<OllamaTags>(`${this.baseUrl}/api/tags`, { method: 'GET' }, 10_000);
    return data.models ?? [];
  }

  async generate(input: ProviderInput): Promise<ProviderResponse> {
    if (!this.isConfigured()) throw new ProviderError(this.name, 'OLLAMA_MODEL is not configured');
    const data = await this.requestJson<OllamaChatResponse>(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        stream: false,
        think: false,
        messages: [
          { role: 'system', content: input.system },
          { role: 'user', content: input.prompt },
        ],
        ...(input.responseFormat === 'json' ? { format: 'json' } : {}),
        options: { temperature: 0.2, num_predict: input.maxTokens ?? 1200 },
      }),
    });
    const text = data.message?.content?.trim();
    if (!text) throw new ProviderError(this.name, 'Ollama returned no text');
    return { provider: this.name, model: data.model ?? this.model, text };
  }
}
