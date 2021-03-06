const Generator = require('yeoman-generator');

function getDevDeps(framework, testFramework) {
  let deps = ['eslint', '@typescript-eslint/parser', '@typescript-eslint/eslint-plugin', 'dotenv'];
  if (framework === 'express') {
    deps = [...deps, '@types/express', 'nodemon', 'ts-node'];
  }
  if (testFramework === 'tsJest') {
    deps = [...deps, 'jest', 'ts-jest', '@types/jest'];
  }
  return deps;
}

function getDeps(framework) {
  let deps = ['typescript'];

  if (framework === 'express') {
    deps = [...deps, 'express'];
  }
  return deps;
}

module.exports = class extends Generator {
  async prompting() {
    this.appSettings = await this.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Package name',
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
        type: 'list',
        name: 'framework',
        message: 'Plan to use a framework?',
        choices: [
          {
            name: 'None',
            value: 'none',
          },
          {
            name: 'Express.js',
            value: 'express',
          },
        ],
        default: 'none',
      },
      {
        type: 'list',
        name: 'testFramework',
        message: 'Plan to use unit testing framework?',
        choices: [
          {
            name: 'None',
            value: 'none',
          },
          {
            name: 'Jest (ts-jest)',
            value: 'tsJest',
          },
        ],
        default: 'none',
      },
      {
        type: 'confirm',
        name: 'initializeGit',
        message: 'Initialize git repository?',
      },
    ]);
  }

  writeFiles() {
    this.fs.copyTpl(this.templatePath('package.json.ejs'), this.destinationPath('package.json'), {
      name: this.appSettings.name,
      author: this.appSettings.author,
      description: this.appSettings.description,
      framework: this.appSettings.framework,
      testFramework: this.appSettings.testFramework,
    });

    this.fs.copy(this.templatePath('.eslint*'), this.destinationPath());
    this.fs.copy(this.templatePath('.prettierrc.json'), this.destinationPath('.prettierrc.json'));
    this.fs.copy(this.templatePath('tsconfig.json'), this.destinationPath('tsconfig.json'));

    this.fs.copyTpl(this.templatePath('index.ts.ejs'), this.destinationPath('src/index.ts'), {
      framework: this.appSettings.framework,
    });

    this.fs.write(this.destinationPath('.env'), '');
  }

  gitInit() {
    if (this.appSettings.initializeGit) {
      this.fs.copy(this.templatePath('gitignore'), this.destinationPath('.gitignore'));
      this.spawnCommandSync('git', ['init']);
    }
  }

  installDependencies() {
    this.npmInstall(getDeps(this.appSettings.framework, this.appSettings.testFramework));
    this.npmInstall(getDevDeps(this.appSettings.framework, this.appSettings.testFramework), {
      'save-dev': true,
    });
  }

  unitTestInit() {
    if (this.appSettings.testFramework === 'tsJest') {
      this.spawnCommandSync('npx', ['ts-jest', 'config:init']);
    }
  }
};
