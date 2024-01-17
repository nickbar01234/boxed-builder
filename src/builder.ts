import { IBuilder } from "./type";

type Class<T> = new () => T;

const Builder = <T>(clazz: Class<T>) => {
  const template = new clazz();

  let shape: Record<string, unknown> = {};
  const builder: Record<string, unknown> = {};

  builder["from"] = (other: any) => {
    shape = Object.assign(shape, other);
    return builder;
  };

  builder["build"] = () => shape;

  Object.getOwnPropertyNames(template).forEach((property) => {
    builder[property] = (...args: unknown[]) => {
      if (args.length === 0) {
        return shape[property];
      }

      shape[property] = args[0];
      if (typeof args[1] === "function") {
        args[1].call(shape);
      }

      return builder;
    };
  });

  return builder as IBuilder<T>;
};

export default Builder;
