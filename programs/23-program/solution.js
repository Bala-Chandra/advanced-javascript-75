// Canonical original solution not yet available from the linked chat.
// Intentionally not fabricated. Paste the original here when provided.
export function createBatcher(processBatch) {
  // Shared array holding values waiting to be processed.
  let queue = [];

  // Indicates whether a microtask has already been scheduled.
  let scheduled = false;

  // Return the function that callers will use.
  return function enqueue(value) {
    // Add the latest value to the shared queue.
    queue.push(value);

    // If a microtask is already scheduled, don't create another.
    if (scheduled) return;

    // Mark the batch as scheduled.
    scheduled = true;

    // Run after the current synchronous execution finishes.
    queueMicrotask(() => {
      // Allow future batches to schedule another microtask.
      scheduled = false;

      // Capture the current queue by reference.
      const batch = queue;

      // Replace the shared queue with a fresh array.
      queue = [];

      // Process all captured values together.
      processBatch(batch);
    });
  };
}

