import { GeneratorFn, StreamGenerator } from "./types";

/**
 * `compose(f, g, h, ...)` returns a generator function `G(data)` that yields
 * all `(f · g · h · ...)(data)`.
 *
 * @note Used to compose multiple transforms into a `pipeline`.
 */
export const compose = <Chunk>(
  ...generators: GeneratorFn<Chunk>[]
): GeneratorFn<Chunk> => {
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
export const pipeline = <Chunk>(
  stream: ReadableStream<Chunk>,
  ...transforms: GeneratorFn<Chunk>[]
): ReadableStream<Chunk> => {
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
export const yieldStream = async function* <Chunk>(
  stream: ReadableStream<Chunk>,
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
export const generateStream = <Chunk, Return, Data>(
  G: StreamGenerator<Data, Chunk, Return>,
  data?: Data
): ReadableStream<Chunk> => {
  return new ReadableStream<Chunk>({
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
export const streamArray = <Chunk>(
  array: Chunk[]
): ReadableStream<Chunk> => {
  return generateStream(function* () {
    for (const item of array) {
      yield item;
    }
  });
};

/**
 * Accepts a stream and yields a growing buffer of all chunks received.
 */
export const buffer = async function* <Chunk>(
  stream: ReadableStream<Chunk>
) {
  const buffer: Chunk[] = [];

  for await (const chunk of yieldStream(stream)) {
    buffer.push(chunk);
    yield buffer;
  }
};

export * from "./types";