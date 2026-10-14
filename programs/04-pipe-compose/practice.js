// YOUR WORKSPACE: implement this without looking at solution.js.
// Keep your implementation independent of the reference.
export function pipe(...functions){
  return function(input) {
    return functions.reduce((value, fn) => fn(value), input);
    // return functions.reduce((accumulator, currentValue = current function) => fn(value), input); --- IGNORE ---
  }
}

export function compose(...functions){
  return function(input){
    return functions.reduceRight((value, fn) => fn(value), input);
  }
}
export const solve = pipe
