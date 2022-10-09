declare module 'fast-json-parse' {
  type Parsed = {
    err?: unknown;
    value?: unknown;
  };

  // eslint-disable-next-line @typescript-eslint/naming-convention
  function Parse(data: unknown): Parsed;
  export = Parse;
}

declare module 'on-exit-leak-free' {
  import type SonicBoom from 'sonic-boom';

  export function register(
    obj: unknown,
    shutdown: (arg1: SonicBoom & {destroyed?: boolean}, arg2: string) => void,
  ): void;
  export function unregister(obj: unknown): void;
}
