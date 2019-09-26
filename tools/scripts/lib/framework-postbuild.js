const path = require('path');
const cpx = require('cpx');
const { exec } = require('child_process');
const { processSass } = require('../common/sass');
const { copyToNodeModules } = require('../common/node-copy');

// copy fonts to the dist folder
const _copyFonts = () => {
  const sourcePath = path.resolve(__dirname, '..', '..', '..', 'projects', 'yuuvis', 'framework', 'src', 'assets', 'fonts');
  const destPath = path.resolve(__dirname, '..', '..', '..', 'dist', 'yuuvis', 'framework', 'fonts');
  const source = `${sourcePath}${path.sep}*`;
  cpx.copySync(source, destPath);
};

const postbuild = async () => {
  // process styles
  await processSass('framework');
  // copy fonts to the libs dist folder
  _copyFonts();
  // copy i18n resources to the libs dist folder
  console.log('npm run extract:merge:all');
  exec('npm run extract:merge:all', () => {
    // copy libs dist folder to the projects node_modules
    copyToNodeModules('framework');
  });
};

postbuild();
