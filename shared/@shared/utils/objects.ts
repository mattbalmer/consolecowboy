export const entryCount = <T extends object>(object: T): number => {
  return Object.keys(object).length;
}

export const filterObject = <T extends object, K extends keyof T>(
  object: T,
  predicate: (value: T[K], key: K, index: number) => boolean,
): Partial<T> => {
  const result = {} as Partial<T>;
  let index = 0;

  for (const key in object) {
    // @ts-ignore
    if (predicate(object[key], key as K, index)) {
      result[key] = object[key];
    }
    index += 1;
  }

  return result;
}

export const mapObject = <R extends object, T extends object, K extends keyof T>(
  object: T,
  // @ts-ignore
  map: (value: T[K], key: K, index: number) => R[K],
): R => {
  const result = {} as R;
  let index = 0;

  for (const key in object) {
    // @ts-ignore
    result[key as K] = map(object[key], key as K, index);
    index += 1;
  }

  return result;
}