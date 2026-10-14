// YOUR WORKSPACE: implement this without looking at solution.js.
// Keep your implementation independent of the reference.
export function myCall(fn, thisArg, ...args) {

  const context = thisArg ?? globalThis;

  const key = Symbol("temporaryFunction");

  context[key] = fn;

  const result = context[key](...args);


  delete context[key];

  return result;
}

export function myApply(fn, thisArg, args = []) {
  return myCall(fn, thisArg, ...args);
}

export function myBind(fn, thisArg, ...boundArgs) {
  return function(...args) {
    return myApply(fn, thisArg, [...boundArgs, ...args]);
  };
}

export const solve = myCall
