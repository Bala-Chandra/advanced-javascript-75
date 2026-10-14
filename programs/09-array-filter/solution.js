export function deepEqual(a, b, seen = new WeakMap()) {
  if (Object.is(a, b)) return true;

  if (
    typeof a !== "object" ||
    typeof b !== "object" ||
    a === null ||
    b === null
  ) {
    return false;
  }

  // Detect already-compared object pairs.
  if (seen.get(a) === b) return true;
  seen.set(a, b);

  const keysA = Reflect.ownKeys(a);
  const keysB = Reflect.ownKeys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) {
      return false;
    }

    if (!deepEqual(a[key], b[key], seen)) {
      return false;
    }
  }

  return true;
}
export const solve = deepEqual;
