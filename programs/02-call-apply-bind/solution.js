// Reference implementation. See README.md for provenance and caveats.
export function myCall(fn, thisArg, ...args) { return Reflect.apply(fn, thisArg, args); }
export function myApply(fn, thisArg, args = []) { return Reflect.apply(fn, thisArg, args); }
export function myBind(fn, thisArg, ...boundArgs) { return function (...args) { return Reflect.apply(fn, thisArg, [...boundArgs, ...args]); }; }
export const solve = myCall;
