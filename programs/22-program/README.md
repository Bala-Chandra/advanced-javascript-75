# Problem 22 — Original title pending

**Source status:** The original numbered statement and implementation were not available in this conversation. Do not mistake this placeholder for the curriculum.

## Definition and expectations
Pending exact original problem text. Once supplied, record: signature, inputs/outputs, examples, edge cases, complexity, intuition, and real-world application.

## Required variations
Pending original follow-up requirements. Create individual files in `variations/` for each variant.

## Debug steps
1. After adding the original code to `solution.js`, add a sample invocation in `run.js`.
2. Set a breakpoint inside `solution.js`.
3. Open `run.js` and press F5 with **Debug current program file** selected.
4. Inspect Locals/Watch/Call Stack; use F10 to step over and F11 to step into.
5. Run `npm run run -- 22` and `npm run test:one -- 22` from the root.
6. Implement `practice.js` independently after studying the reference.

## Teaching checklist
Predict output → dry-run → explain closure/this/async behavior as relevant → edge cases → complexity → variations → interview explanation.



# ##################################################################################################################
# Problem 22 — Production Throttle

> **JavaScript Coding Mastery | Advanced | Senior → Staff Frontend**  
> Repository note: Save this document as `README.md` in your Problem 22 directory. VS Code and GitHub will syntax-highlight every fenced `javascript` block.

## Learning objectives

By the end, you should be able to explain the original implementation line by line, reconstruct it from memory, predict timing, distinguish throttle from debounce, identify production bugs, and reason about a configurable throttle with `leading`, `trailing`, `cancel()`, and `flush()`.

**Learning status:** Original implementation reconstructed at 100% accuracy. MCQs, verbal assessment, and independent mastery of the modified implementation remain pending. **Problem 21 reminder:** `leading`, `trailing`, and `maxWait` modifications remain pending mastery/assessment.

---

## 1. What is throttle?

**Throttle** limits how often a callback may execute while its wrapper is called frequently. With a `wait` of 100 ms, many scroll events can produce one leading callback and, if configured, one callback at the end of each throttle window.

- **Debounce:** “Has activity stopped for `wait` milliseconds?” Repeated calls restart the waiting period.
- **Throttle:** “Is this execution window open?” Repeated calls do **not** restart the active window.

Common uses: scroll-position updates, pointer-move tracking, resize measurements, drag previews, and progress indicators. For animation, `requestAnimationFrame` may be a better scheduling primitive.

### Mental timeline

Assume calls at 0, 30, 60, and 90 ms, `wait = 100`, and a leading+trailing throttle:

```text
Time (ms):  0       30       60       90      100
Calls:      A        B        C        D
Executes:   A                                D
           ^ leading                        ^ trailing
```

The pending trailing callback uses **the latest** saved arguments (`D`), even though its timer was started earlier.

---

## 2. Exact original implementation (unchanged)

```javascript
function throttle(fn, wait) {
  let lastExecution = 0;
  let timerId = null;
  let lastArgs;
  let lastThis;

  return function (...args) {
    const now = Date.now();

    lastArgs = args;
    lastThis = this;

    const remaining = wait - (now - lastExecution);

    if (remaining <= 0) {
      clearTimeout(timerId);
      timerId = null;

      lastExecution = now;
      fn.apply(lastThis, lastArgs);
    } else if (timerId === null) {
      timerId = setTimeout(() => {
        lastExecution = Date.now();
        timerId = null;

        fn.apply(lastThis, lastArgs);
      }, remaining);
    }
  };
}
```

### Original code, explained line by line

