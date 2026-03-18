export function serializeData<T>(value: T): T {
  return transformValue(value) as T;
}

function transformValue(value: unknown): unknown {
  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => transformValue(item));
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, transformValue(nestedValue)]),
    );
  }

  return value;
}
