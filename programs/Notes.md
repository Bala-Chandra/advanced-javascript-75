Get all own-property keys
`const keysA = Reflect.ownKeys(a);`
`const keysB = Reflect.ownKeys(b);`


`Reflect.ownKeys()` returns an array of an object's own property keys, including:
- Enumerable string keys
- Non-enumerable string keys
- Symbol keys
Example:
`const symbol = Symbol("id");`

`const obj = {
  name: "Sam",
  [symbol]: 100
};`

`Reflect.ownKeys(obj);`
// ["name", Symbol(id)]


Unlike `Object.keys()`, it includes non-enumerable and Symbol keys.
However, it does not return inherited keys.
***********************************************************************************************
`Object.is(a, b)`
`if (Object.is(a, b)) return true;`


First, the function checks whether the two values are identical under `Object.is()` semantics.
a	b	Result
10	10	true
"hello"	"hello"	true
NaN	NaN	true
0	-0	false
Same object reference	Same reference	true
Separate objects with same properties	Separate references	false
If `Object.is()` returns true, there is no need for further comparison.
**************************************************************************************************