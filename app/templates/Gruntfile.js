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
        dist: 'dist_production_rename',
        bsFiles: {
            src: [
                '<%%= css %>/style.css',
                '<%%= js %>/app-compiled.js',
                '<%%= www %>/*.html'
            ]
        },
        lessFiles: {
            '<%%= css %>/style.css': '<%%= styles %>/main.less'
        },
        browserifyFiles: {
            '<%%= js %>/app-compiled.js': ['<%%= app %>/app.js']
        },

        less: {
            options: {
                paths: [
                    '<%%= styles %>',
                    '<%%= bower %>'
                ],
                plugins: [require('less-plugin-glob')],
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
                files: '<%%= lessFiles %>'
            },
            production: {
                files: '<%%= lessFiles %>'
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

        eslint: {
            options: {
                config: '.eslintrc'
            },
            gruntfile: {
                src: ['Gruntfile.js']
            },
            dev: {
                options: {
                    config: '.eslintrc-dev'
                },
                src: '<%%= app %>/**/*.js'
            },
            production: {
                src: '<%%= app %>/**/*.js'
            }
        },

        browserify: {
            dev: {
                options: {
                    debug: true,
                    watch: true
                },
                files: '<%%= browserifyFiles %>'
            },
            production: {
                files: '<%%= browserifyFiles %>'
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
                        <% if (includeBabel || includeReact) { %>'<%%= bower %>/es5-shim/es5-shim.min.js',
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
            icon: [
                '<%%= gfx %>/svg-min',
                '<%%= gfx %>/icon/png'
            ]<% } %>
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
                'devFile' : '<%%= bower %>/modernizr/modernizr.js',
                'outputFile' : '<%%= js %>/modernizr.js',
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
                    // '<%%= bower %>/modernizr/feature-detects/css-vhunit.js'
                ]
            }
        },<% } %>

        esteWatch: {
            options: {
                dirs: [
                    './',
                    '<%%= app %>/**/',
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
                    return 'eslint:gruntfile';
                } else if (filepath === 'www/js/app-compiled.js') {
                    return;
                } else {
                    grunt.config(['eslint', 'dev', 'src'], filepath);
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
                    port: <%= bsPortNumber %>,
                    open: false,
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

    require('jit-grunt')(grunt, {
        eslint: 'gruntify-eslint'
    });

    grunt.registerTask('default', ['dev', 'browserSync:dev', 'esteWatch']);
    grunt.registerTask('nosync', ['dev', 'esteWatch']); // useful for testing in IE8
    grunt.registerTask('dev', ['cssdev', 'jsdev', 'tpldev']);
    grunt.registerTask('cssdev', ['less:dev', 'autoprefixer']);
    grunt.registerTask('css', ['less:production', 'autoprefixer', 'cssmin']);<% if (includeGrunticon) { %>
    grunt.registerTask('icon', ['clean:icon', 'svgmin', 'grunticon']);<% } %>
    grunt.registerTask('jsdev', ['eslint:gruntfile', 'eslint:dev', 'browserify:dev']);
    grunt.registerTask('js', ['eslint:gruntfile', 'eslint:production', 'browserify:production', <% if (includeModernizr) { %>'modernizr:dist', <% } %>'uglify:compile']);
    grunt.registerTask('tpldev', ['assemble:dev']);
    grunt.registerTask('tpl', ['assemble:production']);
    grunt.registerTask('prototype', ['clean:prototype', 'copy:prototype', 'cacheBust']);
    grunt.registerTask('dist', ['clean:production', 'copy:production']);
    grunt.registerTask('build', ['clean:build', 'css', 'copy:js', 'js', 'tpl', 'dist']);<% if (includeRsync) { %>
    grunt.registerTask('deploy', ['build', 'prototype', 'rsync']);<% } %>

};
