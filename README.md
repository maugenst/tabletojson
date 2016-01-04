# Table to JSON

Attempts to convert HTML tables into JSON.

Can be passed the markup for a single table as a string, a fragment of HTML or an entire page or just a URL (with an optional callback function; promises also supported).

The response is always an array. Every array entry in the response represents a table found on the page (in same the order they were found in the HTML).

## Known issues / limitations

This module only supports parsing basic tables with a simple horizontal set of <th></th> headings and corresponding <td></td> cells.

It can give useless results on tables that have complex structures or multiple headers (such as on both X and Y axis).

You'll need to handle things like work out which tables to parse and (in most cases) clean up the data. You might want to combine it it with modules like json2csv.

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