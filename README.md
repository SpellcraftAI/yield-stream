# `yield-stream`

[**Github**](https://github.com/gptlabs/yield-stream) |
[**NPM**](https://npmjs.com/package/yield-stream) |
[**Docs**](https://yield-stream.vercel.app)

A small library for switching between streams, generators, and arrays. See docs
for details.

### Note: Using `NodeJS.ReadableStream`

By default, this library uses WHATWG `ReadableStream`, which is only available
on Node 18+. If you are on an older version of Node or otherwise need to use
`NodeJS.ReadableStream`, import from:

```ts
import { yieldStream } from "yield-stream/node";
```