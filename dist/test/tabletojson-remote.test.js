"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
require("jest-extended");
const Tabletojson_1 = require("../lib/Tabletojson");
const express = require("express");
const app = express();
describe('TableToJSON Remote', function () {
    beforeAll(() => {
        app.use(express.static(__dirname));
        app.get('/user', (_req, res) => {
            res.status(200).json({ name: 'john' });
        });
        app.listen(80);
    });
    test('Get table from locally mocked server returning a json object', async function () {
        await expect(Tabletojson_1.Tabletojson.convertUrl('http://localhost/user')).rejects.toThrow(/Tabletojson can just handle text/);
    });
    test('Get table from locally mocked server returning a json object passing just a callback method', async function () {
        await expect(Tabletojson_1.Tabletojson.convertUrl('http://localhost/user', () => { })).rejects.toThrow(/Tabletojson can just handle text/);
    });
    test('Get table from locally mocked server returning a json object passing in an object and a callback method', async function () {
        await expect(Tabletojson_1.Tabletojson.convertUrl('http://localhost/user', {
            useFirstRowForHeadings: true
        }, () => { })).rejects.toThrow(/Tabletojson can just handle text/);
    });
    test('Get table from locally mocked server returning an image', async function () {
        await expect(Tabletojson_1.Tabletojson.convertUrl('http://localhost/lorem.png')).rejects.toThrow(/Tabletojson can just handle text/);
    });
    test('Get table from Wikipedia using callBack function', async function () {
        await Tabletojson_1.Tabletojson.convertUrl('https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes', converted => {
            const mainTable = converted[1];
            expect(mainTable[0]).toHaveProperty('Language family');
            expect(mainTable instanceof Array).toBeTruthy();
            expect(mainTable[0]).toHaveProperty('Language family');
        });
    });
    test('Get table from Wikipedia using callBack function without options', async function () {
        await Tabletojson_1.Tabletojson.convertUrl('https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes', converted => {
            expect(converted).toBeDefined();
            const mainTable = converted[1];
            expect(mainTable instanceof Array).toBeTruthy();
            expect(mainTable[0]).toHaveProperty('Language family');
        });
    });
    test('Get table from Wikipedia using promise', async function () {
        const converted = await Tabletojson_1.Tabletojson.convertUrl('https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes');
        expect(converted).toBeDefined();
        const mainTable = converted[1];
        expect(mainTable instanceof Array).toBeTruthy();
        expect(mainTable[0]).toHaveProperty('Language family');
    });
    test('Get table from w3schools.com and use first row as heading', async function () {
        const converted = await Tabletojson_1.Tabletojson.convertUrl('https://www.w3schools.com/html/html_tables.asp', {
            useFirstRowForHeadings: true
        });
        expect(converted).toBeDefined();
        const mainTable = converted[0];
        expect(mainTable instanceof Array).toBeTruthy();
        Object.keys(mainTable[0]).forEach(key => {
            expect(mainTable[0][key]).toEqual(key);
        });
    });
    test('Get table from w3schools.com and use first row as heading and calling a passed in callback function', async function () {
        const callbackFunction = (converted) => {
            expect(converted).toBeDefined();
            const mainTable = converted[0];
            expect(mainTable instanceof Array).toBeTruthy();
            Object.keys(mainTable[0]).forEach(key => {
                expect(mainTable[0][key]).toEqual(key);
            });
        };
        await Tabletojson_1.Tabletojson.convertUrl('https://www.w3schools.com/html/html_tables.asp', {
            useFirstRowForHeadings: true
        }, callbackFunction);
    });
    test('Get table from wikipedia containing Kanji, Hiragana, Katakana and latin texts', async function () {
        const converted = await Tabletojson_1.Tabletojson.convertUrl('https://en.wikipedia.org/wiki/Japanese_writing_system', {
            containsClasses: ['wikitable']
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
    test('Try to get a table from a nonexisting domain', async function () {
        Tabletojson_1.Tabletojson.convertUrl('https://www.klhsfljkag.com/ydasdadad/adsaakhjg/jahsgajhvas.html').catch(e => {
            expect(e.message).toContain('getaddrinfo ENOTFOUND www.klhsfljkag.com');
        });
    });
});
//# sourceMappingURL=tabletojson-remote.test.js.map