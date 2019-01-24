/*
Deregisters a project from Rush.

If the project is a member of the public repo,
it gets deregistered in both public and private rush configurations

Usage:
  node scripts/remove-project public my-project-1
  node scripts/remove-project private my-project-2
*/

const {readFileSync: read, writeFileSync: write} = require('fs');
const {execSync: exec} = require('child_process');

const [,, category, project] = process.argv;

if (category && project) {
  const {name} = readJson(`${__dirname}/../${category}/${project}/package.json`);
  exec(`rm -rf ${__dirname}/${category}/${project}`);

  rewrite(`${__dirname}/rush.json`, t => t
    .replace(`{
    {
      "packageName": "${name}",
      "projectFolder": "${category}/${project}",
    },\n`)
  );
  if (category === 'public') {
    rewrite(`${__dirname}/public/rush.json`, t => t
      .replace(`{
    {
      "packageName": "${name}",
      "projectFolder": "${category}/${project}",
    },\n`)
    );
  }
}

function rewrite(file, fn) {
  write(file, fn(read(file, 'utf8')), 'utf8');
}
function readJson(file, fn) {
  return JSON.parse(read(file, 'utf8'));
}