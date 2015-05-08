/* Inspired by
 *
 * http://yeoman.io/authoring
 * http://code.tutsplus.com/tutorials/build-your-own-yeoman-generator--cms-20040
 * https://github.com/robinpokorny/generator-lessapp/
 * https://github.com/sindresorhus/generator-electron/
 * http://mammal.io/articles/yeoman-generators-es6/
 */

'use strict';
// var path = require('path');
var fs = require('fs');
var chalk = require('chalk');
var yeoman = require('yeoman-generator');
var mkdirp = require('mkdirp');
var yosay = require('yosay');
var _ = require('lodash')._;

module.exports = yeoman.generators.Base.extend({
    constructor: function() {
        yeoman.generators.Base.apply(this, arguments);

        this.option('skip-install');

        // fix yeoman warning: "#mkdir() is deprecated. Use mkdirp module instead."
        this.mkdir = mkdirp;

        this.customErrors = [];
        this.enabledBsComponents = ['variables', 'mixins', 'normalize', 'scaffolding', 'type', 'forms', 'buttons'];
    },

    promptUser: function() {
        var done = this.async();

        this.log(yosay('Actum Frontend Generator powered by Yeoman'));

        var prompts = [{
            name: 'appName',
            message: 'What is your app\'s name?'
        }, {
            name: 'appDescription',
            message: 'What is your app\'s description?',
            default: 'Best project ever.'
        }, {
            name: 'appVersion',
            message: 'What is your app\'s version?',
            default: '0.0.0'
        }, {
            name: 'appHomepage',
            message: 'What is your app\'s homepage?'
        }, {
            type: 'checkbox',
            name: 'features',
            message: 'Out of the box I include custom HTML boilerplate, Grunt, Bower, Assemble, Browserify, Picturefill, Autoprefixer and BrowserSync.\n' +
                     'What more would you like?',
            choices: [{
                name: 'jQuery',
                value: 'jquery',
                checked: true
            }, {
                name: 'Modernizr',
                value: 'modernizr',
                checked: false
            }, {
                name: 'Handlebars',
                value: 'handlebars',
                checked: false
            }, {
                name: 'Grunticon + svgmin',
                value: 'grunticon',
                checked: true
            }, {
                name: 'BabelJS for ES6 and/or React',
                value: 'babel',
                checked: true
            }, {
                name: 'rsync deployment',
                value: 'rsync',
                checked: false
            }]
        }];

        this.prompt(prompts, function (props) {
            var features = prompts[prompts.length-1].choices;
            var chosenFeatures = props.features;
            var isFeatureChosen = function(feat) {
                return chosenFeatures && chosenFeatures.indexOf(feat) !== -1;
            };

            this.appName = props.appName;
            this.appSlug = _.kebabCase(this.appName);
            this.appDescription = props.appDescription;
            this.appVersion = props.appVersion;
            this.appHomepage = props.appHomepage;

            features.map(function(feat) {
                var val = feat.value;
                var uppercased = val.charAt(0).toUpperCase() + val.slice(1);
                this['include' + uppercased] = isFeatureChosen(val);
            }.bind(this));

            done();
        }.bind(this));
    },

    scaffolding: function() {
        this.mkdir('www');
        this.mkdir('dist');
    },

    styles: function() {
        this.directory('www/less');
    },

    javascripts: function() {
        this.directory('www/app');
    },

    templates: function() {
        this.directory('www/tpl');
        this.template('www/tpl/layouts/default.hbs');
        this.template('www/tpl/pages/boilerplate.hbs');
        this.template('www/tpl/pages/homepage.hbs');
        this.template('www/tpl/pages/index.hbs');
    },

    graphics: function() {
        this.directory('www/gfx');
        if (this.includeGrunticon) {
            this.mkdir('www/gfx/svg');
        }
    },

    projectJson: function() {
        this.template('project.json', this.appSlug + '.json');
    },

    packageJson: function() {
        var packageJson = {
            name: this.appSlug,
            version: this.appVersion,
            description: this.appDescription,
            private: true
        };

        if (this.includeBabel || this.includeHandlebars || this.includeJquery) {
            packageJson.browserify = {
                transform: []
            };

            if (this.includeJquery || this.includeHandlebars) {
                packageJson.browserify.transform.push('browserify-shim');
                packageJson['browserify-shim'] = {};

                if (this.includeJquery) {
                    packageJson['browserify-shim'].jquery = 'global:$';
                }
                if (this.includeHandlebars) {
                    packageJson['browserify-shim'].handlebars = 'Handlebars';
                }
            }
            if (this.includeBabel) {
                packageJson.browserify.transform.push('babelify');
            }
            if (this.includeHandlebars) {
                packageJson.browserify.transform.push('hbsfy');
            }
            // TODO if includeHandlebars then add "browser" section with "handlebars": "./node_modules/grunt-contrib-handlebars/node_modules/handlebars/dist/handlebars.runtime.js"
        }

        this.write('package.json', JSON.stringify(packageJson, null, 2));
    },

    bower: function() {
        var bowerJson = {
            name: this.appSlug,
            version: this.appVersion,
            private: true
        };

        this.copy('bowerrc', '.bowerrc');
        this.write('bower.json', JSON.stringify(bowerJson, null, 2));
    },

    editorconfig: function() {
        this.copy('editorconfig', '.editorconfig');
    },

    gruntfile: function() {
        this.template('Gruntfile.js');
    },

    jsLint: function() {
        this.copy('jscsrc', '.jscsrc');
    },

    git: function() {
        this.copy('www/gitattributes', 'www/.gitattributes');
        this.copy('gitignore', '.gitignore');
    },

    scripts: function() {
        this.copy('init.sh', 'init.sh');
        this.copy('init.bat', 'init.bat');
    },

    readme: function(){
        this.template('README.md', 'README.md');
    },

    install: {
        npmInstall: function() {
            var packages = [
                'assemble',
                'browserify',
                'browserify-shim',
                'grunt',
                'grunt-autoprefixer',
                'grunt-browser-sync',
                'grunt-browserify',
                'grunt-cache-bust',
                'grunt-contrib-clean',
                'grunt-contrib-copy',
                'grunt-contrib-cssmin',
                'grunt-contrib-jshint',
                'grunt-contrib-less',
                'grunt-contrib-uglify',
                'grunt-este-watch',
                'jshint-stylish',
                'grunt-jscs',
                'jit-grunt',
                'picturefill'
            ];

            if (this.includeBabel) {
                packages.push('babelify');
            }
            if (this.includeHandlebars) {
                packages.push('hbsfy');
            }
            if (this.includeModernizr) {
                packages.push('grunt-modernizr');
            }
            if (this.includeGrunticon) {
                packages.push('grunt-grunticon', 'grunt-svgmin');
            }
            if (this.includeRsync) {
                packages.push('grunt-rsync');
            }

            if (this.options['skip-install']) {
                this.customErrors.push(
                    chalk.yellow('\nNPM install skipped, you might miss project\'s dependencies later…\n') +
                    chalk.green('You can run the command manually: ' + chalk.bold('npm install ' + packages.join(' ') + ' --save-dev'))
                );

                return;
            }

            this.npmInstall(packages, { 'saveDev': true }, function(err) {
                if (err === 0) {
                    return;
                }

                this.customErrors.push(
                    chalk.red('\nNPM install ended with error, dependencies might not have been saved into package.json\n') +
                    chalk.green('Try running the command manually: ' + chalk.bold('npm install ' + packages.join(' ') + ' --save-dev'))
                );
            }.bind(this));
        },

        bowerInstall: function() {
            var components = [
                'bootstrap',
                'respond',
                'picturefill'
            ];

            if (this.includeJquery) {
                components.push('jquery');
            }
            if (this.includeBabel) {
                components.push('es5-shim');
            }
            if (this.includeModernizr) {
                components.push('modernizr');
            }

            if (this.options['skip-install']) {
                this.customErrors.push(
                    chalk.yellow('\nBower install skipped, you might miss project\'s dependencies later…\n') +
                    chalk.green('You can run the command manually: ' + chalk.bold('bower install ' + components.join(' ') + ' --save'))
                );

                return;
            }

            this.bowerInstall(components, { 'save': true }, function(err) {
                if (err === 0) {
                    return;
                }

                this.customErrors.push(
                    chalk.red('\nBower install ended with error, dependencies might not have been saved into bower.json\n') +
                    chalk.green('Try running the command manually: ' + chalk.bold('bower install ' + components.join(' ') + ' --save'))
                );
            }.bind(this));
        }
    },

    end: {
        bootstrap: function() {
            if (this.options['skip-install']) {
                this.customErrors.push(
                    chalk.yellow('\nI couldn\'n create a custom bootstrap.less for you because you prompted me not to install bower components…')
                );

                return;
            }

            var done = this.async();

            fs.readFile(this.destinationPath('www/bower/bootstrap/less/bootstrap.less'), 'utf8', function(err, data) {
                if (err) {
                    this.customErrors.push(
                        chalk.red(
                            '\nI couldn\'n create a custom bootstrap.less for you. Source file was not found. ' +
                            'This is probably because bower install ended with error.\n' + err
                        )
                    );
                } else {
                    data = data.replace(/"/g, '\'').replace(/(@import ')/g, '// @import \'../../bower/bootstrap/less/');
                    this.enabledBsComponents.forEach(function(component) {
                        var regex = new RegExp('(\/\/ )(.*\/' + component + '.*)', 'gi');
                        data = data.replace(regex, '$2');
                    });
                    this.write('www/less/bootstrap/bootstrap.less', data);
                }

                done();
            }.bind(this));
        },

        sanitize: function() {
            this.customErrors.forEach(function(error) {
                this.log(error);
            }.bind(this));

            this.log(chalk.magenta.bold('\nHappy coding!\n'));
        }
    }
});
