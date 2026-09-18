/**
 * plain error loses the HTTP status code and error message, so API error extends
 * error to contain all the relevant information of the error 
 */

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T | null> {
  const response = await fetch(input, init);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      body && typeof body.error === "string"
        ? body.error
        : `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return (await response.json()) as T;
}