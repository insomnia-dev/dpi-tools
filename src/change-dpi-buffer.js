import { getType, changeDpiOnArray, mergeTypedArrays } from './util';

const changeDpiBuffer = (buffer, dpi) => {
  const headerChunk = new Uint8Array(buffer.slice(0, 33));
  const rest = buffer.slice(33);
  const type = getType(buffer);
  const changedHeader = changeDpiOnArray(headerChunk, dpi, type);
  return mergeTypedArrays(changedHeader, rest);
};

export default changeDpiBuffer;
