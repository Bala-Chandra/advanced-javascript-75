# Problem 15 — Custom Iterable

**Definition:** Iterator protocol, iterable protocol, independent iteration state.

**Reference status:** Original code reproduced from the visible conversation.

## Expected behavior and mental model
Iterator protocol, iterable protocol, independent iteration state. Explain the input, return value, closure/state changes, and relevant JavaScript semantics.

## Staff-engineer interview question
What does spread call, and why does each iteration get its own current?

## Variations / follow-up programs
Reverse range; step argument; generator equivalent; early return(); infinite sequence.. Implement each as a separate file under `variations/` when you reach it.

## Debug this problem (VS Code)
1. Open `solution.js` and put a breakpoint inside the function (not just on the export line).
2. Open `run.js`, select **Run and Debug → Debug current program file**, then press **F5**.
3. Use **F11** to step into the function, **F10** to step over, and inspect **Variables**, **Watch**, and **Call Stack**.
4. Watch each callback invocation and state mutation. Use **Shift+F11** to return to the caller.
5. Run `npm run run -- 15` from the project root; use `npm run test:one -- 15` to run tests.
6. When ready, implement `practice.js` yourself and compare results with `solution.js`.

## Explain it back
- Predict the output before running.
- Trace execution line by line.
- Name two edge cases and the time/space complexity.
- Explain one real-world Vue / Node.js use case.

## Notes
Add your own explanation, mistakes, and revised intuition here.
