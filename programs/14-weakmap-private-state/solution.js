// Reference implementation. See README.md for provenance and caveats.
const privateState = new WeakMap();
export class Counter {
  constructor() { privateState.set(this, { count: 0 }); }
  increment() { privateState.get(this).count++; }
  getValue() { return privateState.get(this).count; }
}
export const solve = Counter;
