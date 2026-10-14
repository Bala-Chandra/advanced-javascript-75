// YOUR WORKSPACE: implement this without looking at solution.js.
// Keep your implementation independent of the reference.
export function curry(fn) {
  
  function curried(...args) {
    if(args.length >= fn.length) {
      return fn.apply(this, args);
    }

    return function(...nextArgs){
      return curried.apply(this, [...args, ...nextArgs]);
    };
  }
  
  
   return curried;
}

add = (a, b, c) => a + b + c;

const curriedAdd = curry(add);

curriedAdd(1)(2)(3); // 6
curriedAdd(1, 2)(3); // 6
curriedAdd(1)(2, 3); // 6

export const solve = curry
