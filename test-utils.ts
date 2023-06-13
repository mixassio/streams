import {Writable} from "stream";

export class Write extends Writable {
    buffer: string = '';

    chunks: string[] = [];

    _write(chunk: any, encoding: BufferEncoding, callback: (error?: (Error | null)) => void) {
        this.chunks.push(chunk.toString());
        callback();
    }

}
