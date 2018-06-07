'use strict';

require('should');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const tabletojson = require('../lib/tabletojson');

describe('TableToJSON Local', function() {
    this.timeout(0);

    let html = '';

    before(() => {
        html = fs.readFileSync(path.resolve(__dirname, 'tables.html'), {encoding: 'UTF-8'});
    });

    it('Options: Strip HTML from header AND from body', async function() {
        const converted = await tabletojson.convert(html, {
            stripHtmlFromHeadings: true,
            stripHtmlFromCells: true
        });
        converted.should.be.ok();

        const firstTable = converted[0];

        _.has(firstTable[0], 'Age').should.be.true();
        firstTable[0].Age.should.be.equal('2');
    });

    it('Options: Strip HTML from header AND from body using stripHtml-shortcut ', async function() {
        const converted = await tabletojson.convert(html, {
            stripHtml: true
        });
        converted.should.be.ok();

        const firstTable = converted[0];

        _.has(firstTable[0], 'Age').should.be.true();
        firstTable[0].Age.should.be.equal('2');
    });

    it('Options: Strip HTML from header but not from body', async function() {
        const converted = await tabletojson.convert(html, {
            stripHtmlFromHeadings: true,
            stripHtmlFromCells: false
        });
        converted.should.be.ok();

        const firstTable = converted[0];

        _.has(firstTable[0], 'Age').should.be.true();
        firstTable[0].Age.should.be.equal('<i>2</i>');
    });

    it('Options: Strip HTML from body but not from header', async function() {
        const converted = await tabletojson.convert(html, {
            stripHtmlFromHeadings: false,
            stripHtmlFromCells: true
        });
        converted.should.be.ok();

        const firstTable = converted[0];

        _.has(firstTable[0], '<b>Age</b>').should.be.true();
        firstTable[0]['<b>Age</b>'].should.be.equal('2');
    });

    // ADDED TO FIX: https://github.com/maugenst/tabletojson/issues/15
    it('Double Header Entry: handle double header entries in different tables', async function() {
        const converted = await tabletojson.convert(html);
        converted.should.be.ok();

        const firstTable = converted[0];
        const secondTable = converted[1];

        _.has(firstTable[0], 'Age').should.be.true();
        _.has(secondTable[0], 'Age').should.be.true();
    });

    it('Double Header Entry: handle double header entries', async function() {
        const converted = await tabletojson.convert(html);
        converted.should.be.ok();

        const firstTable = converted[0];

        _.has(firstTable[0], 'isDumb').should.be.true();
        _.has(firstTable[0], 'isDumb_2').should.be.true();
    });

    it('Directly local html content: Table with header', async function() {
        const converted = await tabletojson.convert(html);
        converted.should.be.ok();

        const firstTable = converted[0];

        _.has(firstTable[0], 'Dog').should.be.true();
        _.has(firstTable[0], 'Race').should.be.true();
        _.has(firstTable[0], 'Age').should.be.true();
    });

    it('Do not strip HTML from header', async function() {
        const converted = await tabletojson.convert(html, {
            stripHtml: false
        });
        converted.should.be.ok();

        const firstTable = converted[0];

        _.has(firstTable[0], 'Dog').should.be.true();
        _.has(firstTable[0], 'Race').should.be.true();
        _.has(firstTable[0], '<b>Age</b>').should.be.true();
    });

    it('Directly passing html content: Table without header', async function() {
        const converted = await tabletojson.convert(html);
        converted.should.be.ok();

        const thirdTable = converted[2];
        _.has(thirdTable[0], '0').should.be.true();
        _.has(thirdTable[0], '1').should.be.true();
        _.has(thirdTable[0], '2').should.be.true();

        thirdTable[0]['0'].should.be.equal('Dog');
        thirdTable[0]['1'].should.be.equal('Race');
        thirdTable[0]['2'].should.be.equal('Age');
    });

    // ADDED TO FIX: https://github.com/maugenst/tabletojson/issues/14
    it('Empty header: to be converted into their column count and not to the underline field name', async function() {
        const converted = await tabletojson.convert(html);
        converted.should.be.ok();

        const forthTable = converted[3];
        _.has(forthTable[0], 'Dog').should.be.true();
        _.has(forthTable[0], '1').should.be.true();
        _.has(forthTable[0], '2').should.be.true();
        _.has(forthTable[0], 'Height').should.be.true();
        _.has(forthTable[0], '4').should.be.true();
    });

    // ADDED TO FIX: https://github.com/maugenst/tabletojson/pull/18
    it('Double Header Entry: countDuplicateHeadings:false', async function() {
        const converted = await tabletojson.convert(html, {
            countDuplicateHeadings: false
        });
        converted.should.be.ok();

        const table = converted[4];

        _.has(table[0], 'PLACE').should.be.true();
        _.has(table[0], 'VALUE').should.be.true();
        _.has(table[0], 'PLACE_2').should.be.false();
        _.has(table[0], 'VALUE_2').should.be.false();
        _.has(table[1], 'PLACE').should.be.true();
        _.has(table[1], 'VALUE').should.be.true();
        _.has(table[1], 'PLACE_2').should.be.false();
        _.has(table[1], 'VALUE_2').should.be.false();

        table[0].PLACE.should.be.equal('def');
        table[0].VALUE.should.be.equal('2');
        table[1].PLACE.should.be.equal('jkl');
        table[1].VALUE.should.be.equal('4');
    });

    // ADDED TO FIX: https://github.com/maugenst/tabletojson/pull/18
    it('Double Header Entry: countDuplicateHeadings:true', async function() {
        const converted = await tabletojson.convert(html, {
            countDuplicateHeadings: true
        });
        converted.should.be.ok();

        const table = converted[4];

        _.has(table[0], 'PLACE').should.be.true();
        _.has(table[0], 'VALUE').should.be.true();
        _.has(table[0], 'PLACE_2').should.be.true();
        _.has(table[0], 'VALUE_2').should.be.true();
        _.has(table[1], 'PLACE').should.be.true();
        _.has(table[1], 'VALUE').should.be.true();
        _.has(table[1], 'PLACE_2').should.be.true();
        _.has(table[1], 'VALUE_2').should.be.true();

        table[0].PLACE.should.be.equal('abc');
        table[0].VALUE.should.be.equal('1');
        table[0].PLACE_2.should.be.equal('def');
        table[0].VALUE_2.should.be.equal('2');
        table[1].PLACE.should.be.equal('ghi');
        table[1].VALUE.should.be.equal('3');
        table[1].PLACE_2.should.be.equal('jkl');
        table[1].VALUE_2.should.be.equal('4');
    });

    // FEATURE 'ignoreColumns'
    it('Option: ignoreColumns: [2, 3]', async function() {
        const converted = await tabletojson.convert(html, {
            ignoreColumns: [2, 3]
        });
        converted.should.be.ok();

        const table = converted[5];

        _.has(table[0], 'NAME').should.be.true();
        _.has(table[0], 'PLACE').should.be.true();
        _.has(table[0], 'WEIGHT').should.be.false();
        _.has(table[0], 'SEX').should.be.false();
        _.has(table[0], 'AGE').should.be.true();
        table[0].NAME.should.be.equal('Mel');
        table[0].PLACE.should.be.equal('1');
        table[0].AGE.should.be.equal('23');

        _.has(table[1], 'NAME').should.be.true();
        _.has(table[1], 'PLACE').should.be.true();
        _.has(table[1], 'WEIGHT').should.be.false();
        _.has(table[1], 'SEX').should.be.false();
        _.has(table[1], 'AGE').should.be.true();
        table[1].NAME.should.be.equal('Tom');
        table[1].PLACE.should.be.equal('2');
        table[1].AGE.should.be.equal('54');

        _.has(table[2], 'NAME').should.be.true();
        _.has(table[2], 'PLACE').should.be.true();
        _.has(table[2], 'WEIGHT').should.be.false();
        _.has(table[2], 'SEX').should.be.false();
        _.has(table[2], 'AGE').should.be.true();
        table[2].NAME.should.be.equal('Bill');
        table[2].PLACE.should.be.equal('3');
        table[2].AGE.should.be.equal('31');
    });

    // FEATURE 'onlyColumns'
    it('Option: onlyColumns: [0, 4]', async function() {
        const converted = await tabletojson.convert(html, {
            onlyColumns: [0, 4],
            ignoreColumns: [2, 4]
        });
        converted.should.be.ok();

        const table = converted[5];

        _.has(table[0], 'NAME').should.be.true();
        _.has(table[0], 'PLACE').should.be.false();
        _.has(table[0], 'WEIGHT').should.be.false();
        _.has(table[0], 'SEX').should.be.false();
        _.has(table[0], 'AGE').should.be.true();
        table[0].NAME.should.be.equal('Mel');
        table[0].AGE.should.be.equal('23');

        _.has(table[1], 'NAME').should.be.true();
        _.has(table[1], 'PLACE').should.be.false();
        _.has(table[1], 'WEIGHT').should.be.false();
        _.has(table[1], 'SEX').should.be.false();
        _.has(table[1], 'AGE').should.be.true();
        table[1].NAME.should.be.equal('Tom');
        table[1].AGE.should.be.equal('54');

        _.has(table[2], 'NAME').should.be.true();
        _.has(table[2], 'PLACE').should.be.false();
        _.has(table[2], 'WEIGHT').should.be.false();
        _.has(table[2], 'SEX').should.be.false();
        _.has(table[2], 'AGE').should.be.true();
        table[2].NAME.should.be.equal('Bill');
        table[2].AGE.should.be.equal('31');
    });

    // FEATURE 'ignoreHiddenRows:true'
    it('Option: ignoreHiddenRows:true', async function() {
        const converted = await tabletojson.convert(html, {
            ignoreHiddenRows: true
        });
        converted.should.be.ok();

        const table = converted[5];

        _.has(table[0], 'NAME').should.be.true();
        _.has(table[0], 'PLACE').should.be.true();
        _.has(table[0], 'WEIGHT').should.be.true();
        _.has(table[0], 'SEX').should.be.true();
        _.has(table[0], 'AGE').should.be.true();

        table.length.should.be.equal(3);
    });

    // FEATURE 'ignoreHiddenRows:false'
    it('Option: ignoreHiddenRows:false', async function() {
        const converted = await tabletojson.convert(html, {
            ignoreHiddenRows: false
        });
        converted.should.be.ok();

        const table = converted[5];

        _.has(table[0], 'NAME').should.be.true();
        _.has(table[0], 'PLACE').should.be.true();
        _.has(table[0], 'WEIGHT').should.be.true();
        _.has(table[0], 'SEX').should.be.true();
        _.has(table[0], 'AGE').should.be.true();

        table.length.should.be.equal(4);
    });

    // FEATURE 'headings: ['A', 'B', 'C', 'D', 'E']'
    it('Option: headings: ["A","B","C","D","E"]', async function() {
        const converted = await tabletojson.convert(html, {
            headings: ['A', 'B', 'C', 'D', 'E']
        });
        converted.should.be.ok();

        const table = converted[5];

        _.has(table[0], 'A').should.be.true();
        _.has(table[0], 'B').should.be.true();
        _.has(table[0], 'C').should.be.true();
        _.has(table[0], 'D').should.be.true();
        _.has(table[0], 'E').should.be.true();

        table.length.should.be.equal(3);
    });

    // FEATURE 'headings: ['A', 'B', 'C']'
    it('Option: headings: ["A","B","C"]', async function() {
        const converted = await tabletojson.convert(html, {
            headings: ['A', 'B', 'C']
        });
        converted.should.be.ok();

        const table = converted[5];

        _.has(table[0], 'A').should.be.true();
        _.has(table[0], 'B').should.be.true();
        _.has(table[0], 'C').should.be.true();
        _.has(table[0], 'D').should.be.false();
        _.has(table[0], 'E').should.be.false();

        table.length.should.be.equal(3);
    });

    /**
     * | NAME | PLACE | WEIGHT | SEX | AGE |
     * |  Mel |     1 |     58 |   W |  23 |
     * |  Tom |     2 |     78 |   M |  54 |
     * | Bill |     3 |     92 |   M |  31 |
     */
    // FEATURE 'headings: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']'
    it('Option: headings: ["A","B","C","E","E","F","G","H","I"]', async function() {
        const converted = await tabletojson.convert(html, {
            headings: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']
        });
        converted.should.be.ok();

        const table = converted[5];

        _.has(table[0], 'A').should.be.true();
        _.has(table[0], 'B').should.be.true();
        _.has(table[0], 'C').should.be.true();
        _.has(table[0], 'D').should.be.true();
        _.has(table[0], 'E').should.be.true();

        table.length.should.be.equal(3);
        table[0].A.should.equal('Mel');
        table[0].B.should.equal('1');
        table[0].C.should.equal('58');
        table[0].D.should.equal('W');
        table[0].E.should.equal('23');

        table[1].A.should.equal('Tom');
        table[1].B.should.equal('2');
        table[1].C.should.equal('78');
        table[1].D.should.equal('M');
        table[1].E.should.equal('54');

        table[2].A.should.equal('Bill');
        table[2].B.should.equal('3');
        table[2].C.should.equal('92');
        table[2].D.should.equal('M');
        table[2].E.should.equal('31');
    });

    /**
     * | NAME | PLACE | WEIGHT | SEX | AGE |
     * |  Mel |     1 |     58 |   W |  23 |
     * |  Tom |     2 |     78 |   M |  54 |
     * | Bill |     3 |     92 |   M |  31 |
     */
    // FEATURE 'headings: ['A', 'B', 'C'] && ignoreColumns: [1, 2]'
    it('Option: headings: ["A","B","C"] && ignoreColumns: [1, 2]', async function() {
        const converted = await tabletojson.convert(html, {
            headings: ['A', 'B', 'C'],
            ignoreColumns: [1, 2]
        });
        converted.should.be.ok();

        const table = converted[5];

        _.has(table[0], 'A').should.be.true();
        _.has(table[0], 'B').should.be.true();
        _.has(table[0], 'C').should.be.true();
        _.has(table[0], 'D').should.be.false();
        _.has(table[0], 'E').should.be.false();

        table.length.should.be.equal(3);

        table[0].A.should.equal('Mel');
        table[0].B.should.equal('W');
        table[0].C.should.equal('23');

        table[1].A.should.equal('Tom');
        table[1].B.should.equal('M');
        table[1].C.should.equal('54');

        table[2].A.should.equal('Bill');
        table[2].B.should.equal('M');
        table[2].C.should.equal('31');
    });

    /**
     * | NAME | PLACE | WEIGHT | SEX | AGE |
     * |  Mel |     1 |     58 |   W |  23 |
     * |  Tom |     2 |     78 |   M |  54 |
     * | Bill |     3 |     92 |   M |  31 |
     */
    // FEATURE 'headings: ['A', 'B', 'C'] && ignoreColumns: [1, 2] && onlyColumns: [0, 4]'
    it('Option: headings: ["A","B","C"] && ignoreColumns: [1, 2] && onlyColumns: [0, 4]', async function() {
        const converted = await tabletojson.convert(html, {
            headings: ['A', 'B', 'C'],
            ignoreColumns: [1, 2],
            onlyColumns: [0, 4]
        });
        converted.should.be.ok();

        const table = converted[5];

        _.has(table[0], 'A').should.be.true();
        _.has(table[0], 'B').should.be.true();
        _.has(table[0], 'C').should.be.false();
        _.has(table[0], 'D').should.be.false();
        _.has(table[0], 'E').should.be.false();

        table.length.should.be.equal(3);

        table[0].A.should.equal('Mel');
        table[0].B.should.equal('23');

        table[1].A.should.equal('Tom');
        table[1].B.should.equal('54');

        table[2].A.should.equal('Bill');
        table[2].B.should.equal('31');
    });

    /**
     * | NAME | PLACE | WEIGHT | SEX | AGE |
     * |  Mel |     1 |     58 |   W |  23 |
     * |  Tom |     2 |     78 |   M |  54 |
     * | Bill |     3 |     92 |   M |  31 |
     */
    // FEATURE 'headings: ['A'] && ignoreColumns: [1, 2] && onlyColumns: [0, 4]'
    it('Option: headings: ["A"] && ignoreColumns: [1, 2] && onlyColumns: [0, 4]', async function() {
        const converted = await tabletojson.convert(html, {
            headings: ['A'],
            ignoreColumns: [1, 2],
            onlyColumns: [0, 4]
        });
        converted.should.be.ok();

        const table = converted[5];

        _.has(table[0], 'A').should.be.true();
        _.has(table[0], 'B').should.be.false();
        _.has(table[0], 'C').should.be.false();
        _.has(table[0], 'D').should.be.false();
        _.has(table[0], 'E').should.be.false();

        table.length.should.be.equal(3);

        table[0].A.should.equal('Mel');

        table[1].A.should.equal('Tom');

        table[2].A.should.equal('Bill');
    });

    // FIX/TEST: https://github.com/maugenst/tabletojson/issues/19
    it('Test to check conversion and handling of Kanji, Hiragana, Katakana and latin texts', async function() {
        const converted = await tabletojson.convert(html);
        converted.should.be.ok();

        const table = converted[6];

        _.has(table[0], 'Kanji').should.be.true();
        _.has(table[0], 'Hiragana').should.be.true();
        _.has(table[0], 'Katakana').should.be.true();
        _.has(table[0], 'Rōmaji').should.be.true();
        _.has(table[0], 'English').should.be.true();

        table[0]['Kanji'].should.equal('私');
        table[0]['Hiragana'].should.equal('わたし');
        table[0]['Katakana'].should.equal('ワタシ');
        table[0]['Rōmaji'].should.equal('watashi');
        table[0]['English'].should.equal('I, me');
    });
});
