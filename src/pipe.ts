import { IPipe, PipeFns, Terminate, Unary } from "./type";
import { isPromise } from "./utils";

const _Pipe = <T extends PipeFns>(fns: T) => {
  const pipe = (arg: any) => {
    let output = arg;
    // Pad pipe if the reject comes at the last index
    const paddedPipes = [...fns, (x: any) => x];
    let terminated = false;
    let terminatedReason: any = undefined;

    const terminate: Terminate = (output?: any) => {
      terminated = true;
      terminatedReason = output;
      return undefined as never;
    };

    const resolveAsync = async <T extends Unary[]>(
      fns: T,
      output: Promise<any>
    ) => {
      for (const fn of fns) {
        if (terminated) {
          return Promise.resolve(terminatedReason);
        }
        output = isPromise(output)
          ? await output.then((resolved) => fn(resolved, terminate))
          : fn(output, terminate);
      }
      return output;
    };

    for (const [idx, fn] of paddedPipes.entries()) {
      if (terminated) {
        return terminatedReason;
      }

      output = fn(output, terminate);
      if (isPromise(output)) {
        return resolveAsync(paddedPipes.slice(idx + 1), output);
      }
    }

    return output;
  };

  pipe.o = (fn: Unary) => _Pipe([...fns, fn]);

  return pipe as IPipe<T>;
};

const Pipe = <T, U>(fn: Unary<T, U>) => _Pipe([fn]);

export default Pipe;
