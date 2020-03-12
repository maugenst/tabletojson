const {Tabletojson: tabletojson} = require('../dist');

tabletojson.convertUrl(
    'https://www.timeanddate.com/holidays/ireland/2017',
    {
        useFirstRowForHeadings: true/*,
        request: {
            proxy: 'http://proxy:8080'
        }*/
    },
    function(tablesAsJson) {
        console.log(tablesAsJson[0]);
    }
);
