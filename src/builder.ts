import { IBuilder, IStagedBuilder } from "./type";

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
    const key = property.charAt(0).toUpperCase() + property.slice(1);
    builder[`get${key}`] = () => {
      return shape[property];
    };

    builder[`set${key}`] = (arg: any, validate?: Function) => {
      shape[property] = typeof arg === "function" ? arg.call(arg, shape) : arg;
      if (validate != undefined) {
        validate.call(validate, shape);
      }
      return builder;
    };
  });

  return builder;
};

const Boxed = <T>(clazz: Class<T>) => {
  return {
    Builder: () => Builder(clazz) as IBuilder<T>,
    StagedBuilder: <K extends Array<keyof T>>() =>
      Builder(clazz) as IStagedBuilder<T, K>,
  };
};

export default Boxed;
