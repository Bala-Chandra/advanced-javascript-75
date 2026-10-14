// Reference implementation. See README.md for provenance and caveats.
export function memoize(fn) {
  const cache = new Map();

  return function (key) {
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn.call(this, key);
    cache.set(key, result);

    return result;
  };
}
export const solve = memoize;
