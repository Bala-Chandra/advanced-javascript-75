# Problem 21 — Original title pending

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
5. Run `npm run run -- 21` and `npm run test:one -- 21` from the root.
6. Implement `practice.js` independently after studying the reference.

## Teaching checklist
Predict output → dry-run → explain closure/this/async behavior as relevant → edge cases → complexity → variations → interview explanation.

## ##########################################################################################################################


# Problem 21 — Production Debounce

**Difficulty:** Advanced · **Track:** JavaScript Coding Mastery · **Audience:** Junior → Senior → Staff

> **Progress note (October 2026):** The original trailing-edge implementation has been explained, reconstructed, and assessed (approximately 92% provisional mastery). The `leading`, `trailing`, and `maxWait` modifications are **pending independent reconstruction and mastery assessment**. The variations below are study references, **not** a claim that those modifications have been mastered.

## Contents

- [Problem 21 — Original title pending](#problem-21--original-title-pending)
  - [Definition and expectations](#definition-and-expectations)
  - [Required variations](#required-variations)
  - [Debug steps](#debug-steps)
  - [Teaching checklist](#teaching-checklist)
  - [##########################################################################################################################](#)
- [Problem 21 — Production Debounce](#problem-21--production-debounce)
  - [Contents](#contents)
  - [1. Problem statement and mental model](#1-problem-statement-and-mental-model)
  - [2. Exact original implementation](#2-exact-original-implementation)
    - [Annotated original (same behavior; comments only)](#annotated-original-same-behavior-comments-only)
  - [3. Line-by-line walkthrough](#3-line-by-line-walkthrough)
    - [Input and output](#input-and-output)
  - [4. Timeline and closure state](#4-timeline-and-closure-state)
  - [5. JavaScript internals](#5-javascript-internals)
    - [`clearTimeout` does not reset the variable](#cleartimeout-does-not-reset-the-variable)
    - [`this`, `apply`, and `bind`](#this-apply-and-bind)
    - [Event loop](#event-loop)
    - [Memory](#memory)
  - [6. `cancel()` versus `flush()`](#6-cancel-versus-flush)
  - [7. Original implementation limitations](#7-original-implementation-limitations)
    - [Reentrancy bug in the exact original](#reentrancy-bug-in-the-exact-original)
    - [Exception bug](#exception-bug)
  - [8. Variation A — leading only](#8-variation-a--leading-only)
  - [9. Variation B — leading and trailing](#9-variation-b--leading-and-trailing)
  - [10. Variation C — leading, trailing and maxWait](#10-variation-c--leading-trailing-and-maxwait)
  - [11. Production-oriented configurable implementation](#11-production-oriented-configurable-implementation)
    - [Why these changes matter](#why-these-changes-matter)
    - [Important limits of this reference implementation](#important-limits-of-this-reference-implementation)
  - [12. How the configurable implementation works](#12-how-the-configurable-implementation-works)
    - [State machine](#state-machine)
    - [`shouldInvoke(time)`](#shouldinvoketime)
    - [`remainingWait(time)`](#remainingwaittime)
    - [`leadingEdge(time)`](#leadingedgetime)
    - [`trailingEdge(time)`](#trailingedgetime)
    - [`timerExpired()`](#timerexpired)
    - [`debounced()`](#debounced)
  - [13. Vitest test cases](#13-vitest-test-cases)
  - [14. Vue, React, NestJS and Node applications](#14-vue-react-nestjs-and-node-applications)
    - [Vue 3 / Pinia — search input](#vue-3--pinia--search-input)
    - [React — stable wrapper across renders](#react--stable-wrapper-across-renders)
    - [NestJS — delayed background updates (in-process only)](#nestjs--delayed-background-updates-in-process-only)
    - [Node.js / Express — coalescing local work](#nodejs--express--coalescing-local-work)
  - [15. Complexity, API contracts and interview traps](#15-complexity-api-contracts-and-interview-traps)
    - [Senior-level answer (concise)](#senior-level-answer-concise)
    - [Staff-level extension](#staff-level-extension)
  - [16. Personal assessment and revision sheet](#16-personal-assessment-and-revision-sheet)
    - [Recorded assessment (original only)](#recorded-assessment-original-only)
    - [Specific mistakes and lessons](#specific-mistakes-and-lessons)
    - [5–10 minute active-recall routine](#510-minute-active-recall-routine)
    - [Completion checklist](#completion-checklist)

---

## 1. Problem statement and mental model

Debounce postpones execution until calls have been quiet for a specified duration. In the original implementation, each new call replaces the pending timer; the **latest arguments and receiver** win.

- **Debounce:** “Has activity stopped long enough?”
- **Throttle:** “Has enough time passed since the last allowed execution?”
- **Trailing edge:** execute after the quiet period.
- **Leading edge:** execute at the beginning of a burst.
- **`maxWait`:** force an invocation after a bounded period of sustained activity (assuming the event loop can run).

```text
wait = 100 ms

Call:      A(0)    B(20)   C(40)
           |       |       |
Timers:    100x    120x    140 ✓
Output:                     C at approximately 140 ms

x = canceled; ✓ = executes
```

Real timers are not precise deadlines: browser throttling and a busy event loop can delay execution.

## 2. Exact original implementation

**This block is the exact code supplied for Problem 21.** Do not confuse it with the improved version later.

```javascript
function debounce(fn, wait) {
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
```

### Annotated original (same behavior; comments only)

```javascript
function debounce(fn, wait) {        // Factory: fn is the callback; wait is delay in ms.
  let timerId = null;                // Shared handle for the one pending timeout.
  let lastArgs;                      // Latest argument array, captured by closure.
  let lastThis;                      // Latest receiver (`this`), captured by closure.

  function debounced(...args) {      // Returned wrapper; rest parameter collects arguments.
    lastArgs = args;                 // Replace arguments from previous call.
    lastThis = this;                 // Save how THIS wrapper was invoked.

    clearTimeout(timerId);          // Cancel previous pending timeout, if any.
                                     // Does NOT change the timerId variable!
    timerId = setTimeout(() => {    // Register a new callback and save its handle.
      timerId = null;               // Mark timer as no longer pending when it fires.
      fn.apply(lastThis, lastArgs); // Call fn with latest receiver + latest args.
      lastArgs = lastThis = null;   // Release references (only if fn returns normally).
    }, wait);                       // Schedule after at least wait milliseconds.
  }

  debounced.cancel = () => {        // Functions are objects; attach a method.
    clearTimeout(timerId);          // Cancel scheduled work.
    timerId = null;                 // Update our own state explicitly.
    lastArgs = lastThis = null;     // Drop saved call data.
  };

  debounced.flush = () => {         // Execute pending trailing work immediately.
    if (timerId === null) return;   // No pending timer -> no callback invocation.
    clearTimeout(timerId);          // Prevent scheduled duplicate execution.
    timerId = null;                 // Mark no pending timer.
    fn.apply(lastThis, lastArgs);   // Invoke now using latest saved data.
    lastArgs = lastThis = null;     // Cleanup if fn returns normally.
  };

  return debounced;                 // Return wrapper with cancel and flush methods.
}
```

## 3. Line-by-line walkthrough

| Expression | Explanation | Interview nuance |
|---|---|---|
| `debounce(fn, wait)` | Factory accepts callback and delay. | Factory itself does not call `fn`. |
| `let timerId = null` | Initially no scheduled timer. | Browser timeout handle is typically numeric; Node returns a `Timeout` object. |
| `let lastArgs` | Holds latest wrapper call's arguments. | An array reference is retained until replaced/cleared. |
| `let lastThis` | Holds latest wrapper call's receiver. | Receiver depends on call site, not the callback's declaration location. |
| `function debounced(...args)` | Creates wrapper with rest arguments. | A normal function has dynamic `this`; replacing it with an arrow changes behavior. |
| `lastArgs = args` | Latest call wins. | Earlier calls' arguments are discarded. |
| `lastThis = this` | Latest call's receiver wins. | `fn.apply` cannot change an arrow callback's lexical `this`. |
| `clearTimeout(timerId)` | Cancel previous scheduled timeout. | Does **not** mutate `timerId`. |
| `setTimeout(..., wait)` | Schedule trailing callback. | Delay is minimum, not exact execution time. |
| `timerId = null` inside timer | Mark no pending timer. | Timer has already fired; no `clearTimeout` needed. |
| `fn.apply(lastThis, lastArgs)` | Invoke original callback with saved receiver/arguments. | `apply` calls immediately; `bind` creates a new function. |
| `lastArgs = lastThis = null` | Chained assignment clears references. | Not exception-safe and not reentrancy-safe in the original. |
| `debounced.cancel = ...` | Adds cancel method to function object. | Does not cancel work already started by `fn`. |
| `debounced.flush = ...` | Runs pending invocation early. | Returns `undefined` in original even if `fn` returns a value. |
| `return debounced` | Caller receives reusable wrapper. | Every factory call creates a separate closure. |

### Input and output

```javascript
const save = debounce(function (text) {
  console.log("Saving:", text);
  return text.length;
}, 300);

const result = save("draft");
console.log(result); // undefined: original wrapper discards fn's return value.
```

`save` is the returned function. Calling `debounce(...)` itself does not schedule a timeout; calling `save(...)` does.

## 4. Timeline and closure state

Assume `wait = 100` and timely timers:

| Time | Call/action | `timerId` (illustrative) | `lastArgs` | Result |
|---:|---|---|---|---|
| 0 ms | `save("A")` | 5 | `["A"]` | Timer due ~100 ms |
| 20 ms | `save("B")` | 6 | `["B"]` | Cancel 5; due ~120 ms |
| 40 ms | `save("C")` | 7 | `["C"]` | Cancel 6; due ~140 ms |
| ~140 ms | Timer 7 fires | `null` | `["C"]` | Invoke `fn("C")` |
| After normal return | Cleanup | `null` | `null` | Release latest arguments/receiver |

```text
debounce(fn, 100)
       |
       v
Shared lexical environment (one per factory call)
  timerId  ---> pending timeout handle
  lastArgs ---> latest arguments array
  lastThis ---> latest receiver object
  fn, wait ---> factory parameters
       ^
       |
  +----+--------------------+
  |                         |
debounced(...)         debounced.cancel / .flush
(all access the same environment)
```

**Closure:** A function retains access to its lexical environment after the outer function has returned. These variables are **not passed as arguments** to `debounced`; they are referenced from its closure.

## 5. JavaScript internals

### `clearTimeout` does not reset the variable

```javascript
let timerId = setTimeout(() => console.log("Hello"), 1000);
// Suppose browser returns handle 10.
clearTimeout(timerId);
console.log(timerId); // Still 10, not null.
timerId = null;        // Your code explicitly resets it.
```

In the main wrapper, resetting to `null` immediately after cancellation is unnecessary because the next line replaces the handle with a new timeout.

### `this`, `apply`, and `bind`

```javascript
const user = {
  name: "Bala",
  greet: debounce(function (message) {
    console.log(this.name, message);
  }, 100)
};

user.greet("Hello");                 // Receiver is user.
const detached = user.greet;
// detached("Hi") would have undefined `this` in strict mode.
const bound = user.greet.bind(user);  // Permanently bind the WRAPPER to user.
bound("Welcome");                   // Latest call wins; prints "Bala Welcome".
```

`fn.apply(receiver, argsArray)` invokes a **normal function** with that receiver. It does not permanently bind the function. An arrow function's lexical `this` cannot be replaced with `apply`.

### Event loop

`setTimeout` registers a timer with the host runtime. Once its delay has elapsed, its callback becomes eligible to run when the relevant event-loop task queue is serviced. It cannot interrupt currently running synchronous JavaScript.

### Memory

The closure retains `lastArgs` and `lastThis` while pending. Large argument objects may stay reachable. Clearing references after invocation/cancellation reduces unnecessary retention. Cleanup must not erase state created by a reentrant invocation.

## 6. `cancel()` versus `flush()`

| Operation | Pending timer? | Invoke callback? | Reset pending timer? |
|---|---|---|---|
| `debounced.cancel()` | Yes | No | Yes |
| `debounced.cancel()` | No | No | Yes |
| `debounced.flush()` | Yes | Yes, immediately | Yes |
| `debounced.flush()` | No | No | Already none |

```javascript
const save = debounce(v => console.log("Saved", v), 300);

save("A");
save.cancel(); // A will not execute.
save.flush();  // Nothing: timerId is null.

save("B");
save.flush();  // Immediately logs "Saved B".
save.flush();  // Nothing: no pending invocation.
```

**Important:** Neither operation aborts a fetch or Promise that the callback has already started. Use `AbortController` separately if required.

## 7. Original implementation limitations

| Limitation | Why it matters | Production approach |
|---|---|---|
| No `leading` option | Cannot invoke on first call. | Configurable leading edge. |
| No `maxWait` | Continuous activity can postpone forever. | Timestamp-based deadline. |
| Callback throws | Cleanup after `fn.apply` is skipped. | Clear saved call data **before** invoking. |
| Reentrant callback | Old cleanup can erase new call's state. | Snapshot/clear before callback. |
| Return value discarded | `debounced()` and `flush()` return `undefined`. | Track and return last invocation result. |
| Timers delayed | `wait` is not a hard real-time guarantee. | Document event-loop limitations. |
| `this` detached | Receiver may become `undefined`. | Call as method or explicitly `bind`. |
| No async cancellation | Already-started work continues. | Combine with abort/sequence checks. |

### Reentrancy bug in the exact original

```javascript
const task = debounce(function (value) {
  console.log(value);
  if (value === "A") task("B");
}, 100);

task("A");
// Approximately 100 ms: prints A; callback schedules B.
// Old callback then clears lastArgs = null.
// Approximately 200 ms: B timer calls fn.apply(..., null).
// apply treats null argument-list as no arguments, so it prints undefined.
```

This is **not** a `TypeError` from `apply(null, null)`; `null` as the argument-list is accepted and means no arguments.

### Exception bug

```javascript
const task = debounce(() => { throw new Error("Failure"); }, 100);
task({ largeData: new Array(100000).fill("x") });
// When fn throws, the original cleanup statement is skipped.
// The closure may retain the large argument object.
```

## 8. Variation A — leading only

**Contract:** Invoke immediately on the first call of a burst; ignore subsequent calls until the quiet period ends. A new call restarts the quiet-period timer.

```javascript
const leadingOnly = debounce(
  function (value) { console.log(value); },
  300,
  { leading: true, trailing: false }
);
```

Expected idealized behavior:

```text
A at 0 ms       -> execute A immediately
B at 100 ms     -> no invocation, quiet timer resets
C at 200 ms     -> no invocation, quiet timer resets
No calls 300 ms -> burst ends at ~500 ms, no trailing invocation
D at 600 ms     -> execute D immediately (new burst)
```

The configurable implementation in section 11 supplies this behavior. This section illustrates **usage**, not a separate implementation.

## 9. Variation B — leading and trailing

**Contract:** First call executes immediately. If additional calls arrive during the burst, the latest of those calls executes after a quiet period. A single call should **not** execute twice.

```javascript
const bothEdges = debounce(
  value => console.log(value),
  300,
  { leading: true, trailing: true }
);
```

```text
One call:  A(0) --------------------------> output A only at 0
Many:     A(0) B(100) C(200) ------------> output A at 0, C at ~500
```

**Why track pending arguments?** After a leading invocation, clearing pending arguments ensures a trailing timer does not duplicate the same call. A later call populates new pending arguments, enabling the trailing invocation.

## 10. Variation C — leading, trailing and maxWait

**Contract:** A continuous stream of calls should not postpone execution indefinitely. For `wait: 300` and `maxWait: 1000`, the latest pending invocation must become eligible by the maximum-wait deadline, subject to event-loop scheduling.

```javascript
const bounded = debounce(
  value => console.log(value),
  300,
  { leading: true, trailing: true, maxWait: 1000 }
);
```

Illustrative call stream (not a guarantee of exact wall-clock execution):

```text
Calls:    0  100 200 300 400 500 600 700 800 900 1000 1100 ...
Leading:  ^
maxWait:                                 ^ around 1000 ms
More calls continue -> subsequent maximum-wait periods apply.
```

**Important semantic choice:** The reference implementation below normalizes `maxWait` to at least `wait` (as common debounce utilities do). `maxWait` is a bound on eligible invocations, not a hard real-time guarantee if the event loop is blocked.

## 11. Production-oriented configurable implementation

This is a **separate implementation**, not the exact original. It uses one timer plus timestamps and follows a commonly used debounce state-machine design. It targets modern browser/Node environments with `performance.now()`.

```javascript
function debounceAdvanced(fn, wait, options = {}) {
  // CHANGE 1: Fail early on invalid callback or delay.
  if (typeof fn !== "function") {
    throw new TypeError("Expected fn to be a function");
  }
  if (!Number.isFinite(wait) || wait < 0) {
    throw new RangeError("wait must be a non-negative finite number");
  }

  // CHANGE 2: Expose configurable invocation edges.
  const leading = Boolean(options.leading ?? false);
  const trailing = Boolean(options.trailing ?? true);
  const hasMaxWait = options.maxWait !== undefined;

  if (hasMaxWait &&
      (!Number.isFinite(options.maxWait) || options.maxWait < 0)) {
    throw new RangeError("maxWait must be a non-negative finite number");
  }

  // CHANGE 3: Normalize maxWait to at least wait.
  const maxWait = hasMaxWait ? Math.max(wait, options.maxWait) : undefined;

  // CHANGE 4: Use a monotonic clock, avoiding system-clock jumps.
  const clock = () => performance.now();

  // CHANGE 5: Separate last call time from last invocation time.
  let lastArgs;
  let lastThis;
  let timerId;                // undefined means no timer is scheduled.
  let lastCallTime;
  let lastInvokeTime = 0;
  let result;                 // Last callback result (including a Promise, if returned).

  function invokeFunc(time) {
    // CHANGE 6: Snapshot and clear BEFORE calling user code.
    // Prevents exception retention and old cleanup destroying reentrant state.
    const args = lastArgs;
    const context = lastThis;
    lastArgs = undefined;
    lastThis = undefined;
    lastInvokeTime = time;

    result = fn.apply(context, args);
    return result;
  }

  function shouldInvoke(time) {
    if (lastCallTime === undefined) return true; // First call.

    const sinceCall = time - lastCallTime;
    const sinceInvoke = time - lastInvokeTime;

    return (
      sinceCall >= wait ||
      (hasMaxWait && sinceInvoke >= maxWait)
    );
  }

  function remainingWait(time) {
    const sinceCall = time - lastCallTime;
    const sinceInvoke = time - lastInvokeTime;
    const quietRemaining = wait - sinceCall;

    // CHANGE 7: Respect whichever deadline arrives first.
    return hasMaxWait
      ? Math.min(quietRemaining, maxWait - sinceInvoke)
      : quietRemaining;
  }

  function leadingEdge(time) {
    lastInvokeTime = time;
    // CHANGE 8: Start timer before invoking user callback.
    // A reentrant call will observe an active timer.
    timerId = setTimeout(timerExpired, wait);
    return leading ? invokeFunc(time) : result;
  }

  function trailingEdge(time) {
    timerId = undefined;

    // CHANGE 9: Only invoke when a NEW pending call exists.
    // A single leading call does not execute again at trailing edge.
    if (trailing && lastArgs !== undefined) {
      return invokeFunc(time);
    }

    lastArgs = undefined;
    lastThis = undefined;
    return result;
  }

  function timerExpired() {
    const time = clock();
    if (shouldInvoke(time)) return trailingEdge(time);

    // CHANGE 10: Reschedule for the earlier of quiet time or maxWait.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function debounced(...args) {
    const time = clock();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(time);
      }

      if (hasMaxWait) {
        // CHANGE 11: Under sustained calls, force eligible invocation.
        clearTimeout(timerId);
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(time);
      }
    }

    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }

    // CHANGE 12: Return the last completed invocation result.
    return result;
  }

  debounced.cancel = () => {
    // CHANGE 13: Cancel timer and reset burst timestamps/state.
    clearTimeout(timerId);
    timerId = undefined;
    lastArgs = undefined;
    lastThis = undefined;
    lastCallTime = undefined;
    lastInvokeTime = 0;
  };

  debounced.flush = () => {
    // CHANGE 14: Return last result if nothing is pending.
    if (timerId === undefined) return result;

    clearTimeout(timerId);
    return trailingEdge(clock());
  };

  return debounced;
}
```

### Why these changes matter

| Change | Reason |
|---|---|
| Input validation | Detect wrong API usage immediately. |
| `leading` / `trailing` | Control beginning/end of burst. |
| `maxWait` | Bound postponement during continuous activity. |
| `performance.now()` | Monotonic elapsed-time measurement. |
| `lastCallTime` / `lastInvokeTime` | Distinguish quiet-time deadline from maximum-wait deadline. |
| Snapshot and clear before `fn.apply` | Avoid stale-reference retention on throw and old cleanup erasing reentrant state. |
| `result` | Preserve most recent callback return value. |
| `cancel()` | Discard pending invocation and reset scheduling state. |
| `flush()` | Execute eligible pending trailing work immediately, or return last result. |

### Important limits of this reference implementation

- **Not real-time:** `maxWait` cannot execute while the JavaScript thread is blocked.
- **Async callbacks:** If `fn` returns a Promise, the wrapper returns the last Promise; it does not make every call await its own future invocation or cancel ongoing requests.
- **Errors:** Synchronous callback errors propagate from whichever path invokes the callback; timer callback errors surface asynchronously. Saved argument/receiver references have already been cleared.
- **`leading: false, trailing: false`:** No callbacks execute, even though timers may be scheduled.
- **Clock:** Requires `performance.now()`; use an explicit monotonic-clock adapter for environments without it.
- **`wait = 0`:** Execution is still governed by JavaScript task scheduling and option semantics.
- **API contract:** This is a useful study reference, not a substitute for production testing or a well-maintained library when reliability is critical.

## 12. How the configurable implementation works

### State machine

```text
                 first call
Idle --------------------------------> Active timer
  |                                       |
  | leading=true: invoke now              | more calls
  |                                       v
  |                              replace lastArgs/lastThis
  |                                       |
  |                      +----------------+----------------+
  |                      |                                 |
  |                 quiet wait met                    maxWait met
  |                      |                                 |
  |                      v                                 v
  +<------ trailingEdge: invoke if pending <---- forced invocation
```

### `shouldInvoke(time)`

Returns `true` when the wrapper has never been called, the quiet interval has elapsed, or the maximum-wait interval has elapsed. It is a **decision function**: it does not invoke `fn` by itself.

### `remainingWait(time)`

Calculates the earlier remaining deadline:

```javascript
Math.min(
  wait - (time - lastCallTime),
  maxWait - (time - lastInvokeTime)
);
```

If `maxWait` is absent, only the quiet-period deadline matters.

### `leadingEdge(time)`

Starts a timer and, if enabled, invokes immediately. Starting the timer **before** calling `fn` matters if `fn` synchronously calls the wrapper again.

### `trailingEdge(time)`

Marks the timer inactive and invokes only if `trailing` is enabled **and** a newer call has left pending arguments. This prevents duplicate execution for a single leading call.

### `timerExpired()`

Checks whether either deadline is satisfied. If not, reschedules the timer for the remaining duration. This allows one timer to enforce both quiet-period and maximum-wait behavior.

### `debounced()`

Captures the latest call data, checks whether invocation is due, invokes immediately when appropriate, or ensures a timer exists. It returns the most recent result, not a Promise for each individual call.

## 13. Vitest test cases

Use `vi.useFakeTimers()` and `vi.setSystemTime(...)` for the **original** `Date.now()`-based code. For `debounceAdvanced`, Vitest fake timers also mock `performance.now()` in typical configurations; verify your project's Vitest version and fake-timer settings.

```javascript
import { describe, it, expect, vi, afterEach } from "vitest";
// Import debounce (original) and debounceAdvanced (configurable)
// from your actual source module.

afterEach(() => {
  vi.useRealTimers();
});

describe("original debounce", () => {
  it("runs only latest trailing call", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const wrapped = debounce(fn, 100);

    wrapped("A");
    vi.advanceTimersByTime(20);
    wrapped("B");
    vi.advanceTimersByTime(20);
    wrapped("C");

    vi.advanceTimersByTime(99);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("C");
  });

  it("cancel discards pending invocation", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const wrapped = debounce(fn, 100);
    wrapped("A");
    wrapped.cancel();
    vi.runAllTimers();
    expect(fn).not.toHaveBeenCalled();
  });

  it("flush invokes pending work once", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const wrapped = debounce(fn, 100);
    wrapped("B");
    wrapped.flush();
    wrapped.flush();
    vi.runAllTimers();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe("advanced debounce", () => {
  it("leading+trailing invokes once for a single call", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const wrapped = debounceAdvanced(fn, 100, {
      leading: true,
      trailing: true
    });
    wrapped("A");
    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("A");
  });

  it("leading+trailing invokes latest second call", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const wrapped = debounceAdvanced(fn, 100, {
      leading: true,
      trailing: true
    });
    wrapped("A");
    vi.advanceTimersByTime(20);
    wrapped("B");
    vi.advanceTimersByTime(100);
    expect(fn.mock.calls).toEqual([["A"], ["B"]]);
  });

  it("maxWait prevents indefinite postponement", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const wrapped = debounceAdvanced(fn, 100, {
      leading: false,
      trailing: true,
      maxWait: 250
    });
    for (let i = 0; i < 5; i++) {
      wrapped(i);
      vi.advanceTimersByTime(60);
    }
    expect(fn).toHaveBeenCalled();
  });

  it("preserves this and latest arguments", () => {
    vi.useFakeTimers();
    const fn = vi.fn(function (x) { return this.base + x; });
    const wrapped = debounceAdvanced(fn, 100);
    const obj = { base: 10, wrapped };
    obj.wrapped(2);
    obj.wrapped(5);
    vi.advanceTimersByTime(100);
    expect(fn).toHaveReturnedWith(15);
  });

  it("clears stale references before a throwing callback", () => {
    vi.useFakeTimers();
    const fn = vi.fn(() => { throw new Error("boom"); });
    const wrapped = debounceAdvanced(fn, 100);
    wrapped({ large: true });
    expect(() => vi.advanceTimersByTime(100)).toThrow("boom");
    // Internal memory cannot be directly asserted; test behavior after recovery.
    wrapped.cancel();
  });
});
```

**Additional tests before shipping:** repeated maxWait cycles, reentrant leading and trailing callbacks, cancellation followed by a new burst, `flush()` during leading-only mode, callback throws during leading and trailing, delayed event-loop execution, invalid options, `wait=0`, detached receiver, Promise return values, and timer cleanup on component unmount.

## 14. Vue, React, NestJS and Node applications

### Vue 3 / Pinia — search input

```javascript
import { ref, onBeforeUnmount } from "vue";

const query = ref("");
const search = debounceAdvanced((value) => {
  // Call a Pinia action or search service here.
  console.log("Search:", value);
}, 300, { trailing: true });

function onQueryChanged(value) {
  query.value = value;
  search(value);
}

onBeforeUnmount(() => search.cancel());
```

**Production note:** Debouncing does not prevent stale network responses from arriving out of order. Use `AbortController` or request sequence IDs in the store.

### React — stable wrapper across renders

```javascript
import { useMemo, useEffect } from "react";

function useDebouncedSearch(onSearch) {
  // Caller should supply a stable onSearch (e.g., useCallback),
  // or use a ref for the latest callback if it changes every render.
  const search = useMemo(
    () => debounceAdvanced(onSearch, 300),
    [onSearch]
  );

  useEffect(() => () => search.cancel(), [search]);
  return search;
}
```

If `onSearch` changes each render, this example recreates the wrapper and resets debounce state; a ref-based latest-callback pattern may be preferable.

### NestJS — delayed background updates (in-process only)

```javascript
const scheduleIndexRefresh = debounceAdvanced(
  async () => { /* refresh an index */ },
  500,
  { trailing: true, maxWait: 2000 }
);
```

**Production note:** An in-memory timer is not durable across restarts and does not coordinate across multiple server instances. For guaranteed jobs use a queue and persistent storage; debounce is not a replacement for rate limiting.

### Node.js / Express — coalescing local work

```javascript
const scheduleLocalCacheRebuild = debounceAdvanced(
  () => { /* rebuild local cache */ },
  200,
  { leading: false, trailing: true, maxWait: 1000 }
);
```

For per-user or per-resource coalescing, use **separate wrapper instances keyed by resource**, with an eviction/cleanup policy. A single global wrapper can accidentally merge unrelated users' work.

## 15. Complexity, API contracts and interview traps

| Operation | Approximate overhead | Memory |
|---|---|---|
| Create wrapper | O(1) | O(1) closure state |
| Call wrapper with k arguments | O(k) to collect rest arguments, plus O(1) scheduling operations | O(k) latest arguments |
| Cancel | O(1) | Releases pending references |
| Flush | O(1) scheduling overhead **plus callback cost** | Depends on callback |

**Interview traps:**

1. `clearTimeout(timerId)` does **not** assign `null` to the variable.
2. `apply` invokes now; `bind` creates a new bound function.
3. Detached methods can lose their `this` receiver.
4. A single leading call should not automatically cause a duplicate trailing call.
5. `maxWait` must work repeatedly under sustained calls, not just once.
6. Cleanup **after** calling user code can be skipped on exceptions and can destroy reentrant state.
7. Timer callbacks cannot run while synchronous JavaScript blocks the event loop.
8. `cancel()` does not abort already-started async work.
9. A wrapper's last result is not necessarily the result of the current call.
10. `flush()` semantics must be documented; in the original, it does nothing when no timer is pending.

### Senior-level answer (concise)

> Debounce is a closure-based scheduling pattern. Each call captures its latest arguments and receiver, cancels the previous timeout, and schedules a new trailing callback. The callback executes only after the quiet period. `cancel` discards pending work; `flush` invokes pending work immediately. Production concerns include preserving `this`, exception-safe cleanup, reentrancy, and stale async responses.

### Staff-level extension

> A production API needs explicit leading/trailing semantics, bounded postponement with `maxWait`, well-defined result and flush behavior, and testable timer state. A timestamp-based state machine can enforce both the quiet deadline and maximum-wait deadline. It should not be confused with server-side rate limiting, durable queues, or cancellation of already-running asynchronous operations.

## 16. Personal assessment and revision sheet

### Recorded assessment (original only)

| Dimension | Recorded result |
|---|---|
| First-attempt reconstruction | ~96% |
| Corrected reconstruction | Pending confirmation of capitalization fix (`LastThis` → `lastThis`) |
| Original MCQs | 3/4 valid (one flawed MCQ excluded) |
| Reinforcement | 3/3 |
| Timer-handle comprehension | 1/1 |
| Independent verbal explanation | ~90% |
| Overall original mastery | ~92% provisional coaching estimate |
| `leading` / `trailing` / `maxWait` modification | **PENDING reconstruction, MCQs, verbal explanation and mastery assessment** |

### Specific mistakes and lessons

- **Capitalization:** `LastThis` is not the declared `lastThis` variable; JavaScript is case-sensitive.
- **Detached `this`:** In strict mode, `this.name` on `undefined` throws rather than printing `undefined`.
- **Reentrancy:** A callback can call its own wrapper; old cleanup can wipe new pending arguments.
- **`flush()` guard:** `timerId === null` means return without invoking in the original implementation.
- **Timer handle:** `clearTimeout(handle)` cancels the timer but does not mutate the handle variable.

### 5–10 minute active-recall routine

1. **Reconstruct** the original implementation from memory, including `cancel()` and `flush()`.
2. **Trace** A at 0, B at 20, C at 40, with `wait=100`; explain every change to `timerId`, `lastArgs`, and `lastThis`.
3. **Explain** why leading+trailing with one call must not invoke twice, how `maxWait` handles continuous calls, and how clearing state **before** invoking protects against reentrancy.

### Completion checklist

- [x] Original code explanation
- [x] First independent reconstruction
- [x] Original MCQ round and targeted reinforcement
- [x] Original verbal explanation
- [ ] Confirm minor capitalization correction
- [ ] Independently reconstruct configurable variation
- [ ] Test leading/trailing/maxWait edge cases
- [ ] Complete modification MCQs and verbal assessment
- [ ] Complete framework transfer assessment

---

**Revision reminder:** When returning to **Problem 21**, explicitly mention: **The leading/trailing/maxWait modifications are still pending mastery and assessment.**
