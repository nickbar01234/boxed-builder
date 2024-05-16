import { describe, expect, it } from "@jest/globals";
import Builder from "./builder";
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
    expect(Builder(Student).Builder().setName("nickbar01234").getName()).toBe(
      "nickbar01234"
    );
  });

  it("Set and validate", () => {
    expect(() =>
      Builder(Student)
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
      Builder(Student)
        .Builder()
        .setName("nickbar01234")
        .setLocation((shape) => (shape.name === "nickbar01234" ? "Tufts" : ""))
        .getLocation()
    ).toBe("Tufts");
  });

  it("Build partial from", () => {
    expect(
      Builder(Student)
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
      Builder(University).Builder().from({ state: "MA", students: [] }).build()
    ).toStrictEqual({ state: "MA", students: [] });
  });
});

describe("Test Staged Builder", () => {
  it("Build all stages", () => {
    expect(
      Builder(University)
        .StagedBuilder<["state", "students"]>()
        .setState("MA")
        .setStudents([])
        .build()
    ).toStrictEqual({
      state: "MA",
      students: [],
    });
  });

  it("Build partial stages", () => {
    expect(
      Builder(Student)
        .StagedBuilder<["name", "location"]>()
        .setName("nickbar01234")
        .setLocation("MA")
        .build()
    ).toStrictEqual({
      name: "nickbar01234",
      location: "MA",
    });
  });
});

describe("Test Forward Builder", () => {
  it("Build all properties", () => {
    expect(
      Builder(Student)
        .ForwardBuilder()
        .setLocation("MA")
        .setName("nickbar01234")
        .build()
    ).toStrictEqual({ name: "nickbar01234", location: "MA" });
  });
});
