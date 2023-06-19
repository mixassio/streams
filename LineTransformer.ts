import { Transform } from 'stream';
import _ from 'lodash';

export class LineTransformer extends Transform {
  private keys: string[] = [];
  private isKeys = true;
  constructor(private lineTransformer: (line: string) => string) {
    super();
  }

  _transform(chunk: any, encoding: BufferEncoding, callback: Function): void {
    const element = chunk.toString().trim();
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
