declare module 'fast-json-parse' {
  type Parsed = {
    err?: unknown;
    value?: unknown;
  };

  function Parse(data:unknown): Parsed;
  export = Parse;
}
