import { ReadableStream, WritableStream } from "stream/web";

declare module 'web-streams-polyfill/ponyfill/es2018' {
    export interface TransformStream<I = any, O = any> {
        readable: ReadableStream<O>;
        writable: WritableStream<I>;
    }
}