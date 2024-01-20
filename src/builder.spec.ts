import { describe, expect, it } from "@jest/globals";
import Boxed from "./builder";
import { Property } from "./decorator";
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

describe("Test Builder", () => {
  it("Set and get value", () => {
    expect(Boxed(Student).Builder().setName("nickbar01234").getName()).toBe(
      "nickbar01234"
    );
  });

  it("Set and validate", () => {
    expect(() =>
      Boxed(Student)
        .Builder()
        .setAge(-1, (shape) => {
          if (shape.age == undefined || shape.age < 0) {
            throw new Error();
          }
        })
    ).toThrowError();
  });

  it("Set value with function", () => {
    expect(
      Boxed(Student)
        .Builder()
        .setName("nickbar01234")
        .setLocation((shape) => (shape.name === "nickbar01234" ? "Tufts" : ""))
        .getLocation()
    ).toBe("Tufts");
  });

  it("Build partial from", () => {
    expect(
      Boxed(Student)
        .Builder()
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
      Boxed(University).Builder().from({ state: "MA", students: [] }).build()
    ).toStrictEqual({ state: "MA", students: [] });
  });
});

describe("Test Staged Builder", () => {
  it("Build all stages", () => {
    expect(
      Boxed(University)
        .StagedBuilder<["state", "students"]>()
        .setState("MA")
        .setStudents([])
        .build()
    ).toStrictEqual({
      state: "MA",
      students: [],
    });
  });
});
