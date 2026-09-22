import { BaseProvider, ProviderError } from '../base';
import { ProviderInput, ProviderResponse } from '../../types';

type AnthropicResponse = { content?: Array<{ type: string; text?: string }>; model?: string };

export class AnthropicProvider extends BaseProvider {
  readonly name = 'anthropic' as const;
  readonly model: string;
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(config: { apiKey?: string; model?: string; baseUrl?: string } = {}) {
    super();
    this.apiKey = config.apiKey ?? process.env.ANTHROPIC_API_KEY ?? '';
    this.model = config.model ?? process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-5';
    this.baseUrl = (config.baseUrl ?? 'https://api.anthropic.com').replace(/\/$/, '');
  }

  isConfigured() { return Boolean(this.apiKey && this.model); }

  async generate(input: ProviderInput): Promise<ProviderResponse> {
    if (!this.isConfigured()) throw new ProviderError(this.name, 'Anthropic provider is not configured');
    const data = await this.requestJson<AnthropicResponse>(`${this.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: input.maxTokens ?? 1600,
        system: input.system,
        messages: [{ role: 'user', content: input.prompt }],
      }),
    });
    const text = data.content?.filter((block) => block.type === 'text').map((block) => block.text ?? '').join('\n').trim();
    if (!text) throw new ProviderError(this.name, 'Anthropic returned no text');
    return { provider: this.name, model: data.model ?? this.model, text };
  }
}

