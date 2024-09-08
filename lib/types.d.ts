declare module 'on-exit-leak-free' {
  export function register(
    obj: unknown,
    shutdown: (arg1: any, arg2: string) => void,
  ): void;
  export function unregister(obj: unknown): void;
}
