export type Describe<T> = Pick<T, keyof T>;

type BuilderSetter<T, S> = {
  [k in keyof T & string as `set${Capitalize<k>}`]: (
    arg: T[k] | ((shape: S) => T[k]),
    validate?: (shape: Record<k, T[k]> & S) => void
  ) => Omit<IBuilder<T, Record<k, T[k]> & S>, "from">;
};

type Getter<T> = {
  [k in keyof T & string as `get${Capitalize<k>}`]: () => T[k];
};

/**
 * @link https://stackoverflow.com/questions/68257379/how-to-omit-optional-properties-from-type - Pick non-optional field
 */
type RequiredProperties<T> = {
  [k in keyof T as T[k] extends Required<T>[k] ? k : never]: T[k];
};

type UndefinedProperties<T> = {
  [k in keyof T]-?: undefined extends T[k] ? k : never;
}[keyof T];

/**
 * @link https://stackoverflow.com/questions/56146819/typescript-how-to-transfrom-undefined-property-to-optional-property Transforming union with undefined to optional field
 */
type Optional<T> = Partial<Pick<T, UndefinedProperties<T>>> &
  Pick<T, Exclude<keyof T, UndefinedProperties<T>>>;

export type IBuilder<T, S extends Record<string, any> = {}> = {
  from: <U extends Partial<T>>(
    other: U
  ) => Omit<IBuilder<T, RequiredProperties<U>>, "from">;
} & BuilderSetter<T, S> &
  Getter<S> &
  (S extends RequiredProperties<Optional<T>> ? { build: () => T } : {});

type Rest<T extends unknown[]> = T extends [unknown, ...infer R] ? R : [];

// Extract out all values in K that's in T
type Filter<T, K extends any[]> = K extends []
  ? []
  : K[0] extends keyof T
  ? Filter<T, Rest<K>>
  : [K[0], ...Rest<K>];

type StagedBuilderSetter<T, K extends Array<keyof T>, S> = Record<
  `set${Capitalize<K[0] & string>}`,
  (
    arg: T[K[0]] | ((shape: S) => T[K[0]]),
    validate?: (shape: Record<K[0], T[K[0]]> & S) => void
  ) => Omit<IStagedBuilder<T, Rest<K>, Record<K[0], T[K[0]]> & S>, "from">
>;

type _IStagedBuilder<
  T,
  K extends Array<keyof T>,
  S extends Record<string, any>
> = K extends []
  ? Omit<IBuilder<T, S>, "from">
  : {
      from: <U extends Partial<T>>(
        other: U
      ) => Omit<IStagedBuilder<T, Filter<T, K>, RequiredProperties<U>>, "from">;
    } & Getter<S> &
      StagedBuilderSetter<T, K, S>;

/**
 * Need a wrapper over _IStagedBuilder in the case that client passes an empty
 * stage array, in which case we don't need to omit from.
 */
export type IStagedBuilder<
  T,
  K extends Array<keyof T> = [],
  S extends Record<string, any> = {}
> = K extends [] ? IBuilder<T, S> : _IStagedBuilder<T, K, S>;

type ForwardBuilderSetter<T, S> = {
  [k in keyof T & string as `set${Capitalize<k>}`]: (
    arg: T[k] | ((shape: S) => T[k]),
    validate?: (shape: Record<k, T[k]> & S) => void
  ) => Omit<IForwardBuilder<Omit<T, k>, Record<k, T[k]> & S>, "from">;
};

export type IForwardBuilder<T, S extends Record<string, any> = {}> = {
  from: <U extends Partial<T>>(
    other: U
  ) => Omit<IBuilder<Omit<T, keyof U>, RequiredProperties<U>>, "from">;
} & ForwardBuilderSetter<T, S> &
  Getter<S> &
  (S extends RequiredProperties<Optional<T>> ? { build: () => T } : {});

export type Terminate = (output?: any) => never;

export type Unary<T = any, U = any> = (t: T, terminate: Terminate) => U;

export type PipeFns = [Unary, ...Unary[]];

type PipeOutput<T extends PipeFns> = T extends readonly [
  ...Unary[],
  infer Output extends Unary
]
  ? Awaited<ReturnType<Output>>
  : never;

type HasPromises<T extends Unary[]> = T extends []
  ? false
  : ReturnType<T[0]> extends Promise<infer U>
  ? true
  : HasPromises<Rest<T>>;

export type IPipe<T extends PipeFns> = {
  o: <U extends Unary<PipeOutput<T>>>(fn: U) => IPipe<[...T, U]>;
} & ((
  t: Parameters<T[0]>[0]
) => HasPromises<T> extends true ? Promise<PipeOutput<T>> : PipeOutput<T>);
