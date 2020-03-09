import * as cheerio from 'cheerio';
import got from 'got';
import {CallbackFunction, TableToJsonOptions} from '../index';

export class Tabletojson {
    static convert(
        html: string,
        options: TableToJsonOptions = {
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
        }
    ): any[] {
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

        const jsonResponse: any[] = [];
        let suffix;

        const $ = cheerio.load(html);

        let additionalSelectors = options.containsClasses ? `.${options.containsClasses.join('.')}` : '';
        additionalSelectors = options.id ? `${additionalSelectors}#${options.id}` : '';

        $(`table${additionalSelectors}`).each((_i, table) => {
            const tableAsJson: any[] = [];
            const alreadySeen: any = {};
            // Get column headings
            // @fixme Doesn't support vertical column headings.
            // @todo Try to support badly formated tables.
            const columnHeadings: string[] = [];

            let trs: Cheerio = $(table).find('tr');

            if (options.useFirstRowForHeadings) {
                trs = $(trs[0]);
            }
            let headingsCounter: number = 0;
            // Use headings for objects key evaluation
            trs.each(function(_, row) {
                const cells: Cheerio = options.useFirstRowForHeadings ? $(row).find('td, th') : $(row).find('th');
                cells.each(function(j, cell) {
                    if (options.onlyColumns && !options.onlyColumns.includes(j)) return;
                    if (options.ignoreColumns && !options.onlyColumns && options.ignoreColumns.includes(j)) return;
                    let value: string = '';

                    if (options.headings) {
                        value = options.headings[headingsCounter++];
                    } else {
                        const cheerioCell: Cheerio = $(cell);
                        const cheerioCellText: string = cheerioCell.text();
                        const cheerioCellHtml: string | null = cheerioCell.html();

                        value = options.stripHtmlFromHeadings
                            ? cheerioCellText.trim()
                            : cheerioCellHtml
                            ? cheerioCellHtml.trim()
                            : '';
                    }

                    const seen: any = alreadySeen[value];
                    if (seen && options.countDuplicateHeadings) {
                        suffix = ++alreadySeen[value];
                        columnHeadings[j] = value !== '' ? `${value}_${suffix}` : `${j}`;
                    } else {
                        alreadySeen[value] = 1;
                        columnHeadings[j] = value;
                    }
                });
            });

            let rowspans: any[] = [];

            // Fetch each row
            $(table)
                .find('tr')
                .each(function(i, row) {
                    const rowAsJson: any = {};

                    function setColumn(j: number, content: any) {
                        if (columnHeadings[j] && !options.forceIndexAsNumber) {
                            rowAsJson[columnHeadings[j]] = content;
                        } else {
                            rowAsJson[j] = content;
                        }
                    }

                    // Add content from rowspans
                    rowspans.forEach((rowspan, index) => {
                        if (!rowspan) return;

                        setColumn(index, rowspan.content);

                        rowspan.value--;
                    });
                    const nextrowspans = [...rowspans];

                    const cells: Cheerio = options.useFirstRowForHeadings ? $(row).find('td, th') : $(row).find('td');
                    cells.each(function(j, cell) {
                        // ignoreHiddenRows
                        if (options.ignoreHiddenRows) {
                            const style: string | undefined = $(row).attr('style');
                            if (style) {
                                const m = style.match(/.*display.*:.*none.*/g);
                                if (m && m.length > 0) return;
                            }
                        }

                        // Apply rowspans offsets
                        let aux: number = j;
                        j = 0;
                        do {
                            while (rowspans[j]) j++;
                            while (aux && !rowspans[j]) {
                                j++;
                                aux--;
                            }
                        } while (aux);

                        if (options.onlyColumns && !options.onlyColumns.includes(j)) return;
                        if (options.ignoreColumns && !options.onlyColumns && options.ignoreColumns.includes(j)) return;

                        const cheerioCell: Cheerio = $(cell);
                        const cheerioCellText: string = cheerioCell.text();
                        const cheerioCellHtml: string | null = cheerioCell.html();
                        const cheerioCellRowspan: string | undefined = cheerioCell.attr('rowspan');

                        const content: string = options.stripHtmlFromCells
                            ? cheerioCellText.trim()
                            : cheerioCellHtml
                            ? cheerioCellHtml.trim()
                            : '';

                        setColumn(j, content);

                        // Check rowspan
                        const value: number = cheerioCellRowspan ? parseInt(cheerioCellRowspan, 10) - 1 : 0;
                        if (value > 0) nextrowspans[j] = {content, value};
                    });

                    rowspans = nextrowspans;
                    rowspans.forEach((rowspan, index) => {
                        if (rowspan && rowspan.value === 0) rowspans[index] = null;
                    });

                    // Skip blank rows
                    if (JSON.stringify(rowAsJson) !== '{}') tableAsJson.push(rowAsJson);

                    if (options.limitrows && i === options.limitrows) {
                        return false;
                    }
                });

            // Add the table to the response
            const dataContained: boolean = tableAsJson.length > 0;
            const pushToJsonResult: boolean = Array.isArray(tableAsJson) && dataContained;
            if (!pushToJsonResult) {
                return true;
            }
            jsonResponse.push(tableAsJson);
        });

        return jsonResponse;
    }

