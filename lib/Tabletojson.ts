import * as cheerio from 'cheerio';

/**
 * HeaderRows - defining the rows to be used as keys in the output json object
 *  The values will be concatenated with the given concatWith value
 *  Rowspans and colspans will be taken into account
 * @property {number} from (Optional) Start row [default=0]
 * @property {number} to End row, must be a value greater than 0
 * @property {string} concatWith Concatenate the values with this string
 */
export type HeaderRows = {
    from?: number;
    to: number;
    concatWith: string;
};

/**
 * Options for TableToJson
 * @property {boolean} useFirstRowForHeadings Use the first row as header [default=false]
 * @property {HeaderRows} headers Use the following rows as keys in the output json object. The values are flattened and concatenated the values with 'concatWith' [default=undefined]
 * @property {boolean} stripHtmlFromHeadings Strip all HTML from headings [default=true]
 * @property {boolean} stripHtmlFromCells Strip HTML from cells [default=true]
 * @property {boolean} stripHtml Strip off HTML [default=null] if set true stripHtmlFromHeadings and stripHtmlFromCells will also be true
 * @property {boolean} forceIndexAsNumber Force the index to be used as number [default=false]
 * @property {boolean} countDuplicateHeadings If given a _<NUMBER> will be added to the duplicate key [default=false]
 * @property {number[]} ignoreColumns {Array} Array of column indices to ignored [default=null]
 * @property {number[]} onlyColumns {Array} Array of column indices to be used. Overrides ignoreColumn [default=null]
 * @property {boolean} ignoreHiddenRows Ignoring hidden rows [default=true]
 * @property {string[]} headings {Array} Array of Strings to be used as headings [default=null]
 * @property {string[]} containsClasses {Array} Array of classes to find a specific table [default=null]
 * @property {string[]} id {Array} string of an id [default=null]
 * @property {number} limitrows {Number} Number that limits the result of all rows to a given amount of data [default=null]
 * @property {RequestInit} fetchOptions Options to be passed to request object
 */
export type TableToJsonOptions = {
    useFirstRowForHeadings?: boolean;
    headers?: HeaderRows;
    stripHtmlFromHeadings?: boolean;
    stripHtmlFromCells?: boolean;
    stripHtml?: boolean | null;
    forceIndexAsNumber?: boolean;
    countDuplicateHeadings?: boolean;
    ignoreColumns?: number[] | null;
    onlyColumns?: number[] | null;
    ignoreHiddenRows?: boolean;
    id?: string[] | null;
    headings?: string[] | null;
    containsClasses?: string[] | null;
    limitrows?: number | null;
    fetchOptions?: RequestInit;
};

export type CallbackFunction = (conversionResult: any) => any;

type RowSpan = {content: string; value: number} | null;

