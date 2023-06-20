import { createReadStream, createWriteStream, readFileSync } from 'fs';
import { logStream, myfunc } from './utils';
import { LineTransformer } from './LineTransformer';
import { LineParser } from './LineParser';
import util from 'node:util';
import { Readable, Writable, pipeline } from 'stream';
const pipelinePromise = util.promisify(pipeline);
import fs from 'fs';

// здесь доделано:
// 1. добавлены тесты на сравнение файлов
// 2. добавлены тесты на сравнение файлов с разным highWaterMark
// 3. добавлены в хуки tmp папку для записи файлов и удаление после тестов
// 4. тесты не проходили с logStream, поэтому закомментированы, по одному проходили, какая-то проблема с eventEmitter
describe('lineTransformer', () => {
  let fileCSV: string;

  beforeAll(() => {
    fs.mkdirSync('./tmp', { recursive: true });
    fileCSV = readFileSync('data1.csv', 'utf8');
  });
  afterAll(() => {
    fs.rmSync('./tmp', { recursive: true });
  });
  test('should equal first file with size = 1', (done) => {
    pipelinePromise(
      createReadStream('data1.csv', { highWaterMark: 1, encoding: 'utf8' }),
      new LineParser(),
      // logStream,
      createWriteStream('./tmp/data_result.csv'),
    ).then(() => {
      const fileRes = readFileSync('./tmp/data_result.csv', 'utf8');
      expect(fileRes).toBe(fileCSV);
      done();
    });
  });
  test('should equal first file with size = 10', (done) => {
    pipelinePromise(
      createReadStream('data1.csv', { highWaterMark: 10, encoding: 'utf8' }),
      new LineParser(),
      // logStream,
      createWriteStream('./tmp/data_result10.csv'),
    ).then(() => {
      const fileRes = readFileSync('./tmp/data_result10.csv', 'utf8');
      expect(fileRes).toBe(fileCSV);
      done();
    });
  });
  test('should equal first file with size = 100', (done) => {
    pipelinePromise(
      createReadStream('data1.csv', { highWaterMark: 100, encoding: 'utf8' }),
      new LineParser(),
      // logStream,
      createWriteStream('./tmp/data_result100.csv'),
    ).then(() => {
      const fileRes = readFileSync('./tmp/data_result100.csv', 'utf8');
      expect(fileRes).toBe(fileCSV);
      done();
    });
  });
  test('should equal first file with size = 1000', (done) => {
    pipelinePromise(
      createReadStream('data1.csv', { highWaterMark: 1000, encoding: 'utf8' }),
      new LineParser(),
      // logStream,
      createWriteStream('./tmp/data_result1000.csv'),
    ).then(() => {
      const fileRes = readFileSync('./tmp/data_result1000.csv', 'utf8');
      expect(fileRes).toBe(fileCSV);
      done();
    });
  });
});

// Здесь добавлено
// 1. читаем из стрима в массив chunks
// 2. проверяем, что в массиве chunks содержится то, что мы записали в стрим
// 3. проверка кастомной функции
class Write extends Writable {
  chunks: string[] = [];

  _write(chunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
    const str = chunk.toString();
    // console.log('write->>', str);
    this.chunks.push(str);
    callback();
  }
}
describe('common behavior lineParcer', () => {
  test('simple', (cb) => {
    const readStream = new Readable();
    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/explicit-function-return-type
    readStream._read = () => {};
    readStream.push('firstfield|');
    readStream.push('secondfield');
    readStream.push('\n');
    readStream.push('thirdfield|');
    readStream.push('fourthfield');
    readStream.push('\n');
    readStream.push(null);
    const writeStream = new Write();
    pipelinePromise(readStream, new LineParser(), writeStream).then(() => {
      // console.log('writeStream->>', writeStream.chunks);
      expect(writeStream.chunks.join('')).toBe(
        ['firstfield|secondfield\n', 'thirdfield|fourthfield\n'].join(''),
      );
      cb();
    });
  });
  test('difficult', (cb) => {
    const readStream = new Readable();
    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/explicit-function-return-type
    readStream._read = () => {};
    readStream.push('firstfield|secondfield\nthirdfie');
    readStream.push('ld|fo');
    readStream.push('urthfield');
    readStream.push('\n');
    readStream.push(null);
    const writeStream = new Write();
    pipelinePromise(readStream, new LineParser(), writeStream).then(() => {
      // console.log('writeStream->>', writeStream.chunks);
      expect(writeStream.chunks.join('')).toBe(
        ['firstfield|secondfield\n', 'thirdfield|fourthfield\n'].join(''),
      );
      cb();
    });
  });
});

describe('common behavior lineParcer + lineTransformer', () => {
  test('simple', (cb) => {
    const readStream = new Readable();
    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/explicit-function-return-type
    readStream._read = () => {};
    readStream.push('name|'); // requred name field for myfunc
    readStream.push('secondheader');
    readStream.push('\n');
    readStream.push('firstfield|');
    readStream.push('secondfield');
    readStream.push('\n');
    readStream.push('thierdfield|fourthfield');
    readStream.push('\n');
    readStream.push(null);
    const writeStream = new Write();
    pipelinePromise(readStream, new LineParser(), new LineTransformer(myfunc), writeStream).then(
      () => {
        // console.log('writeStream->>', writeStream.chunks);
        expect(writeStream.chunks).toEqual([
          JSON.stringify({
            name: 'firstfield',
            secondheader: 'secondfield',
            length_name: '10',
          }),
          JSON.stringify({
            name: 'thierdfield',
            secondheader: 'fourthfield',
            length_name: '11',
          }),
        ]);
        cb();
      },
    );
  });
});
