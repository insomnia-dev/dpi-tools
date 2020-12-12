export const PNG = 'image/png';
export const JPEG = 'image/jpeg';

// those are 3 possible signature of the physBlock in base64.
// the pHYs signature block is preceed by the 4 bytes of lenght. The length of
// the block is always 9 bytes. So a phys block has always this signature:
// 0 0 0 9 p H Y s.
// However the data64 encoding aligns we will always find one of those 3 strings.
// this allow us to find this particular occurence of the pHYs block without
// converting from b64 back to string
export const B64_PHYS_SIGNATURE_1 = 'AAlwSFlz';
export const B64_PHYS_SIGNATURE_2 = 'AAAJcEhZ';
export const B64_PHYS_SIGNATURE_3 = 'AAAACXBI';

export const P_CHAR_CODE = 'p'.charCodeAt(0);
export const H_CHAR_CODE = 'H'.charCodeAt(0);
export const Y_CHAR_CODE = 'Y'.charCodeAt(0);
export const S_CHAR_CODE = 's'.charCodeAt(0);