| Code | Explanation | Why it matters |
|---|---|---|
| `function throttle(fn, wait)` | Receives the original callback and minimum execution interval. | Creates one throttle instance. |
| `let lastExecution = 0` | Remembers the timestamp of the most recent callback execution. | Allows calculation of elapsed time; initialization to `0` has first-call edge cases. |
| `let timerId = null` | Stores the pending timer handle, or `null` when no timer is pending. | Prevents scheduling multiple trailing timers. |
| `let lastArgs` | Stores the latest wrapper-call arguments. | Trailing invocation uses the most recent data. |
| `let lastThis` | Stores the latest wrapper-call receiver. | Preserves dynamic `this` for ordinary functions. |
| `return function (...args)` | Returns a new function; `...args` collects positional arguments into an array. | This function closes over the outer variables. |
| `const now = Date.now()` | Reads the current wall-clock timestamp in milliseconds. | Measures elapsed time; system-clock adjustments can affect it. |
| `lastArgs = args` | Replaces previously saved arguments. | Latest call wins. |
| `lastThis = this` | Saves the wrapper's invocation receiver. | Supports `fn.apply(...)` later. |
| `const remaining = wait - (now - lastExecution)` | Computes the time still needed before the next eligible execution. | Core throttle decision. |
| `if (remaining <= 0)` | Checks whether enough time has elapsed. | Permits immediate execution. |
| `clearTimeout(timerId)` | Requests cancellation of a pending timer, if any. | Avoids an obsolete trailing callback. |
| `timerId = null` | Explicitly resets the stored handle. | `clearTimeout` **does not** mutate the variable. |
| `lastExecution = now` | Records the current execution time. | Starts the next cooldown interval. |
| `fn.apply(lastThis, lastArgs)` | Calls the original function with saved receiver and arguments. | `apply` invokes immediately; it does not permanently bind `this`. |
| `else if (timerId === null)` | Runs only when immediate execution is disallowed and no timer is pending. | Subsequent calls update data without restarting the timer. |
| `timerId = setTimeout(..., remaining)` | Schedules one future callback and saves its handle. | Implements the trailing execution. |
| `lastExecution = Date.now()` inside timer | Records actual timer-callback execution time. | Timers can fire late when the event loop is busy. |
| `timerId = null` inside timer | Marks the timer as no longer pending. | It has already fired; no cancellation is needed. |
| `fn.apply(lastThis, lastArgs)` inside timer | Invokes the callback with the **latest** saved arguments and receiver. | Explains why the trailing result is `D`, not `B`. |

### What is a timer handle?

```javascript
let timerId = setTimeout(() => console.log('run'), 1000);
// Browser: usually a numeric timer ID.
// Node.js: typically a Timeout object.

clearTimeout(timerId); // Cancels the pending timer.
console.log(timerId);  // Still contains the same handle!
timerId = null;        // Your code, not clearTimeout, resets the variable.
```

A timer handle is **not** a countdown or remaining duration. The runtime owns the timer; your variable stores a reference/identifier used to cancel it.

### Closures and memory

```text
throttle(fn, wait)
    |
    +-- shared lexical environment
    |      lastExecution
    |      timerId
    |      lastArgs
    |      lastThis
    |      fn, wait
    |
    +-- returns throttled function
               |
               +-- each call reads/writes the SAME shared variables
```

Calling `throttle()` twice creates two independent closures. Calling the **same returned function** repeatedly reuses the same closure. The stored arguments and receiver can retain large objects until explicitly released or until the throttle function becomes unreachable.

### Execution trace of the original

Assume `wait = 100`, `Date.now()` is already much greater than 100 on the first call, and timers run on schedule:

| Relative time | Wrapper call | `remaining` | Timer state | Callback execution |
|---:|---|---:|---|---|
| 0 ms | `throttled('A')` | ≤ 0 | No pending timer | `A` immediately |
| 30 ms | `throttled('B')` | 70 | Schedule for 100 ms | None |
| 60 ms | `throttled('C')` | 40 | Existing timer retained | None |
| 90 ms | `throttled('D')` | 10 | Existing timer retained | None |
| ~100 ms | Timer callback | — | Reset to `null` | `D` |

**Critical:** The original timer is scheduled by B but reads `lastArgs` when it fires, so it sees D.

### Original implementation limitations

1. `Date.now()` is wall-clock time and can move backward or forward.
2. `lastExecution = 0` is not a reliable first-call policy in all clock environments.
3. `lastArgs` and `lastThis` are retained after invocation.
4. If `fn` throws, the original code has no explicit exception-safe state cleanup.
5. Reentrant calls may overwrite shared data while an older invocation is running.
6. There are no `leading`, `trailing`, `cancel()`, or `flush()` controls.
7. The wrapper discards the original callback's return value.
8. There is no input validation or documented behavior for unusual `wait` values.

---

## 3. Improved implementation — configurable and reentrancy-aware

The version below deliberately uses **fixed windows**: the first call starts a window of length `wait`; calls during that window do not restart it. If `leading` is true, the first call runs immediately. If `trailing` is true, the latest additional call runs when the window expires. After a trailing execution, a fresh window is opened to prevent the next call from executing immediately within another `wait` interval.

**Defined semantics:**

