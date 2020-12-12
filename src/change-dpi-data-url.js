import { PNG, JPEG } from './constants';

import { detectPhysChunkFromDataUrl, changeDpiOnArray } from './util';

const changeDpiDataUrl = (base64Image, dpi) => {
  const dataSplitted = base64Image.split(',');
  const format = dataSplitted[0];
  const body = dataSplitted[1];
  let type;
  let headerLength;
  let overwritePhys = false;
  if (format.indexOf(PNG) !== -1) {
    type = PNG;
    const b64Index = detectPhysChunkFromDataUrl(body);
    // 28 bytes in dataUrl are 21bytes, length of phys chunk with everything inside.
    if (b64Index >= 0) {
      headerLength = Math.ceil((b64Index + 28) / 3) * 4;
      overwritePhys = true;
    } else {
      headerLength = (33 / 3) * 4;
    }
  } else if (format.indexOf(JPEG) !== -1) {
    type = JPEG;
    headerLength = (18 / 3) * 4;
  }
  // 33 bytes are ok for pngs and jpegs
  // to contain the information.
  const stringHeader = body.substring(0, headerLength);
  const restOfData = body.substring(headerLength);
  const headerBytes = atob(stringHeader);
  const dataArray = new Uint8Array(headerBytes.length);
  for (let i = 0; i < dataArray.length; i += 1) {
    dataArray[i] = headerBytes.charCodeAt(i);
  }
  const finalArray = changeDpiOnArray(dataArray, dpi, type, overwritePhys);
  const base64Header = btoa(String.fromCharCode(...finalArray));
  return [format, ',', base64Header, restOfData].join('');
};

export default changeDpiDataUrl;
