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


// Below are the implementations of filter, reduce, some, and every, following the same structure as your original myMap().
// All four skip missing indexes in sparse arrays, as the native methods do.
// 1. myFilter() — O(n) time, O(n) space
export function myFilter(array, callback, thisArg) {
  const result = [];

  for (let i = 0; i < array.length; i++) {
    if (!(i in array)) continue;

    if (callback.call(thisArg, array[i], i, array)) {
      result.push(array[i]);
    }
  }

  return result;
}


// Key difference from map: filter starts with an empty array and uses push() to collect only the elements whose callback returns a truthy value. It stores the original element, not the callback's return value.
// 2. myReduce() — O(n) time, O(1) auxiliary space
export function myReduce(array, callback, initialValue) {
  const length = array.length;
  let i = 0;
  let accumulator;

  if (arguments.length >= 3) {
    accumulator = initialValue;
  } else {
    while (i < length && !(i in array)) {
      i++;
    }

    if (i >= length) {
      throw new TypeError(
        "Reduce of empty array with no initial value"
      );
    }

    accumulator = array[i];
    i++;
  }

  for (; i < length; i++) {
    if (!(i in array)) continue;

    accumulator = callback(
      accumulator,
      array[i],
      i,
      array
    );
  }

  return accumulator;
}


//   Key difference: reduce maintains an accumulator, which is updated using the callback's return value.
// arguments.length >= 3 distinguishes an explicitly supplied undefined initial value from an omitted initial value. This matters for native-compatible behavior.
// 3. mySome() — O(n) time, O(1) space
export function mySome(array, callback, thisArg) {
  for (let i = 0; i < array.length; i++) {
    if (!(i in array)) continue;

    if (callback.call(thisArg, array[i], i, array)) {
      return true;
    }
  }

  return false;
}


  // Key difference: some stops immediately when any callback returns a truthy value.
  // For an empty array, it returns false.
  // 4. myEvery() — O(n) time, O(1) space
export function myEvery(array, callback, thisArg) {
  for (let i = 0; i < array.length; i++) {
    if (!(i in array)) continue;

    if (!callback.call(thisArg, array[i], i, array)) {
      return false;
    }
  }

  return true;
}


//   Key difference: every stops immediately when any callback returns a falsy value.
// For an empty array, it returns true, because no element violates the condition.

// Comparison for revision
// Method	Initial state	Callback result	Early exit
// map	new Array(length)	Store at same index	No
// filter	[]	Push original value if truthy	No
// reduce	Initial value or first present element	Replace accumulator	No
// some	Conceptually false	Return true if truthy	Yes
// every	Conceptually true	Return false if falsy	Yes
// One subtlety: the implementations above are educational versions, not fully specification-compliant polyfills. For example, filter, some, and every re-read the array length each iteration, whereas native methods snapshot the initial length. reduce already captures the length.
