export type VisibilityLevel = 'public' | 'private' | 'internal';

export interface MemactClientConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export interface SDKPayload {
  id: string;
  data: Record<string, any>;
  timestamp: number;
}

export interface SDKResponse<T = any> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

export class MemactClient {
  constructor(config: MemactClientConfig);
  public getVisibility(): VisibilityLevel;
  public setVisibility(level: VisibilityLevel): void;
  public sendPayload(payload: SDKPayload): Promise<SDKResponse>;
  public fetchParams(key: string): Promise<SDKResponse<Record<string, any>>>;
}