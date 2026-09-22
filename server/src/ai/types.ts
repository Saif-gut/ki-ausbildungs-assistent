export type ProviderName = 'ollama' | 'anthropic' | 'gemini';
export type TaskType = 'greeting' | 'career_info' | 'job_question' | 'profile_match' | 'application' | 'cv' | 'interview' | 'unknown';
export type Complexity = 'simple' | 'normal' | 'complex';
export type Sensitivity = 'low' | 'personal' | 'sensitive';
export type PipelineStage = ProviderName | 'finalizer';

export type ProfilePayload = Record<string, unknown>;

export type JobPayload = {
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  tasks?: string[];
  requirements?: unknown[];
  salary?: string;
  future?: string;
  [key: string]: unknown;
};

export type AIRequest = {
  message: string;
  profile?: ProfilePayload;
  job?: JobPayload;
  conversation?: Array<{ role: 'user' | 'assistant'; content: string }>;
};

export type RouteDecision = {
  task: TaskType;
  complexity: Complexity;
  sensitivity: Sensitivity;
  intendedPath: PipelineStage[];
  reason: string;
};

export type ProviderInput = {
  system: string;
  prompt: string;
  maxTokens?: number;
  responseFormat?: 'text' | 'json';
};

export type ProviderResponse = {
  provider: ProviderName;
  model: string;
  text: string;
};

export interface AIProvider {
  readonly name: ProviderName;
  readonly model: string;
  isConfigured(): boolean;
  generate(input: ProviderInput): Promise<ProviderResponse>;
}

export type ProviderRegistry = Record<ProviderName, AIProvider>;

export type PrivacyResult = {
  request: AIRequest;
  redactedFields: string[];
};

export type InternalTrace = {
  task: TaskType;
  complexity: Complexity;
  sensitivity: Sensitivity;
  intendedPath: PipelineStage[];
  executedPath: PipelineStage[];
  skippedProviders: ProviderName[];
  redactedFields: string[];
};

export type AIResponse = {
  answer: string;
  trace?: InternalTrace;
};

