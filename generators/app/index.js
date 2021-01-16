const Generator = require('yeoman-generator');

module.exports = class extends Generator {
  async prompting() {
    this.appSettings = await this.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Application name',
      },
      {
        type: 'input',
        name: 'description',
        message: 'Application description',
      },
      {
        type: 'input',
        name: 'author',
        message: 'Application author',
      },
      {
        type: 'confirm',
        name: 'initializeGit',
        message: 'Initialize empty git repository?'
      }
    ]);
  }

  writeFiles() {
    this.fs.copyTpl(this.templatePath('package.json'), this.destinationPath('package.json'), {
      name: this.appSettings.name,
      author: this.appSettings.author,
      description: this.appSettings.description,
    });

    this.fs.copy(this.templatePath('.eslint*'), this.destinationPath());
    this.fs.copy(this.templatePath('.prettierrc.json'), this.destinationPath('.prettierrc.json'));
    this.fs.copy(this.templatePath('tsconfig.json'), this.destinationPath('tsconfig.json'));

    this.fs.write(this.destinationPath('src/index.ts'), '');
    this.fs.write(this.destinationPath('.env'), '');
  }

  gitInit() {
    if (this.appSettings.initializeGit) {
      this.fs.copy(this.templatePath('gitignore'), this.destinationPath('.gitignore'));
      this.spawnCommandSync('git', ['init']);
    }
  }

  installDependencies() {
    this.npmInstall(['typescript']);
    this.npmInstall(['eslint', '@typescript-eslint/parser', '@typescript-eslint/eslint-plugin', 'dotenv'], {
      'save-dev': true,
    });
  }
};
