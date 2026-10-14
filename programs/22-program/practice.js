// Implement independently, then compare with solution.js.
export function throttle(fn, wait){
  let lastExecution = 0;
  let timerId = null;
  let lastArgs;
  let lastThis;

  return function(...args) {
    const now = Date.now();
    
    lastArgs = args;
    lastThis = this;

    const remaining = wait - (now - lastExecution);

    if(remaining <= 0){
      clearTimeout(timerId);
      timerId = null;

      lastExecution = now;
      
      fn.apply(lastThis, lastArgs);
    }else if(timerId === null){
      timerId = setTimeout(() =>{
        lastExecution = Date.now();
        timerId = null;
        fn.apply(lastThis, lastArgs);
      }, remaining)
    }
    
  }
}
