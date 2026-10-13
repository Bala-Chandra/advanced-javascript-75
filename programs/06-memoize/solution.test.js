import { describe, it, expect } from "vitest";
import { solve } from "./solution.js";
describe("reference implementation", () => {
  it("exports an implementation", () => { expect(typeof solve).toBe("function"); });
});
