/**
 * Wherein we do some crazy shit to check that the named exports from a module
 * conform to an interface. This is done to ensure that we define both Edge and
 * Node versions of platform-specific functions.
 *
 * @see
 * https://github.com/microsoft/TypeScript/issues/420#issuecomment-1325905522
 */

/* ------------------------------- Type Check ------------------------------- */
type SharedImport = typeof import("./shared");
const shared: Shared = {} as SharedImport;
void shared;

type NodeImport = typeof import("./node");
const node: Module = {} as NodeImport;
void node;

type EdgeImport = typeof import("./edge");
const edge: Module = {} as EdgeImport;
void edge;

interface Module {
  yieldStream: unknown;
  generateStream: unknown;
  streamArray: unknown;
  pipeline: unknown;
  buffer: unknown;
}

interface Shared {
  generateArray: unknown;
  compose: unknown;
}

export {};