import { expect, describe, it } from "@jest/globals";
import Pipe from "./pipe";

describe("Test Synchronous Pipe", () => {
  const ERROR = 400;

  const positive = (x: number) => x > 0;
  const negate = (x: boolean) => !x;
  const multiplyBy = (x: number) => (y: number) => x * y;

  it("Unary", () => {
    expect(Pipe(positive)(10)).toBe(true);
  });

  it("Compose functions", () => {
    expect(Pipe(positive).o(negate)(10)).toBe(false);
  });

  it("Compose pipes", () => {
    // Area
    const BASE = 10;
    const HEIGHT = 5;

    expect(Pipe(Pipe(multiplyBy(0.5))).o(multiplyBy(HEIGHT))(BASE)).toBe(25);
  });

  it("Terminate entry", () => {
    expect(Pipe((_, reject) => reject(ERROR)).o(positive)(1)).toBe(ERROR);
  });

  it("Terminate chain", () => {
    expect(
      Pipe(positive)
        .o((_, reject) => reject(ERROR))
        .o(negate)(-1)
    ).toBe(ERROR);
  });

  it("Terminate end of chain", () => {
    expect(
      Pipe(positive)
        .o(negate)
        .o((_, reject) => reject(ERROR))(10)
    ).toBe(ERROR);
  });

  it("Type infer", () => {
    expect(Pipe(multiplyBy(5)).o((x) => x + 5)(1)).toBe(10);
  });
});

describe("Test Asynchronous Pipe", () => {
  const ERROR = 400;

  const multiplyBy = (x: number) => (y: number) => x * y;
  const asyncMultiplyBy = (x: number) => async (y: number) => x * y;

  it("Async entry", async () => {
    await expect(Pipe(asyncMultiplyBy(5))(4)).resolves.toBe(20);
  });

  it("Async composite pipes", async () => {
    await expect(
      Pipe(asyncMultiplyBy(5)).o(Pipe(asyncMultiplyBy(5)))(4)
    ).resolves.toBe(100);
  });

  it("Mix chain", async () => {
    await expect(Pipe(multiplyBy(5)).o(asyncMultiplyBy(5))(4)).resolves.toBe(
      100
    );

    await expect(Pipe(asyncMultiplyBy(5)).o(multiplyBy(5))(4)).resolves.toBe(
      100
    );
  });

  it("Reject entry", async () => {
    await expect(Pipe(async (_, reject) => reject(ERROR))(1)).resolves.toBe(
      ERROR
    );
  });

  it("Reject chain", async () => {
    await expect(
      Pipe(asyncMultiplyBy(5)).o(async (_, reject) => reject(ERROR))(1)
    ).resolves.toBe(ERROR);
  });
});
