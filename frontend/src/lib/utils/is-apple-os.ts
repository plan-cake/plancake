const applePlatformRegex = /Mac|iPod|iPhone|iPad/i;

export function isAppleOs(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  if (navigator.platform) {
    return applePlatformRegex.test(navigator.platform);
  }

  return applePlatformRegex.test(navigator.userAgent);
}
