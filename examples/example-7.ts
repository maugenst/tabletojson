import {tabletojson} from '../lib/Tabletojson';
import * as fs from 'fs';
import * as path from 'path';
const html = fs.readFileSync(path.resolve(process.cwd(), '../test/tables.html'), {
    encoding: 'utf-8',
});
const converted = tabletojson.convert(html, {
    id: ['table15'],
    headers: {
        to: 2,
        concatWith: ' ',
    },
});
console.log(JSON.stringify(converted, null, 2));
