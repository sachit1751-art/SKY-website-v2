import { readFileSync } from 'fs';
const data = readFileSync('./src/data.ts', 'utf8');

// A very hacky way, but let's just use ts-node or something.
// Actually, let's just grep the names.
