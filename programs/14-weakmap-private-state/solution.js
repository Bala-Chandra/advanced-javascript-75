// Reference implementation. See README.md for provenance and caveats.
const privateState = new WeakMap();


export class Counter {
  constructor() {
    privateState.set(this, { count: 0 });
  }

  increment() {
    privateState.get(this).count++;
  }

  get value() {
    return privateState.get(this).count;
  }
}
export const solve = Counter;
