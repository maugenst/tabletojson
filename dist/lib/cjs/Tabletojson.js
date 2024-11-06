"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tabletojson = exports.Tabletojson = void 0;
const cheerio = __importStar(require("cheerio"));
class Tabletojson {
    static convert(html, options = {
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
        limitrows: null
    }) {
        options = Object.assign({
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
            if (options.headers) {
                if (options.headers.to === 0) {
                    return;
                }
                const rows = [];
                for (let i = options.headers.from || 0; i <= options.headers.to; i++) {
                    rows.push(i);
                }
                let columnLength = 0;
                const trs = $(table).find('tr');
                trs.each((_index, row) => {
                    const cells = $(row).find('td, th');
                    columnLength = cells.length > columnLength ? cells.length : columnLength;
                });
                const createNew2DArray = (columns, ca_rows, defaultValue) => {
                    return Array.from(Array(ca_rows), (_row) => Array.from(Array(columns), (_cell) => defaultValue));
                };
                const headings = createNew2DArray(columnLength, rows.length, undefined);
                rows.forEach((rowIndex, index) => {
                    const cells = $(trs[rowIndex]).find('td, th');
                    let currentColumn = headings[index].indexOf(undefined);
                    cells.each((_j, cell) => {
                        const cheerioCell = $(cell);
                        const cheerioCellColspan = Number(cheerioCell.attr('colspan')).valueOf() || 1;
                        const cheerioCellRowspan = Number(cheerioCell.attr('rowspan')).valueOf() || 1;
                        const cellContent = cheerioCell.text().trim();
                        for (let x = 0; x < cheerioCellColspan; x++) {
                            if (headings[index][currentColumn] !== undefined) {
                                currentColumn++;
                            }
                            headings[index][currentColumn] = cellContent;
                            if (cheerioCellRowspan > 1) {
                                for (let y = 1; y < cheerioCellRowspan; y++) {
                                    headings[index + y][currentColumn] = '';
                                }
                            }
                            currentColumn++;
                        }
                    });
                });
                const flatten2DArrayByColumns = (arr) => {
                    const numRows = arr.length;
                    const numCols = arr[0].length;
                    const flattened = new Array(numCols).fill('');
                    for (let col = 0; col < numCols; col++) {
                        let columnString = '';
                        for (let row = 0; row < numRows; row++) {
                            columnString += (row > 0 ? ' ' : '') + arr[row][col];
                        }
                        flattened[col] = columnString.trim();
                    }
                    return flattened;
                };
                const flatHeadings = flatten2DArrayByColumns(headings);
                rows.sort((a, b) => b - a).forEach((rowToBeRemoved) => {
                    $(`table${additionalSelectors} tr`).eq(rowToBeRemoved).remove();
                });
                if (flatHeadings.length > 0) {
                    $(table).prepend(`<thead><tr><th>${flatHeadings.join('</th><th>')}</th></tr></thead>`);
                }
            }
            let trs = $(table).find('tr');
            if (options.useFirstRowForHeadings) {
                trs = $(trs[0]);
            }
            let headingsCounter = 0;
            trs.each((_index, row) => {
                const cells = options.useFirstRowForHeadings
                    ? $(row).find('td, th')
                    : $(row).find('th');
                cells.each((cellIndex, cell) => {
                    if (options.onlyColumns && !options.onlyColumns.includes(cellIndex)) {
                        return;
                    }
                    if (options.ignoreColumns && !options.onlyColumns && options.ignoreColumns.includes(cellIndex)) {
                        return;
                    }
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
                        columnHeadings[cellIndex] = value !== '' ? `${value}_${suffix}` : `${cellIndex}`;
                    }
                    else {
                        alreadySeen[value] = 1;
                        columnHeadings[cellIndex] = value;
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
                    if (!rowspan) {
                        return;
                    }
                    setColumn(index, rowspan.content);
                    rowspan.value--;
                });
                const nextrowspans = [...rowspans];
                const cells = options.useFirstRowForHeadings
                    ? $(row).find('td, th')
                    : $(row).find('td');
                cells.each((cellIndex, cell) => {
                    if (options.ignoreHiddenRows) {
                        const style = $(row).attr('style');
                        if (style) {
                            const m = style.match(/.*display.*:.*none.*/g);
                            if (m && m.length > 0) {
                                return;
                            }
                        }
                    }
                    const adjustedIndex = applyOffsets(cellIndex, rowspans);
                    if (options.onlyColumns && !options.onlyColumns.includes(adjustedIndex)) {
                        return;
                    }
                    if (options.ignoreColumns &&
                        !options.onlyColumns &&
                        options.ignoreColumns.includes(adjustedIndex)) {
                        return;
                    }
                    const cheerioCell = $(cell);
                    const cheerioCellText = cheerioCell.text();
                    const cheerioCellHtml = cheerioCell.html();
                    const cheerioCellRowspan = cheerioCell.attr('rowspan');
                    const content = options.stripHtmlFromCells
                        ? cheerioCellText.trim()
                        : cheerioCellHtml
                            ? cheerioCellHtml.trim()
                            : '';
                    setColumn(adjustedIndex, content);
                    const value = cheerioCellRowspan ? parseInt(cheerioCellRowspan, 10) - 1 : 0;
                    if (value > 0) {
                        nextrowspans[adjustedIndex] = { content, value };
                    }
                });
                rowspans = nextrowspans;
                rowspans.forEach((rowspan, index) => {
                    if (rowspan && rowspan.value === 0) {
                        rowspans[index] = null;
                    }
                });
                if (JSON.stringify(rowAsJson) !== '{}') {
                    tableAsJson.push(rowAsJson);
                }
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
    static convertUrl(url, callbackFunctionOrOptions, callbackFunction) {
        return __awaiter(this, void 0, void 0, function* () {
            let options;
            let fetchOptions;
            if (callbackFunction &&
                typeof callbackFunction === 'function' &&
                typeof callbackFunctionOrOptions === 'object') {
                options = callbackFunctionOrOptions;
                fetchOptions = options.fetchOptions || {};
                const result = yield fetch(url, fetchOptions);
                const resultMimetype = result.headers.get('content-type');
                if (resultMimetype && !resultMimetype.includes('text/')) {
                    throw new Error('Tabletojson can just handle text/** mimetypes');
                }
                return callbackFunction.call(this, Tabletojson.convert(yield result.text(), options));
            }
            else if (typeof callbackFunctionOrOptions === 'function') {
                const result = yield fetch(url);
                const resultMimetype = result.headers.get('content-type');
                if (resultMimetype && !resultMimetype.includes('text/')) {
                    throw new Error('Tabletojson can just handle text/** mimetypes');
                }
                return callbackFunctionOrOptions.call(this, Tabletojson.convert(yield result.text()));
            }
            else if (typeof callbackFunctionOrOptions === 'object') {
                options = callbackFunctionOrOptions;
                const result = yield fetch(url, callbackFunctionOrOptions.fetchOptions || {});
                const resultMimetype = result.headers.get('content-type');
                if (resultMimetype && !resultMimetype.includes('text/')) {
                    throw new Error('Tabletojson can just handle text/** mimetypes');
                }
                return Tabletojson.convert(yield result.text(), options);
            }
            else {
                options = {};
                fetchOptions = options.fetchOptions || {};
                const result = yield fetch(url);
                const resultMimetype = result.headers.get('content-type');
                if (resultMimetype && !resultMimetype.includes('text/')) {
                    throw new Error('Tabletojson can just handle text/** mimetypes');
                }
                return Tabletojson.convert(yield result.text(), options);
            }
        });
    }
}
exports.Tabletojson = Tabletojson;
exports.tabletojson = Tabletojson;
const applyOffsets = (cellIndex, rowspans) => {
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
//# sourceMappingURL=Tabletojson.js.map