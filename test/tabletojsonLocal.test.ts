'use strict';

import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import {TableToJsonOptions, tabletojson} from '../lib/Tabletojson';
import {jest} from '@jest/globals';

describe('TableToJSON Local', function () {
    let html = '';
    let noTables = '';

    beforeAll(() => {
        html = fs.readFileSync(path.resolve(process.cwd(), 'test/tables.html'), 'utf8');
        noTables = fs.readFileSync(path.resolve(process.cwd(), 'test/notables.html'), 'utf8');
    });

    it('Exports TableToJsonOptions', function () {
        const options: TableToJsonOptions = {
            useFirstRowForHeadings: true,
            stripHtmlFromHeadings: true,
            stripHtmlFromCells: true,
            stripHtml: true,
            forceIndexAsNumber: true,
            countDuplicateHeadings: true,
            ignoreColumns: [1, 2, 3],
            onlyColumns: [1, 2, 3],
            ignoreHiddenRows: true,
            id: ['a', 'b'],
            headings: ['a', 'b'],
            containsClasses: ['a', 'b'],
            limitrows: 4,
            fetchOptions: undefined
        };

        expect(_.has(options, 'useFirstRowForHeadings ')).toBeDefined();
        expect(_.has(options, 'stripHtmlFromHeadings')).toBeDefined();
        expect(_.has(options, 'stripHtmlFromCells')).toBeDefined();
        expect(_.has(options, 'stripHtml')).toBeDefined();
        expect(_.has(options, 'forceIndexAsNumber')).toBeDefined();
        expect(_.has(options, 'countDuplicateHeadings ')).toBeDefined();
        expect(_.has(options, 'ignoreColumns')).toBeDefined();
        expect(_.has(options, 'onlyColumns')).toBeDefined();
        expect(_.has(options, 'ignoreHiddenRows')).toBeDefined();
        expect(_.has(options, 'id')).toBeDefined();
        expect(_.has(options, 'headings')).toBeDefined();
        expect(_.has(options, 'containsClasses')).toBeDefined();
        expect(_.has(options, 'limitrows')).toBeDefined();
        expect(_.has(options, 'fetchOptions')).toBeDefined();
    });

    it('Options: Strip HTML from header AND from body', function () {
        const converted = tabletojson.convert(html, {
            stripHtmlFromHeadings: true,
            stripHtmlFromCells: true
        });
        expect(converted).toBeDefined();

        const firstTable = converted[0];

        expect(_.has(firstTable[0], 'Age')).toBeTruthy();
        expect(firstTable[0].Age).toBe('2');
    });

    it('Options: Strip HTML from header AND from body using stripHtml-shortcut ', function () {
        const converted = tabletojson.convert(html, {
            stripHtml: true
        });
        expect(converted).toBeDefined();

        const firstTable = converted[0];

        expect(_.has(firstTable[0], 'Age')).toBeTruthy();
        expect(firstTable[0].Age).toBe('2');
    });

    it('Options: Strip HTML from header but not from body', function () {
        const converted = tabletojson.convert(html, {
            stripHtmlFromHeadings: true,
            stripHtmlFromCells: false
        });
        expect(converted).toBeDefined();

        const firstTable = converted[0];

        expect(_.has(firstTable[0], 'Age')).toBeTruthy();
        expect(firstTable[0].Age).toBe('<i>2</i>');
    });

    it('Options: Strip HTML from body but not from header', function () {
        const converted = tabletojson.convert(html, {
            stripHtmlFromHeadings: false,
            stripHtmlFromCells: true
        });
        expect(converted).toBeDefined();

        const firstTable = converted[0];

        expect(_.has(firstTable[0], '<b>Age</b>')).toBeTruthy();
        expect(firstTable[0]['<b>Age</b>']).toBe('2');
    });

    // ADDED TO FIX: https://github.com/maugenst/tabletojson/issues/15
    it('Double Header Entry: handle double header entries in different tables', function () {
        const converted = tabletojson.convert(html);
        expect(converted).toBeDefined();

        const firstTable = converted[0];
        const secondTable = converted[1];

        expect(_.has(firstTable[0], 'Age')).toBeTruthy();
        expect(_.has(secondTable[0], 'Age')).toBeTruthy();
    });

    it('Double Header Entry: handle double header entries', function () {
        const converted = tabletojson.convert(html);
        expect(converted).toBeDefined();

        const firstTable = converted[0];

        expect(_.has(firstTable[0], 'isDumb')).toBeTruthy();
        expect(_.has(firstTable[0], 'isDumb_2')).toBeTruthy();
    });

    it('Directly local html content: Table with header', function () {
        const converted = tabletojson.convert(html);
        expect(converted).toBeDefined();

        const firstTable = converted[0];

        expect(_.has(firstTable[0], 'Dog')).toBeTruthy();
        expect(_.has(firstTable[0], 'Race')).toBeTruthy();
        expect(_.has(firstTable[0], 'Age')).toBeTruthy();
    });

    it('Do not strip HTML from header', function () {
        const converted = tabletojson.convert(html, {
            stripHtml: false
        });
        expect(converted).toBeDefined();

        const firstTable = converted[0];

        expect(_.has(firstTable[0], 'Dog')).toBeTruthy();
        expect(_.has(firstTable[0], 'Race')).toBeTruthy();
        expect(_.has(firstTable[0], '<b>Age</b>')).toBeTruthy();
    });

    it('Directly passing html content: Table without header', function () {
        const converted = tabletojson.convert(html);
        expect(converted).toBeDefined();

        const thirdTable = converted[2];
        expect(_.has(thirdTable[0], '0')).toBeTruthy();
        expect(_.has(thirdTable[0], '1')).toBeTruthy();
        expect(_.has(thirdTable[0], '2')).toBeTruthy();

        expect(thirdTable[0]['0']).toBe('Dog');
        expect(thirdTable[0]['1']).toBe('Race');
        expect(thirdTable[0]['2']).toBe('Age');
    });

    // ADDED TO FIX: https://github.com/maugenst/tabletojson/issues/14
    it('Empty header: to be converted into their column count and not to the underline field name', function () {
        const converted = tabletojson.convert(html);
        expect(converted).toBeDefined();

        const forthTable = converted[3];
        expect(_.has(forthTable[0], 'Dog')).toBeTruthy();
        expect(_.has(forthTable[0], '1')).toBeTruthy();
        expect(_.has(forthTable[0], '2')).toBeTruthy();
        expect(_.has(forthTable[0], 'Height')).toBeTruthy();
        expect(_.has(forthTable[0], '4')).toBeTruthy();
    });

    // ADDED TO FIX: https://github.com/maugenst/tabletojson/pull/18
    it('Double Header Entry: countDuplicateHeadings:false', function () {
        const converted = tabletojson.convert(html, {
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

    // ADDED TO FIX: https://github.com/maugenst/tabletojson/pull/18
    it('Double Header Entry: countDuplicateHeadings:true', function () {
        const converted = tabletojson.convert(html, {
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

    // FEATURE 'ignoreColumns'
    it('Option: ignoreColumns: [2, 3]', function () {
        const converted = tabletojson.convert(html, {
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

    // FEATURE 'onlyColumns'
    it('Option: onlyColumns: [0, 4]', function () {
        const converted = tabletojson.convert(html, {
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

    // FEATURE 'ignoreHiddenRows:true'
    it('Option: ignoreHiddenRows:true', function () {
        const converted = tabletojson.convert(html, {
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

    // FEATURE 'ignoreHiddenRows:false'
    it('Option: ignoreHiddenRows:false', function () {
        const converted = tabletojson.convert(html, {
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

    // FEATURE 'headings: ['A', 'B', 'C', 'D', 'E']'
    it('Option: headings: ["A","B","C","D","E"]', function () {
        const converted = tabletojson.convert(html, {
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

    // FEATURE 'headings: ['A', 'B', 'C']'
    it('Option: headings: ["A","B","C"]', function () {
        const converted = tabletojson.convert(html, {
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

    /**
     * | NAME | PLACE | WEIGHT | SEX | AGE |
     * |  Mel |     1 |     58 |   W |  23 |
     * |  Tom |     2 |     78 |   M |  54 |
     * | Bill |     3 |     92 |   M |  31 |
     */
    // FEATURE 'headings: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']'
    it('Option: headings: ["A","B","C","E","E","F","G","H","I"]', function () {
        const converted = tabletojson.convert(html, {
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

    /**
     * | NAME | PLACE | WEIGHT | SEX | AGE |
     * |  Mel |     1 |     58 |   W |  23 |
     * |  Tom |     2 |     78 |   M |  54 |
     * | Bill |     3 |     92 |   M |  31 |
     */
    // FEATURE 'headings: ['A', 'B', 'C'] && ignoreColumns: [1, 2]'
    it('Option: headings: ["A","B","C"] && ignoreColumns: [1, 2]', function () {
        const converted = tabletojson.convert(html, {
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

    /**
     * | NAME | PLACE | WEIGHT | SEX | AGE |
     * |  Mel |     1 |     58 |   W |  23 |
     * |  Tom |     2 |     78 |   M |  54 |
     * | Bill |     3 |     92 |   M |  31 |
     */
    // FEATURE 'headings: ['A', 'B', 'C'] && ignoreColumns: [1, 2] && onlyColumns: [0, 4]'
    it('Option: headings: ["A","B","C"] && ignoreColumns: [1, 2] && onlyColumns: [0, 4]', function () {
        const converted = tabletojson.convert(html, {
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

    /**
     * | NAME | PLACE | WEIGHT | SEX | AGE |
     * |  Mel |     1 |     58 |   W |  23 |
     * |  Tom |     2 |     78 |   M |  54 |
     * | Bill |     3 |     92 |   M |  31 |
     */
    // FEATURE 'headings: ['A'] && ignoreColumns: [1, 2] && onlyColumns: [0, 4]'
    it('Option: headings: ["A"] && ignoreColumns: [1, 2] && onlyColumns: [0, 4]', function () {
        const converted = tabletojson.convert(html, {
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

    // FIX/TEST: https://github.com/maugenst/tabletojson/issues/19
    it('Test to check conversion and handling of Kanji, Hiragana, Katakana and latin texts', function () {
        const converted = tabletojson.convert(html);
        expect(converted).toBeDefined();

        const table = converted[6];

        expect(_.has(table[0], 'Kanji')).toBeTruthy();
        expect(_.has(table[0], 'Hiragana')).toBeTruthy();
        expect(_.has(table[0], 'Katakana')).toBeTruthy();
        expect(_.has(table[0], 'Rōmaji')).toBeTruthy();
        expect(_.has(table[0], 'English')).toBeTruthy();

        expect(table[0].Kanji).toEqual('私');
        expect(table[0].Hiragana).toEqual('わたし');
        expect(table[0].Katakana).toEqual('ワタシ');
        expect(table[0].Rōmaji).toEqual('watashi');
        expect(table[0].English).toEqual('I, me');
    });

    // ENHANCEMENT: https://github.com/maugenst/tabletojson/issues/30
    it('limit results to only get a configurable amount of rows', function () {
        let converted = tabletojson.convert(html);
        expect(converted).toBeDefined();

        let table = converted[9];

        expect(table.length).toBe(200);

        converted = tabletojson.convert(html, {
            limitrows: 5
        });

        expect(converted).toBeDefined();

        table = converted[9];

        expect(table.length).toBe(5);
    });

    // ENHANCEMENT: Coverage improvement to also cover rowspan tables
    // | PARENT | CHILD | AGE |
    // |        |   Sue |  15 |
    // | Marry  | Steve |  12 |
    // |        |   Tom |   3 |

    it('Rowspan usage leads to correct object representation', function () {
        const converted = tabletojson.convert(html, {
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

    // ENHANCEMENT: Coverage improvement to also cover complex rowspan tables
    // | PARENT | CHILD | AGE |
    // +--------+-------+-----+
    // |        |   Sue |  15 |
    // +        +-------+-----+
    // | Marry  | Steve |  12 |
    // +        +-------+-----+
    // |        |       |     |
    // +--------+   Tom |   3 +
    // |        |       |     |
    // + Taylor +-------+-----+
    // |        | Peter |  17 |
    // +--------+-------+-----+

    it('Table #12 - Complex rowspan usage leads to correct object representation', function () {
        const converted = tabletojson.convert(html, {
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

    it('Table #12-a - Complex rowspan usage leads to correct object representation', function () {
        const converted = tabletojson.convert(html, {
            id: ['table12-a']
        });
        expect(converted).toBeDefined();
        expect(converted.length).toBe(1);
        const table = converted[0];

        expect(table.length).toBe(6);

        console.log(JSON.stringify(table));

        expect(table[0].Department).toBe('Engineering');
        expect(table[1].Department).toBe('Engineering');
        expect(table[2].Department).toBe('Engineering');
        expect(table[3].Department).toBe('Engineering');
        expect(table[4].Department).toBe('Social Science');
        expect(table[5].Department).toBe('Social Science');

        expect(table[0].Major).toBe('Computer Science');
        expect(table[1].Major).toBe('Computer Science');
        expect(table[2].Major).toBe('Computer Science');
        expect(table[3].Major).toBe('Electrical Engineering');
        expect(table[4].Major).toBe('Economics');
        expect(table[5].Major).toBe('Economics');

        expect(table[0].Class).toBe('CS101');
        expect(table[1].Class).toBe('CS201');
        expect(table[2].Class).toBe('CS303');
        expect(table[3].Class).toBe('EE101');
        expect(table[4].Class).toBe('EC101');
        expect(table[5].Class).toBe('EC401');

        expect(table[0].Instructor).toBe('Kim');
        expect(table[1].Instructor).toBe('Garcia');
        expect(table[2].Instructor).toBe('Garcia');
        expect(table[3].Instructor).toBe('Müller');
        expect(table[4].Instructor).toBe('Nguyen');
        expect(table[5].Instructor).toBe('Smith');

        expect(table[0].Credit).toBe('3');
        expect(table[1].Credit).toBe('3');
        expect(table[2].Credit).toBe('2');
        expect(table[3].Credit).toBe('3');
        expect(table[4].Credit).toBe('3');
        expect(table[5].Credit).toBe('3');
    });

    // Currently skipped as it is not yet implemented --> Code needs to be reviewed
    it.skip('Table #12-b - Complex cells with rowspan AND colspan', function () {
        const converted = tabletojson.convert(html, {
            id: ['table12-b']
        });
        expect(converted).toBeDefined();
        expect(converted.length).toBe(1);
        const table = converted[0];

        expect(table.length).toBe(6);

        expect(table[0].Header1).toBe('Cell1');
        expect(table[1].Header1).toBe('Cell1');
        expect(table[2].Header1).toBe('Cell1');
        expect(table[3].Header1).toBe('Cell1');
        expect(table[4].Header1).toBe('Cell13');
        expect(table[5].Header1).toBe('Cell15');

        expect(table[0].Header2).toBe('Cell2');
        expect(table[1].Header2).toBe('Cell2');
        expect(table[2].Header2).toBe('Cell2');
        expect(table[3].Header2).toBe('Cell10');
        expect(table[4].Header2).toBe('Cell13');
        expect(table[5].Header2).toBe('Cell16');

        expect(table[0].Header3).toBe('Cell3');
        expect(table[1].Header3).toBe('Cell6');
        expect(table[2].Header3).toBe('Cell8');
        expect(table[3].Header3).toBe('Cell11');
        expect(table[4].Header3).toBe('Cell11');
        expect(table[5].Header3).toBe('Cell11');

        expect(table[0].Header4).toBe('Cell4');
        expect(table[1].Header4).toBe('Cell7');
        expect(table[2].Header4).toBe('Cell7');
        expect(table[3].Header4).toBe('Cell11');
        expect(table[4].Header4).toBe('Cell11');
        expect(table[5].Header4).toBe('Cell11');

        expect(table[0].Header5).toBe('Cell5');
        expect(table[1].Header5).toBe('Cell5');
        expect(table[2].Header5).toBe('Cell9');
        expect(table[3].Header5).toBe('Cell12');
        expect(table[4].Header5).toBe('Cell14');
        expect(table[5].Header5).toBe('Cell14');
    });

    it('Options: containsClasses', function () {
        const converted = tabletojson.convert(html, {
            containsClasses: ['table']
        });
        expect(converted).toBeDefined();

        const firstTable = converted[0];

        expect(_.has(firstTable[0], 'Age')).toBeTruthy();
        expect(firstTable[0].Age).toBe('2');
    });

    it('Options: byId', function () {
        const converted = tabletojson.convert(html, {
            id: ['table9']
        });
        expect(converted).toBeDefined();
        expect(converted.length).toBe(1);

        const table = converted[0];

        expect(_.has(table[0], 'Age')).toBeTruthy();
        expect(table[0].Age).toBe('2');
    });

    it('Options: useFirstRowForHeadings', function () {
        const converted = tabletojson.convert(html, {
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

    it('Converting a table with no content', function () {
        const converted = tabletojson.convert(html, {
            id: ['table14']
        });
        expect(converted).toBeDefined();
        expect(Array.isArray(converted)).toBeTruthy();
        expect(converted.length).toBe(0);
    });

    it('Options: converting an html page with no tables', function () {
        const converted = tabletojson.convert(noTables);
        expect(converted).toBeDefined();
        expect(converted.length).toBe(0);
    });

    it('Converting a multi-level header table', function () {
        const converted = tabletojson.convert(html, {
            id: ['table15'],
            headers: {
                to: 2,
                concatWith: ' '
            }
        });
        const table = converted[0];
        expect(_.has(table[0], 'Industry')).toBeTruthy();
        expect(table[0].Industry).toEqual('total');
        expect(converted.length).toBe(1);
    });

    it('Converting a multi-level header table with no content', function () {
        const converted = tabletojson.convert(html, {
            id: ['table14'],
            headers: {
                to: 0,
                concatWith: ' '
            }
        });
        expect(converted).toBeDefined();
        expect(Array.isArray(converted)).toBeTruthy();
        expect(converted.length).toBe(0);
    });

    test('Tabletojson class reference for coverage', () => {
        // Reference the class directly to ensure coverage
        expect(typeof tabletojson.convert).toBe('function');
    });

    test('should skip hidden rows when ignoreHiddenRows is true', () => {
        const html = `
        <table>
            <tr style="display: none"><td>Hidden</td></tr>
            <tr><td>Visible</td></tr>
        </table>
    `;
        const result = tabletojson.convert(html, {ignoreHiddenRows: true});
        expect(result[0].length).toBe(1);
        // Check the value of the only cell in the only row
        expect(Object.values(result[0][0])).toContain('Visible');
    });

    test('should skip hidden rows with style display:none when ignoreHiddenRows is true', () => {
        const html = `
        <table>
            <tr style="color: red; display: none;"><td>Hidden</td></tr>
            <tr><td>Visible</td></tr>
        </table>
    `;
        const result = tabletojson.convert(html, {ignoreHiddenRows: true});
        expect(result[0].length).toBe(1);
        expect(Object.values(result[0][0])).toContain('Visible');
    });

    test('should skip hidden rows with style display:none (no space) when ignoreHiddenRows is true', () => {
        const html = `
        <table>
            <tr style="display:none"><td>Hidden</td></tr>
            <tr><td>Visible</td></tr>
        </table>
    `;
        const result = tabletojson.convert(html, {ignoreHiddenRows: true});
        expect(result[0].length).toBe(1);
        expect(Object.values(result[0][0])).toContain('Visible');
    });

    // Covers line 409 and 431
    test('convertUrl with only URL (no options/callback)', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            text: () => Promise.resolve('<table><tr><td>Test</td></tr></table>'),
            headers: {get: () => 'text/html'}
        });
        const result = await tabletojson.convertUrl('https://example.com');
        expect(Object.values(result[0][0])).toContain('Test');
    });

    // Covers line 417 and 431
    test('convertUrl with callback as second argument', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            text: () => Promise.resolve('<table><tr><td>Test2</td></tr></table>'),
            headers: {get: () => 'text/html'}
        });
        await tabletojson.convertUrl('https://example.com', (result) => {
            expect(Object.values(result[0][0])).toContain('Test2');
        });
    });
});
