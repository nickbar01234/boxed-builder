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

export type IBuilder<T, S = {}> = {
  from: <U extends Partial<T>>(other: U) => Omit<IBuilder<T, U>, "from">;
} & Setter<T, S> &
  Getter<T> &
  (S extends RequiredProperties<Optional<T>> ? { build: () => T } : {});
