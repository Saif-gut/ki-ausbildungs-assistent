export type ServerConfig = ReturnType<typeof readServerConfig>;

export function readServerConfig() {
  return {
    host: process.env.AI_SERVER_HOST ?? '127.0.0.1',
    port: Number(process.env.AI_SERVER_PORT ?? 8787),
    internalTestMode: process.env.AI_INTERNAL_TEST_MODE === 'true',
    allowedOrigins: (process.env.AI_ALLOWED_ORIGINS ?? 'http://localhost:8081,http://localhost:8085')
      .split(',').map((origin) => origin.trim()).filter(Boolean),
  };
}

