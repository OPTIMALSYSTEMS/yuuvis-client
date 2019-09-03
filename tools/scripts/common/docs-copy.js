const path = require('path');
const cpx = require('cpx');

const copyDocumentationJSON = library => {
  const sourcePath = path.resolve(__dirname, '..', '..', '..', 'documentation', 'yuuvis', library);
  const destPath = path.resolve(__dirname, '..', '..', '..', 'node_modules');

  const source = `${sourcePath}${path.sep}**${path.sep}*`;
  const target = `${destPath}${path.sep}@yuuvis${path.sep}${library}`;
  console.log(source + ' => ' + target);
  cpx.copySync(source, target);
};

process.argv.forEach(function(val, index, array) {
  if (val.indexOf('--lib') !== -1) {
    const library = val.substr(val.lastIndexOf('=') + 1);
    copyDocumentationJSON(library);
  }
});

exports.copyToNodeModules = copyToNodeModules;
