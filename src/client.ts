/**
 * Reusable HTTP client — thin wrapper around fetch with:
 *   - Base URL configuration
 *   - Auth header injection (Bearer token)
 *   - API key support (x-api-key header, required by ReqRes as of 2026)
 *   - Consistent error shape
 *   - Response time capture (for perf assertions)
 */

const BASE_URL = "https://reqres.in/api";

export interface ApiResponse<T = unknown> {
  status: number;
  data: T;
  headers: Record<string, string>;
  durationMs: number;
}

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private apiKey: string | null;

  constructor(baseUrl: string = BASE_URL, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey ?? process.env.REQRES_API_KEY ?? null;
  }

  /** Set auth token for subsequent requests */
  setToken(token: string): void {
    this.token = token;
  }

  /** Clear auth state */
  clearToken(): void {
    this.token = null;
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.token) h["Authorization"] = `Bearer ${this.token}`;
    if (this.apiKey) h["x-api-key"] = this.apiKey;
    return h;
  }

  async get<T = unknown>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>("GET", path);
  }

  async post<T = unknown>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>("POST", path, body);
  }

  async put<T = unknown>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>("PUT", path, body);
  }

  async delete<T = unknown>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>("DELETE", path);
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<ApiResponse<T>> {
    const start = Date.now();
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: this.headers(),
      body: body ? JSON.stringify(body) : undefined,
    });
    const durationMs = Date.now() - start;

    const data = (await res.json().catch(() => null)) as T;

    // Convert Headers to plain object
    const responseHeaders: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return { status: res.status, data, headers: responseHeaders, durationMs };
  }
}
