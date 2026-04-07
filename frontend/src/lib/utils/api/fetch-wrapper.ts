import { ApiErrorData, formatApiError } from "@/lib/utils/api/handle-api-error";

export class ApiErrorResponse extends Error {
  /**
   * The HTTP status code returned by the API
   */
  readonly status: number;
  /**
   * The error data returned by the API, structured according to `ApiErrorData`.
   */
  readonly data: ApiErrorData;
  /**
   * If the error is due to a bad request (status code 400-499)
   */
  readonly badRequest: boolean;
  /**
   * If the error is due to rate limiting (status code 429)
   */
  readonly rateLimited: boolean;
  /**
   * If the error is due to a server error (status code 500-599)
   */
  readonly serverError: boolean;
  /**
   * The error data formatted into a string using `formatApiError`, for display in the UI.
   */
  readonly formattedMessage: string;

  constructor(status: number, data: ApiErrorData) {
    super(`API Error: ${status}`);
    this.status = status;
    this.data = data;
    this.badRequest = status >= 400 && status < 500;
    this.rateLimited = status === 429;
    this.serverError = status >= 500;
    this.formattedMessage = formatApiError(data);
  }
}

/**
 * A fetch API wrapper that directly returns JSON data.
 * 
 * If either the status is not in the 200-299 range, an error is thrown with the error
 * data from the response.
 * 
 * If the fetch call itself fails, a 503 error is thrown.
 * 
 * @param url The URL to fetch.
 * @param options The options to pass to the fetch call.
 * @returns The JSON data from the response, if the call was successful.
 */
export async function fetchJson(url: string, options: RequestInit): Promise<object> {
  let response;
  let data;

  try {
    response = await fetch(url, options);
    data = await response.json();
  } catch {
    throw new ApiErrorResponse(503, { error: { general: ["Service unavailable, please try again later."] } });
  }

  if (response.ok) {
    return data;
  } else {
    const errorData: ApiErrorData = data;
    throw new ApiErrorResponse(response.status, errorData);
  }
}
