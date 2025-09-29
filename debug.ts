import {source} from "./packages/envrw/src/index.js";

// const start = performance.now();

// const DEBUG = await source(".env").read("DEBUG");

// const end = performance.now();

// console.log(DEBUG);
// console.log(`Took ${end - start} ms`);

await source(".env").write("DEBUG", "hey");