- Default: `{ leading: true, trailing: true }`.
- With both enabled, **one isolated call executes once**, not twice.
- With `leading: false, trailing: true`, the first call waits one full window.
- With both false, callbacks never execute.
- `cancel()` discards pending work and resets the cooldown.
- `flush()` immediately executes **pending trailing work**, if any; otherwise returns the last completed result. A flush that invokes work starts a fresh cooldown window.
- Calls during a window return the **last completed callback result**, which may be `undefined`. Async callbacks return Promises; this utility does not await or abort them.
- Reentrant calls are permitted and preserve their own pending arguments.
- A thrown callback exception propagates from the invocation context; state is cleaned before invocation. An uncaught exception from an asynchronous timer callback still needs an application-level error strategy.

```javascript
function throttle(fn, wait, options = {}) {
  // CHANGE 1: Validate inputs instead of silently accepting invalid values.
  if (typeof fn !== 'function') {
    throw new TypeError('Expected fn to be a function');
  }
  if (!Number.isFinite(wait) || wait < 0) {
    throw new RangeError('wait must be a non-negative finite number');
  }

  // CHANGE 2: Expose leading/trailing behavior through an options object.
  const { leading = true, trailing = true } = options;

  // CHANGE 3: Remove Date.now() arithmetic entirely.
  // Fixed windows are driven by setTimeout, so clock jumps cannot
  // corrupt an elapsed-time subtraction.

  // A pending timer marks an active throttle window.
  let timerId = null;

  // Latest call data waiting for a trailing invocation.
  let lastArgs;
  let lastThis;

  // CHANGE 4: Preserve the most recently completed callback result.
  let result;

  function invoke() {
    // CHANGE 5: Snapshot and clear shared data BEFORE invoking fn.
    // If fn synchronously calls throttled() again, its new arguments
    // will not be erased by cleanup from this older invocation.
    const args = lastArgs;
    const context = lastThis;
    lastArgs = undefined;
    lastThis = undefined;

    // No post-call cleanup is required, even if fn throws.
    result = fn.apply(context, args);
    return result;
  }

  function scheduleWindow() {
    // The timer is created before any user callback is invoked.
    timerId = setTimeout(onWindowEnd, wait);
  }

  function onWindowEnd() {
    // The current timer has fired, so it is no longer pending.
    timerId = null;

    if (trailing && lastArgs !== undefined) {
      // CHANGE 6: Establish the next cooldown BEFORE invoking user code.
      // This prevents a synchronous reentrant call from being treated
      // as a brand-new leading call at the same instant.
      scheduleWindow();
      invoke();
      return;
    }

    // No trailing work: the burst/window is finished.
    lastArgs = undefined;
    lastThis = undefined;
  }

  function throttled(...args) {
    // CHANGE 7: Always save the latest arguments and receiver.
    lastArgs = args;
    lastThis = this;

    if (timerId === null) {
      // First call of a new window: start a fixed-duration timer.
      scheduleWindow();

      if (leading) {
        // Immediate leading call consumes saved arguments.
        // An isolated call therefore does not execute again later.
        return invoke();
      }
    }

    // A timer already exists: do NOT restart it (unlike debounce).
    return result;
  }

  // CHANGE 8: Add cancellation, including release of retained references.
  throttled.cancel = function () {
    clearTimeout(timerId);
    timerId = null;
    lastArgs = undefined;
    lastThis = undefined;
  };

  // CHANGE 9: Add flush for a pending trailing call.
  throttled.flush = function () {
    if (!trailing || lastArgs === undefined) {
      return result;
    }

    // End the previous window and begin a new cooldown.
    clearTimeout(timerId);
    timerId = null;
    scheduleWindow();

    return invoke();
  };

  return throttled;
}
```

### Why this is different from the earlier draft

An earlier draft used both `windowActive` and `timerId`, and allowed a trailing callback to set the window inactive before invoking user code. That approach can create ambiguous cooldown behavior around reentrant calls. This version uses **one timer as the window-state indicator** and starts the next cooldown **before** a trailing invocation. It also avoids holding `lastArgs` and `lastThis` after a leading-only window finishes.

This is an educational, explicitly specified throttle rather than a claim of universal throttle semantics. Different libraries make different choices about window alignment, `flush()`, exception behavior, and whether a trailing execution opens another cooldown. Validate these semantics against your application requirements.

---

## 4. Improved code — line-by-line walkthrough

### A. Function signature and validation

```javascript
function throttle(fn, wait, options = {}) {
```

