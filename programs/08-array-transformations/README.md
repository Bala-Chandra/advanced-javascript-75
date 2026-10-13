# Problem 08 — Array Transformations

**Definition:** Native map semantics: callbacks, index, thisArg, sparse array holes.

**Reference status:** Original code reproduced from the visible conversation.

## Expected behavior and mental model
Native map semantics: callbacks, index, thisArg, sparse array holes. Explain the input, return value, closure/state changes, and relevant JavaScript semantics.

## Staff-engineer interview question
Why does new Array(length) matter, and why skip !(i in array)?

## Variations / follow-up programs
myFilter; myReduce; mySome; myEvery; generic transform engine; sparse arrays; mutation during iteration.. Implement each as a separate file under `variations/` when you reach it.

## Debug this problem (VS Code)
1. Open `solution.js` and put a breakpoint inside the function (not just on the export line).
2. Open `run.js`, select **Run and Debug → Debug current program file**, then press **F5**.
3. Use **F11** to step into the function, **F10** to step over, and inspect **Variables**, **Watch**, and **Call Stack**.
4. Watch each callback invocation and state mutation. Use **Shift+F11** to return to the caller.
5. Run `npm run run -- 8` from the project root; use `npm run test:one -- 8` to run tests.
6. When ready, implement `practice.js` yourself and compare results with `solution.js`.

## Explain it back
- Predict the output before running.
- Trace execution line by line.
- Name two edge cases and the time/space complexity.
- Explain one real-world Vue / Node.js use case.

## Notes
Add your own explanation, mistakes, and revised intuition here.
