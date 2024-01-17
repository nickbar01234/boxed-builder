import { describe, expect, it } from "@jest/globals";
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

  it("Set and get value", () => {
    expect(Builder(Student).name("nickbar01234").name()).toBe("nickbar01234");
  });

  it("Set and validate", () => {
    expect(() =>
      Builder(Student).age(-1, (shape) => {
        if (shape.age == undefined || shape.age < 0) {
          throw new Error();
        }
      })
    ).toThrowError();
  });

  it("Set value with function", () => {
    expect(
      Builder(Student)
        .name("nickbar01234")
        .location((shape) => (shape.name === "nickbar01234" ? "Tufts" : ""))
        .location()
    ).toBe("Tufts");
  });

  it("Build partial from", () => {
    expect(
      Builder(Student)
        .from({ name: "nickbar01234", location: "Vietnam" })
        .build()
    ).toEqual({
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