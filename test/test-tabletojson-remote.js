'use strict';

require('should');
const config = require('config');
const _ = require('lodash');
const tabletojson = require('../lib/tabletojson');

describe('TableToJSON Remote', function() {
    this.timeout(0);

    it('Get table from Wikipedia using callBack function', async function() {
        await tabletojson.convertUrl(
            'https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes',
            {
                request: {
                    proxy: config.get('request.proxy')
                }
            },
            converted => {
                converted.should.be.ok();
                const mainTable = converted[1];
                (mainTable instanceof Array).should.be.true();
                mainTable[0].should.have.property('Language family');
            }
        );
    });

    it('Get table from Wikipedia using callBack function without options', async function() {
        await tabletojson.convertUrl('https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes', converted => {
            converted.should.be.ok();
            const mainTable = converted[1];
            (mainTable instanceof Array).should.be.true();
            mainTable[0].should.have.property('Language family');
        });
    });

    it('Get table from Wikipedia using promise', async function() {
        const converted = await tabletojson.convertUrl('https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes', {
            request: {
                proxy: config.get('request.proxy')
            }
        });

        converted.should.be.ok();
        const mainTable = converted[1];
        (mainTable instanceof Array).should.be.true();
        mainTable[0].should.have.property('Language family');
    });

    it('Get table from timeanddate.com and use first row as heading', async function() {
        const converted = await tabletojson.convertUrl('https://www.timeanddate.com/holidays/ireland/2017', {
            useFirstRowForHeadings: true,
            request: {
                proxy: config.get('request.proxy')
            }
        });

        converted.should.be.ok();
        const mainTable = converted[0];
        (mainTable instanceof Array).should.be.true();

        Object.keys(mainTable[0]).forEach(key => {
            mainTable[0][key].should.be.equal(key);
        });
    });

    it('Get table from wikipedia containing Kanji, Hiragana, Katakana and latin texts', async function() {
        const converted = await tabletojson.convertUrl('https://en.wikipedia.org/wiki/Japanese_writing_system', {
            containsClasses: ['wikitable'],
            request: {
                proxy: config.get('request.proxy')
            }
        });

        converted.should.be.ok();
        const table = converted[0];
        (table instanceof Array).should.be.true();

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

    it('Try to get a table from a nonexisting domain', async function() {
        tabletojson.convertUrl('https://www.klhsfljkag.com/ydasdadad/adsaakhjg/jahsgajhvas.html').catch(e => {
            e.message.should.equal('getaddrinfo ENOTFOUND www.klhsfljkag.com www.klhsfljkag.com:443');
        });
    });
});
