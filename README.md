[![NPM](https://nodei.co/npm/tabletojson.png)](https://nodei.co/npm/tabletojson/)

[![Build](https://travis-ci.org/maugenst/tabletojson.svg?branch=master)](https://travis-ci.org/maugenst/tabletojson.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/maugenst/tabletojson/badge.svg?branch=master)](https://coveralls.io/github/maugenst/tabletojson?branch=master)
[![Dependencies](https://david-dm.org/maugenst/tabletojson.svg)](https://david-dm.org/maugenst/tabletojson)
[![Known Vulnerabilities](https://snyk.io/test/github/maugenst/tabletojson/badge.svg?targetFile=package.json)](https://snyk.io/test/github/maugenst/tabletojson?targetFile=package.json)

# Table to JSON

Attempts to convert HTML tables into JSON.

Can be passed the markup for a single table as a string, a fragment of HTML or an entire page or just 
a URL (with an optional callback function; promises also supported).

The response is always an array. Every array entry in the response represents a table found on the page 
(in same the order they were found in the HTML).

## Basic usage

Install via npm

```
npm install tabletojson
```

### Remote (`convertUrl`)

```javascript
'use strict';

const tabletojson = require('tabletojson');

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

const tabletojson = require('../lib/tabletojson');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, '../test/tables.html'), {encoding: 'UTF-8'});
const converted = tabletojson.convert(html);

console.log(converted);
```

### Duplicate column headings 

If there are duplicate column headings, subsequent headings are suffixed with a count:

```
// Table
| PLACE | VALUE | PLACE | VALUE |
|   abc |     1 |   def |     2 |

// Example output
[{
  PLACE: 'abc', VALUE: '1',
  PLACE_2: 'def', VALUE_2: '2',
}]
```

### Tables with headings in the first column 

If a table contains headings in the first column you might get an unexpected result, but you can pass a 
second argument with options with `{ useFirstRowForHeadings: true }` to have it treat the first column 
as it would any other cell.

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

The following options are true by default, which converts all values to plain text to give you an easier 
more readable object to work with:

* stripHtmlFromHeadings
* stripHtmlFromCells

If your table contains HTML you want to parse (for example for links) you can set `stripHtmlFromCells` 
to `false` to treat it as raw text.

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

You probably don't need to set `stripHtmlFromHeadings` to false (and setting it to false can make the 
results hard to parse), but if you do you can also set both at the same time by setting `stripHtml` to 
false.


## Options

### request (only `convertUrl`)
If you need to get data from a remote server to pass it to the parser you can call `tabletojson.convertUrl`.
When working behind a proxy you can pass any request-options (proxy, headers,...) by adding a request
object to the options passed to `convertUrl`.
for more information on how to configure request please have a look at: [https://github.com/request/request](https://github.com/request/request)

``` javascript
tabletojson.convertUrl('https://www.timeanddate.com/holidays/ireland/2017', {
    useFirstRowForHeadings: true,
    request: {
        proxy: 'http://proxy:8080'
    }
});
```

### stripHtmlFromHeadings
Strip any HTML from heading cells. Default is true.

```
// Table
| KEY | <b>VALUE</b> |
| abc |            1 |
| dev |            2 |

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

```
// Table
| KEY |    VALUE |
| abc | <i>1</i> |
| dev | <i>2</i> |

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

``` javascript
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
Default is 'true'. If set to 'false' duplicate headings will not get a trailing _<NUMBER>. The value of 
the field will be the last value found in the table row:

```
// Table
| PLACE | VALUE | PLACE | VALUE |
|   abc |     1 |   def |     2 |
|   ghi |     3 |   jkl |     4 |

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

```
// Table
| NAME | PLACE | WEIGHT | SEX | AGE |
|  Mel |     1 |     58 |   W |  23 |
|  Tom |     2 |     78 |   M |  54 |
| Bill |     3 |     92 |   M |  31 |

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

```
// Table
| NAME | PLACE | WEIGHT | SEX | AGE |
|  Mel |     1 |     58 |   W |  23 |
|  Tom |     2 |     78 |   M |  54 |
| Bill |     3 |     92 |   M |  31 |

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

```
// Table
 | NAME | PLACE | WEIGHT | SEX | AGE |
 |  Mel |     1 |     58 |   W |  23 |
 |  Tom |     2 |     78 |   M |  54 |
 | Bill |     3 |     92 |   M |  31 |
*|  Cat |     4 |      4 |   W |   2 |*

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
Array of Strings to be used as headings. Default is 'null/undefined'.

If more headings are given than columns exist the overcounting ones will be ignored. If less headings 
are given than existing values the overcounting values are ignored.

```
// Table
 | NAME | PLACE | WEIGHT | SEX | AGE |
 |  Mel |     1 |     58 |   W |  23 |
 |  Tom |     2 |     78 |   M |  54 |
 | Bill |     3 |     92 |   M |  31 |
*|  Cat |     4 |      4 |   W |   2 |*


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
Number of rows to which the resulting object should be limited to. Default is 'null/undefined'.

```
// Huge Table (see test/tables.html)
 | Roleplayer Number | Name            | Text to say                                     |
 |  0                | Raife Parkinson | re dolor in hendrerit in vulputate ve           | 
 |  1                | Hazel Schultz   | usto duo dolores et ea rebum. Ste               | 
 |  2                | Montana Delgado | psum dolor sit amet. Lorem ipsum dolor sit ame  | 
 |  3                | Dianne Mcbride  | olor sit amet. Lorem ipsum                      | 
 |  4                | Xena Lynch      | us est Lorem ipsum dol                          |
 |  5                | Najma Holding   | akimata sanctus est Lorem ipsum dolor sit ame   |
 |  6                | Kiki House      | nvidunt ut                                      |
.
.
.
 | 197               | Montana Delgado | lores et ea rebum. Stet clita kasd gu           | 
 | 198               | Myrtle Conley   | a rebum. Stet clita kasd gubergren, no sea taki | 
 | 199               | Hanna Ellis     | kimata sanctus est Lorem ipsum dolor si         | 


// Example output with limitrows: 5
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
Array of classes to find a specific table using this class. Default is 'null/undefined'.

## Known issues and limitations

This module only supports parsing basic tables with a simple horizontal set of <th></th> headings and 
corresponding <td></td> cells.

It can give useless or weird results on tables that have complex structures (such as nested tables) or 
multiple headers (such as on both X and Y axis).

You'll need to handle things like work out which tables to parse and (in most cases) clean up the data. 
You might want to combine it it with modules like json2csv or CsvToMarkdownTable.

You might want to use it with a module like 'cheerio' if you want to parse specific tables identified 
by id or class (i.e. select them with cheerio and pass the HTML of them as a string).

## Example usage

```javascript
// Convert an HTML blob into an array of all the tables on the page
var tabletojson = require('tabletojson');
var tablesAsJson = tabletojson.convert(html);
var firstTableAsJson = tablesAsJson[0];
var secondTableAsJson = tablesAsJson[1];
...
```

```javascript
// Fetch a URL and parse all it's tables into JSON, using a callback
var tabletojson = require('tabletojson');
var url = 'https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes';
tabletojson.convertUrl(url, function(tablesAsJson) {
  var listofSovereignStates = tablesAsJson[0];
});
```

```javascript
// Fetch a URL and parse all it's tables into JSON, using promises
var tabletojson = require('tabletojson');
var url = 'http://en.wikipedia.org/wiki/List_of_countries_by_credit_rating';
tabletojson.convertUrl(url)
.then(function(tablesAsJson) {
  var standardAndPoorRatings = tablesAsJson[1];
  var fitchRatings = tablesAsJson[2];
});
```

```javascript
// Fetch a table from Wikipedia and combine with json2csv to convert to CSV
var tabletojson = require('tabletojson');
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

# Issues

Right now the table needs to be "well formatted" to be convertable. Tables in tables with not be 
processed.

```html
<thead>
    <tr>
        <th>Header</th>
    <tr>
</thead>
```

# Contributing

Improvements, fixes and suggestions for better written modules that other people have created are welcome, as are bug 
reports against specific tables it is unable to handle.

You can find basic tests in the test folder. I implemented the most straight forward way in using the library. Nonetheless
there are some edge cases that need to be tested and I would like to ask for support here. Feel free to fork and create
PRs here. Every bit of help is appreciated.

To get also an insight you can use Iain's examples located in the example folder included with this project that shows
usage and would be a good start.

If you submit a pull request, please add an example for your use case, so I can understand what you want it to do (as I 
want to get around to writing tests for this and want to understand the sort of use cases people have).

# Thanks

June 2018 - Very special thanks to the originator of the library, Iain Collins (@iaincollins). Without his investigation in website 
grasping and mastering cheerio this lib would have not been where it is right now. Also I would personally like to say 
"Thank you" for your trust in passing me the ownership. @maugenst 

Additional thanks to @roryok, Max Thyen (@maxthyen), Thor Jacobsen (@twjacobsen) and Michael Keller (@mhkeller) for 
improvements and bug fixes.