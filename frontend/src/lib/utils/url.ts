/**
 * Validates and sanitizes a potential redirect URL to prevent Open Redirect
 * vulnerabilities.
 *
 * @param url - The raw URL string to validate (e.g., from search params).
 * @param fallback - The default path to return if the URL is invalid.
 *                   Defaults to "/dashboard".
 * @returns A safe, same-origin relative path.
 */
export function getSafeRedirectUrl(
  url: string | null | undefined,
  fallback: string = "/dashboard",
): string {
  if (!url) return fallback;

  // Ensure it's a relative path (starts with '/')
  // AND is not a protocol-relative absolute URL (starts with '//')
  if (url.startsWith("/") && !url.startsWith("//")) {
    return url;
  }

  return fallback;
}
