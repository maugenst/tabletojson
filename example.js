var tabletojson = require('tabletojson');
tabletojson.convertUrl('https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes', function(tablesAsJson) {
  // Print ou tthe first table on the above webpage as a JSON object
  console.log(tablesAsJson[1]);
});