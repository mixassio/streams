import { createReadStream, createWriteStream, readFileSync } from 'fs';
import { LineParser, transformStream2 } from './lineParseTransformer';
import util from 'node:util';
import { pipeline } from 'stream';
const pipelinePromise = util.promisify(pipeline);
describe('lineTransformer', () => {
  let fileCSV: string;

  beforeAll(() => {
    fileCSV = readFileSync('data1.csv', 'utf8');
  });
  test('should equal first file with size = 1', () => {
    pipelinePromise(
      createReadStream('data1.csv', { highWaterMark: 1 }),
      new LineParser(),
      transformStream2,
      createWriteStream('data_result.csv'),
    ).then(() => {
      const fileRes = readFileSync('data_result.csv', 'utf8');
      expect(fileRes).toBe(fileCSV);
    });
  });
  test('should equal first file with size = 10', () => {
    pipelinePromise(
      createReadStream('data1.csv', { highWaterMark: 10 }),
      new LineParser(),
      transformStream2,
      createWriteStream('data_result.csv'),
    ).then(() => {
      const fileRes = readFileSync('data_result.csv', 'utf8');
      expect(fileRes).toBe(fileCSV);
    });
  });
  test('should equal first file with size = 100', () => {
    pipelinePromise(
      createReadStream('data1.csv', { highWaterMark: 100 }),
      new LineParser(),
      transformStream2,
      createWriteStream('data_result.csv'),
    ).then(() => {
      const fileRes = readFileSync('data_result.csv', 'utf8');
      expect(fileRes).toBe(fileCSV);
    });
  });
  test('should equal first file with size = 1000', () => {
    pipelinePromise(
      createReadStream('data1.csv', { highWaterMark: 1000 }),
      new LineParser(),
      transformStream2,
      createWriteStream('data_result.csv'),
    ).then(() => {
      const fileRes = readFileSync('data_result.csv', 'utf8');
      expect(fileRes).toBe(fileCSV);
    });
  });
});
