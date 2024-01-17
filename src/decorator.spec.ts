import { describe, expect, it } from "@jest/globals";
import { Property } from "./decorator";

describe("Test Property Initializer", () => {
  const student = new (class {
    @Property
    name!: string;

    @Property
    age!: number;

    year!: number;
  })();

  it("Decorator initalize value", () => {
    expect(Object.getOwnPropertyNames(student)).toEqual(
      expect.arrayContaining(["name", "age"])
    );
  });
});
