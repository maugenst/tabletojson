'use strict';

require('should');
const config = require('config');
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
});
