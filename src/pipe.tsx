import { IPipe, Unary } from "./type";

const _Pipe = <T extends Unary[]>(fns: T) => {
  const pipe = (t: any) => {
    let output = t;
    for (const fn of fns) {
      output = fn(output);
    }
    return output;
  };

  pipe.o = (fn: Unary) => _Pipe([...fns, fn]);

  return pipe as IPipe<T>;
};

const Pipe = _Pipe<[]>([]);

export default Pipe;