    /**
     * Convert an HTML Page for a given URL
     * @param url URL to be called
     * @param callbackFunctionOrOptions {Object} Options for html conversion
     * @param callbackFunctionOrOptions.useFirstRowForHeadings Use the first row as header [default=false]
     * @param callbackFunctionOrOptions.stripHtmlFromHeadings Strip all HTML from headings [default=true]
     * @param callbackFunctionOrOptions.stripHtmlFromCells Strip HTML from cells [default=true]
     * @param callbackFunctionOrOptions.stripHtml Strip off HTML [default=null] if set true stripHtmlFromHeadings and stripHtmlFromCells will also be true
     * @param callbackFunctionOrOptions.forceIndexAsNumber Force the index to be used as number [default=false]
     * @param callbackFunctionOrOptions.countDuplicateHeadings If given a _<NUMBER> will be added to the duplicate key [default=false]
     * @param callbackFunctionOrOptions.ignoreColumns {Array} Array of column indices to ignored [default=null]
     * @param callbackFunctionOrOptions.onlyColumns {Array} Array of column indices to be used. Overrides ignoreColumn [default=null]
     * @param callbackFunctionOrOptions.ignoreHiddenRows Ignoring hidden rows [default=true]
     * @param callbackFunctionOrOptions.headings {Array} Array of Strings to be used as headings [default=null]
     * @param callbackFunctionOrOptions.headings {Array} Array of classes to find a specific table [default=null]
     * @param callbackFunctionOrOptions.limitrows {Integer} Integer that limits the result of all rows to a given amount of data [default=null]
     * @param callbackFunctionOrOptions.request Options to be passed to request object
     * @param callbackFunction Callback function to be called when the conversion finished
     * @return {Promise<*>} Promise containing the result
     */
    static async convertUrl(
        url: string,
        callbackFunctionOrOptions?: TableToJsonOptions | CallbackFunction,
        callbackFunction?: CallbackFunction
    ): Promise<any> {
        let options: TableToJsonOptions;
        let callback = null;
        let gotOptions: any;

        if (
            callbackFunction &&
            typeof callbackFunction === 'function' &&
            typeof callbackFunctionOrOptions === 'object'
        ) {
            // If both options and callback passed
            options = callbackFunctionOrOptions;
            // If you need to pass in options for request (proxy)
            // add them to callbackFunctionOrOptions.request
            gotOptions = options.got || {};
            callback = callbackFunction;

            // Use a callback (if passed)
            const result = await got(url, gotOptions);
            const resultMimetype = result.headers['content-type'];
            if (resultMimetype && !resultMimetype.includes('text/')) {
                throw new Error('Tabletojson can just handle text/** mimetypes');
            }
            return callback.call(this, Tabletojson.convert(result.body, options));
        } else if (typeof callbackFunctionOrOptions === 'function') {
            // If only callback passed, invoke with no options
            callback = callbackFunctionOrOptions;

            // Use a callback (if passed)
            const result = await got(url);
            const resultMimetype = result.headers['content-type'];
            if (resultMimetype && !resultMimetype.includes('text/')) {
                throw new Error('Tabletojson can just handle text/** mimetypes');
            }
            return callback.call(this, Tabletojson.convert(result.body));
        } else {
            // If neither argument is callback, return a promise
            options = callbackFunctionOrOptions || {};
            // If you need to pass in options for request (proxy)
            // add them to callbackFunctionOrOptions.request
            gotOptions = options.got || {};
            gotOptions.resolveBodyOnly = true;
            const result = await got(url);
            const resultMimetype = result.headers['content-type'];
            if (resultMimetype && !resultMimetype.includes('text/')) {
                throw new Error('Tabletojson can just handle text/** mimetypes');
            }
            return Tabletojson.convert(result.body, options);
        }
    }
}
