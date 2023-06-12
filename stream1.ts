import { createReadStream, createWriteStream } from 'fs';

const delimeter = '|';
const newLine = '\n';

const readStream = createReadStream('data1.csv', { highWaterMark: 1 });
const writeStream = createWriteStream('data_result.csv');
const bufferField: string[] = [];
const bufferLine: string[] = [];
let isHeaders = true;

readStream.on('data', (chunk: string | Buffer) => {
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
    console.log(bufferLine);
    // как вернуть данные чтобы перешло в .pipe(writeStream) без следующей строчки?
    writeStream.write(bufferLine.join('|') + '\n');
    bufferField.length = 0;
    bufferLine.length = 0;
  }
});
