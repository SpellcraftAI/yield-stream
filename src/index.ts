// import "shim-streams";
import { GeneratorFn, StreamGenerator } from "./types";

/**
 * `compose(f, g, h, ...)` returns a generator function `G(data)` that yields
 * all `(f · g · h · ...)(data)`.
 *
 * @note Used to compose multiple transforms into a `pipeline`.
 */
export const compose = <T>(
  ...generators: GeneratorFn<T>[]
): GeneratorFn<T> => {
  return generators.reduce(
    (prev, next) => async function* (data) {
      for await (const chunk of prev(data)) {
        yield* next(chunk);
      }
    },
  );
};

/**
 * Accepts a stream and transforms and returns a stream of the transformed
 * chunks. Transforms can yield multiple chunks per input chunk.
 */
export const pipeline = <T>(
  stream: ReadableStream<T>,
  ...transforms: GeneratorFn<T>[]
): ReadableStream<T> => {
  const composed = compose(...transforms);
  return generateStream(
    async function* () {
      for await (const chunk of yieldStream(stream)) {
        yield* composed(chunk);
      }
    }
  );
};

/**
 * Accepts a stream and yields all of its chunks.
 */
export const yieldStream = async function* <T>(
  stream: ReadableStream<T>,
  controller?: AbortController
) {
  const reader = stream.getReader();
  while (true) {
    if (controller?.signal.aborted) {
      break;
    }

    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    yield value;
  }
};

/**
 * Accepts a generator function and streams its outputs.
 */
export const generateStream = <T, TReturn, D>(
  G: StreamGenerator<D, T, TReturn>,
  data?: D
): ReadableStream<T> => {
  return new ReadableStream<T>({
    async start(controller) {
      for await (const chunk of G(data)) {
        controller.enqueue(chunk);
      }
      controller.close();
    },
  });
};

/**
 * Accepts an array and returns a stream of its items.
 */
export const streamArray = <T>(array: T[]): ReadableStream<T> => {
  return generateStream(function* () {
    for (const item of array) {
      yield item;
    }
  });
};

/**
 * Accepts a stream and yields a growing buffer of all chunks received.
 */
export const buffer = async function* <T>(stream: ReadableStream<T>) {
  const buffer: T[] = [];

  for await (const chunk of yieldStream(stream)) {
    buffer.push(chunk);
    yield buffer;
  }
};

export * from "./types";