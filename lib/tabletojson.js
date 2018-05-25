'use strict';

var cheerio = require('cheerio');
var request = require('request');

class tabletojson {
    /**
     * Static conversion of a given HTML Page
     * @param html {String} Html page content
     * @param options {Object} Options for html conversion
     * @param options.useFirstRowForHeadings Use the first row as header [default=false]
     * @param options.stripHtmlFromHeadings Strip all HTML from headings [default=true]
     * @param options.stripHtmlFromCells Strip HTML from cells [default=true]
     * @param options.stripHtml Strip off HTML [default=null] if set true stripHtmlFromHeadings and stripHtmlFromCells will also be true
     * @param options.forceIndexAsNumber Force the index to be used as number [default=false]
     * @return {Object} Converted Object as an object literal
     */
    static convert(html, options) {
        options = Object.assign(
            {
                useFirstRowForHeadings: false,
                stripHtmlFromHeadings: true,
                stripHtmlFromCells: true,
                stripHtml: null,
                forceIndexAsNumber: false
            },
            options
        );

        if (options.stripHtml === true) {
            options.stripHtmlFromHeadings = true;
            options.stripHtmlFromCells = true;
        } else if (options.stripHtml === false) {
            options.stripHtmlFromHeadings = false;
            options.stripHtmlFromCells = false;
        }

        var jsonResponse = [],
            alreadySeen = [],
            suffix = undefined;

        var $ = cheerio.load(html);

        $('table').each(function(i, table) {
            var tableAsJson = [];
            // Get column headings
            // @fixme Doesn't support vertical column headings.
            // @todo Try to support badly formated tables.
            var columnHeadings = [];

            var trs = $(table).find('tr');

            if (options.useFirstRowForHeadings) trs = $(trs[0]);

            trs.each(function(i, row) {
                $(row)
                    .find('th')
                    .each(function(j, cell) {
                        var value = options.stripHtmlFromHeadings
                            ? $(cell)
                                  .text()
                                  .trim()
                            : $(cell)
                                  .html()
                                  .trim();

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
            $(table)
                .find('tr')
                .each(function(i, row) {
                    var rowAsJson = {};

                    var rows = options.useFirstRowForHeadings ? $(row).find('td, th') : $(row).find('td');
                    rows.each(function(j, cell) {
                        var content = options.stripHtmlFromCells
                            ? $(cell)
                                  .text()
                                  .trim()
                            : $(cell)
                                  .html()
                                  .trim();

                        if (columnHeadings[j] && !options.forceIndexAsNumber) {
                            rowAsJson[columnHeadings[j]] = content;
                        } else {
                            rowAsJson[j] = content;
                        }
                    });

                    // Skip blank rows
                    if (JSON.stringify(rowAsJson) != '{}') tableAsJson.push(rowAsJson);
                });

            // Add the table to the response
            if (tableAsJson.length != 0) jsonResponse.push(tableAsJson);
        });

        return jsonResponse;
    }

    /**
     * Convert an HTML Page for a given URL
     * @param url URL to be called
     * @param arg1 {Object} Options for html conversion
     * @param arg1.useFirstRowForHeadings Use the first row as header [default=false]
     * @param arg1.stripHtmlFromHeadings Strip all HTML from headings [default=true]
     * @param arg1.stripHtmlFromCells Strip HTML from cells [default=true]
     * @param arg1.stripHtml Strip off HTML [default=null] if set true stripHtmlFromHeadings and stripHtmlFromCells will also be true
     * @param arg1.forceIndexAsNumber Force the index to be used as number [default=false]
     * @param arg1.request Options to be passed to request object
     * @param arg2 Callback function to be called when the conversion finished
     * @return {Promise<*>} Promise containing the result
     */
    static async convertUrl(url, arg1, arg2) {
        let options = null;
        let callback = null;
        let requestOptions = null;

        if (typeof arg2 === 'function') {
            // If both options and callback passed
            options = arg1;
            // If you need to pass in options for request (proxy)
            // add them to arg1.request
            requestOptions = options.request || {};
            callback = arg2;

            // Use a callback (if passed)
            const html = await tabletojson.fetchUrl(url, requestOptions);
            return callback.call(this, tabletojson.convert(html, options));
        } else if (typeof arg1 === 'function') {
            // If only callback passed, invoke with no options
            callback = arg1;

            // Use a callback (if passed)
            const html = await tabletojson.fetchUrl(url);
            return callback.call(this, tabletojson.convert(html, options));
        } else {
            // If neither argument is callback, return a promise
            options = arg1 || {};
            // If you need to pass in options for request (proxy)
            // add them to arg1.request
            requestOptions = options.request || {};
            const html = await tabletojson.fetchUrl(url, requestOptions);
            return tabletojson.convert(html, options);
        }
    }

    static fetchUrl(url, options) {
        return new Promise((resolve, reject) => {
            request(url, options, function(error, response, body) {
                if (error) {
                    reject(error);
                }
                resolve(body);
            });
        });
    }
}

module.exports = {
    convert: tabletojson.convert,
    convertUrl: tabletojson.convertUrl
};
