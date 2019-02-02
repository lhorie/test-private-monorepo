const {readFileSync: read, writeFileSync: write, readdirSync: ls, existsSync: exists} = require('fs');

const versions = {};

collectVersions('public');
collectVersions('private');

updateVersions('public');
updateVersions('private');

function collectVersions(category) {
  ls(`${__dirname}/../${category}`).forEach(project => {
    if (exists(`${__dirname}/../${category}/${project}/package.json`)) {
      const {name, version} = JSON.parse(read(`${__dirname}/../${category}/${project}/package.json`));
      versions[name] = version;
    }
  });
}

function updateVersions(category) {
  ls(`${__dirname}/../${category}`).forEach(project => {
    json(`${__dirname}/../${category}/${project}/package.json`, d => {
      for (const name in versions) {
        if (d.dependencies && d.dependencies[name]) d.dependencies[name] = `^${versions[name]}`;
        if (d.devDependencies && d.devDependencies[name]) d.devDependencies[name] = `^${versions[name]}`;
        if (d.peerDependencies && d.peerDependencies[name]) d.peerDependencies[name] = `^${versions[name]}`;
      }
    });
  });
}

function json(file, fn) {
  if (exists(file)) {
    const data = JSON.parse(read(file, 'utf8'));
    fn(data);
    write(file, JSON.stringify(data, null, 2), 'utf8');
  }
}
