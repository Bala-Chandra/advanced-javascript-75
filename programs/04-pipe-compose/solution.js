// Reference implementation. See README.md for provenance and caveats.
export function pipe(...functions) {
  return function (input) {
    return functions.reduce(
      (value, fn) => fn(value),
      input
    );
  };
}

export function compose(...functions) {
  return function (input) {
    return functions.reduceRight(
      (value, fn) => fn(value),
      input
    );
  };
}

const double = x => x * 2;
const increment = x => x + 1;

pipe(double, increment)(5);    // 11
compose(double, increment)(5); // 12


export const solve = pipe;
