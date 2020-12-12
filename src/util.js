import {
  PNG,
  JPEG,
  B64_PHYS_SIGNATURE_1,
  B64_PHYS_SIGNATURE_2,
  B64_PHYS_SIGNATURE_3,
  P_CHAR_CODE,
  H_CHAR_CODE,
  Y_CHAR_CODE,
  S_CHAR_CODE,
} from './constants';

export const createPngDataTable = () => {
  /* Table of CRCs of all 8-bit messages. */
  const crcTable = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }
  return crcTable;
};

const pngDataTable = createPngDataTable();

export const calcCrc = (buf) => {
  let c = -1;
  for (let n = 0; n < buf.length; n += 1) {
    c = pngDataTable[(c ^ buf[n]) & 0xff] ^ (c >>> 8);
  }
  return c ^ -1;
};

export const searchStartOfPhys = (data) => {
  const length = data.length - 1;
  // we check from the end since we cut the string in proximity of the header
  // the header is within 21 bytes from the end.
  for (let i = length; i >= 4; i -= 1) {
    if (
      data[i - 4] === 9 &&
      data[i - 3] === P_CHAR_CODE &&
      data[i - 2] === H_CHAR_CODE &&
      data[i - 1] === Y_CHAR_CODE &&
      data[i] === S_CHAR_CODE
    ) {
      return i - 3;
    }
  }
  return -1;
};

export const changeDpiOnArray = (
  dataArray,
  sourceDpi,
  format,
  overwritePhys = false
) => {
  let dpi = sourceDpi;
  if (format === JPEG) {
    dataArray[13] = 1; // 1 pixel per inch or 2 pixel per cm
    dataArray[14] = dpi >> 8; // dpiX high byte
    dataArray[15] = dpi & 0xff; // dpiX low byte
    dataArray[16] = dpi >> 8; // dpiY high byte
    dataArray[17] = dpi & 0xff; // dpiY low byte
    return dataArray;
  }
  if (format === PNG) {
    const physChunk = new Uint8Array(13);
    // chunk header pHYs
    // 9 bytes of data
    // 4 bytes of crc
    // this multiplication is because the standard is dpi per meter.
    dpi *= 39.3701;
    physChunk[0] = P_CHAR_CODE;
    physChunk[1] = H_CHAR_CODE;
    physChunk[2] = Y_CHAR_CODE;
    physChunk[3] = S_CHAR_CODE;
    physChunk[4] = dpi >>> 24; // dpiX highest byte
    physChunk[5] = dpi >>> 16; // dpiX veryhigh byte
    physChunk[6] = dpi >>> 8; // dpiX high byte
    physChunk[7] = dpi & 0xff; // dpiX low byte
    physChunk[8] = physChunk[4]; // dpiY highest byte
    physChunk[9] = physChunk[5]; // dpiY veryhigh byte
    physChunk[10] = physChunk[6]; // dpiY high byte
    physChunk[11] = physChunk[7]; // dpiY low byte
    physChunk[12] = 1; // dot per meter....

    const crc = calcCrc(physChunk);

    const crcChunk = new Uint8Array(4);
    crcChunk[0] = crc >>> 24;
    crcChunk[1] = crc >>> 16;
    crcChunk[2] = crc >>> 8;
    crcChunk[3] = crc & 0xff;

    if (overwritePhys) {
      const startingIndex = searchStartOfPhys(dataArray);
      dataArray.set(physChunk, startingIndex);
      dataArray.set(crcChunk, startingIndex + 13);
      return dataArray;
    }
    // i need to give back an array of data that is divisible by 3 so that
    // dataurl encoding gives me integers, for luck this chunk is 17 + 4 = 21
    // if it was we could add a text chunk containing some info, until desired
    // length is met.

    // chunk structure 4 bytes for length is 9
    const chunkLength = new Uint8Array(4);
    chunkLength[0] = 0;
    chunkLength[1] = 0;
    chunkLength[2] = 0;
    chunkLength[3] = 9;

    const finalHeader = new Uint8Array(54);
    finalHeader.set(dataArray, 0);
    finalHeader.set(chunkLength, 33);
    finalHeader.set(physChunk, 37);
    finalHeader.set(crcChunk, 50);
    return finalHeader;
  }

  return null;
};

export const detectPhysChunkFromDataUrl = (data) => {
  let b64index = data.indexOf(B64_PHYS_SIGNATURE_1);
  if (b64index === -1) {
    b64index = data.indexOf(B64_PHYS_SIGNATURE_2);
  }
  if (b64index === -1) {
    b64index = data.indexOf(B64_PHYS_SIGNATURE_3);
  }
  // if b64index === -1 chunk is not found
  return b64index;
};

export default detectPhysChunkFromDataUrl;
