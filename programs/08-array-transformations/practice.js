// YOUR WORKSPACE: implement this without looking at solution.js.
// Keep your implementation independent of the reference.
export function myMap(array, callback, thisArgs) {
  const result = new Array(array.length);

  for(let i = 0; i < array.length; i++){
    if( !(i in array))  continue;

    result[i] = callback.call(thisArgs, i, array[i], array);
    
  }
  return result;
}

// const arr = [10, undefined, , 40];

// 0 in arr; // true
// 1 in arr; // true
// 2 in arr; // false
// 3 in arr; // true

// Even though index 1 contains undefined, the property exists.
// Index 2 is a hole, so the property doesn't exist (assuming no inherited numeric property).
// Your original condition:
// if (!(i in array)) continue;


// means skip missing indexes, not skip falsy or undefined values.


// You correctly identified that the callback contains the custom transformation logic.
// But .call() has another responsibility: setting the callback's this binding.
// callback.call(
//   thisArg,   // Requested this binding
//   array[i],  // First callback argument
//   i,         // Second callback argument
//   array      // Third callback argument
// );


// The thisArg is not passed as the first regular parameter of the callback. It is supplied as its this binding, subject to ordinary JavaScript function semantics.
