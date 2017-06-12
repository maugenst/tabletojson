# Table to JSON

Attempts to convert HTML tables into JSON.

Can be passed the markup for a single table as a string, a fragment of HTML or an entire page or just a URL (with an optional callback function; promises also supported).

The response is always an array. Every array entry in the response represents a table found on the page (in same the order they were found in the HTML).

## Options

### Tables with headings in the first column 

If a table contains headings in the first column you might get an unexpected result, but you can pass a second argument with options with `{ useFirstRowForHeadings: true }` to have it treat the first column as it would any other cell.

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

The following options are true by default, which converts all values to plain text to give you an easier more readable object to work with:

* stripHtmlFromHeadings
* stripHtmlFromCells

If your table contains HTML you want to parse (for example for links) you can set `stripHtmlFromCells` to `false` to treat it as raw text.

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

You probably don't need to set `stripHtmlFromHeadings` to false (and setting it to false can make the results hard to parse), but if you do you can also set both at the same time by setting `stripHtml` to false.

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

## Options, known issues and limitations

This module only supports parsing basic tables with a simple horizontal set of <th></th> headings and corresponding <td></td> cells.

It can give useless or weird results on tables that have complex structures (such as nested tables) or multiple headers (such as on both X and Y axis).

You'll need to handle things like work out which tables to parse and (in most cases) clean up the data. You might want to combine it it with modules like json2csv or CsvToMarkdownTable.

You might want to use it with a module like 'cheerio' if you want to parse specific tables identified by id or class (i.e. select them with cheerio and pass the HTML of them as a string).

## Example usage

``` javascript
// Convert an HTML blob into an array of all the tables on the page
var tabletojson = require('tabletojson');
var tablesAsJson = tabletojson.convert(html);
var firstTableAsJson = tablesAsJson[0];
var secondTableAsJson = tablesAsJson[1];
...
```

``` javascript
// Fetch a URL and parse all it's tables into JSON, using a callback
var tabletojson = require('tabletojson');
var url = 'https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes';
tabletojson.convertUrl(url, function(tablesAsJson) {
  var listofSovereignStates = tablesAsJson[0];
});
```

``` javascript
// Fetch a URL and parse all it's tables into JSON, using promises
var tabletojson = require('tabletojson');
var url = 'http://en.wikipedia.org/wiki/List_of_countries_by_credit_rating';
tabletojson.convertUrl(url)
.then(function(tablesAsJson) {
  var standardAndPoorRatings = tablesAsJson[0];
  var fitchRatings = tablesAsJson[1];
});
```

``` javascript
// Fetch a table from Wikipedia and combine with json2csv to convert to CSV
var tabletojson = require('tabletojson');
var json2csv = require('json2csv');
var url = 'http://en.wikipedia.org/wiki/List_of_countries_by_credit_rating';
tabletojson.convertUrl(url)
.then(function(tablesAsJson) {
  var standardAndPoorCreditRatings = tablesAsJson[0];
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

# Contributing

Improvements, fixes and suggestions for better written modules that other people have created are welcome, as are bug reports against specific tables it is unable to handle.

If there is enough interest and I get some examples that I'll improve the code and actually write some tests.

# Thanks

Thank you to @roryok, Max Thyen (@maxthyen), Thor Jacobsen (@twjacobsen) and Michael Keller (@mhkeller) for improvements and bug fixes.
