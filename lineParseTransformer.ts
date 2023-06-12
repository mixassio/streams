import { Transform, TransformCallback, pipeline } from 'stream';
import { createReadStream, createWriteStream } from 'fs';
import _ from 'lodash';
import util from 'node:util';
const pipelinePromise = util.promisify(pipeline);

export class LineParser extends Transform {
  private bufferLine: string[] = [];
  private bufferString = '';
  constructor(private delimeter = '|', private newLine = '\n') {
    super();
  }
  _transform(chunk: any, encoding: BufferEncoding, callback: Function): void {
    const element = chunk.toString();
    const parsedElement = element.split(this.newLine);
    if (parsedElement.length === 1) {
      this.bufferString += parsedElement[0];
    }
    if (parsedElement.length >= 2) {
      const [firstElement, ...restElements] = parsedElement;
      this.bufferString += firstElement;
      this.bufferLine.push(this.bufferString);
      this.bufferString = '';
      this.bufferString += restElements.pop();
      if (restElements.length > 0) {
        this.bufferLine.push(...restElements);
      }
    }
    if (this.bufferLine.length > 0) {
      if (this.bufferLine.length === 1) {
        this.push(this.bufferLine[0] + '\n');
        this.bufferLine.length = 0;
      } else {
        this.bufferLine.forEach((el) => this.push(el + '\n'));
        this.bufferLine.length = 0;
      }
    }
    callback(null, '');
  }
  _flush(callback: TransformCallback): void {
    if (this.bufferString.length > 0) {
      callback(null, this.bufferString);
    }
    callback(null, '');
  }
}

export class LineTransformer extends Transform {
  private keys: string[] = [];
  private isKeys = true;
  constructor(private lineTransformer: (line: string) => string) {
    super();
  }

  _transform(chunk: any, encoding: BufferEncoding, callback: Function): void {
    const element = chunk.toString();
    if (this.isKeys) {
      this.keys = element.split('|');
      this.isKeys = false;
      callback(null, '');
      return;
    }
    const el = JSON.stringify(_.zipObject(this.keys, element.split('|')));
    callback(null, this.lineTransformer(el));
  }
}

export const transformStream2 = new Transform({
  transform(chunk, encoding, callback): void {
    // console.log(chunk.toString());
    callback(null, chunk.toString());
  },
});

const myfunc = (line: string): string => {
  const obj = JSON.parse(line);
  obj.length_name = obj.name.length.toString();
  return JSON.stringify(obj);
};

// createReadStream('data1.csv', { highWaterMark: 100 })
//   .pipe(new LineParser())
//   // .pipe(transformStream2)
//   // .pipe(new LineTransformer(myfunc))
//   .pipe(transformStream2)
//   .pipe(createWriteStream('data_result.csv'));

pipelinePromise(
  createReadStream('data1.csv', { highWaterMark: 100 }),
  new LineParser(),
  transformStream2,
  // new LineTransformer(myfunc),
  createWriteStream('data_result.csv'),
);
