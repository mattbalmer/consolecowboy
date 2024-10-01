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