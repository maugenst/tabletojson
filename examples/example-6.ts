import {tabletojson} from '../lib/Tabletojson';
import * as fs from 'fs';
import * as path from 'path';
const html = fs.readFileSync(path.resolve(process.cwd(), '../../test/tables.html'), {
    encoding: 'utf-8',
});
const converted = tabletojson.convert(html);
console.log(converted);
