#!/bin/sh

cat >dist/lib/cjs/package.json <<!EOF
{
    "type": "commonjs"
}
!EOF
mv dist/lib/cjs/Tabletojson.d.ts @typings

cat >dist/lib/mjs/package.json <<!EOF
{
    "type": "module"
}
!EOF
mv dist/lib/mjs/Tabletojson.d.ts @typings
npx @biomejs/biome lint ./@typings --write
