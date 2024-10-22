import * as rfdcRaw from 'rfdc';

const createRFDC = typeof rfdcRaw === 'function'
  ? rfdcRaw
  // @ts-ignore
  : typeof rfdcRaw.default ? rfdcRaw.default
    : null;

if (!createRFDC) {
  throw new Error(`Cannot correctly import RFDC`);
}

const rfdc: <T>(object: T) => T = createRFDC({
  circles: false,
  proto: false,
});

export { createRFDC };
export { rfdc };