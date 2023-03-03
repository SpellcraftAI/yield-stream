import { Readable } from "stream";
import { GeneratorFn, StreamGenerator } from "../types";
import { compose, generateArray } from "./shared";

/**
 * Accepts a generator function and returns a NodeJS.ReadableStream of its
 * outputs.
 */
export const generateStream = <Chunk, Return, Data>(
  G: StreamGenerator<Data, Chunk, Return>,
  data?: Data
): NodeJS.ReadableStream => {
  const readable = Readable.from(G(data));
  return readable;
};


/**
 * Accepts a stream and yields all of its chunks.
 */
export const yieldStream = async function* <Chunk>(
  stream: NodeJS.ReadableStream,
  controller?: AbortController
): AsyncGenerator<Chunk> {
  for await (const chunk of stream) {
    if (controller?.signal.aborted) {
      break;
    }

    yield chunk as Chunk;
  }
};

/**
 * Accepts a stream and transforms and returns a stream of the transformed
 * chunks. Transforms can yield multiple chunks per input chunk.
 */
export const pipeline = <Chunk>(
  stream: NodeJS.ReadableStream,
  ...transforms: GeneratorFn<Chunk>[]
): NodeJS.ReadableStream => {
  const composed = compose(...transforms);
  return generateStream(
    async function* () {
      for await (const chunk of yieldStream<Chunk>(stream)) {
        yield* composed(chunk);
      }
    }
  );
};

/**
 * Accepts an array and returns a stream of its items.
 */
export const streamArray = <Chunk>(
  array: Chunk[]
): NodeJS.ReadableStream => {
  return generateStream(generateArray(array));
};

/**
 * Accepts a stream and yields a growing buffer of all chunks received.
 */
export const buffer = async function* <Chunk>(
  stream: NodeJS.ReadableStream
) {
  const buffer: Chunk[] = [];

  for await (const chunk of yieldStream<Chunk>(stream)) {
    buffer.push(chunk);
    yield buffer;
  }
};