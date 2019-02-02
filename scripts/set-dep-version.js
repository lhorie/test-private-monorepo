const {readFileSync: read, writeFileSync: write, readdirSync: ls, existsSync: exists} = require('fs');

const [,, name, version] = process.argv;

const versions = {};

updateVersions('public');
updateVersions('private');

function updateVersions(category) {
  ls(`${__dirname}/../${category}`).forEach(project => {
    json(`${__dirname}/../${category}/${project}/package.json`, d => {
      if (d.dependencies && d.dependencies[name]) d.dependencies[name] = `^${version.replace(/\^+/, '')}`;
      if (d.devDependencies && d.devDependencies[name]) d.devDependencies[name] = `^${version.replace(/\^+/, '')}`;
      if (d.peerDependencies && d.peerDependencies[name]) d.peerDependencies[name] = `^${version.replace(/\^+/, '')}`;
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
