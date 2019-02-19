const {readdirSync: ls} = require('fs');

const deps = ls(`${__dirname}/../common/temp/node_modules`);
const problems = deps.filter(dep => dep.match(/fusion-/));

if (problems.length > 0) {
  throw new Error(`Fusion packages should not be hoisted to the monorepo node_modules! Problematic packages are: ${problems.join(', ')}`);
}
