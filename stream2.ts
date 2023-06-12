import { createReadStream, createWriteStream } from 'fs';
import { Transform, TransformCallback } from 'stream';

const delimeter = '|';
const newLine = '\n';

const readStream = createReadStream('data1.csv', { highWaterMark: 1 });
const writeStream = createWriteStream('data_result.csv');
const bufferField: string[] = [];
const bufferLine: string[] = [];
let isHeaders = true;

const transformStream = new Transform({
  transform(chunk, encoding, callback): void {
    const element = chunk.toString();
    if (element === delimeter) {
      bufferLine.push(bufferField.join(''));
      bufferField.length = 0;
    } else if (element !== newLine) {
      bufferField.push(element);
    } else {
      bufferLine.push(bufferField.join(''));
      if (isHeaders) {
        bufferLine.push('length_name');
        isHeaders = false;
      } else {
        bufferLine.push(bufferLine[0].length.toString());
      }
      // this.push(bufferLine.join('|') + '\n');
      callback(null, bufferLine.join('|') + '\n');
      bufferField.length = 0;
      bufferLine.length = 0;
      return;
    }

    callback();
  },
});

const transformStream2 = new Transform({
  transform(chunk, encoding, callback): void {
    console.log(chunk.toString());
    callback(null, chunk);
  },
});

readStream.pipe(transformStream).pipe(transformStream2).pipe(writeStream);
