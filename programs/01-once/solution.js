// Reference implementation. See README.md for provenance and caveats.
function once(fn) {
  let called = false;
  let result;
  return function (...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}
export { once };
export const solve = once;
