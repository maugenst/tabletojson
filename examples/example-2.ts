import {tabletojson} from '../lib/Tabletojson';
tabletojson.convertUrl(
    'https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes',
    {
        stripHtmlFromCells: false,
    },
    function (tablesAsJson) {
        console.log(tablesAsJson[1]);
    },
);
