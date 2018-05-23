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

    it('Directly local html content: Table with header', async function() {
        const converted = await tabletojson.convert(html);
        converted.should.be.ok();

        const firstTable = converted[0];

        _.has(firstTable[0], 'Dog').should.be.true();
        _.has(firstTable[0], 'Race').should.be.true();
        _.has(firstTable[0], 'Age').should.be.true();
    });

    it('Directly passing html content: Table without header', async function() {
        const converted = await tabletojson.convert(html);
        converted.should.be.ok();

        const secondTable = converted[1];
        _.has(secondTable[0], '0').should.be.true();
        _.has(secondTable[0], '1').should.be.true();
        _.has(secondTable[0], '2').should.be.true();

        secondTable[0]['0'].should.be.equal('Dog');
        secondTable[0]['1'].should.be.equal('Race');
        secondTable[0]['2'].should.be.equal('Age');
    });
});
