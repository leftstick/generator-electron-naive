const Generator = require('yeoman-generator');

class gen extends Generator {
    constructor(args, opts) {
        super(args, opts);
    }

    initializing() {
        try {
            this.username = process.env.USER || process.env.USERPROFILE.split(require('path').sep)[2];
        } catch (e) {
            this.username = '';
        }
    }

    prompting() {
        return this.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Your project name',
                validate: name => {
                    if (!name) {
                        return 'Project name cannot be empty';
                    }
                    if (!/\w+/.test(name)) {
                        return 'Project name should only consist of 0~9, a~z, A~Z, _, .';
                    }

                    var fs = require('fs');
                    if (!fs.existsSync(this.destinationPath(name))) {
                        return true;
                    }
                    if (require('fs').statSync(this.destinationPath(name)).isDirectory()) {
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
                type: 'confirm',
                name: 'remote',
                message: 'Use remote URL?',
                default: true
            },
            {
                type: 'input',
                name: 'webUrl',
                message: 'Your website to be packaged',
                when: function(answers) {
                    return answers.remote;
                },
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
                type: 'list',
                name: 'arch',
                message: 'The target system architecture to build for',
                choices: [
                    'ia32',
                    'x64',
                    'all'
                ],
                default: 'x64'
            },
            {
                type: 'list',
                name: 'platform',
                message: 'The target platform to build for',
                choices: [
                    'linux',
                    'win32',
                    'darwin',
                    'mas',
                    'all'
                ],
                default: 'darwin'
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
        ])
            .then(answers => {
                require('date-util');
                this.answers = answers;
                this.answers.date = new Date().format('mmm d, yyyy');
                this.obj = {
                    answers: this.answers
                };
            });
    }

    configuring(answers) {
        const path = require('path');
        const fs = require('fs');
        const done = this.async();
        fs.exists(this.destinationPath(this.answers.name), exists => {
            if (exists && fs.statSync(this.destinationPath(this.answers.name)).isDirectory()) {
                this.log.error('Directory [' + this.answers.name + '] exists');
                process.exit(1);
            }
            this.destinationRoot(path.join(this.destinationRoot(), this.answers.name));
            done();
        });
    }

    writing() {
        this.fs.copy(this.templatePath('gitignore'), this.destinationPath('.gitignore'));
        this.fs.copyTpl(this.templatePath('gulpfile.js.vm'), this.destinationPath('gulpfile.js'), this.obj);
        if (!this.answers.remote) {
            this.fs.copyTpl(this.templatePath('index.html.vm'), this.destinationPath('src/index.html'), this.obj);
        }
        this.fs.copyTpl(this.templatePath('main.js.vm'), this.destinationPath('src/main.js'), this.obj);
        this.fs.copyTpl(this.templatePath('package.json.vm'), this.destinationPath('package.json'), this.obj);
    }

    install() {
        var deps = ['gulp', 'rimraf', 'electron-packager', 'electron-prebuilt', 'semver-regex'];
        if (!this.answers.remote) {
            deps.push('gulp-livereload');
        }
        this.npmInstall(deps, {
            registry: this.answers.registry,
            saveDev: true
        });
    }

    end() {
        this.log.ok(`Project ${this.answers.name} generated!!!`);
    }
}

module.exports = gen;
