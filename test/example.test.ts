/* eslint-disable no-console */
import test from "ava";
import { buffer, streamArray, yieldStream } from "../src";

test("streams and generators should work properly", async (t) => {
  const testArray = [1, 2, 3, 4, 5];
  const stream = streamArray(testArray);

  let i = 0;
  for await (const chunk of yieldStream(stream)) {
    console.log(chunk);
    t.is(chunk, testArray[i], "chunk should match testArray");
    i++;
  }

  const forBuffering = streamArray(testArray);
  const buffered = buffer(forBuffering);

  let j = 0;
  for await (const chunk of buffered) {
    console.log(chunk);
    t.deepEqual(chunk, testArray.slice(0, j + 1), "buffered chunk should match testArray");
    j++;
  }

  t.pass();
});