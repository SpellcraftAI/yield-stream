import { GeneratorFn } from "../types";

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
 * Accepts an array and returns a generator function that yields its items.
 */
export const generateArray = <Chunk>(
  array: Chunk[]
) => {
  return function* () {
    for (const item of array) {
      yield item;
    }
  };
};