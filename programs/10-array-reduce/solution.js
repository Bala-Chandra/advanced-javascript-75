export function deepClone(value, seen = new WeakMap()) {
  if (typeof value !== "object" || value === null) {
    return value;
  }

  if (seen.has(value)) {
    return seen.get(value);
  }

  const clone = Array.isArray(value)
    ? []
    : Object.create(Object.getPrototypeOf(value));

  // Register BEFORE recursively cloning children.
  seen.set(value, clone);

  for (const key of Reflect.ownKeys(value)) {
    const descriptor =
      Object.getOwnPropertyDescriptor(value, key);

    if ("value" in descriptor) {
      descriptor.value = deepClone(descriptor.value, seen);
    }

    Object.defineProperty(clone, key, descriptor);
  }

  return clone;
}
export const solve = deepClone;