- `fn`: the original callback.
- `wait`: cooldown duration in milliseconds.
- `options = {}`: default parameter; callers can omit configuration.

```javascript
if (typeof fn !== 'function') {
  throw new TypeError('Expected fn to be a function');
}
```

- `typeof` checks whether `fn` is callable as a function.
- `throw` stops construction immediately and signals a programmer error.

```javascript
if (!Number.isFinite(wait) || wait < 0) {
  throw new RangeError('wait must be a non-negative finite number');
}
```

- `Number.isFinite` rejects `NaN`, `Infinity`, and non-number values.
- `||` means **either** invalid condition is enough to reject `wait`.
- `wait = 0` is permitted; scheduling still follows the runtime's timer/event-loop rules.

### B. Configuration and clock

```javascript
const { leading = true, trailing = true } = options;
```

- Destructuring extracts two option properties and supplies defaults.
- `leading` decides whether the first call of a new window runs immediately.
- `trailing` decides whether queued work runs when the window ends.
- The improved implementation does not require a clock at all: `setTimeout` defines each fixed window. This removes the original dependence on wall-clock subtraction. If a timestamp-based design is needed instead, prefer monotonic `performance.now()` over `Date.now()` for elapsed-time measurements.

### C. Closure state

```javascript
let timerId = null;
let lastArgs;
let lastThis;
let result;
```

- `timerId === null`: no active throttle window.
- Non-null `timerId`: a window is active.
- `lastArgs`/`lastThis`: latest pending invocation data.
- `result`: last successfully returned callback value.
- Each returned wrapper gets its **own** closure state.

### D. `invoke()` and exception/reentrancy safety

```javascript
function invoke() {
  const args = lastArgs;
  const context = lastThis;
  lastArgs = undefined;
  lastThis = undefined;
  result = fn.apply(context, args);
  return result;
}
```

1. Copy the current arguments and receiver into local variables.
2. Clear the shared references **before** executing user code.
3. Invoke `fn` with `apply(context, args)`.
4. Save and return the callback result.
5. If `fn` throws, shared arguments/receiver are already cleared; the exception propagates.
6. If `fn` calls the throttle wrapper recursively, the recursive call writes **new** pending data, which is not overwritten by old cleanup.

**Nuance:** Clearing references does not magically cancel work or erase objects from memory. The local `args` and `context` references remain alive for the duration of the current invocation.

### E. Scheduling a window

```javascript
function scheduleWindow() {
  timerId = setTimeout(onWindowEnd, wait);
}
```

- `setTimeout` registers a one-shot timer.
- `timerId` stores its handle.
- Every wrapper call during this window sees a non-null handle and therefore does not restart the timer.
- Timer callbacks are **not guaranteed** to run at exactly `wait` milliseconds.

### F. Timer expiration

```javascript
function onWindowEnd() {
  timerId = null;

  if (trailing && lastArgs !== undefined) {
    scheduleWindow();
    invoke();
    return;
  }

  lastArgs = undefined;
  lastThis = undefined;
}
```

- The current timer has fired, so its handle is cleared.
- If trailing execution is enabled and there are pending arguments, a **new cooldown** is scheduled before invoking the callback.
- `invoke()` consumes pending arguments and executes the callback.
- If there is no pending work, references are cleared and the throttle becomes idle.
- Reentrant calls inside the callback encounter the already-created cooldown timer, so they do not accidentally start a second leading invocation.

### G. Returned wrapper

```javascript
function throttled(...args) {
  lastArgs = args;
  lastThis = this;

  if (timerId === null) {
    scheduleWindow();
    if (leading) {
      return invoke();
    }
  }

  return result;
}
```

- Every call updates the latest arguments and receiver.
- If no timer is active, a new fixed window starts.
- With `leading: true`, the callback executes immediately and its pending data is consumed.
- With `leading: false`, it waits until the timer fires.
- While a timer exists, additional calls do not schedule another timer; they simply replace pending data.
- Suppressed calls return the last completed result, **not** a Promise for the next scheduled execution.

### H. `cancel()`

```javascript
throttled.cancel = function () {
  clearTimeout(timerId);
  timerId = null;
  lastArgs = undefined;
  lastThis = undefined;
};
```

- Cancel the pending timer, if any.
- Reset the window state.
- Discard pending invocation arguments and receiver.
- Do not execute the callback.
- Do not abort an asynchronous operation that has already started.

### I. `flush()`

