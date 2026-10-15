// YOUR WORKSPACE: implement this without looking at solution.js.
// Keep your implementation independent of the reference.
const privateState = new WeakMap();

export class counter {
  constructor (){
    privateState.set(this, { count: 0 });
  }

  increment(){
    privateState.get(this).count++;
  }
  get value(){
    return privateState.get(this).count;
  }
}
