import { expect, describe, it } from "@jest/globals";
import Pipe from "./pipe";

describe("Test Synchronous Pipe", () => {
  const positive = (x: number) => x > 0;
  const negate = (x: boolean) => !x;
  const multiplyBy = (x: number) => (y: number) => x * y;

  it("Unary", () => {
    expect(Pipe.o(positive)(10)).toBe(true);
  });

  it("Compose functions", () => {
    expect(Pipe.o(positive).o(negate)(10)).toBe(false);
  });

  it("Compose pipes", () => {
    // Area
    const BASE = 10;
    const HEIGHT = 5;

    expect(Pipe.o(Pipe.o(multiplyBy(0.5))).o(multiplyBy(HEIGHT))(BASE)).toBe(
      25
    );
  });
});
