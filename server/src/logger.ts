/** Only operational metadata belongs here. Never pass prompts, profiles or provider bodies. */
export function safeLog(event: string, metadata: Record<string, string | number | boolean | string[] | undefined>) {
  const safeMetadata = Object.fromEntries(Object.entries(metadata).filter(([, value]) => value !== undefined));
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), event, ...safeMetadata }));
}

