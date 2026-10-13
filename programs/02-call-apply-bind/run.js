import { solve } from "./solution.js";
import { pathToFileURL } from "node:url";
const number = Number(import.meta.dirname.split("/").at(-1).slice(0, 2));
const examples = {
  1: () => { const f = solve((x) => x * 2); console.log(f(3), f(10)); },
  2: () => console.log(solve(function(x) { return this.value + x; }, {value: 2}, 3)),
  3: () => console.log(solve((a,b,c)=>a+b+c)(1)(2)(3)),
  4: () => console.log(solve(x=>x+1,x=>x*2)(3)),
  6: () => { const f=solve(x=>x*x); console.log(f(4), f(4)); },
  8: () => console.log(solve([1,2,3],x=>x*2)),
  14: () => { const c=new (solve)(); c.increment(); console.log(c.getValue()); },
  15: () => console.log([...solve(1,4)])
};
examples[number]?.();
