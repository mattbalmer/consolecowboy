export type UUID = string;

export type URN_TYPES = 'user' | 'room';
export type URN <T extends URN_TYPES | unknown = unknown> = T extends URN_TYPES
  ? `urn:${T}:${UUID}`
  : `urn:${URN_TYPES}:${UUID}`;
