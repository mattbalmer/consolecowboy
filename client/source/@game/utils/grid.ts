import { Coord, CoordString, Dir } from '@game/types';

export const coordToString = ({ x, y }: Coord): CoordString => `${x},${y}`;

export const getEdgeDirs = (nodeMap: Record<string, string>, { x, y }: Coord): Dir[] => {
  let output: Dir[] = [];

  if (coordToString({ x: x - 0.5, y }) in nodeMap && coordToString({ x: x + 0.5, y }) in nodeMap) {
    output.push('left');
    output.push('right');
  }
  if (coordToString({ x, y: y - 0.5 }) in nodeMap && coordToString({ x, y: y + 0.5 }) in nodeMap) {
    output.push('up');
    output.push('down');
  }
  // if (coordToString({ x: x - 0.5, y }) in nodeMap) {
  //   output.push('left');
  // }
  // if (coordToString({ x: x + 0.5, y }) in nodeMap) {
  //   output.push('right');
  // }
  // if (coordToString({ x, y: y - 0.5 }) in nodeMap) {
  //   output.push('up');
  // }
  // if (coordToString({ x, y: y + 0.5 }) in nodeMap) {
  //   output.push('down');
  // }

  return output
}