```javascript
throttled.flush = function () {
  if (!trailing || lastArgs === undefined) {
    return result;
  }

  clearTimeout(timerId);
  timerId = null;
  scheduleWindow();
  return invoke();
};
```

- If no trailing invocation is pending, return the last completed result.
- Otherwise, cancel the old timer and execute pending work immediately.
- Open a fresh cooldown **before** calling user code, protecting against reentrancy.
- Return the immediate callback result.
- **Unlike the original Problem 21 debounce**, this throttle's `flush()` semantics are explicitly defined to open a fresh cooldown.

---

## 5. Usage examples

### Default leading + trailing

```javascript
const trackScroll = throttle(
  function (position) {
    console.log('Scroll:', position);
    return position;
  },
  100,
  { leading: true, trailing: true }
);

trackScroll(10); // Immediate: Scroll: 10
trackScroll(20); // Pending trailing value = 20
trackScroll(30); // Replaces pending value with 30
// Approximately 100 ms after the first call: Scroll: 30
```

### Trailing-only

```javascript
const update = throttle(
  (value) => console.log('Updated:', value),
  200,
  { leading: false, trailing: true }
);

update('A'); // Nothing immediately
update('B'); // Latest pending value is B
// Around 200 ms after the first call: Updated: B
```

### Leading-only

```javascript
const fire = throttle(
  () => console.log('Fired'),
  200,
  { leading: true, trailing: false }
);

fire(); // Immediate
fire(); // Suppressed during the window
// No trailing invocation
```

### `cancel()` and `flush()`

```javascript
const save = throttle(
  (value) => console.log('Saved:', value),
  300,
  { leading: false, trailing: true }
);

save('Draft 1');
save('Draft 2');
save.flush(); // Immediately logs: Saved: Draft 2

save('Draft 3');
save.cancel(); // Discards Draft 3; no later invocation
```

### Preserving `this`

```javascript
const dashboard = {
  title: 'Sales',
  update: throttle(function (value) {
    console.log(this.title, value);
  }, 100)
};

dashboard.update(42); // 'Sales 42'
```

**Caution:** If you detach `dashboard.update` and invoke it as a plain function, its receiver may be `undefined` in strict mode. `apply()` preserves the receiver of the wrapper call; it does not permanently bind the original object. An arrow callback also has lexical `this`, which `apply()` cannot change.

---

## 6. Production caveats and engineering decisions

| Concern | Decision / limitation |
|---|---|
| Clock changes | The improved fixed-window version relies on timer scheduling, not wall-clock subtraction; no `Date.now()` comparison is needed. |
| First call | Explicitly controlled by `leading`; no `lastExecution = 0` assumption. |
| Memory | Pending arguments and receiver are cleared before invocation or on cancellation/window end. |
| Exceptions | State is cleared before invoking `fn`, but an uncaught error in a timer callback still reaches the runtime's error handling. |
| Reentrancy | A new cooldown is created before trailing/flush invocations; pending arguments are snapshotted and cleared before calling user code. |
| Async callbacks | Promises are passed through when `fn` executes; no automatic abort, deduplication, or awaiting. |
| Return values | Immediate invocations return `fn`'s result; suppressed calls return the last completed result. |
| Timer accuracy | Browser timer clamping, inactive tabs, and event-loop congestion may delay execution. |
| `wait = 0` | The leading call can execute immediately; trailing timers are still asynchronous. |
| `leading = trailing = false` | No callback executes, though a timer window may still be scheduled. |
| Framework cleanup | Call `.cancel()` when a component unmounts if pending work should be discarded. |
| Multiple instances | Each `throttle(...)` call creates independent timer/argument state. |

**API design note:** There is no single universal definition of throttle. Some libraries schedule windows relative to the last execution, others to the first call, and some allow different `flush()` semantics. Define and test the contract you actually need.

### Complexity

Let `k` be the number of arguments passed in a wrapper call.

- Creating a throttle: **O(1)** time and state.
- Calling the wrapper: **O(k)** to gather `...args` into an array, plus approximately O(1) scheduling work.
- `cancel()` / `flush()` scheduling overhead: **O(1)**, excluding the callback's own work.
- Retained extra space: **O(k)** for the latest arguments, plus constant bookkeeping. Referenced objects can themselves be arbitrarily large.

---

## 7. Senior / Staff interview explanation

