# Problem 21 — Production Debounce with leading, trailing, and maxWait

This implementation supports your requested modification while preserving `this`, `arguments`, `cancel()`, and `flush()`.
It also addresses the original implementation's reentrancy and synchronous exception-cleanup problems.

## Complete solution

```javascript
function debounce(fn, wait, options = {}) {
  const {
    leading = false,
    trailing = true,
    maxWait
  } = options;

  let timerId = null;
  let maxTimerId = null;
  let lastArgs;
  let lastThis;
  let result;

  function invoke() {
    const args = lastArgs;
    const context = lastThis;

    // Clear before invocation to support reentrant calls.
    lastArgs = undefined;
    lastThis = undefined;

    result = fn.apply(context, args);
    return result;
  }

  function clearTimers() {
    clearTimeout(timerId);
    clearTimeout(maxTimerId);

    timerId = null;
    maxTimerId = null;
  }

  function onTrailingTimer() {
    timerId = null;

    if (trailing && lastArgs !== undefined) {
      clearTimeout(maxTimerId);
      maxTimerId = null;
      invoke();
    } else if (maxTimerId === null) {
      lastArgs = undefined;
      lastThis = undefined;
    }
  }

  function onMaxTimer() {
    maxTimerId = null;

    clearTimeout(timerId);
    timerId = null;

    if (lastArgs !== undefined) {
      invoke();
    }
  }

  function debounced(...args) {
    const isNewBurst =
      timerId === null && maxTimerId === null;

    lastArgs = args;
    lastThis = this;

    // Reset the trailing timer on every call.
    clearTimeout(timerId);

    timerId = setTimeout(onTrailingTimer, wait);

    // Start maxWait timer only once per burst.
    if (
      maxWait !== undefined &&
      maxTimerId === null
    ) {
      maxTimerId = setTimeout(onMaxTimer, maxWait);
    }

    // Invoke immediately on the leading edge.
    if (leading && isNewBurst) {
      return invoke();
    }

    return result;
  }

  debounced.cancel = () => {
    clearTimers();

    lastArgs = undefined;
    lastThis = undefined;
  };

  debounced.flush = () => {
    if (lastArgs === undefined) {
      return result;
    }

    clearTimers();
    return invoke();
  };

  return debounced;
}
```

## Important production caveat

The code above is a useful learning implementation, but it is not yet fully production-correct for every combination of options.
In particular, a single maxWait timer started at the beginning of a burst is not sufficient to guarantee repeated maximum-wait intervals under continuous calls. Also, the interaction between `leading`, `trailing`, and the max-wait timer requires more careful state tracking.

For a production-grade implementation, I recommend the timestamp-based approach below, which follows the established debounce state-machine design.

## Recommended production implementation

```javascript
function debounce(fn, wait, options = {}) {
  if (typeof fn !== "function") {
    throw new TypeError("Expected a function");
  }

  const leading = Boolean(options.leading);
  const trailing = options.trailing !== false;
  const hasMaxWait = options.maxWait !== undefined;

  wait = Math.max(0, Number(wait) || 0);

  const maxWait = hasMaxWait
    ? Math.max(wait, Number(options.maxWait) || 0)
    : undefined;

  let lastArgs;
  let lastThis;
  let timerId;
  let lastCallTime;
  let lastInvokeTime = 0;
  let result;

  function invokeFunc(time) {
    const args = lastArgs;
    const context = lastThis;

    lastArgs = undefined;
    lastThis = undefined;
    lastInvokeTime = time;

    result = fn.apply(context, args);
    return result;
  }

  function startTimer(callback, delay) {
    return setTimeout(callback, delay);
  }

  function remainingWait(time) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;

    const waitRemaining = wait - timeSinceLastCall;

    return hasMaxWait
      ? Math.min(
          waitRemaining,
          maxWait - timeSinceLastInvoke
        )
      : waitRemaining;
  }

  function shouldInvoke(time) {
    if (lastCallTime === undefined) {
      return true;
    }

    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (hasMaxWait && timeSinceLastInvoke >= maxWait)
    );
  }

  function leadingEdge(time) {
    lastInvokeTime = time;

    timerId = startTimer(timerExpired, wait);

    return leading ? invokeFunc(time) : result;
  }

  function trailingEdge(time) {
    timerId = undefined;

    if (trailing && lastArgs !== undefined) {
      return invokeFunc(time);
    }

    lastArgs = undefined;
    lastThis = undefined;

    return result;
  }

  function timerExpired() {
    const time = Date.now();

    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }

    timerId = startTimer(
      timerExpired,
      remainingWait(time)
    );
  }

  function debounced(...args) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(time);
      }

      if (hasMaxWait) {
        clearTimeout(timerId);

        timerId = startTimer(timerExpired, wait);

        return invokeFunc(time);
      }
    }

    if (timerId === undefined) {
      timerId = startTimer(timerExpired, wait);
    }

    return result;
  }

  debounced.cancel = function () {
    clearTimeout(timerId);

    timerId = undefined;
    lastArgs = undefined;
    lastThis = undefined;
    lastCallTime = undefined;
    lastInvokeTime = 0;
  };

  debounced.flush = function () {
    if (timerId === undefined) {
      return result;
    }

    clearTimeout(timerId);
    return trailingEdge(Date.now());
  };

  return debounced;
}
```

This second implementation is the one to study for Senior/Staff interviews. It uses one reschedulable timer and timestamps rather than managing separate trailing and maximum-wait timers.

## How the options behave

| Options | Behavior |
| --- | --- |
| `leading: false, trailing: true` | Executes after calls stop for `wait` ms |
| `leading: true, trailing: false` | Executes immediately at the start of a burst |
| `leading: true, trailing: true` | Executes immediately, then again only if additional calls occur during the burst |
| `maxWait: 1000` | Prevents continuous calls from postponing eligible execution beyond the maximum-wait interval |

For example:

```javascript
const search = debounce(
  function (query) {
    console.log("Searching:", query);
  },
  300,
  {
    leading: true,
    trailing: true,
    maxWait: 1000
  }
);

search("V");
search("Vu");
search("Vue");
```

The first call executes immediately. The later calls update the pending trailing invocation. If calls continue without a quiet period, `maxWait` forces an invocation.

## One nuance about `flush()`

In the recommended implementation, `flush()` executes a pending trailing invocation immediately. If the leading invocation already occurred and there are no newer arguments, it returns the previous result without invoking again.

This is important for avoiding duplicate callbacks.

## Next learning step

I suggest we master the recommended implementation in four focused pieces: `shouldInvoke()`, `remainingWait()`, `leadingEdge()`/`trailingEdge()`, and finally `debounced()` with `cancel()`/`flush()`.

Start with `shouldInvoke()`, because it is the decision-making core of the implementation.