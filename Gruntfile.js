'use strict';
module.exports = function(grunt) {
    const isparta = require('isparta');

    // load plugins
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-prettier');
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-coveralls');
    grunt.loadNpmTasks('grunt-mocha-istanbul');

    // configure plugins
    grunt.initConfig({
        env: {
            coverage: {
                APP_DIR_FOR_CODE_COVERAGE: 'coverage'
            }
        },
        instrument: {
            api: {
                files: 'lib/*.js',
                options: {
                    basePath: 'coverage/instrument/'
                }
            }
        },
        mochaTest: {
            all: {
                src: ['test/test-*.js'],
                options: {
                    reporter: 'spec'
                }
            }
        },
        mocha_istanbul: {
            all: {
                src: ['test/test-*.js'],
                options: {
                    root: './lib',
                    coverage: true,
                    check: {
                        lines: 75,
                        statements: 75
                    },
                    reportFormats: ['cobertura', 'lcovonly']
                }
            }
        },
        coveralls: {
            basic_test: {
                src: 'test/fixtures/lcov.info'
            },

            grunt_coveralls_real_coverage: {
                src: 'coverage/lcov.info'
            }
        },
        eslint: {
            options: {
                configFile: '.eslintrc'
            },
            target: ['test/**/*.js']
        }
    });

    // register tasks
    grunt.registerTask('default', ['mochaTest:all', 'eslint', 'mocha_istanbul:all']);
    grunt.registerTask('coverage', ['env:coverage', instrument]);
};
