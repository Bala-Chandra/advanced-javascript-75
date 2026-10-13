// Reference implementation. See README.md for provenance and caveats.
export function pipe(...functions) {
  return function (input) {
    return functions.reduce((value, fn) => fn(value), input);
  };
}
export function compose(...functions) {
  return function (input) {
    return functions.reduceRight((value, fn) => fn(value), input);
  };
}
export const solve = pipe;
