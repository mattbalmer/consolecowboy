export const stringIDForNumber = (num: number): string =>
  num <= 0 ? ''
  : stringIDForNumber(Math.floor((num - 1) / 26)) + String.fromCharCode((num - 1) % 26 + 65);

export const numberForStringID = (stringID: string): number =>
  stringID.toUpperCase().split('').reduce((acc, val) => acc * 26 + val.charCodeAt(0) - 64, 0);
