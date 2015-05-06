'use strict';

module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('<%= appSlug %>.json'),
        www: 'www',
        bower: 'www/bower',
        styles: 'www/less',
        css: 'www/css',
        gfx: 'www/gfx',
        app: 'www/app',
        js: 'www/js',
        tpl: 'www/tpl',
        prototypeDist: 'dist',
        dist: '…',
        bsFiles: {
            src: [
                '<%%= css %>/style.css',
                '<%%= js %>/app-compiled.js',
                '<%%= www %>/*.html'
            ]
        },

        less: {
            options: {
                paths: [
                    '<%%= styles %>',
                    '<%%= bower %>'
                ],
                relativeUrls: true
            },
            dev: {
                options: {
                    sourceMap: true,
                    sourceMapFilename: '<%%= css %>/style.css.map',
                    sourceMapURL: 'style.css.map',
                    sourceMapBasepath: '<%%= www %>',
                    outputSourceFiles: true
                },
                files: {
                    '<%%= css %>/style.css': '<%%= styles %>/main.less'
                }
            },
            production: {
                files: {
                    '<%%= css %>/style.css': '<%%= styles %>/main.less'
                }
            }
        },

        autoprefixer: {
            options: {
                browsers: ['> 5%', 'last 2 version', 'ie 8', 'ie 9']
            },
            prefix: {
                src: '<%%= css %>/style.css'
            }
        },

        cssmin: {
            min: {
                files: {
                    '<%%= css %>/style.min.css': '<%%= css %>/style.css'
                }
            }
        },<% if (includeGrunticon) { %>

        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%%= gfx %>/svg',
                    src: ['*.svg'],
                    dest: '<%%= gfx %>/svg-min'
                }]
            }
        },

        grunticon: {
            icons: {
                files: [{
                    expand: true,
                    cwd: '<%%= gfx %>/svg-min',
                    src: ['*.svg', '*.png'],
                    dest: '<%%= gfx %>/icon'
                }],
                options: {
                    enhanceSVG: true
                }
            }
        },<% } %>

        jshint: {
            options: {
                reporter: require('jshint-stylish'),

                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                unused: true,
                boss: true,
                eqnull: true,
                indent: 4,
                white: false,
                quotmark: 'single',
                trailing: true,
                node: true,
                jquery: true
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            dev: {
                options: {
                    undef: false,
                    unused: false
                },
                src: [
                    '<%%= app %>/**/*.js'
                ]
            },
            production: {
                options: {
                    browser: true
                },
                src: [
                    '<%%= app %>/**/*.js'
                ]
            }
        },

        jscs: {
            options: {
                config: '.jscsrc'
            },
            src: [
                '<%%= app %>/**/*.js'
            ]
        },

        browserify: {
            dev: {
                options: {
                    debug: true,
                    watch: true
                },
                files: {
                    '<%%= js %>/app-compiled.js': ['<%%= app %>/app.js']
                }
            },
            production: {
                files: {
                    '<%%= js %>/app-compiled.js': ['<%%= app %>/app.js']
                }
            }
        },

        uglify: {
            options: {
                report: 'min'
            },
            compile: {
                files: {
                    '<%%= js %>/app-compiled.min.js': ['<%%= js %>/app-compiled.js'],
                    '<%%= js %>/legacy.min.js': [
                        <% if (includeBabel) { %>'<%%= bower %>/es5-shim/es5-shim.min.js',
                        '<%%= bower %>/es5-shim/es5-sham.min.js',
                        <% } %>'<%%= bower %>/respond/dest/respond.min.js'
                    ]
                }
            }
        },

        clean: {
            prototype: '<%%= prototypeDist %>',
            production: [
                '<%%= dist %>/css/*',
                '<%%= dist %>/js/*',
                '<%%= dist %>/gfx/*',
                '<%%= dist %>/img/*'
            ],
            build: [
                '<%%= css %>/*',
                '<%%= js %>/*',
                '<%%= www %>/*.html'
            ]<% if (includeGrunticon) { %>,
            icon: '<%%= gfx %>/icon/png'<% } %>
        },

        copy: {
            options: {
                nonull: true
            },
            js: {
                files: [{
                    expand: true,
                    flatten: true,
                    src: [
                        '<%%= bower %>/picturefill/dist/picturefill.min.js'
                    ],
                    dest: '<%%= js %>'
                }]
            },
            prototype: {
                files: [{
                    expand: true,
                    cwd: 'www',
                    src: [
                        'css/*.css',
                        'js/*.js',<% if (includeGrunticon) { %>
                        'gfx/icon/**/*',<% } %>
                        'img/**/*',
                        '*.{html,png,ico,xml,json}'
                    ],
                    dest: '<%%= prototypeDist %>'
                }]
            },
            production: {
                files: [{
                    expand: true,
                    cwd: 'www',
                    src: [
                        'css/*.css',
                        'js/*.js',<% if (includeGrunticon) { %>
                        'gfx/icon/**/*',<% } %>
                        'img/**/*',
                        '*.{png,ico,xml,json}'
                    ],
                    dest: '<%%= dist %>'
                }]
            }
        },

        assemble: {
            options: {
                pkg: '<%%= pkg %>',
                flatten: true
            },
            dev: {
                options: {
                    data: '<%%= tpl %>/dev/*.json',
                    partials: ['<%%= tpl %>/partials/**/*.hbs'],
                    layout: '<%%= tpl %>/layouts/default.hbs'
                },
                files: {
                    '<%%= www %>': ['<%%= tpl %>/pages/**/*.hbs']
                }
            },
            production: {
                options: {
                    data: '<%%= tpl %>/production/*.json',
                    partials: ['<%%= tpl %>/partials/**/*.hbs'],
                    layout: '<%%= tpl %>/layouts/default.hbs'
                },
                files: {
                    '<%%= www %>': ['<%%= tpl %>/pages/**/*.hbs']
                }
            }
        },

        cacheBust: {
            options: {
                encoding: 'utf8',
                algorithm: 'md5',
                length: 8,
                rename: false,
                ignorePatterns: ['satyr.io']
            },
            prototype: {
                files: [{
                    src: ['<%%= prototypeDist %>/*.html']
                }]
            }
        },<% if (includeModernizr) { %>

        modernizr: {
            dist: {
                'devFile' : '<%= bower %>/modernizr/modernizr.js',
                'outputFile' : '<%= js %>/modernizr.js',
                'extra' : {
                    'shiv' : true,
                    'printshiv' : true,
                    'load' : false,
                    'mq' : false,
                    'cssclasses' : true
                },
                'extensibility' : {
                    'addtest' : false,
                    'prefixed' : false,
                    'teststyles' : false,
                    'testprops' : true,
                    'testallprops' : true,
                    'hasevents' : false,
                    'prefixes' : false,
                    'domprefixes' : true
                },

                // By default, source is uglified before saving
                'uglify' : true,

                // Define any tests you want to implicitly include.
                // 'tests' : ['video', 'csstransforms', 'history'],

                // By default, this task will crawl your project for references to Modernizr tests.
                // Set to false to disable.
                'parseFiles' : true,

                // When parseFiles = true, this task will crawl all *.js, *.css, *.scss files, except files that are in node_modules/.
                // You can override this by defining a 'files' array below.
                'files' : {
                    'src': [
                        '<%%= css %>/style.css',
                        '<%%= js %>/app-compiled.js'
                    ]
                },

                // When parseFiles = true, matchCommunityTests = true will attempt to
                // match user-contributed tests.
                'matchCommunityTests' : false,

                // Have custom Modernizr tests? Add paths to their location here.
                'customTests' : [
                    // '<%= bower %>/modernizr/feature-detects/css-vhunit.js'
                ]
            }
        },<% } %>

        esteWatch: {
            options: {
                dirs: [
                    './',
                    //'<%%= app %>/**/',
                    '<%%= styles %>/**/',
                    '<%%= tpl %>/**/'
                ],
                livereload: {
                    enabled: false
                }
            },
            less: function() {
                return 'cssdev';
            },
            js: function(filepath) {
                if (filepath === 'Gruntfile.js') {
                    return 'jshint:gruntfile';
                } else if (filepath === 'www/js/app-compiled.js') {
                    return;
                } else {
                    grunt.config(['jshint', 'dev', 'src'], filepath);
                    grunt.config(['jscs', 'src'], filepath);
                    return 'jsdev';
                }
            },
            jsx: function() {
                return 'jsdev';
            },
            hbs: function() {
                return 'tpldev';
            },
            json: function() {
                return 'tpldev';
            }
        },

        browserSync: {
            dev: {
                bsFiles: '<%%= bsFiles %>',
                options: {
                    watchTask: true,
                    port: 1987,
                    server: {
                        baseDir: '<%%= www %>'
                    }
                }
            }
        }<% if (includeRsync) { %>,

        rsync: {
            options: {
                args: ['-zvu'],
                exclude: ['.git*', 'node_modules'],
                recursive: true
            },
            preview: {
                options: {
                    src: './dist/',
                    dest: '/data/www/preview.cz/…',
                    host: 'user@host'
                }
            }
        }<% } %>
    });

    require('jit-grunt')(grunt);

    grunt.registerTask('default', ['dev', 'browserSync:dev', 'esteWatch']);
    grunt.registerTask('nosync', ['dev', 'esteWatch']); // useful for testing in IE8
    grunt.registerTask('dev', ['cssdev', 'jsdev', 'tpldev']);
    grunt.registerTask('cssdev', ['less:dev', 'autoprefixer']);
    grunt.registerTask('css', ['less:production', 'autoprefixer', 'cssmin']);<% if (includeGrunticon) { %>
    grunt.registerTask('icon', ['svgmin', 'clean:icon', 'grunticon']);<% } %>
    grunt.registerTask('jsdev', ['jshint:gruntfile', 'jshint:dev', 'jscs', 'browserify:dev']);
    grunt.registerTask('js', ['jshint:gruntfile', 'jshint:production', 'jscs', 'browserify:production', <% if (includeModernizr) { %>'modernizr:dist', <% } %>'uglify:compile']);
    grunt.registerTask('tpldev', ['assemble:dev']);
    grunt.registerTask('tpl', ['assemble:production']);
    grunt.registerTask('prototype', ['clean:prototype', 'copy:prototype', 'cacheBust']);
    grunt.registerTask('dist', ['clean:production', 'copy:production']);
    grunt.registerTask('build', ['clean:build', 'css', 'copy:js', 'js', 'tpl', 'dist']);<% if (includeRsync) { %>
    grunt.registerTask('deploy', ['build', 'prototype', 'rsync']);<% } %>

};
