var Q = require('q');
var cheerio = require('cheerio');
var request = require('request');

function convert(html, options) {

  options = Object.assign({
      useFirstRowForHeadings: false,
      stripHtmlFromHeadings: true,
      stripHtmlFromCells: true,
      stripHtml: null,
  }, options);
  
  if (options.stripHtml === true) {
    options.stripHtmlFromHeadings = true
    options.stripHtmlFromCells = true
  } else if (options.stripHtml === false) {
    options.stripHtmlFromHeadings = false
    options.stripHtmlFromCells = false    
  }

  var jsonResponse = [],
      alreadySeen = [];

  var $ = cheerio.load(html);

  $('table').each(function(i, table) {

    var tableAsJson = [];
    // Get column headings
    // @fixme Doesn't support vertical column headings.
    // @todo Try to support badly formated tables.
    var columnHeadings = [];

    var trs = $(table).find('tr');
  
    if (options.useFirstRowForHeadings)
      trs = $(trs[0]);
  
    trs.each(function(i, row) {
      $(row).find('th').each(function(j, cell) {
      var value = options.stripHtmlFromHeadings
        ? $(cell).text().trim()
        : $(cell).html().trim();
        
        var seen = alreadySeen[value];
        if (seen) {
          suffix = ++alreadySeen[value];
          columnHeadings[j] = value + '_' + suffix;
        } else {
          alreadySeen[value] = 1;
          columnHeadings[j] = value;
        }
      });
    });

    // Fetch each row
    $(table).find('tr').each(function(i, row) {
      var rowAsJson = {};

      var rows = options.useFirstRowForHeadings ? $(row).find('td, th') : $(row).find('td');
      rows.each(function(j, cell) {
        var content = options.stripHtmlFromCells
          ? $(cell).text().trim()
          : $(cell).html().trim();

        if (columnHeadings[j]) {
          rowAsJson[ columnHeadings[j] ] = content;
        } else {
          rowAsJson[j] = content;
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

exports.convertUrl = function(url, arg1, arg2) {

  let options = null;
  let callback = null;
  
  if (typeof(arg2) === "function") {
    // If both options and callback passed
    options = arg1;
    callback = arg2;
    
    // Use a callback (if passed)
    fetchUrl(url)
    .then(function(html) {
      callback.call( this, convert(html, options) );
    });
  } else if (typeof(arg1) === "function") {
    // If only callback passed, invoke with no options
    callback = arg1;

    // Use a callback (if passed)
    fetchUrl(url)
    .then(function(html) {
      callback.call( this, convert(html, options) );
    });
  } else {
    // If neither argument is callback, return a promise
    options = arg1 || {};
    
    return fetchUrl(url)
    .then(function(html) {
      return convert(html, options);
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
