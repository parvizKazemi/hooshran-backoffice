/**
 * API Client - Standardized fetch wrapper for all API requests
 *
 * This module provides a centralized API client with:
 * - Base URL configuration
 * - Standard headers
 * - Automatic error handling
 * - Token management
 * - Request/Response interceptors
 *
 * Environment configuration:
 * - Reads base URL from VITE_API_BASE_URL defined in .env / .env.example
 */

// Base API URL - can be overridden via environment variables
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Standard headers for all requests
const getDefaultHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // In development: add authorization token from localStorage
  // In production: rely on cookies set by server (credentials: "include" handles this)
  // if (isDevelopment) {
  //   const authData = localStorage.getItem("authData");
  //   if (authData) {
  //     try {
  //       const parsed = JSON.parse(authData);
  //       if (parsed?.token?.accessToken) {
  //         headers.Authorization = `Bearer ${parsed.token.accessToken}`;
  //       }
  //     } catch {
  //       // Ignore parse errors
  //     }
  //   }
  // }

  return headers;
};

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    public override message: string,
    public statusCode?: number,
    public error?: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Standard error response structure
interface ErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
  [key: string]: unknown;
}

// New backend response pattern: { code, message, data }
interface ApiEnvelope<D = unknown> {
  code: string;
  message: string;
  data: D;
}

// Type guard to check envelope structure
function isApiEnvelope(obj: unknown): obj is ApiEnvelope {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "code" in obj &&
    "data" in obj &&
    typeof obj.code === "string"
  );
}

// Utility function to process JSON response with envelope
function processApiResponse<T>(json: unknown): T {
  // If response is envelope, return only data
  if (isApiEnvelope(json)) {
    return (json.data ?? json) as T;
  }

  // Otherwise return raw json (previous behavior)
  return json as T;
}

/**
 * Convert error value to string safely
 */
const errorToString = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        if (typeof item === "object" && item !== null) {
          // Handle validation error objects like {target, value, property, constraints}
          if (
            "constraints" in item &&
            typeof item.constraints === "object" &&
            item.constraints !== null
          ) {
            return Object.values(item.constraints).join(", ");
          }
          if ("message" in item && typeof item.message === "string") {
            return item.message;
          }
          return JSON.stringify(item);
        }
        return String(item);
      })
      .join(", ");
  }
  if (typeof value === "object" && value !== null) {
    // Handle validation error objects
    if (
      "constraints" in value &&
      typeof value.constraints === "object" &&
      value.constraints !== null
    ) {
      return Object.values(value.constraints).join(", ");
    }
    if ("message" in value && typeof value.message === "string") {
      return value.message;
    }
    // For other objects, stringify but limit length
    const str = JSON.stringify(value);
    return str.length > 200 ? str.substring(0, 200) + "..." : str;
  }
  return String(value);
};

/**
 * Handle error response and extract error message
 * This is where all error handling logic is centralized
 */
const handleError = async (response: Response): Promise<never> => {
  let errorData: ErrorResponse = {
    message: "خطا در ارسال درخواست",
    error: "Unknown Error",
    statusCode: response.status,
  };

  try {
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      errorData = await response.json();
    } else {
      const text = await response.text();
      if (text) {
        errorData.message = text;
      }
    }
  } catch {
    // If we can't parse the error, use default
  }

  // Extract error message with priority: message > error > statusCode
  // Convert to string safely to handle objects and arrays
  const errorMessage =
    errorToString(errorData.message) ||
    errorToString(errorData.error) ||
    `خطا: ${errorData.statusCode || response.status}`;

  throw new ApiError(
    errorMessage,
    errorData.statusCode || response.status,
    typeof errorData.error === "string" ? errorData.error : undefined,
    errorData
  );
};

/**
 * Make a fetch request with standardized configuration
 */
const makeRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    // Always include credentials for cookie-based auth in production
    // In development, this also works but we use token headers
    credentials: "include",
    headers: {
      ...getDefaultHeaders(),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Handle non-OK responses (error handling is centralized here)
    if (!response.ok) {
      await handleError(response);
    }

    // Handle empty responses
    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      // For responses that return plain text (like "true")
      const text = await response.text();
      if (text === "true" || text === "false") {
        return (text === "true") as T;
      }
      if (!text) {
        return {} as T;
      }
      // Try to parse as JSON anyway
      try {
        return JSON.parse(text) as T;
      } catch {
        return text as T;
      }
    }

    const json = await response.json();
    return processApiResponse<T>(json);
  } catch (error) {
    // Handle network errors and other exceptions
    if (error instanceof ApiError) {
      throw error;
    }

    // Network errors or other fetch errors
    throw new ApiError(
      error instanceof Error ? error.message : "خطا در اتصال به سرور",
      undefined,
      "NetworkError",
      error
    );
  }
};

/**
 * GET request
 */
export const apiGet = <T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  return makeRequest<T>(endpoint, {
    ...options,
    method: "GET",
  });
};

/**
 * POST request
 */
export const apiPost = <T>(
  endpoint: string,
  data?: unknown,
  options?: RequestInit
): Promise<T> => {
  return makeRequest<T>(endpoint, {
    ...options,
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });
};

/**
 * PUT request
 */
export const apiPut = <T>(
  endpoint: string,
  data?: unknown,
  options?: RequestInit
): Promise<T> => {
  return makeRequest<T>(endpoint, {
    ...options,
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  });
};

/**
 * PATCH request
 */
export const apiPatch = <T>(
  endpoint: string,
  data?: unknown,
  options?: RequestInit
): Promise<T> => {
  return makeRequest<T>(endpoint, {
    ...options,
    method: "PATCH",
    body: data ? JSON.stringify(data) : undefined,
  });
};

/**
 * DELETE request
 */
export const apiDelete = <T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  return makeRequest<T>(endpoint, {
    ...options,
    method: "DELETE",
  });
};

/**
 * Export the API client instance for advanced usage
 */
export const apiClient = {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  delete: apiDelete,
};
