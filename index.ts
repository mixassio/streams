import { Transform, pipeline } from 'stream';
import { createReadStream, createWriteStream } from 'fs';
import util from 'node:util';
import { LineParser } from './LineParser';
import { logStream, myfunc } from './utils';
import { LineTransformer } from './LineTransformer';
const pipelinePromise = util.promisify(pipeline);

// createReadStream('data1.csv', { highWaterMark: 100 })
//   .pipe(new LineParser())
//   // .pipe(transformStream2)
//   // .pipe(new LineTransformer(myfunc))
//   .pipe(transformStream2)
//   .pipe(createWriteStream('data_result.csv'));

pipelinePromise(
  createReadStream('data1.csv', { highWaterMark: 1, encoding: 'utf-8' }),
  new LineParser(),
  logStream,
  new LineTransformer(myfunc),
  createWriteStream('data_result.csv'),
);
