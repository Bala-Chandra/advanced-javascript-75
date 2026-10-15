// YOUR WORKSPACE: implement this without looking at solution.js.
// Keep your implementation independent of the reference.
export function memoixe(fn) {
  const cache = new Map();

    return  function (key) {
      if (cache.has(key)){
        return cache.get(key);
      }   

      const result = fn.call(this, key);
      cache.set(key, result);
      
      return result;
     
    }  
}
