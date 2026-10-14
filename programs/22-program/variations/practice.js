
export function throttle(fn, wait, options = {}) {
  // FIX 1: Validate inputs to avoid unexpected runtime behavior.
  if (typeof fn !== "function") {
    throw new TypeError("Expected fn to be a function");
  }

  if (!Number.isFinite(wait) || wait < 0) {
    throw new RangeError("wait must be a non-negative finite number");
  }

  // FIX 2: Configurable leading and trailing behavior.
  // leading: execute immediately on the first call of a burst.
  // trailing: execute the latest pending call at the end of the window.
  const {
    leading = true,
    trailing = true
  } = options;

  // FIX 3: Use a monotonic clock rather than Date.now().
  // performance.now() is not affected by system clock adjustments.
  // This version targets modern browsers and Node.js runtimes
  // that provide performance.now().
  const now = () => performance.now();

  // FIX 4: Use null to represent "no pending timer".
  let timerId = null;

  // Track the last execution time separately from timer state.
  let lastExecution = 0;

  // Preserve the latest arguments and receiver.
  let lastArgs;
  let lastThis;

  // FIX 5: Store the callback result.
  // Subsequent throttled calls can return the last completed result.
  let result;

  // Track whether a throttle window is currently active.
  let windowActive = false;

  function invoke(time) {
    // FIX 6: Copy invocation data into local variables.
    // Clear shared references BEFORE invoking fn.
    //
    // Why?
    // If fn synchronously calls throttled() again,
    // the new call can safely store its own arguments.
    // Old cleanup cannot accidentally erase newer state.
    const args = lastArgs;
    const context = lastThis;

    lastArgs = undefined;
    lastThis = undefined;

    lastExecution = time;

    // FIX 7: No cleanup after fn.apply().
    // Therefore, if fn throws synchronously, the retained
    // argument and receiver references are already cleared.
    //
    // Also preserves the callback's return value.
    result = fn.apply(context, args);

    return result;
  }

  function onTimer() {
    timerId = null;
    windowActive = false;

    if (trailing && lastArgs !== undefined) {
      const time = now();

      // Execute the latest pending call.
      invoke(time);

      // A trailing invocation establishes a new cooldown window.
      // Reentrant calls made by fn may already have scheduled
      // their own timer, so do not overwrite that timer.
    } else {
      lastArgs = undefined;
      lastThis = undefined;
    }
  }

  function throttled(...args) {
    const time = now();

    lastArgs = args;
    lastThis = this;

    // FIX 8: Explicit first-call/window handling.
    // We no longer rely on lastExecution = 0 to determine
    // whether the first call is eligible.
    if (!windowActive) {
      windowActive = true;

      // Start the cooldown window.
      timerId = setTimeout(onTimer, wait);

      if (leading) {
        return invoke(time);
      }

      return result;
    }

    // While a window is active, only update the latest
    // arguments and receiver. Do not restart the timer.
    return result;
  }

  // FIX 9: Cancel the pending timer and discard pending work.
  throttled.cancel = function () {
    clearTimeout(timerId);

    timerId = null;
    windowActive = false;
    lastExecution = 0;
    lastArgs = undefined;
    lastThis = undefined;
  };

  // FIX 10: Execute the latest pending trailing call immediately.
  // If no trailing invocation is pending, return the last result.
  throttled.flush = function () {
    if (lastArgs === undefined) {
      return result;
    }

    clearTimeout(timerId);

    timerId = null;
    windowActive = false;

    return invoke(now());
  };

  return throttled;
}
