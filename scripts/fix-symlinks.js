const {symlinkSync: link} = require('fs');

try {
  link(
    `${__dirname}/../public/fusion-cli/bin/cli.js`,
    `${__dirname}/../public/create-fusion-app/node_modules/.bin/fusion`
  );
} catch (e) {}

try {
  link(
    `${__dirname}/../public/fusion-cli/bin/cli.js`,
    `${__dirname}/../public/fusion-apollo-universal-client/node_modules/.bin/fusion`
  );
} catch (e) {}
