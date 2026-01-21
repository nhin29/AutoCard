import type { Router } from 'expo-router';

/**
 * Avoids "GO_BACK was not handled" by checking navigation history first.
 *
 * WHY: In expo-router, some screens can be opened as the first route (deep link,
 * refresh, direct route entry). Calling `router.back()` in that case triggers an
 * unhandled GO_BACK warning.
 */
export function safeBack(router: Router, fallbackHref: string = '/(tabs)'): void {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace(fallbackHref as never);
}