export class Tabletojson {
    static convert(
        html: string,
        options: TableToJsonOptions = {
            useFirstRowForHeadings: false,
            headers: undefined,
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
            limitrows: null,
        },
    ): any[] {
        options = Object.assign(
            {
                useFirstRowForHeadings: false,
                rowsForHeadings: undefined,
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
                limitrows: null,
            },
            options,
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

            // To have the correct names of keys in the json result we need to first analyze the header rows
            // flatten them, and concatenate the values
            if (options.headers) {
                if (options.headers.to === 0) return;
                const rows: number[] = [];
                for (let i = options.headers.from || 0; i <= options.headers.to; i++) {
                    rows.push(i);
                }

                // Analyze the table to find the amount of columns
                let columnLength: number = 0;
                // Get the amount of columns
                const trs: cheerio.Cheerio = $(table).find('tr');
                trs.each((_index: number, row: cheerio.Element) => {
                    const cells: cheerio.Cheerio = $(row).find('td, th');
                    columnLength = cells.length > columnLength ? cells.length : columnLength;
                });

                // Create a 2D array with the amount of columns and rows and fill it with the default value
                const createNew2DArray = (columns: number, ca_rows: number, defaultValue: any) => {
                    return Array.from(Array(ca_rows), (_row) => Array.from(Array(columns), (_cell) => defaultValue));
                };
                const headings: any[] = createNew2DArray(columnLength, rows.length, undefined);

                // Fill the 2D array with the values from the table while taking care of the colspan and rowspan
                rows.forEach((rowIndex: number, index: number) => {
                    const cells: cheerio.Cheerio = $(trs[rowIndex]).find('td, th');
                    let currentColumn: number = headings[index].indexOf(undefined);
                    cells.each((_j: number, cell: cheerio.Element) => {
                        const cheerioCell: cheerio.Cheerio = $(cell);
                        const cheerioCellColspan: number | undefined =
                            Number(cheerioCell.attr('colspan')).valueOf() || 1;
                        const cheerioCellRowspan: number | undefined =
                            Number(cheerioCell.attr('rowspan')).valueOf() || 1;

                        const cellContent: string = cheerioCell.text().trim();
                        for (let x: number = 0; x < cheerioCellColspan; x++) {
                            if (headings[index][currentColumn] !== undefined) {
                                currentColumn++;
                            }

                            headings[index][currentColumn] = cellContent;
                            if (cheerioCellRowspan > 1) {
                                for (let y: number = 1; y < cheerioCellRowspan; y++) {
                                    headings[index + y][currentColumn] = '';
                                }
                            }
                            currentColumn++;
                        }
                    });
                });

                // Flatten the 2D array by columns and concatenate the values with the given concatWith value
                const flatten2DArrayByColumns = (arr) => {
                    const numRows = arr.length;
                    const numCols = arr[0].length;
                    const flattened: any[] = new Array(numCols).fill('');

                    for (let col: number = 0; col < numCols; col++) {
                        let columnString: string = '';
                        for (let row: number = 0; row < numRows; row++) {
                            columnString += (row > 0 ? ' ' : '') + arr[row][col];
                        }
                        flattened[col] = columnString.trim();
                    }

                    return flattened;
                };

                const flatHeadings = flatten2DArrayByColumns(headings);
                // Remove the "old" rows from the table
                rows.sort((a, b) => b - a).forEach((rowToBeRemoved: number) => {
                    $(`table${additionalSelectors} tr`).eq(rowToBeRemoved).remove();
                });
                // Add the new header row to the table
                if (flatHeadings.length > 0) {
                    $(table).prepend(`<thead><tr><th>${flatHeadings.join('</th><th>')}</th></tr></thead>`);
                }
            }

            // Regular table work starts now
            let trs: cheerio.Cheerio = $(table).find('tr');

            if (options.useFirstRowForHeadings) {
                trs = $(trs[0]);
            }
            let headingsCounter: number = 0;
            // Use headings for objects key evaluation
            trs.each((_index: number, row: cheerio.Element) => {
                const cells: cheerio.Cheerio = options.useFirstRowForHeadings
                    ? $(row).find('td, th')
                    : $(row).find('th');
                cells.each((cellIndex: number, cell: cheerio.Element) => {
                    if (options.onlyColumns && !options.onlyColumns.includes(cellIndex)) return;
                    if (options.ignoreColumns && !options.onlyColumns && options.ignoreColumns.includes(cellIndex))
                        return;
                    let value: string = '';

                    if (options.headings) {
                        value = options.headings[headingsCounter++];
                    } else {
                        const cheerioCell: cheerio.Cheerio = $(cell);
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
                        columnHeadings[cellIndex] = value !== '' ? `${value}_${suffix}` : `${cellIndex}`;
                    } else {
                        alreadySeen[value] = 1;
                        columnHeadings[cellIndex] = value;
                    }
                });
            });

            let rowspans: RowSpan[] = [];

            // Fetch each row
            $(table)
                .find('tr')
                .each(function (i, row) {
                    const rowAsJson: any = {};

                    function setColumn(j: number, content: string) {
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

                    const cells: cheerio.Cheerio = options.useFirstRowForHeadings
                        ? $(row).find('td, th')
                        : $(row).find('td');
                    cells.each((cellIndex: number, cell: cheerio.Element) => {
                        // ignoreHiddenRows
                        if (options.ignoreHiddenRows) {
                            const style: string | undefined = $(row).attr('style');
                            if (style) {
                                const m = style.match(/.*display.*:.*none.*/g);
                                if (m && m.length > 0) return;
                            }
                        }

                        // Apply rowspans offsets
                        const adjustedIndex = applyOffsets(cellIndex, rowspans);

                        if (options.onlyColumns && !options.onlyColumns.includes(adjustedIndex)) return;
                        if (
                            options.ignoreColumns &&
                            !options.onlyColumns &&
                            options.ignoreColumns.includes(adjustedIndex)
                        )
                            return;

                        const cheerioCell: cheerio.Cheerio = $(cell);
                        const cheerioCellText: string = cheerioCell.text();
                        const cheerioCellHtml: string | null = cheerioCell.html();
                        const cheerioCellRowspan: string | undefined = cheerioCell.attr('rowspan');

                        const content: string = options.stripHtmlFromCells
                            ? cheerioCellText.trim()
                            : cheerioCellHtml
                              ? cheerioCellHtml.trim()
                              : '';

                        setColumn(adjustedIndex, content);

                        // Check rowspan
                        const value: number = cheerioCellRowspan ? parseInt(cheerioCellRowspan, 10) - 1 : 0;
                        if (value > 0) nextrowspans[adjustedIndex] = {content, value};
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
        callbackFunction?: CallbackFunction,
    ): Promise<any> {
        let options: TableToJsonOptions;
        let fetchOptions: RequestInit;

        if (
            callbackFunction &&
            typeof callbackFunction === 'function' &&
            typeof callbackFunctionOrOptions === 'object'
        ) {
            // If both options and callback passed
            options = callbackFunctionOrOptions;
            // If you need to pass in options for request (proxy)
            // add them to callbackFunctionOrOptions.request
            fetchOptions = options.fetchOptions || {};

            // Use a callback (if passed)
            const result = await fetch(url, fetchOptions);
            const resultMimetype = result.headers.get('content-type');
            if (resultMimetype && !resultMimetype.includes('text/')) {
                throw new Error('Tabletojson can just handle text/** mimetypes');
            }
            return callbackFunction.call(this, Tabletojson.convert(await result.text(), options));
        } else if (typeof callbackFunctionOrOptions === 'function') {
            // Use a callback (if passed)
            const result = await fetch(url);
            const resultMimetype = result.headers.get('content-type');
            if (resultMimetype && !resultMimetype.includes('text/')) {
                throw new Error('Tabletojson can just handle text/** mimetypes');
            }
            return callbackFunctionOrOptions.call(this, Tabletojson.convert(await result.text()));
        } else if (typeof callbackFunctionOrOptions === 'object') {
            // If neither argument is callback, return a promise
            options = callbackFunctionOrOptions;
            // Use a callback (if passed)
            const result = await fetch(url, callbackFunctionOrOptions.fetchOptions || {});
            const resultMimetype = result.headers.get('content-type');
            if (resultMimetype && !resultMimetype.includes('text/')) {
                throw new Error('Tabletojson can just handle text/** mimetypes');
            }
            return Tabletojson.convert(await result.text(), options);
        } else {
            // If neither argument is callback, return a promise
            options = {};
            // If you need to pass in options for request (proxy)
            // add them to callbackFunctionOrOptions.request
            fetchOptions = options.fetchOptions || {};
            const result = await fetch(url);
            const resultMimetype = result.headers.get('content-type');
            if (resultMimetype && !resultMimetype.includes('text/')) {
                throw new Error('Tabletojson can just handle text/** mimetypes');
            }
            return Tabletojson.convert(await result.text(), options);
        }
    }
}

const applyOffsets = (cellIndex: number, rowspans: RowSpan[]) => {
    let nullCount = 0;

    for (let i = 0; i < rowspans.length; i++) {
        if (rowspans[i]) {
            continue;
        }

        if (nullCount === cellIndex) {
            return i;
        }

        nullCount++;
    }

    return cellIndex + rowspans.length - nullCount;
};

export {Tabletojson as tabletojson};
