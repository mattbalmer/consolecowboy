import { useState } from 'react';

const PREFIX = 'consolecowboy';

const loadJSON = <T>(key: string, defaultValue?: T): T => {
  const k = [PREFIX, key].join(',');
  const v = localStorage.getItem(k);
  if (v === null || v === undefined) {
    return defaultValue ?? null;
  } else {
    try {
      return JSON.parse(v);
    } catch(error) {
      console.log(`Error parsing JSON`, k);
      return defaultValue ?? null;
    }
  }
}

const saveJSON = <T>(key: string, value: T) => {
  const k = [PREFIX, key].join(',');
  try {
    const str = JSON.stringify(value);
    localStorage.setItem(k, str);
  } catch(error) {
    console.log(`Error stringifying JSON for`, k, value);
    throw error;
  }
}

export const useLocalstorage = <T, K extends string>(key: string, initial: T) => {
  const [state, setState] = useState<T>(loadJSON(key, initial));

  const setCapsule = (newValue: T) => {
    saveJSON(key, newValue);
    setState(newValue);
  };

  return [state, setCapsule]
}
