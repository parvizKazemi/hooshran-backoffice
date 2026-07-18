/**
 * Client-side env helpers. Vite only exposes vars prefixed with VITE_.
 * Mirrors backend TEST_MODE for UI gating; backend remains the source of truth.
 */
export const isTestMode =
  import.meta.env.VITE_TEST_MODE === "true" ||
  import.meta.env.VITE_TEST_MODE === "1";
