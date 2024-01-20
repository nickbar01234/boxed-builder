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

  return builder as IBuilder<T>;
};

const StagedBuilder = <T, K extends Array<keyof T>>(clazz: Class<T>) => {
  return Builder(clazz) as unknown as IStagedBuilder<T, K>;
};

export default Builder;
export { StagedBuilder };
