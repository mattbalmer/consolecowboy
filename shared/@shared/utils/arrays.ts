export const removeRange = <T>(array: T[], start: number, count: number = 1): T[] => {
  return [
    ...array.slice(0, start),
    ...array.slice(start + count),
  ]
};

export const insertIntoCopy = <T>(array: T[], index: number, items: T[]): T[] => {
  return [
    ...array.slice(0, index),
    ...items,
    ...array.slice(index),
  ]
}
export const replace = <T>(array: T[], start: number, items: T[]): T[] => {
  return [
    ...array.slice(0, start),
    ...items,
    ...array.slice(start + items.length),
  ]
}

type GenMapCallback <T> = (i: number) => T;
export const generate = <T>(size: number, value: T | GenMapCallback<T>): T[] => {
  if (typeof value === 'function') {
    const getVal = (_: unknown, i: number) => (value as GenMapCallback<T>)(i);
    return Array.from({ length: size }).map(getVal);
  } else {
    return Array.from({ length: size }).fill(value) as T[];
  }
}