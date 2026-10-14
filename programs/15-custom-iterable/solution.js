// Reference implementation. See README.md for provenance and caveats.
export function range(start, end) {
  return {
    [Symbol.iterator]() {
      let current = start;
      return {
        next() {
          if (current <= end) {
            return {
              value: current++,
              done: false,
            };
          }

          return {
            value: undefined,
            done: true,
          };
        },
      };
    },
  };
}
export const solve = range;
