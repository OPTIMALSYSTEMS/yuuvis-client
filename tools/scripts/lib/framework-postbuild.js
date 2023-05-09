const { exec } = require('child_process');
const { processSass } = require('../common/sass');
const { copyToNodeModules } = require('../common/node-copy');

const postbuild = async () => {
  // process styles
  await processSass('framework');
  // copy i18n resources to the libs dist folder
  console.log('npm run extract:merge:all');
  exec('npm run extract:merge:all', () => {
    // copy libs dist folder to the projects node_modules
    copyToNodeModules('framework');
  });
};

postbuild();
