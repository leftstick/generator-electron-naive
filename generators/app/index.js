'use strict';

var generators = require('yeoman-generator');

var gen = generators.Base.extend({
    initializing: function() {

        try {
            this.username = process.env.USER || process.env.USERPROFILE.split(require('path').sep)[2];
        } catch (e) {
            this.username = '';
        }
    },
    prompting: function() {
        var done = this.async();
        var self = this;

        this.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Your project name',
                validate: function(name) {
                    if (!name) {
                        return 'Project name cannot be empty';
                    }
                    if (!/\w+/.test(name)) {
                        return 'Project name should only consist of 0~9, a~z, A~Z, _, .';
                    }

                    var fs = require('fs');
                    if (!fs.existsSync(self.destinationPath(name))) {
                        return true;
                    }
                    if (require('fs').statSync(self.destinationPath(name)).isDirectory()) {
                        return 'Project already exist';
                    }
                    return true;
                }
            },
            {
                type: 'input',
                name: 'description',
                message: 'Your project description',
                default: ''
            },
            {
                type: 'input',
                name: 'username',
                message: 'Your name',
                default: this.username
            },
            {
                type: 'input',
                name: 'email',
                message: 'Your email',
                default: ''
            },
            {
                type: 'input',
                name: 'webUrl',
                message: 'Your website to be packaged',
                validate: function(webUrl) {
                    return webUrl ? true : 'type url of your website';
                }
            },
            {
                type: 'input',
                name: 'width',
                message: 'Initial width of the app',
                default: 800,
                validate: function(width) {
                    return isNaN(+width) ? 'width must be a number' : true;
                }
            },
            {
                type: 'input',
                name: 'height',
                message: 'Initial height of the app',
                default: 600,
                validate: function(height) {
                    return isNaN(+height) ? 'height must be a number' : true;
                }
            },
            {
                type: 'confirm',
                name: 'resizable',
                message: 'Is the app resizable?',
                default: true
            },
            {
                type: 'checkbox',
                name: 'platforms',
                message: 'Which platform you\'d like to package to?',
                choices: [
                    'darwin',
                    'win32',
                    'linux',
                    'darwin-x64',
                    'linux-ia32',
                    'linux-x64',
                    'win32-ia32',
                    'win32-x64'
                ],
                validate: function(platforms) {
                    return platforms.length > 0;
                }
            },
            {
                type: 'list',
                name: 'registry',
                message: 'Which registry would you use?',
                choices: [
                    'https://registry.npm.taobao.org',
                    'https://registry.npmjs.org'
                ]
            }
        ], function(answers) {
            require('date-util');
            this.answers = answers;
            this.answers.date = new Date().format('mmm d, yyyy');
            this.obj = {answers: this.answers};
            done();
        }.bind(this));
    },
    configuring: function() {
        var path = require('path');
        var fs = require('fs');
        var self = this;
        var done = this.async();
        fs.exists(this.destinationPath(this.answers.name), function(exists) {
            if (exists && fs.statSync(self.destinationPath(self.answers.name)).isDirectory()) {
                self.log.error('Directory [' + self.answers.name + '] exists');
                process.exit(1);
            }
            self.destinationRoot(path.join(self.destinationRoot(), self.answers.name));
            done();
        });
    },
    writing: function() {
        var self = this;

        self.copy(self.templatePath('gitignore'), self.destinationPath('.gitignore'));
        self.fs.copyTpl(self.templatePath('gulpfile.js.vm'), self.destinationPath('gulpfile.js'), self.obj);
        self.fs.copyTpl(self.templatePath('main.js.vm'), self.destinationPath('src/main.js'), self.obj);
        self.fs.copyTpl(self.templatePath('package.json.vm'), self.destinationPath('package.json'), self.obj);
        self.fs.copyTpl(self.templatePath('src-package.json.vm'), self.destinationPath('src/package.json'), self.obj);
    },
    install: function() {
        this.npmInstall(['gulp', 'rimraf', 'gulp-electron'], {
            registry: this.answers.registry,
            saveDev: true
        });
    },
    end: function() {
        this.log.ok('Project ' + this.answers.name + ' generated!!!');
    }
});

module.exports = gen;
