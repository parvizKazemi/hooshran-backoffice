const RETURN_PATH_KEY = "hooshran.admin.return-path";
const BLOCKED_PATHS = new Set(["/login", "/otp"]);

function sanitizeReturnPath(path: string | null): string | null {
  if (!path) return null;
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\"))
    return null;
  if (path.length > 300) return null;
  const pathname = path.split("?")[0] ?? "";
  if (!pathname || BLOCKED_PATHS.has(pathname)) return null;
  return path;
}

export function rememberReturnPath(path: string): void {
  const safe = sanitizeReturnPath(path);
  if (!safe) return;
  try {
    sessionStorage.setItem(RETURN_PATH_KEY, safe);
  } catch {
    /* private mode */
  }
}

export function readReturnPath(): string {
  try {
    return sanitizeReturnPath(sessionStorage.getItem(RETURN_PATH_KEY)) ?? "/";
  } catch {
    return "/";
  }
}

export function clearReturnPath(): void {
  try {
    sessionStorage.removeItem(RETURN_PATH_KEY);
  } catch {
    /* private mode */
  }
}
