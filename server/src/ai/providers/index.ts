import { AnthropicProvider } from './anthropic';
import { GeminiProvider } from './gemini';
import { OllamaProvider } from './ollama';
export function createProviderRegistry() {
  return {
    ollama: new OllamaProvider(),
    anthropic: new AnthropicProvider(),
    gemini: new GeminiProvider(),
  };
}

export { AnthropicProvider, GeminiProvider, OllamaProvider };
