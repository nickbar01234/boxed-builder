import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import Builder from "./builder";
import { Property } from "./decorator";

describe("Test Builder", () => {
  class Student {
    @Property
    name!: string;

    @Property
    location!: string;

    @Property
    age: undefined | number;
  }

  class University {
    @Property
    state!: string;

    @Property
    students!: Student[];
  }

  const mockValidator = jest.fn((x: any) => {});

  beforeEach(() => {
    mockValidator.mockClear();
  });

  it("Set and get value", () => {
    expect(Builder(Student).name("nickbar01234").name()).toBe("nickbar01234");
  });

  it("Set and validate", () => {
    Builder(Student).name("nickbar01234", mockValidator);
    expect(mockValidator).toBeCalledTimes(1);
  });

  it("Build partial from", () => {
    expect(
      Builder(Student)
        .from({ name: "nickbar01234", location: "Vietnam" })
        .build()
    ).toStrictEqual({
      name: "nickbar01234",
      location: "Vietnam",
      age: undefined,
    });
  });

  it("Build full from", () => {
    expect(
      Builder(University).from({ state: "MA", students: [] }).build()
    ).toStrictEqual({ state: "MA", students: [] });
  });
});
