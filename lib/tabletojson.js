'use strict';

const AbstractToJson = require('pagetojson').AbstractToJson;
const cheerio = require('cheerio');

class tabletojson extends AbstractToJson {
    /**
     * Static conversion of a given HTML Page
     * @param html {String} Html page content
     * @param options {Object} Options for html conversion
     * @param options.useFirstRowForHeadings Use the first row as header [default=false]
     * @param options.stripHtmlFromHeadings Strip all HTML from headings [default=true]
     * @param options.stripHtmlFromCells Strip HTML from cells [default=true]
     * @param options.stripHtml Strip off HTML [default=null] if set true stripHtmlFromHeadings and stripHtmlFromCells will also be true
     * @param options.forceIndexAsNumber Force the index to be used as number [default=false]
     * @param options.countDuplicateHeadings If given a _<NUMBER> will be added to the duplicate key [default=false]
     * @param options.ignoreColumns {Array} Array of column indices to ignored [default=null]
     * @param options.onlyColumns {Array} Array of column indices to be used. Overrides ignoreColumn [default=null]
     * @param options.ignoreHiddenRows Ignoring hidden rows [default=true]
     * @param options.headings {Array} Array of Strings to be used as headings [default=null]
     * @param options.headings {Array} Array of classes to find a specific table [default=null]
     * @param options.limitrows {Integer} Integer that limits the result of all rows to a given amount of data [default=null]
     * @return {Object} Converted Object as an object literal
     */
    static convert(html, options) {
        options = Object.assign(
            {
                useFirstRowForHeadings: false,
                stripHtmlFromHeadings: true,
                stripHtmlFromCells: true,
                stripHtml: null,
                forceIndexAsNumber: false,
                countDuplicateHeadings: true,
                ignoreColumns: null,
                onlyColumns: null,
                ignoreHiddenRows: true,
                headings: null,
                containsClasses: null,
                id: null,
                limitrows: null
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

        const jsonResponse = [];
        let suffix = undefined;

        const $ = cheerio.load(html);

        let additionalSelectors = options.containsClasses ? `.${options.containsClasses.join('.')}` : '';
        additionalSelectors = options.id ? `${additionalSelectors}#${options.id}` : '';

        $(`table${additionalSelectors}`).each(function(i, table) {
            const tableAsJson = [];
            const alreadySeen = {};
            // Get column headings
            // @fixme Doesn't support vertical column headings.
            // @todo Try to support badly formated tables.
            const columnHeadings = [];

            let trs = $(table).find('tr');

            if (options.useFirstRowForHeadings) trs = $(trs[0]);
            let headingsCounter = 0;
            // Use headings for objects key evaluation
            trs.each(function(i, row) {
                $(row)
                    .find('th')
                    .each(function(j, cell) {
                        if (options.onlyColumns && !options.onlyColumns.includes(j)) return;
                        if (options.ignoreColumns && !options.onlyColumns && options.ignoreColumns.includes(j)) return;
                        let value = '';

                        if (options.headings) {
                            value = options.headings[headingsCounter++];
                        } else {
                            value = options.stripHtmlFromHeadings
                                ? $(cell)
                                      .text()
                                      .trim()
                                : $(cell)
                                      .html()
                                      .trim();
                        }

                        const seen = alreadySeen[value];
                        if (seen && options.countDuplicateHeadings) {
                            suffix = ++alreadySeen[value];
                            columnHeadings[j] = value !== '' ? value + '_' + suffix : j;
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
                    const rowAsJson = {};

                    const cells = options.useFirstRowForHeadings ? $(row).find('td, th') : $(row).find('td');
                    cells.each(function(j, cell) {
                        // ignoreHiddenRows
                        if (options.ignoreHiddenRows) {
                            const style = $(row).attr('style');
                            if (style) {
                                const m = style.match(/.*display.*:.*none.*/g);
                                if (m && m.length > 0) return;
                            }
                        }

                        if (options.onlyColumns && !options.onlyColumns.includes(j)) return;
                        if (options.ignoreColumns && !options.onlyColumns && options.ignoreColumns.includes(j)) return;

                        const content = options.stripHtmlFromCells
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
                    if (JSON.stringify(rowAsJson) !== '{}') tableAsJson.push(rowAsJson);

                    if (options.limitrows && i === options.limitrows) {
                        return false;
                    }
                });

            // Add the table to the response
            if (tableAsJson && tableAsJson.length !== 0)
                jsonResponse.push(tableAsJson);
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
     * @param arg1.countDuplicateHeadings If given a _<NUMBER> will be added to the duplicate key [default=false]
     * @param arg1.ignoreColumns {Array} Array of column indices to ignored [default=null]
     * @param arg1.onlyColumns {Array} Array of column indices to be used. Overrides ignoreColumn [default=null]
     * @param arg1.ignoreHiddenRows Ignoring hidden rows [default=true]
     * @param arg1.headings {Array} Array of Strings to be used as headings [default=null]
     * @param arg1.headings {Array} Array of classes to find a specific table [default=null]
     * @param arg1.limitrows {Integer} Integer that limits the result of all rows to a given amount of data [default=null]
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
            const html = await AbstractToJson.fetchUrl(url, requestOptions);
            return callback.call(this, tabletojson.convert(html, options));
        } else if (typeof arg1 === 'function') {
            // If only callback passed, invoke with no options
            callback = arg1;

            // Use a callback (if passed)
            const html = await AbstractToJson.fetchUrl(url);
            return callback.call(this, tabletojson.convert(html, options));
        } else {
            // If neither argument is callback, return a promise
            options = arg1 || {};
            // If you need to pass in options for request (proxy)
            // add them to arg1.request
            requestOptions = options.request || {};
            const html = await AbstractToJson.fetchUrl(url, requestOptions);
            return tabletojson.convert(html, options);
        }
    }

}

module.exports = {
    arrayNotEmpty: tabletojson.arrayNotEmpty,
    convert: tabletojson.convert,
    convertUrl: tabletojson.convertUrl
};
