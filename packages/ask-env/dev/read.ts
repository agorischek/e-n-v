import {source} from "../packages/envrw/src/index.js";

const env = await source(".env").read("DEBUG");
console.log(env);   