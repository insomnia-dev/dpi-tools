import { changeDpiOnArray } from './util';

const changeDpiBlob = (blob, dpi) => {
  // 33 bytes are ok for pngs and jpegs
  // to contain the information.
  const headerChunk = blob.slice(0, 33);
  return new Promise((resolve) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const dataArray = new Uint8Array(fileReader.result);
      const tail = blob.slice(33);
      const changedArray = changeDpiOnArray(dataArray, dpi, blob.type);
      resolve(new Blob([changedArray, tail], { type: blob.type }));
    };
    fileReader.readAsArrayBuffer(headerChunk);
  });
};

export default changeDpiBlob;
