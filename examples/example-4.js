var tabletojson = require('./lib/tabletojson');
var json2csv = require('json2csv');

var url = 'http://en.wikipedia.org/wiki/List_of_countries_by_credit_rating';
tabletojson
    .convertUrl(url/*, {
        request: {
            proxy: 'http://proxy:8080'
        }
    }*/)
    .then(function(tablesAsJson) {
        var standardAndPoorCreditRatings = tablesAsJson[1];

        json2csv(
            {
                data: standardAndPoorCreditRatings,
                fields: ['Country', 'Outlook']
            },
            function(err, csv) {
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
            }
        );
    });
