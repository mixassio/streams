import {createReadStream, createWriteStream, readFileSync} from 'fs';
import {LineParser, logStream} from './lineParseTransformer';
import util from 'node:util';
import {pipeline, Readable} from 'stream';
import {Write} from "./test-utils";

const pipelinePromise = util.promisify(pipeline);

describe('lineTransformer', () => {
  let fileCSV: string;

  beforeAll(() => {
    fileCSV = readFileSync('data1.csv', 'utf8');
  });
  test.only('should equal first file with size = 1', (cb) => {
    const readStream = new Readable();
    readStream._read = () => {};
    readStream.push('jlkdfgjak');
    readStream.push('jlkdfgjak');
    readStream.push('jlkdfgjak');
    readStream.push('jlkdfgjak');

    readStream.push('\n');



    // pipeline(
    //     createReadStream('data1.csv', { highWaterMark: 1, encoding: 'utf8' }),
    //     new LineParser(),
    //     transformStream2,
    //     createWriteStream('data_result.csv'),
    //     (err) => {
    //       expect(err).toBe(undefined);
    //       const fileRes = readFileSync('data_result.csv', 'utf8');
    //       expect(fileRes).toBe(fileCSV);
    //       cb();
    //     }
    // )

    const writeStream = new Write();
    pipelinePromise(
        // readStream,
      createReadStream('data1.csv', { highWaterMark: 1, encoding: 'utf8' }),
      new LineParser(),
      logStream,
        writeStream,
    ).then(() => {

      // const fileRes = readFileSync('data_result.csv', 'utf8');
      expect(writeStream.buffer).toBe(fileCSV);
      cb();
    });
  });
  test('should equal first file with size = 10', (cb) => {
    pipelinePromise(
      createReadStream('data1.csv', { highWaterMark: 10, encoding: 'utf8' }),
      new LineParser(),
      logStream,
      createWriteStream('data_result.csv'),
    ).then(() => {
      const fileRes = readFileSync('data_result.csv', 'utf8');
      expect(fileRes).toBe(fileCSV);
      cb();
    });
  });
  test('should equal first file with size = 100', (cb) => {
    pipelinePromise(
      createReadStream('data1.csv', { highWaterMark: 100 }),
      new LineParser(),
      logStream,
      createWriteStream('data_result.csv'),
    ).then(() => {
      const fileRes = readFileSync('data_result.csv', 'utf8');
      expect(fileRes).toBe(fileCSV);
      cb();
    });
  });
  test('should equal first file with size = 1000', (cb) => {
    pipelinePromise(
      createReadStream('data1.csv', { highWaterMark: 1000 }),
      new LineParser(),
      logStream,
      createWriteStream('data_result.csv'),
    ).then(() => {
      const fileRes = readFileSync('data_result.csv', 'utf8');
      expect(fileRes).toBe(fileCSV);
      cb();
    });
  });
});
