export type CLIArgs <N extends Record<string, unknown> | void = void, P extends string[] | void = void> =
  (N extends void ? {
    [key: string]: string | number | boolean,
  } : N)
  & ({
    d?: number[],
  })
  & ({
    _: P extends void ? string[] : P,
  });