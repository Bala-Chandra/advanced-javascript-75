// Reference implementation. See README.md for provenance and caveats.
export function myCall(fn, context, ...args) {
  // null/undefined traditionally fall back to globalThis
  // in this simplified implementation.
  context = context ?? globalThis;

  // A Symbol avoids colliding with an existing property name.
  const key = Symbol("temporaryFunction");

  context[key] = fn;

  // Calling through the object establishes context as `this`.
  const result = context[key](...args);

  delete context[key];

  return result;
}

export function myApply(fn, context, args = []) {
  return myCall(fn, context, ...args);
}

export function myBind(fn, context, ...boundArgs) {
  return function (...laterArgs) {
    return fn.apply(context, [...boundArgs, ...laterArgs]);
  };


}

export const solve = myCall;
