import * as React from 'react';
import { LuDice1, LuDice2, LuDice3, LuDice4, LuDice5, LuDice6 } from 'react-icons/lu';
import { FaDiceOne, FaDiceTwo, FaDiceThree, FaDiceFour, FaDiceFive, FaDiceSix } from 'react-icons/fa';
import { useMemo } from 'react';

const AvailableDiceIcons = [
  LuDice1, LuDice2, LuDice3, LuDice4, LuDice5, LuDice6
];
const UsedDiceIcons = [
  FaDiceOne, FaDiceTwo, FaDiceThree, FaDiceFour, FaDiceFive, FaDiceSix
];

export const Dice = ({
  value,
  isAvailable,
}: {
  value: number,
  isAvailable: boolean,
}) => {
  const IconComponent = useMemo(
    () => isAvailable ? AvailableDiceIcons[value - 1] : UsedDiceIcons[value - 1],
    [value, isAvailable]
  );
  return <>
    <IconComponent
      color={isAvailable ? '#edcd64' : '#666'}
      size={26}
    />
  </>
}