// Canonical original solution not yet available from the linked chat.
// Intentionally not fabricated. Paste the original here when provided.
export function createDeduper() {
  const inFlight = new Map();

  return function dedupe(key, operation) {
    if (inFlight.has(key)) {
      return inFlight.get(key);
    }

    const promise = Promise.resolve()
      .then(operation)
      .finally(() => {
        // Only cache while work is in flight.
        inFlight.delete(key);
      });

    inFlight.set(key, promise);

    return promise;
  };
}
