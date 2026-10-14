// Reference implementation. See README.md for provenance and caveats.
export  function curry(fn) {
  function curried(...args) {
    // fn.length reports the number of declared parameters
    // before the first default/rest parameter.
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }

    return function (...nextArgs) {
      return curried.apply(this, [...args, ...nextArgs]);
    };
  }

  return curried;
}

const add = (a, b, c) => a + b + c;

const curriedAdd = curry(add);

curriedAdd(1)(2)(3); // 6
curriedAdd(1, 2)(3); // 6
curriedAdd(1)(2, 3); // 6



export const solve = curry;
