import _ from 'lodash';
import { Transform } from 'stream';

export class Liner extends Transform {
  constructor(private lineTransformer: (line: string) => Promise<string>) {
    super();
  }

  _transform(chunk: any, encoding: BufferEncoding, callback: Function): void {
    this.lineTransformer(chunk.toString())
      .then((result) => {
        callback(null, result);
      })
      .catch((err) => {
        callback(err);
      });
  }
}

describe('lineParserOld', () => {
  const myFunc = jest.fn();

  it('should func calling', (done) => {
    const liner = new Liner(myFunc.mockResolvedValue(42));
    liner._transform(123, 'utf8', _.noop);
    expect(myFunc).toHaveBeenCalled();
    done();
  });
  it('should func resolve', (done) => {
    const liner = new Liner(myFunc.mockResolvedValue(42));
    const cb = jest.fn();
    liner._transform(123, 'utf8', cb);
    setTimeout(() => {
      expect(cb).toBeCalledWith(null, 42);
      done();
    }, 100);
  });
  it('should func reject', (done) => {
    const err = new Error('my error');
    const liner = new Liner(myFunc.mockRejectedValue(err));
    const cb = jest.fn();
    liner._transform(123, 'utf8', cb);
    setTimeout(() => {
      expect(cb).toBeCalledWith(err);
      done();
    }, 100);
  });
});
