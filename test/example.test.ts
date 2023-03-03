/* eslint-disable no-console */
import test from "ava";

const NODE_MAJOR_VERSION = Number(process.versions.node.split(".")[0]);
const EdgeModule = await import("yield-stream");
const NodeModule = await import("yield-stream/node");

const variants = {
  edge: EdgeModule,
  node: NodeModule,
};

test("streams and generators should work properly", async (t) => {
  for (const [name, module] of Object.entries(variants)) {
    if (NODE_MAJOR_VERSION < 18 && name === "edge") {
      t.pass(`[${name}] Skipping for Node <18`);
      continue;
    }

    await t.notThrowsAsync(
      async () => {
        const { buffer, streamArray, yieldStream } = module;

        let i = 0;
        const testArray = [1, 2, 3, 4, 5];
        const stream = streamArray(testArray);

        for await (const chunk of yieldStream(stream as never)) {
          console.log(chunk);
          t.assert(chunk === testArray[i], "chunk should match testArray");
          i++;
        }

        const forBuffering = streamArray(testArray);
        const buffered = buffer(forBuffering as never);

        let j = 0;
        for await (const chunk of buffered) {
          console.log(chunk);
          t.deepEqual(chunk, testArray.slice(0, j + 1), "buffered chunk should match testArray");
          j++;
        }
      },
      `[${name}] tests should pass`
    );
  }

  t.pass();
});