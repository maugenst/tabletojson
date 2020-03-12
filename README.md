# Table to JSON

Attempts to convert HTML tables into JSON.

[![NPM](https://nodei.co/npm/tabletojson.png)](https://nodei.co/npm/tabletojson)

[![Build](https://travis-ci.org/maugenst/tabletojson.svg?branch=master)](https://travis-ci.org/maugenst/tabletojson.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/maugenst/tabletojson/badge.svg?branch=master)](https://coveralls.io/github/maugenst/tabletojson?branch=master)
[![Dependencies](https://david-dm.org/maugenst/tabletojson.svg)](https://david-dm.org/maugenst/tabletojson)
[![Known Vulnerabilities](https://snyk.io/test/github/maugenst/tabletojson/badge.svg?targetFile=package.json)](https://snyk.io/test/github/maugenst/tabletojson?targetFile=package.json)

Can be passed the markup for a single table as a string, a fragment of HTML or
an entire page or just a URL (with an optional callback function; promises also
supported).

The response is always an array. Every array entry in the response represents a
table found on the page (in same the order they were found in the HTML).

As of version 2.0 tabletojson is completely written in typescript.

!!! ATTENTION !!!: Incompatible API change in version 2.0.0 since request.js got
deprecated. More information [here](#options)...  

## Conversion from version 1.+ to 2.x

* Require must be changed from ``const tabletojson = require('../lib/tabletojson');`` to either 
``const tabletojson = require('../lib/tabletojson').Tabletojson;`` or
``const {Tabletojson: tabletojson} = require('../lib/tabletojson');``
* Replace request options by got options. More information [here](#options)...

## Basic usage

Install via npm

```sh
npm install tabletojson
```

### Remote (`convertUrl`)

```javascript
'use strict';

const tabletojson = require('tabletojson').Tabletojson;

tabletojson.convertUrl(
    'https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes',
    function(tablesAsJson) {
        console.log(tablesAsJson[1]);
    }
);
```

### Local (`convert`)

Have a look in the examples.

```javascript
// example-6.js
'use strict';

const {Tabletojson: tabletojson} = require('../dist');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, '../test/tables.html'), {encoding: 'UTF-8'});
const converted = tabletojson.convert(html);

console.log(converted);
```

### Duplicate column headings

If there are duplicate column headings, subsequent headings are suffixed with a
count:

PLACE | VALUE | PLACE | VALUE
------|-------|-------|------
  abc |     1 |   def |     2

```js
[{
  PLACE: 'abc', VALUE: '1',
  PLACE_2: 'def', VALUE_2: '2',
}]
```

### Tables with rowspan

Having tables with rowspan, the content of the spawned cell must be available in
the respective object.

<table id="table11" class="table" border="1">
    <thead>
    <tr>
        <th>Parent</th>
        <th>Child</th>
        <th>Age</th>
    </tr>
    </thead>
    <tbody>
        <tr>
            <td rowspan="3">Marry</td>
            <td>Sue</td>
            <td>15</td>
        </tr>
        <tr>
            <td>Steve</td>
            <td>12</td>
        </tr>
        <tr>
            <td>Tom</td>
            <td>3</td>
        </tr>
    </tbody>
</table>

```js
[{
  PARENT: 'Marry', CHILD: 'Tom', AGE, '3',
  PARENT: 'Marry', CHILD: 'Steve', AGE, '12',
  PARENT: 'Marry', CHILD: 'Sue', AGE, '15'
}]
```

### Tables with complex rowspan

Having tables with complex rowspans, the content of the spawned cell must be available in the respective object.

<table id="table12" class="table" border="1">
    <thead>
    <tr>
        <th>Parent</th>
        <th>Child</th>
        <th>Age</th>
    </tr>
    </thead>
    <tbody>
        <tr>
            <td rowspan="3">Marry</td>
            <td>Sue</td>
            <td>15</td>
        </tr>
        <tr>
            <td>Steve</td>
            <td>12</td>
        </tr>
        <tr>
            <td rowspan="2">Tom</td>
            <td rowspan="2">3</td>
        </tr>
        <tr>
            <td rowspan="2">Taylor</td>
        </tr>
        <tr>
            <td>Peter</td>
            <td>17</td>
        </tr>
    </tbody>
</table>

```js
[{
  PARENT: 'Marry', CHILD: 'Sue', AGE, '15'
  PARENT: 'Marry', CHILD: 'Steve', AGE, '12',
  PARENT: 'Marry', CHILD: 'Tom', AGE, '3',
  PARENT: 'Taylor', CHILD: 'Tom', AGE, '3',
  PARENT: 'Taylor', CHILD: 'Peter', AGE, '17'
}]
```

### Tables with headings in the first column

If a table contains headings in the first column you might get an unexpected
result, but you can pass a second argument with options with
`{ useFirstRowForHeadings: true }` to have it treat the first column as it would
any other cell.

``` javascript
tabletojson.convertUrl(
  'https://www.timeanddate.com/holidays/ireland/2017',
  { useFirstRowForHeadings: true },
  function(tablesAsJson) {
    console.log(tablesAsJson);
  }
);
```

### Tables with HTML

The following options are true by default, which converts all values to plain
text to give you an easier more readable object to work with:

* stripHtmlFromHeadings
* stripHtmlFromCells

If your table contains HTML you want to parse (for example for links) you can
set `stripHtmlFromCells` to `false` to treat it as raw text.

``` javascript
tabletojson.convertUrl(
  'https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes',
  { stripHtmlFromCells: false },
  function(tablesAsJson) {
    //Print out the 1st row from the 2nd table on the above webpage as JSON
    console.log(tablesAsJson[1][0]);
  }
);
```

Note: This doesn't work with nested tables, which it will still try to parse.

You probably don't need to set `stripHtmlFromHeadings` to `false` (and setting
it to false can make the results hard to parse), but if you do you can also set
both at the same time by setting `stripHtml` to `false`.

## Options

!!! ATTENTION !!! Since request is not actively supported we need to switch to a
reliable request replacement and I decided to use got.
 
This is an incompatible change in version 2++ so keep this in mind and follow
Sindre's [Migration Guide](https://github.com/sindresorhus/got/blob/master/documentation/migration-guides.md).

For special features like using a proxy you should follow this instructions: 
[Proxies](https://github.com/sindresorhus/got#proxies)


### got (only `convertUrl`)

We are using got to fetch remoter HTML pages. So if you need to get data from a 
remote server you can call `tabletojson.convertUrl` and pass any
got-options (proxy, headers,...) by adding a got object to the options
passed to `convertUrl`. for more information on how to configure request please
have a look at
[Proxies](https://github.com/sindresorhus/got#proxies)

``` javascript
tabletojson.convertUrl('https://www.timeanddate.com/holidays/ireland/2017', {
    useFirstRowForHeadings: true,
    got: {
        agent: tunnel.httpOverHttp({
            proxy: {
                host: 'proxy:8080'
            }
        })
    }
});
```

### stripHtmlFromHeadings

Strip any HTML from heading cells. Default is true.

```md
KEY | <b>VALUE</b>
----|-------------
abc |            1
dev |            2
```

```js
// Example output with stripHtmlFromHeadings:true
[
    {
        KEY: 'abc', VALUE: '1'
    },
    {
        KEY: 'dev', VALUE: '2'
    }
]
// Example output with stripHtmlFromHeadings:false
[
    {
        KEY: 'abc', '<b>VALUE</b>': '1'
    },
    {
        KEY: 'dev', '<b>VALUE</b>': '2'
    }
]
```

### stripHtmlFromCells

Strip any HTML from tableBody cells. Default is true.

```md
KEY |    VALUE
----|---------
abc | <i>1</i>
dev | <i>2</i>
```

```js
// Example output with stripHtmlFromHeadings:true
[
    {
        KEY: 'abc', VALUE: '1'
    },
    {
        KEY: 'dev', VALUE: '2'
    }
]
// Example output with stripHtmlFromHeadings:false
[
    {
        KEY: 'abc', 'VALUE': '<i>1</i>'
    },
    {
        KEY: 'dev', 'VALUE': '<i>2</i>'
    }
]
```

### forceIndexAsNumber

Instead of using column text (that sometime re-order the data), force an index as a number (string number).

``` json
// Some JSON (Other rows)
{
  "0": "",
  "1": "Ａ会",
  "2": "Ｂ会",
  "3": "Ｃ会",
  "4": "Something",
  "5": "Else",
  "6": ""
}
// Some JSON (Other rows)
```

### countDuplicateHeadings

Default is `true`. If set to `false`, duplicate headings will not get a trailing
number. The value of the field will be the last value found in the table row:

PLACE | VALUE | PLACE | VALUE
------|-------|-------|------
  abc |     1 |   def |     2
  ghi |     3 |   jkl |     4

```js
// Example output with countDuplicateHeadings:false
[
    {
        PLACE: 'def', VALUE: '2'
    },
    {
        PLACE: 'jkl', VALUE: '4'
    }
]
```

### ignoreColumns

Array of indexes to be ignored, starting with 0. Default is 'null/undefined'.

 NAME | PLACE | WEIGHT | SEX | AGE
------|-------|--------|-----|----
 Mel  |     1 |     58 |   W |  23
 Tom  |     2 |     78 |   M |  54
 Bill |     3 |     92 |   M |  31

```js
// Example output with ignoreColumns: [2, 3]
[
    {
        NAME: 'Mel', PLACE: '1', AGE: '23'
    },
    {
        NAME: 'Tom', PLACE: '2', AGE: '54'
    },
    {
        NAME: 'Bill', PLACE: '3', AGE: '31'
    }
]
```

### onlyColumns

Array of indexes that are taken, starting with 0. Default is 'null/undefined'.
If given, this option overrides ignoreColumns.

 NAME | PLACE | WEIGHT | SEX | AGE
------|-------|--------|-----|----
 Mel  |     1 |     58 |   W |  23
 Tom  |     2 |     78 |   M |  54
 Bill |     3 |     92 |   M |  31

```js
// Example output with onlyColumns: [0, 4]
[
    {
        NAME: 'Mel', AGE: '23'
    },
    {
        NAME: 'Tom', AGE: '54'
    },
    {
        NAME: 'Bill', AGE: '31'
    }
]
```

### ignoreHiddenRows

Indicates if hidden rows (display:none) are ignored. Default is true:

 NAME | PLACE | WEIGHT | SEX | AGE
------|-------|--------|-----|----
 Mel  |     1 |     58 |   W |  23
 Tom  |     2 |     78 |   M |  54
 Bill |     3 |     92 |   M |  31
* Cat |     4 |      4 |   W |   2*

```js
// Example output with ignoreHiddenRows:true
[
    {
        NAME: 'Mel', PLACE: '1', WEIGHT: '58', SEX: 'W', AGE: '23'
    },
    {
        NAME: 'Tom', PLACE: '2', WEIGHT: '78', SEX: 'M', AGE: '54'
    },
    {
        NAME: 'Bill', PLACE: '3', WEIGHT: '92', SEX: 'M', AGE: '31'
    }
]
// Example output with ignoreHiddenRows:false
[
    {
        NAME: 'Mel', PLACE: '1', WEIGHT: '58', SEX: 'W', AGE: '23'
    },
    {
        NAME: 'Tom', PLACE: '2', WEIGHT: '78', SEX: 'M', AGE: '54'
    },
    {
        NAME: 'Bill', PLACE: '3', WEIGHT: '92', SEX: 'M', AGE: '31'
    }
    },
    {
        NAME: 'Cat', PLACE: '4', WEIGHT: '4', SEX: 'W', AGE: '2'
    }
]
```

### headings

Array of Strings to be used as headings. Default is `null`/`undefined`.

If more headings are given than columns exist the overcounting ones will be ignored. If less headings
are given than existing values the overcounting values are ignored.

 NAME | PLACE | WEIGHT | SEX | AGE
------|-------|--------|-----|----
 Mel  |     1 |     58 |   W |  23
 Tom  |     2 |     78 |   M |  54
 Bill |     3 |     92 |   M |  31
* Cat |     4 |      4 |   W |   2*

```js
// Example output with headings: ['A','B','C','D','E']
[
    {
        A: 'Mel', B: '1', C: '58', D: 'W', E: '23'
    },
    {
        A: 'Tom', B: '2', C: '78', D: 'M', E: '54'
    },
    {
        A: 'Bill', B: '3', C: '92', D: 'M', E: '31'
    }
]
// Example output with headings: ['A','B','C']
[
    {
        A: 'Mel', B: '1', C: '58'
    },
    {
        A: 'Tom', B: '2', C: '78'
    },
    {
        A: 'Bill', B: '3', C: '92'
    }
]
// Example output with headings: ['A','B','C','D','E','F','G','H']
[
    {
        A: 'Mel', B: '1', C: '58', D: 'W', E: '23'
    },
    {
        A: 'Tom', B: '2', C: '78', D: 'M', E: '54'
    },
    {
        A: 'Bill', B: '3', C: '92', D: 'M', E: '31'
    }
]
// Example output with headings: ['A','B','C'] && ignoreColumns: [2, 3]
[
    {
        A: 'Mel', B: 'W', C: '23'
    },
    {
        A: 'Tom', B: 'M', C: '54'
    },
    {
        A: 'Bill', B: 'M', C: '31'
    }
]

```

### limitrows

Number of rows to which the resulting object should be limited to. Default is
`null`/`undefined`.

#### Huge Table (see test/tables.html)

Roleplayer Number | Name            | Text to say
------------------|-----------------|------------
 0                | Raife Parkinson | re dolor in hendrerit in vulputate ve
 1                | Hazel Schultz   | usto duo dolores et ea rebum. Ste
 2                | Montana Delgado | psum dolor sit amet. Lorem ipsum dolor
 3                | Dianne Mcbride  | sit ame olor sit amet. Lorem ipsum
 4                | Xena Lynch      | us est Lorem ipsum dol
 5                | Najma Holding   | akimata sanctus est Lorem ipsum dolor sit
 6                | Kiki House      | ame nvidunt ut
...|
197               | Montana Delgado | lores et ea rebum. Stet clita kasd gu a
198               | Myrtle Conley   | rebum. Stet clita kasd gubergren, no sea
199               | Hanna Ellis     | kimata sanctus est Lorem ipsum dolor si

#### Example output with limitrows: 5

```js
[ { 'Roleplayer Number': '0',
        Name: 'Raife Parkinson',
        'Text to say': 're dolor in hendrerit in vulputate ve' },
      { 'Roleplayer Number': '1',
        Name: 'Hazel Schultz',
        'Text to say': 'usto duo dolores et ea rebum. Ste' },
      { 'Roleplayer Number': '2',
        Name: 'Montana Delgado',
        'Text to say': 'psum dolor sit amet. Lorem ipsum dolor sit ame' },
      { 'Roleplayer Number': '3',
        Name: 'Dianne Mcbride',
        'Text to say': 'olor sit amet. Lorem ipsum' },
      { 'Roleplayer Number': '4',
        Name: 'Xena Lynch',
        'Text to say': 'us est Lorem ipsum dol' } ]
```

### containsClasses

Array of classes to find a specific table using this class. Default is `null`/
`undefined`.

## Known issues and limitations

This module only supports parsing basic tables with a simple horizontal set of
`<th></th>` headings and corresponding `<td></td>` cells.

It can give useless or weird results on tables that have complex structures
(such as nested tables) or multiple headers (such as on both X and Y axis).

You'll need to handle things like work out which tables to parse and (in most
cases) clean up the data. You might want to combine it it with modules like
json2csv or CsvToMarkdownTable.

You might want to use it with a module like 'cheerio' if you want to parse
specific tables identified by id or class (i.e. select them with cheerio and
pass the HTML of them as a string).

## Example usage

```javascript
// Convert an HTML blob into an array of all the tables on the page
var tabletojson = require('tabletojson').Tabletojson;
var tablesAsJson = tabletojson.convert(html);
var firstTableAsJson = tablesAsJson[0];
var secondTableAsJson = tablesAsJson[1];
...
```

```javascript
// Fetch a URL and parse all it's tables into JSON, using a callback
var tabletojson = require('tabletojson').Tabletojson;
var url = 'https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes';
tabletojson.convertUrl(url, function(tablesAsJson) {
  var listofSovereignStates = tablesAsJson[0];
});
```

```javascript
// Fetch a URL and parse all it's tables into JSON, using promises
var tabletojson = require('tabletojson').Tabletojson;
var url = 'http://en.wikipedia.org/wiki/List_of_countries_by_credit_rating';
tabletojson.convertUrl(url)
.then(function(tablesAsJson) {
  var standardAndPoorRatings = tablesAsJson[1];
  var fitchRatings = tablesAsJson[2];
});
```

```javascript
// Fetch a table from Wikipedia and combine with json2csv to convert to CSV
var tabletojson = require('tabletojson').Tabletojson;
var json2csv = require('json2csv');
var url = 'http://en.wikipedia.org/wiki/List_of_countries_by_credit_rating';
tabletojson.convertUrl(url)
.then(function(tablesAsJson) {
  var standardAndPoorCreditRatings = tablesAsJson[1];
  json2csv({ data: standardAndPoorCreditRatings,
             fields: [ 'Country', 'Outlook']
           }, function(err, csv) {
            console.log(csv);
            /* Example output
              "Country","Outlook"
              "Abu Dhabi, UAE","Stable"
              "Albania","Stable"
              "Andorra","Negative"
              "Angola","Stable"
              "Argentina","Negative"
              "Aruba","Stable"
              "Australia","Stable"
              "Austria","Negative"
              "Azerbaijan","Positive"
              ...
            */
          });
});
```

## Issues

Right now the table needs to be "well formatted" to be convertable. Tables in
tables with not be processed.

```html
<thead>
    <tr>
        <th>Header</th>
    <tr>
</thead>
```

## Contributing

Improvements, fixes and suggestions for better written modules that other people
have created are welcome, as are bug reports against specific tables it is
unable to handle.

You can find basic tests in the test folder. I implemented the most straight
forward way in using the library. Nonetheless there are some edge cases that
need to be tested and I would like to ask for support here. Feel free to fork
and create PRs here. Every bit of help is appreciated.

To get also an insight you can use Iain's examples located in the example folder
included with this project that shows usage and would be a good start.

If you submit a pull request, please add an example for your use case, so I can
understand what you want it to do (as I want to get around to writing tests for
this and want to understand the sort of use cases people have).

## Thanks

June 2018 - Very special thanks to the originator of the library, Iain Collins
(@iaincollins). Without his investigation in website grasping and mastering
cheerio this lib would have not been where it is right now. Also I would
personally like to say "Thank you" for your trust in passing me the ownership.
Marius (@maugenst)

Additional thanks to

* @roryok
* Max Thyen (@maxthyen)
* Thor Jacobsen (@twjacobsen)
* Michael Keller (@mhkeller)
* Jesús Leganés-Combarro (@piranna)
* João Otávio Ferreira Barbosa (@joaobarbosa)

for improvements and bug fixes.
