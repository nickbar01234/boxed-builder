export type Describe<T> = Pick<T, keyof T>;

type Setter<T, S> = {
  [k in keyof Describe<T>]: (
    arg: Describe<T>[k],
    validate?: (shape: S) => void
  ) => Omit<IBuilder<T, Record<k, Describe<T>[k]> & S>, "from">;
};

type Getter<T> = {
  [k in keyof Describe<T>]: () => Describe<T>[k];
};

type Property<T, S> = Setter<T, S> & Getter<T>;

export type IBuilder<T, S = Record<string, unknown>> = {
  from: <U extends Partial<T>>(other: U) => Property<T, U>;
} & Property<T, S> &
  (S extends T ? { build: () => T } : {});
