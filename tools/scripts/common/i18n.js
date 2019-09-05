const path = require('path');
const cpx = require('cpx');

const copyLanguageFiles = library => {
  const sourcePath = path.resolve(__dirname, '..', '..', '..', 'projects', 'yuuvis', library, 'src', 'assets', 'i18n');
  const destPath = path.resolve(__dirname, '..', '..', '..', 'dist', 'yuuvis', library, 'i18n');

  const source = `${sourcePath}${path.sep}**${path.sep}*`;
  const target = `${destPath}`;
  console.log(source + ' => ' + target);
  cpx.copySync(source, target);
};

process.argv.forEach(function(val, index, array) {
  if (val.indexOf('--lib') !== -1) {
    const library = val.substr(val.lastIndexOf('=') + 1);
    copyLanguageFiles(library);
  }
});

exports.copyLanguageFiles = copyLanguageFiles;
