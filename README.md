# Tabletojson: Converting Table to JSON objects made easy

[![CircleCI](https://circleci.com/gh/maugenst/tabletojson.svg?style=shield)](https://circleci.com/gh/maugenst/tabletojson)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/9e26dee5b7774ceea1b3f01dcaa51c41)](https://app.codacy.com/gh/maugenst/tabletojson/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/9e26dee5b7774ceea1b3f01dcaa51c41)](https://app.codacy.com/gh/maugenst/tabletojson/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_coverage)
[![Known Vulnerabilities](https://snyk.io/test/github/maugenst/tabletojson/badge.svg)](https://snyk.io/test/github/maugenst/tabletojson)

Convert local or remote HTML embedded tables into JSON objects.

# Table of Contents
- [Introduction](#introduction)
- [Incompatible changes](#incompatible-changes)
    * [Conversion from version 1.+ to 2.x](#conversion-from-version-1-to-2x)
    * [Conversion from version 2.0.1 to 3.x](#conversion-from-version-201-to-3x)
- [Installation](#installation)
- [Quickstart](#quickstart)
    * [esm](#esm)
    * [commonjs](#commonjs)
    * [Remote (`convertUrl`)](#remote-converturl)
    * [Local (`convert`)](#local-convert)
- [Use case examples](#use-case-examples)
    * [Duplicate column headings](#duplicate-column-headings)
    * [Tables with rowspan](#tables-with-rowspan)
    * [Tables with complex rowspan](#tables-with-complex-rowspan)
    * [Tables with even more complex rowspans](#tables-with-even-more-complex-rowspans)
    * [Tables with headings in the first column](#tables-with-headings-in-the-first-column)
    * [Tables with HTML](#tables-with-html)
    * [Tables with complex headers](#tables-with-complex-headers)
- [Options](#options)
    * [fetchOptions (only `convertUrl`)](#fetchoptions-only-converturl)
    * [headers](#headers)
    * [stripHtmlFromHeadings](#striphtmlfromheadings)
    * [stripHtmlFromCells](#striphtmlfromcells)
    * [forceIndexAsNumber](#forceindexasnumber)
    * [countDuplicateHeadings](#countduplicateheadings)
    * [ignoreColumns](#ignorecolumns)
    * [onlyColumns](#onlycolumns)
    * [ignoreHiddenRows](#ignorehiddenrows)
    * [headings](#headings)
    * [limitrows](#limitrows)
        + [Huge Table (see test/tables.html)](#huge-table-see-testtableshtml)
        + [Example output with limitrows: 5](#example-output-with-limitrows-5)
    * [containsClasses](#containsclasses)
- [Known issues and limitations](#known-issues-and-limitations)
- [Usage](#usage)
    * [Convert an HTML text into an array of all the tables on the page](#convert-an-html-text-into-an-array-of-all-the-tables-on-the-page)
    * [Fetch a URL and parse all it's tables into JSON, using a callback](#fetch-a-url-and-parse-all-its-tables-into-json-using-a-callback)
    * [Fetch a URL and parse all it's tables into JSON, using promises](#fetch-a-url-and-parse-all-its-tables-into-json-using-promises)
    * [Fetch a table from Wikipedia and combine with json2csv to convert to CSV](#fetch-a-table-from-wikipedia-and-combine-with-json2csv-to-convert-to-csv)
- [Contributing](#contributing)
    * [Contributors](#contributors)

## Introduction

Tabletojson attempts to convert local or remote HTML tables into JSON with a very low footprint. 
Can be passed the markup for a single table as a string, a fragment of HTML or
an entire page or just a URL (with an optional callback function; promises also
supported).

The response is always an array. Every array entry in the response represents a
table found on the page (in same the order they were found in HTML).

As of version 2.0 tabletojson is completely written in typescript.

## Incompatible changes
* Version 2 on request.js is not used anymore
* Version >=2.1.0 got is not used anymore and got replaced by node internal fetch. more information [here](#options)...
* Switched from commonjs to module system. Bumped version to 3.0.0  
* Providing a "hybrid" library to cope with the needs of both esm and commonjs. Bumped version to 4.0.1.
* Adding support for complex headings as key in the output json object. Bumped version to 4.1.0. 

### Conversion from version 1.+ to 2.x

* Require must be changed from ``const tabletojson = require('../lib/tabletojson');`` to either 
``const tabletojson = require('../lib/tabletojson').Tabletojson;`` or
``const {Tabletojson: tabletojson} = require('../lib/tabletojson');``
* Replace request options by fetch options. More information [here](#options)...

### Conversion from version 2.0.1 to 3.x

* Tabletojson now uses esm. Use ``import {Tabletojson as tabletojson} from 'tabletojson';`` or ``import {tabletojson} from 'tabletojson';``
* Added lowercase import ``import {tabletojson} from 'tabletojson';``
* If you are using Node 18 execute examples by calling:
```sh
npm run build:examples
cd dist/examples
node --experimental-vm-modules --experimental-specifier-resolution=node example-1.js --prefix=dist/examples
```

## Installation

```sh
npm install tabletojson
```

## Quickstart

### esm

```typescript
import {tabletojson} from 'tabletojson';
tabletojson.convertUrl('https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes', function (tablesAsJson) {
  console.log(tablesAsJson[1]);
});
```

### commonjs

```javascript
const {tabletojson} = require('tabletojson');
tabletojson.convertUrl('https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes', function (tablesAsJson) {
  console.log(tablesAsJson[1]);
});
```

### Remote (`convertUrl`)

```typescript
// example-1.ts
import {tabletojson} from 'tabletojson';
tabletojson.convertUrl('https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes', function (tablesAsJson) {
    console.log(tablesAsJson[1]);
});
```

### Local (`convert`)

More examples can be found in examples folder.

```typescript
// example-6.ts
import {tabletojson} from 'tabletojson';
import * as fs from 'fs';
import * as path from 'path';
const html = fs.readFileSync(path.resolve(process.cwd(), '../../test/tables.html'), {
  encoding: 'utf-8',
});
const converted = tabletojson.convert(html);
console.log(converted);
```

## Use case examples

### Duplicate column headings

Tables with duplicate column headings, subsequent headings are suffixed with a
count:

```md
|| PLACE || VALUE || PLACE || VALUE ||
|--------|--------|--------|---------|
| abc    |      1 |    def |      2  |
```

```json
[
  {
    "PLACE": "abc",
    "VALUE": "1",
    "PLACE_2": "def",
    "VALUE_2": "2"
  }
]
```

### Tables with rowspan

In tables with rowspan, the content of the spawned cell must be available in
the respective object.

<table id="table11" class="table" style="border: solid">
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

```json
[
  {"Parent": "Marry", "Child": "Tom", "Age": "3"},
  {"Parent": "Marry", "Child": "Steve", "Age": "12"},
  {"Parent": "Marry", "Child": "Sue", "Age": "15"}
]
```

### Tables with complex rowspan

In tables with complex rowspans, the content of the spawned cell must be available in the respective object.

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

```json
[
  {"Parent": "Marry", "Child": "Sue", "Age": "15"},
  {"Parent": "Marry", "Child": "Steve", "Age": "12"},
  {"Parent": "Marry", "Child": "Tom", "Age": "3"},
  {"Parent": "Taylor", "Child": "Tom", "Age": "3"},
  {"Parent": "Taylor", "Child": "Peter", "Age": "17"}
]
```

### Tables with even more complex rowspans

In tables with even more complex rowspans, the content of the spawned cell must be available in the respective object.

<table id="table12-a" class="table" border="1">
    <thead>
    <tr>
        <th>Department</th>
        <th>Major</th>
        <th>Class</th>
        <th>Instructor</th>
        <th>Credit</th>
    </tr>
    </thead>
    <tbody>
        <tr>
            <td rowspan="4">Engineering</td>
            <td rowspan="3">Computer Science</td>
            <td>CS101</td>
            <td>Kim</td>
            <td rowspan="2">3</td>
        </tr>
        <tr>
            <td>CS201</td>
            <td rowspan="2">Garcia</td>
        </tr>
        <tr>
            <td>CS303</td>
            <td>2</td>
        </tr>
        <tr>
            <td>Electrical Engineering</td>
            <td>EE101</td>
            <td>Müller</td>
            <td>3</td>
        </tr>
        <tr>
            <td rowspan="2">Social Science</td>
            <td rowspan="2">Economics</td>
            <td>EC101</td>
            <td>Nguyen</td>
            <td rowspan="2">3</td>
        </tr>
        <tr>
            <td>EC401</td>
            <td>Smith</td>
        </tr>
    </tbody>
</table>


```json
[
    {
        "Department": "Engineering",
        "Major": "Computer Science",
        "Class": "CS101",
        "Instructor": "Kim",
        "Credit": "3"
    },
    {
        "Department": "Engineering",
        "Major": "Computer Science",
        "Credit": "3",
        "Class": "CS201",
        "Instructor": "Garcia"
    },
    {
        "Department": "Engineering",
        "Major": "Computer Science",
        "Instructor": "Garcia",
        "Class": "CS303",
        "Credit": "2"
    },
    {
        "Department": "Engineering",
        "Major": "Electrical Engineering",
        "Class": "EE101",
        "Instructor": "Müller",
        "Credit": "3"
    },
    {
        "Department": "Social Science",
        "Major": "Economics",
        "Class": "EC101",
        "Instructor": "Nguyen",
        "Credit": "3"
    },
    {
        "Department": "Social Science",
        "Major": "Economics",
        "Credit": "3",
        "Class": "EC401",
        "Instructor": "Smith"
    }
]
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

### Tables with complex headers

Use the following rows as keys in the output json object. The values are flattened and concatenated the values with 'concatWith' [default=undefined]

Input:

<table id="table15" class="table" style="border:solid">
    <tbody>
    <tr>
        <td rowspan="3">Industry</td>
        <td colspan="3">Operating income</td>
        <td colspan="3">Operating costs</td>
        <td colspan="3">Total profit</td>
    </tr>
    <tr>
        <td colspan="2">amount (billion)</td>
        <td rowspan="2">Year-over-year growth (%)</td>
        <td colspan="2">amount (billion)</td>
        <td rowspan="2">Year-over-year growth (%)</td>
        <td colspan="2">amount (billion)</td>
        <td rowspan="2">Year-over-year growth (%)</td>
    </tr>
    <tr>
        <td>$</td>
        <td>€<sup>*</sup></td>
        <td>$</td>
        <td>€<sup>*</sup></td>
        <td>$</td>
        <td>€<sup>*</sup></td>
    </tr>
    <tr>
        <td>total</td>
        <td>843280,70</td>
        <td>758952,63</td>
        <td>-0,30</td>
        <td>718255,00</td>
        <td>646429,50</td>
        <td>0,20</td>
        <td>46558,20</td>
        <td>41902,38</td>
        <td>-11,70</td>
    </tr>
    <tr>
        <td>Coal mining and washing industry</td>
        <td>22937,30</td>
        <td>20643,57</td>
        <td>-13,90</td>
        <td>14653,70</td>
        <td>13188,33</td>
        <td>-7,50</td>
        <td>5236,90</td>
        <td>4713,21</td>
        <td>-26,30</td>
    </tr>
    <tr>
        <td>Oil and gas extraction</td>
        <td>7605,10</td>
        <td>6844,59</td>
        <td>-9,60</td>
        <td>3863,60</td>
        <td>3477,24</td>
        <td>0,10</td>
        <td>2592,70</td>
        <td>2333,43</td>
        <td>-10,80</td>
    </tr>
    <tr>
        <td>Ferrous metal mining and dressing industry</td>
        <td>3010,70</td>
        <td>2709,63</td>
        <td>-4,40</td>
        <td>2369,10</td>
        <td>2132,19</td>
        <td>-4,10</td>
        <td>326,60</td>
        <td>293,94</td>
        <td>-23,80</td>
    </tr>
    <tr>
        <td>Non-ferrous metal mining and dressing industry</td>
        <td>2180,90</td>
        <td>1962,81</td>
        <td>-0,30</td>
        <td>1394,30</td>
        <td>1254,87</td>
        <td>-2,50</td>
        <td>512,10</td>
        <td>460,89</td>
        <td>4,00</td>
    </tr>
    <tr>
        <td>Non-metallic ore mining and dressing industry</td>
        <td>2244,70</td>
        <td>2020,23</td>
        <td>-5,70</td>
        <td>1612,00</td>
        <td>1450,80</td>
        <td>-5,70</td>
        <td>236,10</td>
        <td>212,49</td>
        <td>-7,00</td>
    </tr>
    <tr>
        <td>Mining professional and ancillary activities</td>
        <td>1537,30</td>
        <td>1383,57</td>
        <td>12,70</td>
        <td>1453,70</td>
        <td>1308,33</td>
        <td>11,80</td>
        <td>2,60</td>
        <td>2,34</td>
        <td>-77,00</td>
    </tr>
    <tr>
        <td colspan="10">
            Note: Some indicators in this table have a situation where the total is not equal to the sum of the sub-items, which is due to rounding of the data and has not been mechanically adjusted.<br>
            <sup>*</sup> Conversion rate: 1$=0,9€
        </td>
    </tr>
</table>

Output:

```json
[
    {
        "Industry": "total",
        "Operating income amount (billion) $": "843280,70",
        "Operating income amount (billion) €*": "758952,63",
        "Operating income Year-over-year growth (%)": "-0,30",
        "Operating costs amount (billion) $": "718255,00",
        "Operating costs amount (billion) €*": "646429,50",
        "Operating costs Year-over-year growth (%)": "0,20",
        "Total profit amount (billion) $": "46558,20",
        "Total profit amount (billion) €*": "41902,38",
        "Total profit Year-over-year growth (%)": "-11,70"
    },
    {
        "Industry": "Coal mining and washing industry",
        "Operating income amount (billion) $": "22937,30",
        "Operating income amount (billion) €*": "20643,57",
        "Operating income Year-over-year growth (%)": "-13,90",
        "Operating costs amount (billion) $": "14653,70",
        "Operating costs amount (billion) €*": "13188,33",
        "Operating costs Year-over-year growth (%)": "-7,50",
        "Total profit amount (billion) $": "5236,90",
        "Total profit amount (billion) €*": "4713,21",
        "Total profit Year-over-year growth (%)": "-26,30"
    },
    {
        "Industry": "Oil and gas extraction",
        "Operating income amount (billion) $": "7605,10",
        "Operating income amount (billion) €*": "6844,59",
        "Operating income Year-over-year growth (%)": "-9,60",
        "Operating costs amount (billion) $": "3863,60",
        "Operating costs amount (billion) €*": "3477,24",
        "Operating costs Year-over-year growth (%)": "0,10",
        "Total profit amount (billion) $": "2592,70",
        "Total profit amount (billion) €*": "2333,43",
        "Total profit Year-over-year growth (%)": "-10,80"
    },
    {
        "Industry": "Ferrous metal mining and dressing industry",
        "Operating income amount (billion) $": "3010,70",
        "Operating income amount (billion) €*": "2709,63",
        "Operating income Year-over-year growth (%)": "-4,40",
        "Operating costs amount (billion) $": "2369,10",
        "Operating costs amount (billion) €*": "2132,19",
        "Operating costs Year-over-year growth (%)": "-4,10",
        "Total profit amount (billion) $": "326,60",
        "Total profit amount (billion) €*": "293,94",
        "Total profit Year-over-year growth (%)": "-23,80"
    },
    {
        "Industry": "Non-ferrous metal mining and dressing industry",
        "Operating income amount (billion) $": "2180,90",
        "Operating income amount (billion) €*": "1962,81",
        "Operating income Year-over-year growth (%)": "-0,30",
        "Operating costs amount (billion) $": "1394,30",
        "Operating costs amount (billion) €*": "1254,87",
        "Operating costs Year-over-year growth (%)": "-2,50",
        "Total profit amount (billion) $": "512,10",
        "Total profit amount (billion) €*": "460,89",
        "Total profit Year-over-year growth (%)": "4,00"
    },
    {
        "Industry": "Non-metallic ore mining and dressing industry",
        "Operating income amount (billion) $": "2244,70",
        "Operating income amount (billion) €*": "2020,23",
        "Operating income Year-over-year growth (%)": "-5,70",
        "Operating costs amount (billion) $": "1612,00",
        "Operating costs amount (billion) €*": "1450,80",
        "Operating costs Year-over-year growth (%)": "-5,70",
        "Total profit amount (billion) $": "236,10",
        "Total profit amount (billion) €*": "212,49",
        "Total profit Year-over-year growth (%)": "-7,00"
    },
    {
        "Industry": "Mining professional and ancillary activities",
        "Operating income amount (billion) $": "1537,30",
        "Operating income amount (billion) €*": "1383,57",
        "Operating income Year-over-year growth (%)": "12,70",
        "Operating costs amount (billion) $": "1453,70",
        "Operating costs amount (billion) €*": "1308,33",
        "Operating costs Year-over-year growth (%)": "11,80",
        "Total profit amount (billion) $": "2,60",
        "Total profit amount (billion) €*": "2,34",
        "Total profit Year-over-year growth (%)": "-77,00"
    },
    {
        "Industry": "Note: Some indicators in this table have a situation where the total is not equal to the sum of the sub-items, which is due to rounding of the data and has not been mechanically adjusted.\n            * Conversion rate: 1$=0,9€"
    }
]
```


## Options

### fetchOptions (only `convertUrl`)

Tabletojson is using fetch api which is available in node from version 17.5.0 onwards to fetch remote HTML pages. See
[mdn web docs on fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) for more information. The usage of
Tabletojson should now be the same in node as in browsers.
So if you need to get data from a remote server you can call `tabletojson.convertUrl` and pass any
fetch-options (proxy, headers,...) by adding a RequestInit object to the options
passed to `convertUrl`. For more information on how to configure request please
have a look at [Browser Syntax](https://developer.mozilla.org/en-US/docs/Web/API/fetch#syntax) or [Node fetch](https://nodejs.org/en/blog/announcements/v18-release-announce#fetch-experimental)

``` javascript
tabletojson.convertUrl('https://www.timeanddate.com/holidays/ireland/2017', {
    useFirstRowForHeadings: true,
    fetchOptions: {
        ...
    }
});
```

### headers
Define the rows to be used as keys in the output json object. The values will be concatenated with the given concatWith value. [default=undefined]
``` javascript
const html = fs.readFileSync(path.resolve(process.cwd(), '../test/tables.html'), {
    encoding: 'utf-8',
});
const converted = tabletojson.convert(html, {
    id: ['table15'],

    // from (Optional) Start row [default=0]
    // to End row
    // concatWith Concatenate the values with this string

    headers: {
        to: 2,
        concatWith: ' ',
    },
});
console.log(JSON.stringify(converted, null, 2));
```



### stripHtmlFromHeadings

Strip any HTML from heading cells. Default is true.

```md
||KEY || <b>VALUE</b><||
|-----|----------------|
| abc |              1 |
| dev |              2 |
```

Example output with stripHtmlFromHeadings:true
```json
[
    {
        "KEY": "abc", "VALUE": "1"
    },
    {
        "KEY": "dev", "VALUE": "2"
    }
]
```
Example output with stripHtmlFromHeadings:false
```json
[
    {
        "KEY": "abc", "<b>VALUE</b>": "1"
    },
    {
        "KEY": "dev", "<b>VALUE</b>": "2"
    }
]
```

### stripHtmlFromCells

Strip any HTML from tableBody cells. Default is true.

```md
||KEY ||    VALUE||
|-----|-----------|
|abc  |   <i>1</i>|
|dev  |   <i>2</i>|
```

Example output with stripHtmlFromHeadings:true
```json
[
    {
        "KEY": "abc", "VALUE": "1"
    },
    {
        "KEY": "dev", "VALUE": "2"
    }
]
```
Example output with stripHtmlFromHeadings:false
```json
[
    {
        "KEY": "abc", "VALUE": "<i>1</i>"
    },
    {
        "KEY": "dev", "VALUE": "<i>2</i>"
    }
]
```

### forceIndexAsNumber

Instead of using column text (that sometime re-order the data), force an index as a number (string number).

```json
{
  "0": "",
  "1": "Ａ会",
  "2": "Ｂ会",
  "3": "Ｃ会",
  "4": "Something",
  "5": "Else",
  "6": ""
}
```

### countDuplicateHeadings

Default is `true`. If set to `false`, duplicate headings will not get a trailing
number. The value of the field will be the last value found in the table row:
```md
||PLACE || VALUE || PLACE || VALUE||
|-------|--------|--------|--------|
|   abc |      1 |    def |     2  |
|   ghi |      3 |    jkl |     4  |
```
Example output with countDuplicateHeadings:false
```json
[
    {
        "PLACE": "def", "VALUE": "2"
    },
    {
        "PLACE": "jkl", "VALUE": "4"
    }
]
```

### ignoreColumns

Array of indexes to be ignored, starting with 0. Default is 'null/undefined'.
```md
|| NAME || PLACE || WEIGHT || SEX || AGE ||
|-------|--------|---------|------|-------|
| Mel   |      1 |      58 |    W |  23   |
| Bill  |      3 |      92 |    M |  31   |
| Tom   |      2 |      78 |    M |  54   |
```
Example output with ignoreColumns: [2, 3]
```json
[
    {
        "NAME": "Mel", "PLACE": "1", "AGE": "23"
    },
    {
        "NAME": "Tom", "PLACE": "2", "AGE": "54"
    },
    {
        "NAME": "Bill", "PLACE": "3", "AGE": "31"
    }
]
```

### onlyColumns

Array of indexes that are taken, starting with 0. Default is 'null/undefined'.
If given, this option overrides ignoreColumns.
```md
|| NAME || PLACE || WEIGHT || SEX || AGE ||
|-------|--------|---------|------|-------|
| Mel   |      1 |      58 |    W |     23|
| Tom   |      2 |      78 |    M |     54|
| Bill  |      3 |      92 |    M |     31|
```
Example output with onlyColumns: [0, 4]
```json
[
    {
        "NAME": "Mel", "AGE": "23"
    },
    {
        "NAME": "Tom", "AGE": "54"
    },
    {
        "NAME": "Bill", "AGE": "31"
    }
]
```

### ignoreHiddenRows

Indicates if hidden rows (display:none) are ignored. Default is true:
```md
|| NAME || PLACE || WEIGHT || SEX || AGE ||
|-------|--------|---------|------|-------|
| Mel   |      1 |      58 |    W |     23|
| Tom   |      2 |      78 |    M |     54|
| Bill  |      3 |      92 |    M |     31|
|* Cat  |      4 |       4 |    W |     2*|
```
Example output with ignoreHiddenRows:true
```json
[
  {
    "NAME":"Mel",
    "PLACE":"1",
    "WEIGHT":"58",
    "SEX":"W",
    "AGE":"23"
  },
  {
    "NAME":"Tom",
    "PLACE":"2",
    "WEIGHT":"78",
    "SEX":"M",
    "AGE":"54"
  },
  {
    "NAME":"Bill",
    "PLACE":"3",
    "WEIGHT":"92",
    "SEX":"M",
    "AGE":"31"
  }
]
```
Example output with ignoreHiddenRows:false
```json
[
  {
    "NAME":"Mel",
    "PLACE":"1",
    "WEIGHT":"58",
    "SEX":"W",
    "AGE":"23"
  },
  {
    "NAME":"Tom",
    "PLACE":"2",
    "WEIGHT":"78",
    "SEX":"M",
    "AGE":"54"
  },
  {
    "NAME":"Bill",
    "PLACE":"3",
    "WEIGHT":"92",
    "SEX":"M",
    "AGE":"31"
  },
  {
    "NAME":"Cat",
    "PLACE":"4",
    "WEIGHT":"4",
    "SEX":"W",
    "AGE":"2"
  }
]
```

### headings

Array of Strings to be used as headings. Default is `null`/`undefined`.

If more headings are given than columns exist the overcounting ones will be ignored. If less headings
are given than existing values the overcounting values are ignored.
```md
|| NAME || PLACE || WEIGHT || SEX || AGE ||
|-------|--------|---------|------|-------|
| Mel   |      1 |      58 |    W |     23|
| Tom   |      2 |      78 |    M |     54|
| Bill  |      3 |      92 |    M |     31|
|* Cat  |      4 |       4 |    W |     2*|
```
Example output with headings: ['A','B','C','D','E']
```json
[
  {
    "A":"Mel",
    "B":"1",
    "C":"58",
    "D":"W",
    "E":"23"
  },
  {
    "A":"Tom",
    "B":"2",
    "C":"78",
    "D":"M",
    "E":"54"
  },
  {
    "A":"Bill",
    "B":"3",
    "C":"92",
    "D":"M",
    "E":"31"
  }
]
```
Example output with headings: ['A','B','C']
```json
[
  {
    "A":"Mel",
    "B":"1",
    "C":"58"
  },
  {
    "A":"Tom",
    "B":"2",
    "C":"78"
  },
  {
    "A":"Bill",
    "B":"3",
    "C":"92"
  }
]
```
Example output with headings: ['A','B','C','D','E','F','G','H']
```json
[
  {
    "A":"Mel",
    "B":"1",
    "C":"58",
    "D":"W",
    "E":"23"
  },
  {
    "A":"Tom",
    "B":"2",
    "C":"78",
    "D":"M",
    "E":"54"
  },
  {
    "A":"Bill",
    "B":"3",
    "C":"92",
    "D":"M",
    "E":"31"
  }
]
```
Example output with headings: ['A','B','C'] && ignoreColumns: [2, 3]
```json
[
  {
    "A":"Mel",
    "B":"W",
    "C":"23"
  },
  {
    "A":"Tom",
    "B":"M",
    "C":"54"
  },
  {
    "A":"Bill",
    "B":"M",
    "C":"31"
  }
]
```

### limitrows

Number of rows to which the resulting object should be limited to. Default is
`null`/`undefined`.

#### Huge Table (see test/tables.html)
```md
|| Roleplayer Number || Name            || Text to say||
|--------------------|------------------|--------------|
| 0                  | Raife Parkinson  | re dolor in hendrerit in vulputate ve|
| 1                  | Hazel Schultz    | usto duo dolores et ea rebum. Ste|
| 2                  | Montana Delgado  | psum dolor sit amet. Lorem ipsum dolor|
| 3                  | Dianne Mcbride   | sit ame olor sit amet. Lorem ipsum|
| 4                  | Xena Lynch       | us est Lorem ipsum dol|
| 5                  | Najma Holding    | akimata sanctus est Lorem ipsum dolor sit|
| 6                  | Kiki House       | ame nvidunt ut|
|...|
|197                 | Montana Delgado  | lores et ea rebum. Stet clita kasd gu a|
|198                 | Myrtle Conley    | rebum. Stet clita kasd gubergren, no sea|
|199                 | Hanna Ellis      | kimata sanctus est Lorem ipsum dolor si|
```
#### Example output with limitrows: 5

```json
[
  {
    "Roleplayer Number":"0",
    "Name":"Raife Parkinson",
    "Text to say":"re dolor in hendrerit in vulputate ve"
  },
  {
    "Roleplayer Number":"1",
    "Name":"Hazel Schultz",
    "Text to say":"usto duo dolores et ea rebum. Ste"
  },
  {
    "Roleplayer Number":"2",
    "Name":"Montana Delgado",
    "Text to say":"psum dolor sit amet. Lorem ipsum dolor sit ame"
  },
  {
    "Roleplayer Number":"3",
    "Name":"Dianne Mcbride",
    "Text to say":"olor sit amet. Lorem ipsum"
  },
  {
    "Roleplayer Number":"4",
    "Name":"Xena Lynch",
    "Text to say":"us est Lorem ipsum dol"
  }
]
```

### containsClasses

Array of classes to find a specific table using this class. Default is `null`/
`undefined`.

## Known issues and limitations

* Tables needs to be "well formatted" to be convertable.
* Tables in tables are not processed.
* Only supports parsing basic tables with horizontal set of
`<th></th>` headings and corresponding `<td></td>` cells, but also 
taking care of rowspan and colspan. It can give useless or weird results 
on tables that have complex structures
(such as nested tables) or multiple headers (such as on both X and Y axis).
* You'll need to handle tables to parse and (in most cases) clean up the data. 
You might want to combine it with modules like json2csv or CsvToMarkdownTable.
* You might want to use it with a module like 'cheerio' if you want to parse
specific tables identified by id or class (i.e. select them with cheerio and
pass the HTML of them as a string).

## Usage

Find here a list of examples on how to use the library. More examples can be found in the examples folder or 
in the test folder

### Convert an HTML text into an array of all the tables on the page
```typescript
import {tabletojson} from 'tabletojson';
const tablesAsJson = tabletojson.convert(html);
const firstTableAsJson = tablesAsJson[0];
const secondTableAsJson = tablesAsJson[1];
```

### Fetch a URL and parse all it's tables into JSON, using a callback
```typescript
import {tabletojson} from 'tabletojson';
tabletojson.convertUrl('https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes', function (tablesAsJson) {
  console.log(tablesAsJson[1]);
});
```

### Fetch a URL and parse all it's tables into JSON, using promises

```typescript
import {tabletojson} from 'tabletojson';
const url = 'http://en.wikipedia.org/wiki/List_of_countries_by_credit_rating';
tabletojson.convertUrl(url)
.then(function(tablesAsJson) {
  const standardAndPoorRatings = tablesAsJson[1];
  const fitchRatings = tablesAsJson[2];
});
```
### Fetch a table from Wikipedia and combine with json2csv to convert to CSV
```typescript
import {tabletojson} from 'tabletojson';
import {Parser} from 'json2csv';
const url = 'http://en.wikipedia.org/wiki/List_of_countries_by_credit_rating';
tabletojson.convertUrl(url).then(function (tablesAsJson) {
  const fitchRatings = tablesAsJson[2];
  const json2csvParser = new Parser({
    fields: ['Country/Region', 'Outlook'],
  });
  const csv = json2csvParser.parse(fitchRatings);
  console.log(csv);
  /* Example output
        "Country/Region","Outlook"
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
```

## Contributing

Improvements, fixes and suggestions are welcome.

You can find basic tests in the test folder. The library has been implemented 
to be used straight forward way. Nonetheless there are some edge cases that
need to be tested and I would like to ask for support here. Feel free to fork
and create PRs here. Every bit of help is appreciated.

For more usage examples have a look in the examples folder that shows usage and would be a good start.

If you submit a pull request, please add an example for your use case, so I can
understand what you want it to do (as I want to get around to writing tests for
this and want to understand the sort of use cases people have).

### Contributors

* Marius Augenstein (@maugenst)
* Iain Collins (@iaincollins)
* Rory O'Kelly (@roryok)
* Nordes Ménard-Lamarre (@Nordes)
* Max Thyen (@maxthyen)
* Thor Jacobsen (@twjacobsen)
* Michael Keller (@mhkeller)
* Jesús Leganés-Combarro (@piranna)
* João Otávio Ferreira Barbosa (@joaobarbosa)
* Stefano Fadda (@StefanoF)
* Michael Telatynski (@t3chguy)
* @mherzhoff
* Dooho Hyung (@dooho-h)
