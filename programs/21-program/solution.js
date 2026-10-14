// Canonical original solution not yet available from the linked chat.
// Intentionally not fabricated. Paste the original here when provided.
export function debounce(fn, wait) {
  let timerId = null;
  let lastArgs;
  let lastThis;

  function debounced(...args) {
    lastArgs = args;
    lastThis = this;

    clearTimeout(timerId);

    timerId = setTimeout(() => {
      timerId = null;

      fn.apply(lastThis, lastArgs);

      lastArgs = lastThis = null;
    }, wait);
  }

  debounced.cancel = () => {
    clearTimeout(timerId);

    timerId = null;
    lastArgs = lastThis = null;
  };

  debounced.flush = () => {
    if (timerId === null) return;

    clearTimeout(timerId);
    timerId = null;

    fn.apply(lastThis, lastArgs);

    lastArgs = lastThis = null;
  };

  return debounced;
}
