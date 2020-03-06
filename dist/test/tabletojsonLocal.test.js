'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const Tabletojson_1 = require("../lib/Tabletojson");
describe('TableToJSON Local', function () {
    let html = '';
    let noTables = '';
    beforeAll(() => {
        html = fs.readFileSync(path.resolve(__dirname, 'tables.html'), { encoding: 'UTF-8' });
        noTables = fs.readFileSync(path.resolve(__dirname, 'notables.html'), { encoding: 'UTF-8' });
    });
    it('Options: Strip HTML from header AND from body', async function () {
        const converted = await Tabletojson_1.Tabletojson.convert(html, {
            stripHtmlFromHeadings: true,
            stripHtmlFromCells: true
        });
        expect(converted).toBeDefined();
        const firstTable = converted[0];
        expect(_.has(firstTable[0], 'Age')).toBeTruthy();
        expect(firstTable[0].Age).toBe('2');
    });
    it('Options: Strip HTML from header AND from body using stripHtml-shortcut ', async function () {
        const converted = await Tabletojson_1.Tabletojson.convert(html, {
            stripHtml: true
        });
        expect(converted).toBeDefined();
        const firstTable = converted[0];
        expect(_.has(firstTable[0], 'Age')).toBeTruthy();
        expect(firstTable[0].Age).toBe('2');
    });
    it('Options: Strip HTML from header but not from body', async function () {
        const converted = await Tabletojson_1.Tabletojson.convert(html, {
            stripHtmlFromHeadings: true,
            stripHtmlFromCells: false
        });
        expect(converted).toBeDefined();
        const firstTable = converted[0];
        expect(_.has(firstTable[0], 'Age')).toBeTruthy();
        expect(firstTable[0].Age).toBe('<i>2</i>');
    });
    it('Options: Strip HTML from body but not from header', async function () {
        const converted = await Tabletojson_1.Tabletojson.convert(html, {
            stripHtmlFromHeadings: false,
            stripHtmlFromCells: true
        });
        expect(converted).toBeDefined();
        const firstTable = converted[0];
        expect(_.has(firstTable[0], '<b>Age</b>')).toBeTruthy();
        expect(firstTable[0]['<b>Age</b>']).toBe('2');
    });
    it('Double Header Entry: handle double header entries in different tables', async function () {
        const converted = await Tabletojson_1.Tabletojson.convert(html);
        expect(converted).toBeDefined();
        const firstTable = converted[0];
        const secondTable = converted[1];
        expect(_.has(firstTable[0], 'Age')).toBeTruthy();
        expect(_.has(secondTable[0], 'Age')).toBeTruthy();
    });
    it('Double Header Entry: handle double header entries', async function () {
        const converted = await Tabletojson_1.Tabletojson.convert(html);
        expect(converted).toBeDefined();
        const firstTable = converted[0];
        expect(_.has(firstTable[0], 'isDumb')).toBeTruthy();
        expect(_.has(firstTable[0], 'isDumb_2')).toBeTruthy();
    });
    it('Directly local html content: Table with header', async function () {
        const converted = await Tabletojson_1.Tabletojson.convert(html);
        expect(converted).toBeDefined();
        const firstTable = converted[0];
        expect(_.has(firstTable[0], 'Dog')).toBeTruthy();
        expect(_.has(firstTable[0], 'Race')).toBeTruthy();
        expect(_.has(firstTable[0], 'Age')).toBeTruthy();
    });
    it('Do not strip HTML from header', async function () {
        const converted = await Tabletojson_1.Tabletojson.convert(html, {
            stripHtml: false
        });
        expect(converted).toBeDefined();
        const firstTable = converted[0];
        expect(_.has(firstTable[0], 'Dog')).toBeTruthy();
        expect(_.has(firstTable[0], 'Race')).toBeTruthy();
        expect(_.has(firstTable[0], '<b>Age</b>')).toBeTruthy();
    });
    it('Directly passing html content: Table without header', async function () {
        const converted = await Tabletojson_1.Tabletojson.convert(html);
        expect(converted).toBeDefined();
        const thirdTable = converted[2];
        expect(_.has(thirdTable[0], '0')).toBeTruthy();
        expect(_.has(thirdTable[0], '1')).toBeTruthy();
        expect(_.has(thirdTable[0], '2')).toBeTruthy();
        expect(thirdTable[0]['0']).toBe('Dog');
        expect(thirdTable[0]['1']).toBe('Race');
        expect(thirdTable[0]['2']).toBe('Age');
    });
    it('Empty header: to be converted into their column count and not to the underline field name', async function () {
        const converted = await Tabletojson_1.Tabletojson.convert(html);
        expect(converted).toBeDefined();
        const forthTable = converted[3];
        expect(_.has(forthTable[0], 'Dog')).toBeTruthy();
        expect(_.has(forthTable[0], '1')).toBeTruthy();
        expect(_.has(forthTable[0], '2')).toBeTruthy();
        expect(_.has(forthTable[0], 'Height')).toBeTruthy();
        expect(_.has(forthTable[0], '4')).toBeTruthy();
    });
    it('Double Header Entry: countDuplicateHeadings:false', async function () {
        const converted = await Tabletojson_1.Tabletojson.convert(html, {
            countDuplicateHeadings: false
        });
        expect(converted).toBeDefined();
        const table = converted[4];
        expect(_.has(table[0], 'PLACE')).toBeTruthy();
        expect(_.has(table[0], 'VALUE')).toBeTruthy();
        expect(_.has(table[0], 'PLACE_2')).toBeFalsy();
        expect(_.has(table[0], 'VALUE_2')).toBeFalsy();
        expect(_.has(table[1], 'PLACE')).toBeTruthy();
        expect(_.has(table[1], 'VALUE')).toBeTruthy();
        expect(_.has(table[1], 'PLACE_2')).toBeFalsy();
        expect(_.has(table[1], 'VALUE_2')).toBeFalsy();
        expect(table[0].PLACE).toBe('def');
        expect(table[0].VALUE).toBe('2');
        expect(table[1].PLACE).toBe('jkl');
        expect(table[1].VALUE).toBe('4');
    });
    it('Double Header Entry: countDuplicateHeadings:true', async function () {
        const converted = await Tabletojson_1.Tabletojson.convert(html, {
            countDuplicateHeadings: true
        });
        expect(converted).toBeDefined();
        const table = converted[4];
        expect(_.has(table[0], 'PLACE')).toBeTruthy();
        expect(_.has(table[0], 'VALUE')).toBeTruthy();
        expect(_.has(table[0], 'PLACE_2')).toBeTruthy();
        expect(_.has(table[0], 'VALUE_2')).toBeTruthy();
        expect(_.has(table[1], 'PLACE')).toBeTruthy();
        expect(_.has(table[1], 'VALUE')).toBeTruthy();
        expect(_.has(table[1], 'PLACE_2')).toBeTruthy();
        expect(_.has(table[1], 'VALUE_2')).toBeTruthy();
        expect(table[0].PLACE).toBe('abc');
        expect(table[0].VALUE).toBe('1');
        expect(table[0].PLACE_2).toBe('def');
        expect(table[0].VALUE_2).toBe('2');
        expect(table[1].PLACE).toBe('ghi');
        expect(table[1].VALUE).toBe('3');
        expect(table[1].PLACE_2).toBe('jkl');
        expect(table[1].VALUE_2).toBe('4');
    });
    it('Option: ignoreColumns: [2, 3]', async function () {
        const converted = await Tabletojson_1.Tabletojson.convert(html, {
            ignoreColumns: [2, 3]
        });
        expect(converted).toBeDefined();
        const table = converted[5];
        expect(_.has(table[0], 'NAME')).toBeTruthy();
        expect(_.has(table[0], 'PLACE')).toBeTruthy();
        expect(_.has(table[0], 'WEIGHT')).toBeFalsy();
        expect(_.has(table[0], 'SEX')).toBeFalsy();
        expect(_.has(table[0], 'AGE')).toBeTruthy();
        expect(table[0].NAME).toBe('Mel');
        expect(table[0].PLACE).toBe('1');
        expect(table[0].AGE).toBe('23');
        expect(_.has(table[1], 'NAME')).toBeTruthy();
        expect(_.has(table[1], 'PLACE')).toBeTruthy();
        expect(_.has(table[1], 'WEIGHT')).toBeFalsy();
        expect(_.has(table[1], 'SEX')).toBeFalsy();
        expect(_.has(table[1], 'AGE')).toBeTruthy();
        expect(table[1].NAME).toBe('Tom');
        expect(table[1].PLACE).toBe('2');
        expect(table[1].AGE).toBe('54');
        expect(_.has(table[2], 'NAME')).toBeTruthy();
        expect(_.has(table[2], 'PLACE')).toBeTruthy();
        expect(_.has(table[2], 'WEIGHT')).toBeFalsy();
        expect(_.has(table[2], 'SEX')).toBeFalsy();
        expect(_.has(table[2], 'AGE')).toBeTruthy();
        expect(table[2].NAME).toBe('Bill');
        expect(table[2].PLACE).toBe('3');
        expect(table[2].AGE).toBe('31');
    });
    it('Option: onlyColumns: [0, 4]', async function () {
        const converted = await Tabletojson_1.Tabletojson.convert(html, {
            onlyColumns: [0, 4],
            ignoreColumns: [2, 4]
        });
        expect(converted).toBeDefined();
        const table = converted[5];
        expect(_.has(table[0], 'NAME')).toBeTruthy();
        expect(_.has(table[0], 'PLACE')).toBeFalsy();
        expect(_.has(table[0], 'WEIGHT')).toBeFalsy();
        expect(_.has(table[0], 'SEX')).toBeFalsy();
        expect(_.has(table[0], 'AGE')).toBeTruthy();
        expect(table[0].NAME).toBe('Mel');
        expect(table[0].AGE).toBe('23');
        expect(_.has(table[1], 'NAME')).toBeTruthy();
        expect(_.has(table[1], 'PLACE')).toBeFalsy();
        expect(_.has(table[1], 'WEIGHT')).toBeFalsy();
        expect(_.has(table[1], 'SEX')).toBeFalsy();
        expect(_.has(table[1], 'AGE')).toBeTruthy();
        expect(table[1].NAME).toBe('Tom');
        expect(table[1].AGE).toBe('54');
        expect(_.has(table[2], 'NAME')).toBeTruthy();
        expect(_.has(table[2], 'PLACE')).toBeFalsy();
        expect(_.has(table[2], 'WEIGHT')).toBeFalsy();
        expect(_.has(table[2], 'SEX')).toBeFalsy();
        expect(_.has(table[2], 'AGE')).toBeTruthy();
        expect(table[2].NAME).toBe('Bill');
        expect(table[2].AGE).toBe('31');
    });
    it('Option: ignoreHiddenRows:true', async function () {
        const converted = await Tabletojson_1.Tabletojson.convert(html, {
            ignoreHiddenRows: true
        });
        expect(converted).toBeDefined();
        const table = converted[5];
        expect(_.has(table[0], 'NAME')).toBeTruthy();
        expect(_.has(table[0], 'PLACE')).toBeTruthy();
        expect(_.has(table[0], 'WEIGHT')).toBeTruthy();
        expect(_.has(table[0], 'SEX')).toBeTruthy();
        expect(_.has(table[0], 'AGE')).toBeTruthy();
        expect(table.length).toBe(3);
    });
    it('Option: ignoreHiddenRows:false', async function () {
        const converted = await Tabletojson_1.Tabletojson.convert(html, {
            ignoreHiddenRows: false
        });
        expect(converted).toBeDefined();
        const table = converted[5];
        expect(_.has(table[0], 'NAME')).toBeTruthy();
        expect(_.has(table[0], 'PLACE')).toBeTruthy();
        expect(_.has(table[0], 'WEIGHT')).toBeTruthy();
        expect(_.has(table[0], 'SEX')).toBeTruthy();
        expect(_.has(table[0], 'AGE')).toBeTruthy();
        expect(table.length).toBe(4);
    });
    it('Option: headings: ["A","B","C","D","E"]', async function () {
        const converted = await Tabletojson_1.Tabletojson.convert(html, {
            headings: ['A', 'B', 'C', 'D', 'E']
        });
        expect(converted).toBeDefined();
        const table = converted[5];
        expect(_.has(table[0], 'A')).toBeTruthy();
        expect(_.has(table[0], 'B')).toBeTruthy();
        expect(_.has(table[0], 'C')).toBeTruthy();
        expect(_.has(table[0], 'D')).toBeTruthy();
        expect(_.has(table[0], 'E')).toBeTruthy();
        expect(table.length).toBe(3);
    });
    it('Option: headings: ["A","B","C"]', async function () {
        const converted = await Tabletojson_1.Tabletojson.convert(html, {
            headings: ['A', 'B', 'C']
        });
        expect(converted).toBeDefined();
        const table = converted[5];
        expect(_.has(table[0], 'A')).toBeTruthy();
        expect(_.has(table[0], 'B')).toBeTruthy();
        expect(_.has(table[0], 'C')).toBeTruthy();
        expect(_.has(table[0], 'D')).toBeFalsy();
        expect(_.has(table[0], 'E')).toBeFalsy();
        expect(table.length).toBe(3);
    });
    it('Option: headings: ["A","B","C","E","E","F","G","H","I"]', async function () {
        const converted = await Tabletojson_1.Tabletojson.convert(html, {
            headings: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']
        });
        expect(converted).toBeDefined();
        const table = converted[5];
        expect(_.has(table[0], 'A')).toBeTruthy();
        expect(_.has(table[0], 'B')).toBeTruthy();
        expect(_.has(table[0], 'C')).toBeTruthy();
        expect(_.has(table[0], 'D')).toBeTruthy();
        expect(_.has(table[0], 'E')).toBeTruthy();
        expect(table.length).toBe(3);
        expect(table[0].A).toEqual('Mel');
        expect(table[0].B).toEqual('1');
        expect(table[0].C).toEqual('58');
        expect(table[0].D).toEqual('W');
        expect(table[0].E).toEqual('23');
        expect(table[1].A).toEqual('Tom');
        expect(table[1].B).toEqual('2');
        expect(table[1].C).toEqual('78');
        expect(table[1].D).toEqual('M');
        expect(table[1].E).toEqual('54');
        expect(table[2].A).toEqual('Bill');
        expect(table[2].B).toEqual('3');
        expect(table[2].C).toEqual('92');
        expect(table[2].D).toEqual('M');
        expect(table[2].E).toEqual('31');
    });
    it('Option: headings: ["A","B","C"] && ignoreColumns: [1, 2]', async function () {
        const converted = await Tabletojson_1.Tabletojson.convert(html, {
            headings: ['A', 'B', 'C'],
            ignoreColumns: [1, 2]
        });
        expect(converted).toBeDefined();
        const table = converted[5];
        expect(_.has(table[0], 'A')).toBeTruthy();
        expect(_.has(table[0], 'B')).toBeTruthy();
        expect(_.has(table[0], 'C')).toBeTruthy();
        expect(_.has(table[0], 'D')).toBeFalsy();
        expect(_.has(table[0], 'E')).toBeFalsy();
        expect(table.length).toBe(3);
        expect(table[0].A).toEqual('Mel');
        expect(table[0].B).toEqual('W');
        expect(table[0].C).toEqual('23');
        expect(table[1].A).toEqual('Tom');
        expect(table[1].B).toEqual('M');
        expect(table[1].C).toEqual('54');
        expect(table[2].A).toEqual('Bill');
        expect(table[2].B).toEqual('M');
        expect(table[2].C).toEqual('31');
    });
    it('Option: headings: ["A","B","C"] && ignoreColumns: [1, 2] && onlyColumns: [0, 4]', async function () {
        const converted = await Tabletojson_1.Tabletojson.convert(html, {
            headings: ['A', 'B', 'C'],
            ignoreColumns: [1, 2],
            onlyColumns: [0, 4]
        });
        expect(converted).toBeDefined();
        const table = converted[5];
        expect(_.has(table[0], 'A')).toBeTruthy();
        expect(_.has(table[0], 'B')).toBeTruthy();
        expect(_.has(table[0], 'C')).toBeFalsy();
        expect(_.has(table[0], 'D')).toBeFalsy();
        expect(_.has(table[0], 'E')).toBeFalsy();
        expect(table.length).toBe(3);
        expect(table[0].A).toEqual('Mel');
        expect(table[0].B).toEqual('23');
        expect(table[1].A).toEqual('Tom');
        expect(table[1].B).toEqual('54');
        expect(table[2].A).toEqual('Bill');
        expect(table[2].B).toEqual('31');
    });
    it('Option: headings: ["A"] && ignoreColumns: [1, 2] && onlyColumns: [0, 4]', async function () {
        const converted = await Tabletojson_1.Tabletojson.convert(html, {
            headings: ['A'],
            ignoreColumns: [1, 2],
            onlyColumns: [0, 4]
        });
        expect(converted).toBeDefined();
        const table = converted[5];
        expect(_.has(table[0], 'A')).toBeTruthy();
        expect(_.has(table[0], 'B')).toBeFalsy();
        expect(_.has(table[0], 'C')).toBeFalsy();
        expect(_.has(table[0], 'D')).toBeFalsy();
        expect(_.has(table[0], 'E')).toBeFalsy();
        expect(table.length).toBe(3);
        expect(table[0].A).toEqual('Mel');
        expect(table[1].A).toEqual('Tom');
        expect(table[2].A).toEqual('Bill');
    });
    it('Test to check conversion and handling of Kanji, Hiragana, Katakana and latin texts', async function () {
        const converted = await Tabletojson_1.Tabletojson.convert(html);
        expect(converted).toBeDefined();
        const table = converted[6];
        expect(_.has(table[0], 'Kanji')).toBeTruthy();
        expect(_.has(table[0], 'Hiragana')).toBeTruthy();
        expect(_.has(table[0], 'Katakana')).toBeTruthy();
        expect(_.has(table[0], 'Rōmaji')).toBeTruthy();
        expect(_.has(table[0], 'English')).toBeTruthy();
        expect(table[0]['Kanji']).toEqual('私');
        expect(table[0]['Hiragana']).toEqual('わたし');
        expect(table[0]['Katakana']).toEqual('ワタシ');
        expect(table[0]['Rōmaji']).toEqual('watashi');
        expect(table[0]['English']).toEqual('I, me');
    });
    it('limit results to only get a configurable amount of rows', async function () {
        let converted = await Tabletojson_1.Tabletojson.convert(html);
        expect(converted).toBeDefined();
        let table = converted[9];
        expect(table.length).toBe(200);
        converted = await Tabletojson_1.Tabletojson.convert(html, {
            limitrows: 5
        });
        expect(converted).toBeDefined();
        table = converted[9];
        expect(table.length).toBe(5);
    });
    it('Rowspan usage leads to correct object representation', async function () {
        const converted = await Tabletojson_1.Tabletojson.convert(html, {
            id: ['table11']
        });
        expect(converted).toBeDefined();
        expect(converted.length).toBe(1);
        const table = converted[0];
        expect(table.length).toBe(3);
        expect(_.has(table[0], 'Parent')).toBeTruthy();
        expect(table[0].Parent).toBe('Marry');
        expect(table[1].Parent).toBe('Marry');
        expect(table[2].Parent).toBe('Marry');
    });
    it('Complex rowspan usage leads to correct object representation', async function () {
        const converted = await Tabletojson_1.Tabletojson.convert(html, {
            id: ['table12']
        });
        expect(converted).toBeDefined();
        expect(converted.length).toBe(1);
        const table = converted[0];
        expect(table.length).toBe(5);
        expect(_.has(table[0], 'Parent')).toBeTruthy();
        expect(table[0].Parent).toBe('Marry');
        expect(table[1].Parent).toBe('Marry');
        expect(table[2].Parent).toBe('Marry');
        expect(table[3].Parent).toBe('Taylor');
        expect(table[4].Parent).toBe('Taylor');
        expect(table[0].Child).toBe('Sue');
        expect(table[1].Child).toBe('Steve');
        expect(table[2].Child).toBe('Tom');
        expect(table[3].Child).toBe('Tom');
        expect(table[4].Child).toBe('Peter');
        expect(table[0].Age).toBe('15');
        expect(table[1].Age).toBe('12');
        expect(table[2].Age).toBe('3');
        expect(table[3].Age).toBe('3');
        expect(table[4].Age).toBe('17');
    });
    it('Options: containsClasses', async function () {
        const converted = await Tabletojson_1.Tabletojson.convert(html, {
            containsClasses: ['table']
        });
        expect(converted).toBeDefined();
        const firstTable = converted[0];
        expect(_.has(firstTable[0], 'Age')).toBeTruthy();
        expect(firstTable[0].Age).toBe('2');
    });
    it('Options: byId', async function () {
        const converted = await Tabletojson_1.Tabletojson.convert(html, {
            id: ['table9']
        });
        expect(converted).toBeDefined();
        expect(converted.length).toBe(1);
        const table = converted[0];
        expect(_.has(table[0], 'Age')).toBeTruthy();
        expect(table[0].Age).toBe('2');
    });
    it('Options: useFirstRowForHeadings', async function () {
        const converted = await Tabletojson_1.Tabletojson.convert(html, {
            id: ['table13'],
            useFirstRowForHeadings: true
        });
        expect(converted).toBeDefined();
        expect(converted.length).toBe(1);
        const table = converted[0];
        expect(_.has(table[0], 'Age')).toBeTruthy();
        expect(table[0].Dog).toEqual('Dog');
        expect(table[0].Race).toEqual('Race');
        expect(table[0].Age).toEqual('Age');
        expect(table[1].Dog).toEqual('Donald');
        expect(table[1].Race).toEqual('Bobtail');
        expect(table[1].Age).toEqual('2');
    });
    it('Converting a table with no content', async function () {
        const converted = await Tabletojson_1.Tabletojson.convert(html, {
            id: ['table14']
        });
        expect(converted).toBeDefined();
        expect(Array.isArray(converted)).toBeTruthy();
        expect(converted.length).toBe(0);
    });
    it('Options: converting an html page with no tables', async function () {
        const converted = await Tabletojson_1.Tabletojson.convert(noTables);
        expect(converted).toBeDefined();
        expect(converted.length).toBe(0);
    });
});
//# sourceMappingURL=tabletojsonLocal.test.js.map