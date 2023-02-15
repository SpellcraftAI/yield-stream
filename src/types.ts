/**
 * A generator function that takes a data type and returns a generator of the
 * same type.
 */
export type GeneratorFn<T> =
  (data?: T) => Generator<T> | AsyncGenerator<T>;

/**
 * A generator function that receives a chunk of data and returns a generator
 * of the same type.
 */
export type StreamGenerator<D, T, TReturn> =
  ((data?: D) => AsyncGenerator<T, TReturn>) |
  ((data?: D) => Generator<T, TReturn>);

/**
 * Composes multiple generator functions into a single generator function.
 * Output type must be the same as input type.
 */
export type Transform = (chunk: Uint8Array) => AsyncGenerator<Uint8Array>;
