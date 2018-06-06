'use strict';

const tabletojson = require('../lib/tabletojson');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, '../test/tables.html'), {encoding: 'UTF-8'});
const converted = tabletojson.convert(html);

console.log(converted);