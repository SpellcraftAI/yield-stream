/**
 * A generator function that takes a data type and returns a generator of the
 * same type.
 */
export type GeneratorFn<Data> =
  (data?: Data) => Generator<Data> | AsyncGenerator<Data>;

/**
 * A generator function that receives a chunk of data and returns a generator
 * of the same type.
 */
export type StreamGenerator<Data, Chunk, Return> =
  ((data?: Data) => AsyncGenerator<Chunk, Return>) |
  ((data?: Data) => Generator<Chunk, Return>);

/**
 * Composes multiple generator functions into a single generator function.
 * Output type must be the same as input type.
 */
export type Transform<Chunk = Uint8Array> =
  (chunk?: Chunk) => AsyncGenerator<Chunk>;
