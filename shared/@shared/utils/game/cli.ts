import { CLIArgs } from '@shared/types/game/cli';

const isNamed = (str: string): boolean => Boolean(
  (/-([a-zA-Z]+)/).exec(str)?.[1]
);

export const parseArgs = (args: string[]): CLIArgs => {
  const named = {} as Record<string, string | number | boolean> & { d?: number[] };
  const positional = [] as string[];
  for(let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('-')) {
      const name = (/-([a-zA-Z]+)/).exec(a)?.[1];
      const value = (/=(.+)/).exec(a)?.[1];
      if (name) {
        if (value) {
          named[name] = value;
          if (name === 'd') {
            named.d = value.split(',').map(_ => parseInt(_, 10));
          }
        } else if (isNamed(args[i+1])) {
          named[name] = true;
        } else {
          named[name] = args[i + 1];
          if (name === 'd') {
            named.d = (args[i + 1]).split(',').map(_ => parseInt(_, 10));
          }
          i += 1;
        }
      }
    } else {
      positional.push(a);
    }
  }
  return {
    ...named,
    _: positional,
  } as CLIArgs;
}