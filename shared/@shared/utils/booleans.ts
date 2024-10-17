export const addBools = (...bools: boolean[]): number => {
  return bools.reduce((sum, bool) => sum + (bool ? 1 : 0), 0);
}

export const subBools = (...bools: boolean[]): number => {
  return bools.reduce((sum, bool) => sum - (bool ? 1 : 0), 0);
}