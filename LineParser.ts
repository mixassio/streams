import { Transform, TransformCallback } from 'stream';

export class LineParser extends Transform {
  private bufferLine: string[] = [];
  private bufferString = '';
  constructor(private delimeter = '|', private newLine = '\n') {
    super();
  }
  _transform(chunk: any, encoding: BufferEncoding, callback: Function): void {
    const element = chunk.toString();
    // console.log('element', element);
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
      this.bufferLine.forEach((el) => this.push(el + '\n'));
      this.bufferLine.length = 0;
    }
    callback(null, '');
  }
  _flush(callback: TransformCallback): void {
    if (this.bufferString.length > 0) {
      callback(null, this.bufferString);
      return;
    }
    callback(null, '');
  }
}
