const fs = require('fs-extra');
const enFrameworkPath = './projects/yuuvis/framework/src/assets/i18n/en.json';
const enClientPath = './src/assets/default/i18n/en.json';
const enFramework = readJsonFile(enFrameworkPath);
const enClient = readJsonFile(enClientPath);

const argv = require('yargs')
  .usage('Usage: $0  [options]')
  .option('src', {
    alias: 's',
    describe: 'source file folder',
    demand: false,
    default: './tmp'
  }).help().argv;

applyChanges();

function applyChanges() {
  const diff = readJsonFile(argv.s + '/diff_latest.json');

  if(Object.keys(diff.changed).length < 1) {
    console.log('No changes found. Done.');
    return;
  }

  let frameworkChanges = 0;
  let clientChanges = 0;
  for(let key of Object.keys(diff.changed)) {
    if(enClient[key] !== undefined) {
      enClient[key] = diff.changed[key].new;
      ++clientChanges;
    }

    if(enFramework[key] !== undefined) {
      enFramework[key] = diff.changed[key].new;
      ++frameworkChanges;
    }
  }

  if(frameworkChanges > 0) {
    saveJsonFile(enFrameworkPath, enFramework);
  }

  if(clientChanges > 0) {
    saveJsonFile(enClientPath, enClient, 2);
  }

  console.log('applied in framework\'s en.json: ' + frameworkChanges);
  console.log('applied in clients\'s en.json: ' + clientChanges);
}

function readJsonFile(path) {
  return fs.readJsonSync(path);
}

function saveJsonFile(path, content, replacer) {
  replacer = replacer || '\t';
  fs.writeJson(path, content, {spaces: replacer});
}
