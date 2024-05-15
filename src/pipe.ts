import { IPipe, PipeFns, Unary, VaradicUnary } from "./type";
import { isPromise } from "./utils";

const sync = async <T extends Unary[]>(fns: T, output: any) => {
  for (const fn of fns) {
    output = await fn(output);
  }
  return output;
};

const _Pipe = <T extends PipeFns>(fns: T) => {
  const iter = (fns: Unary[], output: any) => {
    for (const [idx, fn] of fns.entries()) {
      if (isPromise(fn)) {
        return sync(fns.slice(idx), output);
      }
      output = fn(output);
    }
    return output;
  };

  const pipe = (...t: any[]) => {
    let output = fns[0](...t);
    let rest = fns.slice(1);
    return isPromise(output)
      ? output.then((out) => iter(rest, out))
      : iter(rest, output);
  };

  pipe.o = (fn: Unary) => _Pipe([...fns, fn]);

  return pipe as IPipe<T>;
};

const Pipe = <T extends VaradicUnary>(fn: T) => _Pipe([fn]);

export default Pipe;
