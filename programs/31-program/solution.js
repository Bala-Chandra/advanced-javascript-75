// Canonical original solution not yet available from the linked chat.
// Intentionally not fabricated. Paste the original here when provided.
export function createLimiter(limit){
  const queue = [];
  let active = 0;

  function runNext(){

    while(active < limit && queue.length){
      const task = queue.shift();
      active++;

      Promise.resolve()
        .then(task.fn)
      .then(task.resolve, task.reject)
      .finally(() =>{
        active--;
        runNext();
      })
      
    }
    
  }


  return function limitExecution(fn){
    return new Promise((resolve, reject) =>{
          queue.push({ fn, resolve, reject });
      runNext();
    })
  }
}
