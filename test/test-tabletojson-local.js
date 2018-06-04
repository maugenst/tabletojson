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

    it('Double Header Entry: do not count duplicate headings', async function() {
        const converted = await tabletojson.convert(html, {
            countDuplicateHeadings: false
        });
        converted.should.be.ok();

        const firstTable = converted[0];

        _.has(firstTable[0], 'isDumb').should.be.true();
        _.has(firstTable[0], 'isDumb_2').should.be.false();
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
});
