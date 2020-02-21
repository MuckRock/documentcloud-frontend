// From https://stackoverflow.com/a/59879450

const endex = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
export function encode(intcode) {
  if (intcode < endex.length) {
    return endex[intcode];
  } else {
    return (
      encode(Math.floor(intcode / endex.length)) + endex[intcode % endex.length]
    );
  }
}
export function decode(charcode) {
  if (charcode.length < 2) {
    return endex.indexOf(charcode);
  } else {
    return (
      decode(charcode.slice(0, -1)) * endex.length +
      endex.indexOf(charcode.slice(-1))
    );
  }
}
