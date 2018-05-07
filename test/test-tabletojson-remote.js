'use strict';

require('should');
const config = require('config');
const tabletojson = require('../lib/tabletojson');

describe('TableToJSON Remote', function() {
    this.timeout(0);

    it('Get table from Wikipedia using callBack function', async function() {
        const converted = await tabletojson.convertUrl(
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

    // Leaving this one out since this is not a core functionality but rather an usage example
    it.skip('Get table from en.wikipedia.org and convert it to csv', async function() {
        const converted = await tabletojson.convertUrl(
            'http://en.wikipedia.org/wiki/List_of_countries_by_credit_rating',
            {
                request: {
                    proxy: config.get('request.proxy')
                }
            }
        );

        var standardAndPoorCreditRatings = converted[1];

        json2csv(
            {
                data: standardAndPoorCreditRatings,
                fields: ['Country', 'Outlook']
            },
            function(err, csv) {
                console.log(csv);
                /* Example output
      "Country","Outlook"
      "Abu Dhabi, UAE","Stable"
      "Albania","Stable"
      "Andorra","Negative"
      "Angola","Stable"
      "Argentina","Negative"
      "Aruba","Stable"
      "Australia","Stable"
      "Austria","Negative"
      "Azerbaijan","Positive"
      ...
    */
            }
        );
    });
});
