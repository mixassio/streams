// import { fi, th } from '@faker-js/faker';
import { createReadStream, createWriteStream, readdir } from 'fs';
import { Readable, Transform, Writable } from 'stream';
import readline from 'readline';
import { LineParser } from '../LineParser';
import { createGunzip } from 'zlib';
import { Counter, MyParser } from './logParser';

class DirFilesRead extends Readable {
  private pathToDir = '';
  constructor(pathToDir: string) {
    super();
    this.pathToDir = pathToDir;
  }
  _read(size: number): void {
    readdir(this.pathToDir, (err, files) => {
      let counter = files.length;
      if (err) {
        this.emit('error', err);
      } else {
        files.forEach((file) => {
          const fileStream = createReadStream(`${this.pathToDir}/${file}`);
          fileStream.on('end', () => {
            console.log('counter-end-->>>', counter);
            counter--;
            if (counter === 0) {
              this.push(null);
            }
          });
          fileStream.on('data', (chunk) => {
            if (chunk) {
              // console.log('chunk--->>>', chunk.toString());
              this.push(chunk);
            }
          });
          fileStream.on('error', (err) => {
            console.log('error--->>>', err);
            this.emit('error', err);
          });
        });
      }
      // this.push(null);
    });
  }
}

class DirFilesRead2 extends Readable {
  private pathToDir = '';
  constructor(pathToDir: string) {
    super();
    this.pathToDir = pathToDir;
  }
  _read(size: number): void {
    readdir(this.pathToDir, (err, files) => {
      let counter = files.length;
      if (err) {
        this.emit('error', err);
      } else {
        files.forEach((file) => {
          const lineReader = readline.createInterface({
            input: createReadStream(`${this.pathToDir}/${file}`).pipe(
              createGunzip().on('end', (e: any, data: any) =>
                console.log('end gzip-->>', e, data, Date.now()),
              ),
            ),
          });
          lineReader.on('line', (line) => {
            console.log('line - counter-->>>', counter, line, Date.now());
            this.push(line + '\n');
          });
          lineReader.on('close', () => {
            console.log('close - counter-end-->>>', counter, Date.now());
            counter--;
            if (counter === 0) {
              console.log('close - counter-end-if-->>>', counter);
              this.push(null);
              this.resume();
            }
          });
          lineReader.on('error', (err) => {
            console.log('counter-end-->>>', counter);
            console.log('error--->>>', err);
            this.emit('error', err);
          });
          lineReader.on('history', (history) => {
            console.log(`Received: ${history}`, Date.now());
          });
        });
      }
      this.pause();
    });
  }
}

const streamDir = new DirFilesRead2('./job/testgz');
streamDir.pipe(createWriteStream('./job/test/log_result.csv'));

// streamDir
// .pipe(createGunzip())
// .pipe(new LineParser())
// .pipe(
//   new Transform({
//     transform(chunk, encoding, callback): void {
//       console.log('logStream===>>>', chunk.toString());
//       callback(null, chunk.toString());
//     },
//   }),
// )
// .pipe(new MyParser())
// .pipe(new Counter())
// .pipe(
//   new Transform({
//     transform(chunk, encoding, callback): void {
//       console.log('logStream===>>>', chunk.toString());
//       callback(null, chunk.toString());
//     },
//   }),
// )
// .pipe(createWriteStream('./job/test/log_result.csv'));

// createReadStream('./job/logs/4e47eb23f27c2dc838e003a743ca5c16.log.gz')
//   .pipe(createGunzip())
//   .pipe(createWriteStream('./job/test/log_result3.csv'));

// const lineReader = readline.createInterface({
//   input: createReadStream('./job/logs/4e47eb23f27c2dc838e003a743ca5c16.log.gz').pipe(
//     createGunzip(),
//   ),
// });

// lineReader.on('line', (data) => {
//   console.log('line-->>', data);
// });

// lineReader.on('close', (data: any) => {
//   console.log('close-->>', data);
// });
// lineReader.on('history', (data) => {
//   console.log('history-->>', data);
// });
// lineReader.on('pause', (data: any) => {
//   console.log('pause-->>', data);
// });
// lineReader.on('resume', (data: any) => {
//   console.log('resume-->>', data);
// });
// lineReader.on('SIGCONT', (data: any) => {
//   console.log('SIGCONT-->>', data);
// });
// lineReader.on('SIGINT', (data: any) => {
//   console.log('SIGINT-->>', data);
// });
// lineReader.on('SIGCONT', (data: any) => {
//   console.log('SIGCONT-->>', data);
// });
// lineReader.on('SIGTSTP', (data: any) => {
//   console.log('SIGTSTP-->>', data);
// });
// lineReader.close();

// lineReader
//   .pipe(
//     new Transform({
//       transform(chunk, encoding, callback): void {
//         console.log('logStream===>>>', chunk.toString());
//         callback(null, chunk.toString());
//       },
//     }),
//   )
//   .pipe(createWriteStream('./job/test/log_result6.csv'));
