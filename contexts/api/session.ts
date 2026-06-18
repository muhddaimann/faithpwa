// Session bridge: lets the API layer (a plain module, no React) signal an
// expired/invalid session up to the AuthProvider so the user gets kicked out.

type SessionExpiredHandler = () => void;

let handler: SessionExpiredHandler | null = null;
let triggered = false;

// AuthProvider registers what should happen when the session dies.
export const setSessionExpiredHandler = (fn: SessionExpiredHandler | null) => {
  handler = fn;
};

// Called by the API interceptor on a 401. De-duped so a burst of failed
// requests only kicks the user out once.
export const notifySessionExpired = () => {
  if (triggered) return;
  triggered = true;
  handler?.();
};

// Re-arm the guard after a fresh sign-in so it can fire again next time.
export const resetSessionExpired = () => {
  triggered = false;
};

// Pre-empt the guard during an intentional logout so its own revoke-call 401
// doesn't re-fire the kick-out path. Re-armed by resetSessionExpired() on login.
export const markSessionExpiredHandled = () => {
  triggered = true;
};
