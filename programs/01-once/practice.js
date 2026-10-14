// YOUR WORKSPACE: implement this without looking at solution.js.
// Keep your implementation independent of the reference.
export function once(fn) {
  // These variables belong to once()'s lexical environment.
  // The returned function closes over them after once() finishes.
  let called = false;
  let result;

  return function (...args) {
    if (!called) {
      // apply() preserves the caller's `this`.
      result = fn.apply(this, args);
      called = true;
    }

    return result;
  };
}
