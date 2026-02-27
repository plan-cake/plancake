import { InferReq, InferRes } from "@/lib/utils/api/endpoints";
import { fetchJson } from "@/lib/utils/api/fetch-wrapper";

/**
 * Performs a GET request to the specified API endpoint from the client.
 * @param endpoint The endpoint to send the request to from the `ROUTES` object.
 * @param params An object with key-value pairs to be converted into query parameters.
 * @param options Optional fetch options to override defaults.
 * @returns The JSON response from the API, typed according to the `ROUTES` interface.
 */
export async function clientGet<T extends { url: string }>(
  endpoint: T,
  params?: InferReq<T>,
  options?: RequestInit
): Promise<InferRes<T>> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  let queryString = "";
  if (params && Object.keys(params).length > 0) {
    queryString = `?${new URLSearchParams(params).toString()}`;
  }

  const url = `${baseUrl}${endpoint.url}${queryString}`;

  const requestOptions: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    ...options,
  };

  return (await fetchJson(url, requestOptions) as InferRes<T>);
}

/**
 * Performs a POST request to the specified API endpoint from the client.
 * @param endpoint The endpoint to send the request to from the `ROUTES` object.
 * @param body An object representing the JSON body to be sent with the request.
 * @param options Optional fetch options to override defaults.
 * @returns The JSON response from the API, typed according to the `ROUTES` interface.
 */
export async function clientPost<T extends { url: string }>(
  endpoint: T,
  body?: InferReq<T>,
  options?: RequestInit
): Promise<InferRes<T>> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const url = `${baseUrl}${endpoint.url}`;

  const requestOptions: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
    ...options,
  };

  return (await fetchJson(url, requestOptions) as InferRes<T>);
}
