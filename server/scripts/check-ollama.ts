import { OllamaProvider } from '../src/ai/providers/ollama';

async function main() {
  const provider = new OllamaProvider();
  try {
    const models = await provider.listModels();
    console.log(JSON.stringify({
      baseUrl: provider.baseUrl,
      configuredModel: provider.model || null,
      models: models.map((model) => ({ name: model.name, size: model.size, details: model.details })),
    }, null, 2));
    if (!models.length) process.exitCode = 2;
  } catch {
    console.error('Ollama ist unter der konfigurierten URL nicht erreichbar.');
    process.exitCode = 1;
  }
}

void main();
