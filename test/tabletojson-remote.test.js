'use strict';

const config = require('config');
const _ = require('lodash');
const tabletojson = require('../lib/tabletojson');

describe('TableToJSON Remote', function() {

    it('Get table from Wikipedia using callBack function', async function() {
        await tabletojson.convertUrl(
            'https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes',
            {
                request: {
                    proxy: config.get('request.proxy')
                }
            },
            converted => {
                const mainTable = converted[1];
                expect(mainTable[0]).toHaveProperty('Language family');
                expect(mainTable instanceof Array).toBeTruthy();
                expect(mainTable[0]).toHaveProperty('Language family');
            }
        );
    });

    it('Get table from Wikipedia using callBack function without options', async function() {
        await tabletojson.convertUrl('https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes', converted => {
            expect(converted).toBeDefined();
            const mainTable = converted[1];
            expect(mainTable instanceof Array).toBeTruthy();
            expect(mainTable[0]).toHaveProperty('Language family');
        });
    });

    it('Get table from Wikipedia using promise', async function() {
        const converted = await tabletojson.convertUrl('https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes', {
            request: {
                proxy: config.get('request.proxy')
            }
        });

        expect(converted).toBeDefined();
        const mainTable = converted[1];
        expect(mainTable instanceof Array).toBeTruthy();
        expect(mainTable[0]).toHaveProperty('Language family');
    });

    it('Get table from w3schools.com and use first row as heading', async function() {
        const converted = await tabletojson.convertUrl('https://www.w3schools.com/html/html_tables.asp', {
            useFirstRowForHeadings: true,
            request: {
                proxy: config.get('request.proxy')
            }
        });

        expect(converted).toBeDefined();
        const mainTable = converted[0];
        expect(mainTable instanceof Array).toBeTruthy();

        Object.keys(mainTable[0]).forEach(key => {
            expect(mainTable[0][key]).toEqual(key);
        });
    });

    it('Get table from wikipedia containing Kanji, Hiragana, Katakana and latin texts', async function() {
        const converted = await tabletojson.convertUrl('https://en.wikipedia.org/wiki/Japanese_writing_system', {
            containsClasses: ['wikitable'],
            request: {
                proxy: config.get('request.proxy')
            }
        });

        expect(converted).toBeDefined();
        const table = converted[2];
        expect(table instanceof Array).toBeTruthy();

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

    it('Try to get a table from a nonexisting domain', async function() {
        tabletojson.convertUrl('https://www.klhsfljkag.com/ydasdadad/adsaakhjg/jahsgajhvas.html').catch(e => {
            expect(e.message).toContain('getaddrinfo ENOTFOUND www.klhsfljkag.com');
        });
    });
});
