var Q = require('q');
var cheerio = require('cheerio');
var request = require('request');

function convert(html) {
  var jsonResponse = [];
  var $ = cheerio.load(html);

  $('table').each(function(i, table) {
    var tableAsJson = [];
    // Get column headings
    // @fixme Doesn't support vertical column headings.
    // @todo Try to support badly formated tables.
    var columnHeadings = [];
    $(table).find('tr').each(function(i, row) {
      $(row).find('th').each(function(j, cell) {
        columnHeadings[j] = $(cell).text().trim();
      });
    });

    // Fetch each row
    $(table).find('tr').each(function(i, row) {
      var rowAsJson = {};
      $(row).find('td').each(function(j, cell) {
        if (columnHeadings[j]) {
          rowAsJson[ columnHeadings[j] ] = $(cell).text().trim();
        } else {
          rowAsJson[j] = $(cell).text().trim();
        }
      });
      
      // Skip blank rows
      if (JSON.stringify(rowAsJson) != '{}')
        tableAsJson.push(rowAsJson);
    });
    
    // Add the table to the response
    if (tableAsJson.length != 0)
      jsonResponse.push(tableAsJson);
  });
  return jsonResponse;
}
exports.convert = convert;

exports.convertUrl = function(url, callback) {
  if (typeof(callback) === "function") {
    // Use a callback (if passed)
    fetchUrl(url)
    .then(function(html) {
      callback.call( this, convert(html) );
    });
  } else {
    // If no callback, return a promise
    return fetchUrl(url)
    .then(function(html) {
      return convert(html);
    });
  }
}

function fetchUrl(url, callback) {
  var deferred = Q.defer();
  request(url, function (error, response, body) {
    deferred.resolve(body);
  });
  return deferred.promise;
}
