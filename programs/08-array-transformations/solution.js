// Reference implementation. See README.md for provenance and caveats.
export function myMap(array, callback, thisArg) {
  const result = new Array(array.length);
  for (let i = 0; i < array.length; i++) {
    if (!(i in array)) continue;
    result[i] = callback.call(thisArg, array[i], i, array);
  }
  return result;
}
export const solve = myMap;
