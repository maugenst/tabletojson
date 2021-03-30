"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tabletojson = void 0;
const cheerio = require("cheerio");
const got_1 = require("got");
class Tabletojson {
    static convert(html, options = {
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
    }) {
        options = Object.assign({
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
        }, options);
        if (options.stripHtml === true) {
            options.stripHtmlFromHeadings = true;
            options.stripHtmlFromCells = true;
        }
        else if (options.stripHtml === false) {
            options.stripHtmlFromHeadings = false;
            options.stripHtmlFromCells = false;
        }
        const jsonResponse = [];
        let suffix;
        const $ = cheerio.load(html);
        let additionalSelectors = options.containsClasses ? `.${options.containsClasses.join('.')}` : '';
        additionalSelectors = options.id ? `${additionalSelectors}#${options.id}` : '';
        $(`table${additionalSelectors}`).each((_i, table) => {
            const tableAsJson = [];
            const alreadySeen = {};
            const columnHeadings = [];
            let trs = $(table).find('tr');
            if (options.useFirstRowForHeadings) {
                trs = $(trs[0]);
            }
            let headingsCounter = 0;
            trs.each((_index, row) => {
                const cells = options.useFirstRowForHeadings ? $(row).find('td, th') : $(row).find('th');
                cells.each((j, cell) => {
                    if (options.onlyColumns && !options.onlyColumns.includes(j))
                        return;
                    if (options.ignoreColumns && !options.onlyColumns && options.ignoreColumns.includes(j))
                        return;
                    let value = '';
                    if (options.headings) {
                        value = options.headings[headingsCounter++];
                    }
                    else {
                        const cheerioCell = $(cell);
                        const cheerioCellText = cheerioCell.text();
                        const cheerioCellHtml = cheerioCell.html();
                        value = options.stripHtmlFromHeadings
                            ? cheerioCellText.trim()
                            : cheerioCellHtml
                                ? cheerioCellHtml.trim()
                                : '';
                    }
                    const seen = alreadySeen[value];
                    if (seen && options.countDuplicateHeadings) {
                        suffix = ++alreadySeen[value];
                        columnHeadings[j] = value !== '' ? `${value}_${suffix}` : `${j}`;
                    }
                    else {
                        alreadySeen[value] = 1;
                        columnHeadings[j] = value;
                    }
                });
            });
            let rowspans = [];
            $(table)
                .find('tr')
                .each(function (i, row) {
                const rowAsJson = {};
                function setColumn(j, content) {
                    if (columnHeadings[j] && !options.forceIndexAsNumber) {
                        rowAsJson[columnHeadings[j]] = content;
                    }
                    else {
                        rowAsJson[j] = content;
                    }
                }
                rowspans.forEach((rowspan, index) => {
                    if (!rowspan)
                        return;
                    setColumn(index, rowspan.content);
                    rowspan.value--;
                });
                const nextrowspans = [...rowspans];
                const cells = options.useFirstRowForHeadings ? $(row).find('td, th') : $(row).find('td');
                cells.each((j, cell) => {
                    if (options.ignoreHiddenRows) {
                        const style = $(row).attr('style');
                        if (style) {
                            const m = style.match(/.*display.*:.*none.*/g);
                            if (m && m.length > 0)
                                return;
                        }
                    }
                    let aux = j;
                    j = 0;
                    do {
                        while (rowspans[j])
                            j++;
                        while (aux && !rowspans[j]) {
                            j++;
                            aux--;
                        }
                    } while (aux);
                    if (options.onlyColumns && !options.onlyColumns.includes(j))
                        return;
                    if (options.ignoreColumns && !options.onlyColumns && options.ignoreColumns.includes(j))
                        return;
                    const cheerioCell = $(cell);
                    const cheerioCellText = cheerioCell.text();
                    const cheerioCellHtml = cheerioCell.html();
                    const cheerioCellRowspan = cheerioCell.attr('rowspan');
                    const content = options.stripHtmlFromCells
                        ? cheerioCellText.trim()
                        : cheerioCellHtml
                            ? cheerioCellHtml.trim()
                            : '';
                    setColumn(j, content);
                    const value = cheerioCellRowspan ? parseInt(cheerioCellRowspan, 10) - 1 : 0;
                    if (value > 0)
                        nextrowspans[j] = { content, value };
                });
                rowspans = nextrowspans;
                rowspans.forEach((rowspan, index) => {
                    if (rowspan && rowspan.value === 0)
                        rowspans[index] = null;
                });
                if (JSON.stringify(rowAsJson) !== '{}')
                    tableAsJson.push(rowAsJson);
                if (options.limitrows && i === options.limitrows) {
                    return false;
                }
            });
            const dataContained = tableAsJson.length > 0;
            const pushToJsonResult = Array.isArray(tableAsJson) && dataContained;
            if (!pushToJsonResult) {
                return true;
            }
            jsonResponse.push(tableAsJson);
        });
        return jsonResponse;
    }
    static async convertUrl(url, callbackFunctionOrOptions, callbackFunction) {
        let options;
        let callback = null;
        let gotOptions;
        if (callbackFunction &&
            typeof callbackFunction === 'function' &&
            typeof callbackFunctionOrOptions === 'object') {
            options = callbackFunctionOrOptions;
            gotOptions = options.got || {};
            callback = callbackFunction;
            const result = await got_1.default(url, gotOptions);
            const resultMimetype = result.headers['content-type'];
            if (resultMimetype && !resultMimetype.includes('text/')) {
                throw new Error('Tabletojson can just handle text/** mimetypes');
            }
            return callback.call(this, Tabletojson.convert(result.body, options));
        }
        else if (typeof callbackFunctionOrOptions === 'function') {
            callback = callbackFunctionOrOptions;
            const result = await got_1.default(url);
            const resultMimetype = result.headers['content-type'];
            if (resultMimetype && !resultMimetype.includes('text/')) {
                throw new Error('Tabletojson can just handle text/** mimetypes');
            }
            return callback.call(this, Tabletojson.convert(result.body));
        }
        else {
            options = callbackFunctionOrOptions || {};
            gotOptions = options.got || {};
            gotOptions.resolveBodyOnly = true;
            const result = await got_1.default(url);
            const resultMimetype = result.headers['content-type'];
            if (resultMimetype && !resultMimetype.includes('text/')) {
                throw new Error('Tabletojson can just handle text/** mimetypes');
            }
            return Tabletojson.convert(result.body, options);
        }
    }
}
exports.Tabletojson = Tabletojson;
//# sourceMappingURL=Tabletojson.js.map