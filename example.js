var tabletojson = require('tabletojson');

tabletojson.convertUrl('https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes', function(tablesAsJson) {
  //Print out the 1st row from the 2nd table on the above webpage as JSON 
  console.log(tablesAsJson[1][0]);
});

tabletojson.convertUrl(
  'https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes',
  { stripHtmlFromCells: false },
  function(tablesAsJson) {
    //Print out the 1st row from the 2nd table on the above webpage as JSON 
    console.log(tablesAsJson[1][0]);
  }
);

tabletojson.convertUrl(
  'https://www.timeanddate.com/holidays/ireland/2017',
  { useFirstRowForHeadings: true },
  function(tablesAsJson) {
    //Print out the 1st row from the 1st table on the above webpage as JSON 
    console.log(tablesAsJson[0][0]);
  }
);

// Fetch a table from Wikipedia and combine with json2csv to convert to CSV
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


