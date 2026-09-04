import type { AxiosRequestConfig, AxiosResponse } from "axios";
import axios from "axios";

export interface HttpClientOptions {
  baseURL: string;
  timeout?: number;
  /**
   * Read at call time, once per request — never captured at construction. That
   * keeps this package below the app's store layer: it asks for a token when it
   * needs one instead of importing where tokens live.
   */
  getAuthToken?: () => string | null;
  /**
   * Fires on 401, after the failure has been normalized to an `HttpError`. The
   * client reports; the app decides what to do (sign out, clear caches). Keeping
   * the reaction out here is what lets this package stay free of any store or
   * router import.
   */
  onUnauthorized?: (error: HttpError) => void;
}

export interface HttpErrorContext {
  statusCode: number;
  message: string;
  response?: AxiosResponse;
}

export class HttpError extends Error {
  readonly statusCode: number;
  readonly response?: AxiosResponse;

  constructor(context: HttpErrorContext) {
    super(context.message);
    this.name = "HttpError";
    this.statusCode = context.statusCode;
    this.response = context.response;
  }

  /** True for 4xx client errors. */
  isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  /** True for 5xx server errors. */
  isServerError(): boolean {
    return this.statusCode >= 500;
  }

  /** Convenience: 401 Unauthorized. */
  isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  /** Convenience: 403 Forbidden. */
  isForbidden(): boolean {
    return this.statusCode === 403;
  }
}

/**
 * Deliberately does NOT expose the underlying axios instance. A caller holding
 * it could register its own interceptors or issue raw requests, bypassing the
 * `HttpError` normalization below — and then "what can fail, and how" would no
 * longer be answerable from this interface alone. Anything that needs to touch
 * an outgoing request enters through `HttpClientOptions` instead.
 */
export interface HttpClient {
  get<T>(path: string, config?: AxiosRequestConfig): Promise<T>;
  post<T>(
    path: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T>;
  put<T>(path: string, body?: unknown, config?: AxiosRequestConfig): Promise<T>;
  patch<T>(
    path: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T>;
  delete<T>(path: string, config?: AxiosRequestConfig): Promise<T>;
}

export function createHttpClient(options: HttpClientOptions): HttpClient {
  const instance = axios.create({
    baseURL: options.baseURL,
    timeout: options.timeout ?? 10_000,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  // The request interceptor exists only when the caller supplied a token reader,
  // so an unauthenticated app sends exactly the headers it did before.
  if (options.getAuthToken) {
    const getAuthToken = options.getAuthToken;

    instance.interceptors.request.use((config) => {
      const token = getAuthToken();

      if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
      }

      return config;
    });
  }

  // Only the failure path is intercepted: every rejection leaves this client as
  // an HttpError, so callers match on one type.
  instance.interceptors.response.use(undefined, (error: unknown) => {
    if (axios.isAxiosError(error)) {
      // A network failure or timeout has no response, hence statusCode 0.
      const status = error.response?.status ?? 0;
      const message: string =
        (error.response?.data as { message?: string } | undefined)?.message ??
        error.message;

      const httpError = new HttpError({
        statusCode: status,
        message,
        response: error.response,
      });

      // Notify, then rethrow: the caller's own error handling still runs. The
      // callback is for app-level reaction (sign out, clear caches), not for
      // swallowing the failure.
      if (httpError.isUnauthorized()) {
        options.onUnauthorized?.(httpError);
      }

      throw httpError;
    }

    throw error;
  });

  async function request<T>(config: AxiosRequestConfig): Promise<T> {
    const response = await instance.request<T>(config);
    return response.data;
  }

  return {
    get<T>(path: string, config?: AxiosRequestConfig) {
      return request<T>({ ...config, method: "GET", url: path });
    },

    post<T>(path: string, body?: unknown, config?: AxiosRequestConfig) {
      return request<T>({ ...config, method: "POST", url: path, data: body });
    },

    put<T>(path: string, body?: unknown, config?: AxiosRequestConfig) {
      return request<T>({ ...config, method: "PUT", url: path, data: body });
    },

    patch<T>(path: string, body?: unknown, config?: AxiosRequestConfig) {
      return request<T>({ ...config, method: "PATCH", url: path, data: body });
    },

    delete<T>(path: string, config?: AxiosRequestConfig) {
      return request<T>({ ...config, method: "DELETE", url: path });
    },
  };
}
