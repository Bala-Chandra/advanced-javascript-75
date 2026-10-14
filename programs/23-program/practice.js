// Implement independently, then compare with solution.js.
export function createBatcher(processBatch) {
  // Shared array holding values waiting to be processed.
  let queue = [];

  let schedule = false;
  return function enqueue(value) {
    queue.push(value);

    if(schedule === true) return;

    schedule = true;

    queueMicrotask(() =>{
      schedule = false;
      const batch = queue;
      queue = [];
      processBatch(batch);
    })
  }
}
