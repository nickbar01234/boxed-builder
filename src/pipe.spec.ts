import { expect, describe, it } from "@jest/globals";
import Pipe from "./pipe";

describe("Test Synchronous Pipe", () => {
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

  it("Varadic input", () => {
    expect(Pipe((x: number, y: number) => x + y).o(positive)(10, 20)).toBe(
      true
    );
  });
});

describe("Test Asynchronous Pipe", () => {
  const add = (x: number, y: number) => x + y;
  const asyncAdd = async (x: number, y: number) => Promise.resolve(add(x, y));
  const toNList = (length: number) => (elem: number) =>
    Array(length).fill(elem);
  const asyncSum = async (xs: number[]) => xs.reduce(add, 0);

  it("Async entry", async () => {
    await expect(Pipe(asyncAdd)(1, 2)).resolves.toBe(3);
  });

  it("Async pipes", async () => {
    await expect(
      Pipe(asyncAdd).o(Pipe((x: number) => asyncAdd(x, 3)))(1, 2)
    ).resolves.toBe(6);
  });

  it("Awaited entry", async () => {
    await expect(Pipe(asyncAdd).o(toNList(3))(1, 1)).resolves.toStrictEqual([
      2, 2, 2,
    ]);
  });

  it("Awaited chain", async () => {
    await expect(Pipe(add).o(toNList(3)).o(Pipe(asyncSum))(1, 1)).resolves.toBe(
      6
    );
  });
});
