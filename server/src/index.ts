import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { AIOrchestrator } from './ai/orchestrator';
import { createProviderRegistry } from './ai/providers';
import { AIRequest } from './ai/types';
import { readServerConfig } from './config';
import { safeLog } from './logger';

const config = readServerConfig();
const providers = createProviderRegistry();
const orchestrator = new AIOrchestrator(providers);

function applyCors(request: IncomingMessage, response: ServerResponse) {
  const origin = request.headers.origin;
  if (origin && config.allowedOrigins.includes(origin)) {
    response.setHeader('access-control-allow-origin', origin);
    response.setHeader('vary', 'origin');
  }
  response.setHeader('access-control-allow-methods', 'GET,POST,OPTIONS');
  response.setHeader('access-control-allow-headers', 'content-type');
}

function sendJson(response: ServerResponse, status: number, body: unknown) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  response.end(JSON.stringify(body));
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.from(chunk);
    size += buffer.length;
    if (size > 1_000_000) throw new Error('PAYLOAD_TOO_LARGE');
    chunks.push(buffer);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
}

function isAIRequest(value: unknown): value is AIRequest {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.message === 'string' && candidate.message.trim().length > 0 && candidate.message.length <= 12_000;
}

const server = createServer(async (request, response) => {
  applyCors(request, response);
  if (request.method === 'OPTIONS') return response.writeHead(204).end();

  if (request.method === 'GET' && request.url === '/health') {
    return sendJson(response, 200, {
      status: 'ok',
      providers: Object.fromEntries(Object.entries(providers).map(([name, provider]) => [name, { configured: provider.isConfigured(), model: provider.model || null }])),
      internalTestMode: config.internalTestMode,
    });
  }

  if (request.method === 'GET' && request.url === '/v1/ai/ollama/models') {
    try {
      const models = await providers.ollama.listModels();
      return sendJson(response, 200, { models: models.map((model) => ({ name: model.name, size: model.size, details: model.details })) });
    } catch {
      return sendJson(response, 503, { error: 'Ollama ist nicht erreichbar.' });
    }
  }

  if (request.method === 'POST' && request.url === '/v1/ai/respond') {
    const started = Date.now();
    try {
      const body = await readJson(request);
      if (!isAIRequest(body)) return sendJson(response, 400, { error: 'Ungültige Anfrage.' });
      const debugRequested = config.internalTestMode && request.headers['x-ai-debug'] === '1';
      const result = await orchestrator.run(body, { debug: debugRequested, internalTestMode: config.internalTestMode });
      safeLog('ai_request_completed', { durationMs: Date.now() - started, task: result.trace?.task, path: result.trace?.executedPath });
      return sendJson(response, 200, result);
    } catch (error) {
      safeLog('ai_request_failed', { durationMs: Date.now() - started, errorType: error instanceof Error ? error.name : 'UnknownError' });
      return sendJson(response, 503, { error: 'Die Antwort konnte gerade nicht erstellt werden.' });
    }
  }

  return sendJson(response, 404, { error: 'Nicht gefunden.' });
});

server.listen(config.port, config.host, () => {
  safeLog('ai_server_started', {
    host: config.host,
    port: config.port,
    ollamaModel: providers.ollama.model || 'not-configured',
    anthropicConfigured: providers.anthropic.isConfigured(),
    geminiConfigured: providers.gemini.isConfigured(),
    internalTestMode: config.internalTestMode,
  });
});

