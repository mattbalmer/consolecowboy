interface Emitter {
  emit(event: string, data: object)
}

export const emit = <D extends object>(emitter: Emitter, event: string, data: D): unknown => {
  return emitter.emit(event, data);
};