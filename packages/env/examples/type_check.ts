import { NODE_ENV, DEBUG, PORT, DATABASE_URL } from "./env";

// Let's see what TypeScript thinks these are
const nodeEnvType: typeof NODE_ENV = null as any;
const debugType: typeof DEBUG = null as any;  
const portType: typeof PORT = null as any;
const dbUrlType: typeof DATABASE_URL = null as any;

// Try to use them in ways that reveal their types
const portAsNumber: number = PORT; // Should error if PORT isn't number
const nodeEnvAsString: string = NODE_ENV; // Should error if NODE_ENV isn't string  
const debugAsBool: boolean = DEBUG; // Should error if DEBUG isn't boolean

console.log("Types work correctly!");