> “Throttle limits how often a callback executes while calls continue arriving. The returned wrapper retains timer and latest-call state in a closure. The first call opens a fixed window; a leading invocation may run immediately. Later calls update the saved arguments and receiver without restarting the timer. At window end, an optional trailing invocation runs with the most recent data. A production API should define edge behavior, cancellation, flushing, result semantics, timer drift, async operations, and reentrancy. I clear shared argument references before invoking user code so that a reentrant call cannot have its state overwritten by stale cleanup.”

A **Senior** candidate should reconstruct the algorithm, explain the closure, `this`, timer handles, and timing traces. A **Staff** candidate should additionally question API semantics, error propagation, lifecycle cleanup, clock behavior, testing strategy, and whether throttling is even the right tool for the workload.

---

## 8. High-value test scenarios

Use fake timers in Vitest or Jest and cover:

1. One isolated call with leading+trailing → **one** invocation.
2. Calls at 0, 30, 60, 90 ms with `wait = 100` → leading A and trailing D.
3. Trailing-only → no immediate invocation; latest argument wins.
4. Leading-only → no trailing invocation.
5. Both false → callback never runs.
6. `cancel()` before timer expiry → pending work discarded.
7. `flush()` with pending work → executes once immediately.
8. `flush()` without pending work → returns last result, no duplicate.
9. A callback that calls the throttled wrapper again → newer pending state survives.
10. A callback that throws → shared arguments are not retained; exception propagates.
11. Object method invocation → correct `this` for ordinary callbacks.
12. Continuous calls → repeated executions are spaced by windows, not endlessly postponed.
13. Long-blocked event loop → no assumptions about exact wall-clock firing times.
14. Async callback → Promise return semantics and already-running work documented.

### Example Vitest test

```javascript
import { describe, it, expect, vi } from 'vitest';
// Import your implementation from the actual module in your repository.
import { throttle } from './throttle.js';

describe('throttle', () => {
  it('runs leading immediately and latest trailing once', () => {
    vi.useFakeTimers();
    try {
      const callback = vi.fn();
      const run = throttle(callback, 100);

      run('A');
      vi.advanceTimersByTime(30);
      run('B');
      vi.advanceTimersByTime(30);
      run('C');
      vi.advanceTimersByTime(40);

      expect(callback.mock.calls).toEqual([['A'], ['C']]);
      run.cancel();
    } finally {
      vi.useRealTimers();
    }
  });
});
```

**Module note:** The function in this README is a standalone declaration. Add `export` before `function throttle` when saving it in an ES module imported by the test.

---

## 9. Personal assessment and remaining work

| Dimension | Current status |
|---|---|
| Exact original reconstruction | **100%** first attempt |
| Original explanation | Delivered |
| Original MCQs | Pending |
| Independent verbal explanation | Pending |
| Modified implementation reconstruction | Pending |
| Modified implementation MCQs / transfer | Pending |
| Overall demonstrated mastery | Not yet assessed |

**No Staff-level mastery claim yet:** reproducing the original code accurately is one important milestone, not the full assessment.

---

## 10. Five-minute revision cheat sheet

### Core formula from the original

```javascript
const remaining = wait - (Date.now() - lastExecution);
```

- `remaining <= 0` → immediate execution.
- `remaining > 0 && timerId === null` → schedule one trailing timer.
- `remaining > 0 && timerId !== null` → update latest arguments only.

### Five things to remember

1. **Throttle does not restart the active timer**; debounce normally does.
2. `timerId` is a **handle**, not the time remaining. `clearTimeout(timerId)` does not set the variable to `null`.
3. A **closure** keeps `timerId`, `lastArgs`, and `lastThis` alive between calls.
4. `fn.apply(lastThis, lastArgs)` invokes with the latest receiver and argument array; it does not permanently bind `this`.
5. **Reentrancy-safe cleanup happens before calling user code**, so old cleanup cannot erase newly saved state.

### Three active-recall questions

**Q1.** Calls occur at 0, 30, 60, and 90 ms with `wait = 100` and leading+trailing. Which values execute and why?

**Q2.** Why is `lastArgs = undefined` safer **before** `fn.apply(...)` than after it when callbacks can call the wrapper recursively?

**Q3.** What should `cancel()` and `flush()` do when there is no pending trailing invocation? How should their return values be defined?

### What to practice next

Reconstruct the original without looking; then independently rebuild the configurable version in this order: **closure state → invoke → timer/window transition → returned wrapper → cancel/flush → fake-timer tests**.

