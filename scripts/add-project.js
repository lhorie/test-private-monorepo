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
    exec(`rm -rf ${category}/${project}/.gitignore`);
    exec(`rm -rf ${category}/${project}/.gitattributes`);

    // setup `build` script
    if (!data.scripts) data.scripts = {}
    data.scripts.build = data.scripts.build || data.scripts.transpile || 'echo ok';
    delete data.scripts.transpile;

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
  exec('rush update', {cwd: `${__dirname}/../public`});
  exec('rush update');
}

function rewrite(file, fn) {
  write(file, fn(read(file, 'utf8')), 'utf8');
}
function json(file, fn) {
  const data = JSON.parse(read(file, 'utf8'));
  fn(data);
  write(file, JSON.stringify(data, null, 2), 'utf8');
}