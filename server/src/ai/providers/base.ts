import { AIProvider, ProviderInput, ProviderName, ProviderResponse } from '../types';

export class ProviderError extends Error {
  constructor(public readonly provider: ProviderName, message: string, public readonly status?: number) {
    super(message);
    this.name = 'ProviderError';
  }
}

export abstract class BaseProvider implements AIProvider {
  abstract readonly name: ProviderName;
  abstract readonly model: string;
  abstract isConfigured(): boolean;
  abstract generate(input: ProviderInput): Promise<ProviderResponse>;

  protected async requestJson<T>(url: string, init: RequestInit, timeoutMs = 60_000): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { ...init, signal: controller.signal });
      if (!response.ok) {
        // Do not include response bodies: providers can echo sensitive prompt data.
        throw new ProviderError(this.name, `${this.name} request failed`, response.status);
      }
      return await response.json() as T;
    } catch (error) {
      if (error instanceof ProviderError) throw error;
      throw new ProviderError(this.name, `${this.name} is unavailable`);
    } finally {
      clearTimeout(timer);
    }
  }
}

