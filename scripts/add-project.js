/*
Registers a project with Rush.

If the project is a member of the public repo,
it gets registered in both public and private rush configurations

Usage:
  node scripts/add-project public my-project-1
  node scripts/add-project private my-project-2
*/

const {readFileSync: read, writeFileSync: write} = require('fs');
const {execSync: exec} = require('child_process');

const [,, category, project] = process.argv;

if (category && project) {
  json(`${__dirname}/../${category}/${project}/package.json`, data => {
    const name = data.name;

    exec(`rm -rf ${category}/${project}/.git`);
    exec(`rm -rf ${category}/${project}/.nyc_output`);
    exec(`rm -rf ${category}/${project}/dist`);
    exec(`rm -rf ${category}/${project}/dist-tests`);
    exec(`rm -rf ${category}/${project}/node_modules`);
    exec(`rm -rf ${category}/${project}/yarn.lock`);
    exec(`rm -rf ${category}/${project}/package-lock.json`);
    exec(`rm -rf ${category}/${project}/.gitattributes`);

    if (!data.scripts) data.scripts = {};
    if (!data.devDependencies) data.devDependencies = {};

    // setup `build` script
    data.scripts.build = data.scripts.build || data.scripts.transpile || 'echo ok';
    delete data.scripts.transpile;

    // setup test script
    data.scripts.test = data.scripts.test || 'echo ok';

    // setup lint script
    data.scripts.lint = data.scripts.lint || 'eslint src';

    // setup flow script
    data.scripts.flow = data.scripts.flow || 'flow check';

    // fix eslint-plugin-jest
    if (data.dependencies && data.dependencies['eslint-plugin-jest']) {
      data.devDependencies['eslint-plugin-jest'] = data.dependencies['eslint-plugin-jest'];
      delete data.dependencies['eslint-plugin-jest'];
    }

    // upgrade deps
    upgrade(data, '@babel/preset-react');
    upgrade(data, 'apollo-client');
    upgrade(data, 'babel-plugin-transform-flow-strip-types');
    upgrade(data, 'create-universal-package', '3.4.6');
    upgrade(data, 'enzyme');
    upgrade(data, 'enzyme-adapter-react-16');
    upgrade(data, 'eslint-plugin-cup');
    upgrade(data, 'eslint-plugin-import');
    upgrade(data, 'eslint-plugin-jest');
    upgrade(data, 'eslint-preset-cup');
    upgrade(data, 'fusion-core');
    upgrade(data, 'fusion-plugin-universal-events');
    upgrade(data, 'fusion-react');
    upgrade(data, 'fusion-test-utils');
    upgrade(data, 'fusion-tokens');
    upgrade(data, 'koa-bodyparser');
    upgrade(data, 'nyc');
    upgrade(data, 'prop-types');
    upgrade(data, 'react');
    upgrade(data, 'react-apollo');
    upgrade(data, 'react-dom');
    upgrade(data, 'react-redux', '5.1.1');
    upgrade(data, 'redux');
    upgrade(data, 'tape-cup');
    upgrade(data, 'unitest');

    // install dependencies
    const deps = [
      'babel-eslint',
      'eslint',
      'eslint-config-fusion',
      'eslint-plugin-cup',
      'eslint-plugin-flowtype',
      'eslint-plugin-import',
      'eslint-plugin-jest',
      'eslint-plugin-prettier',
      'eslint-plugin-react',
      'prettier',
      'flow-bin',
    ];
    deps.map(dep => {
      data.devDependencies[dep] = `^${exec(`npm info ${dep} version`).toString().trim()}`;
    });

    // setup flow config
    try {
      rewrite(`${__dirname}/../${category}/${project}/.flowconfig`, t => t
        .replace(/\[include\]\n/, '[include]\n../../common/temp/node_modules\n')
      );
    } catch (e) {}

    // rush.json is not actually JSON, use string replacement
    rewrite(`${__dirname}/../rush.json`, t => t
      .replace('"projects": [', `"projects": [
    {
      "packageName": "${name}",
      "projectFolder": "${category}/${project}"
    },`
      )
    );

    // registers to public rush monorepo, if needed
    if (category === 'public') {
      rewrite(`${__dirname}/../public/rush.json`, t => t
        .replace('"projects": [', `"projects": [
    {
      "packageName": "${name}",
      "projectFolder": "${project}"
    },`
        )
      );
    }
  });
  console.log(`- Updating ${project}`);
  exec('rush purge', {cwd: `${__dirname}/../public`})
  exec('rush update', {cwd: `${__dirname}/../public`});
  exec('rush purge');
  exec('rush update');
  console.log(`- Building ${project}`);
  exec('rush build');
  console.log(`- Testing ${project}`);
  exec('rush test -p 2');
  console.log(`- Linting ${project}`);
  exec('rush lint');
  console.log(`- Checking Flow on ${project}`);
  exec('rush flow');
}

function rewrite(file, fn) {
  write(file, fn(read(file, 'utf8')), 'utf8');
}
function json(file, fn) {
  const data = JSON.parse(read(file, 'utf8'));
  fn(data);
  write(file, JSON.stringify(data, null, 2), 'utf8');
}
function upgrade(data, dep, value) {
  upgradeSection(data, 'dependencies', dep, value);
  upgradeSection(data, 'devDependencies', dep, value);
  upgradeSection(data, 'peerDependencies', dep, value);
}
function upgradeSection(data, section, dep, value) {
  if (data[section] && data[section][dep]) {
    data[section][dep] = `^${value || exec(`npm show ${dep} version 2>/dev/null`).toString().trim()}`;
  }
}