const {Tabletojson: tabletojson} = require('../dist');

tabletojson.convertUrl(
    'https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes',
    /*{
        request: {
            proxy: 'http://proxy:8080'
        }
    },*/
    function(tablesAsJson) {
        console.log(tablesAsJson[1]);
    }
);
