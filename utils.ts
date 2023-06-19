import { Transform } from 'stream';

export const logStream = new Transform({
  transform(chunk, encoding, callback): void {
    // console.log(chunk.toString());
    callback(null, chunk.toString());
  },
});

export const myfunc = (line: string): string => {
  // console.log('line', line);
  const obj = JSON.parse(line);
  // console.log('obj', obj);
  obj.length_name = obj.name.length.toString();
  return JSON.stringify(obj);
};
