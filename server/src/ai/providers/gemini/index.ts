import { BaseProvider, ProviderError } from '../base';
import { ProviderInput, ProviderResponse } from '../../types';

type GeminiResponse = { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; modelVersion?: string };

export class GeminiProvider extends BaseProvider {
  readonly name = 'gemini' as const;
  readonly model: string;
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(config: { apiKey?: string; model?: string; baseUrl?: string } = {}) {
    super();
    this.apiKey = config.apiKey ?? process.env.GOOGLE_GEMINI_API_KEY ?? '';
    this.model = config.model ?? process.env.GEMINI_MODEL ?? 'gemini-3.8-flash';
    this.baseUrl = (config.baseUrl ?? 'https://generativelanguage.googleapis.com').replace(/\/$/, '');
  }

  isConfigured() { return Boolean(this.apiKey && this.model); }

  async generate(input: ProviderInput): Promise<ProviderResponse> {
    if (!this.isConfigured()) throw new ProviderError(this.name, 'Gemini provider is not configured');
    const data = await this.requestJson<GeminiResponse>(`${this.baseUrl}/v1beta/models/${encodeURIComponent(this.model)}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': this.apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: input.system }] },
        contents: [{ role: 'user', parts: [{ text: input.prompt }] }],
        generationConfig: {
          maxOutputTokens: input.maxTokens ?? 1200,
          ...(input.responseFormat === 'json' ? { responseMimeType: 'application/json' } : {}),
        },
        store: false,
      }),
    });
    const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('\n').trim();
    if (!text) throw new ProviderError(this.name, 'Gemini returned no text');
    return { provider: this.name, model: data.modelVersion ?? this.model, text };
  }
}

