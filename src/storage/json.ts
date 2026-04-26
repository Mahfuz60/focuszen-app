export function safeParseJson<T>(value: string | null, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function safeStringifyJson(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return JSON.stringify(null);
  }
}
