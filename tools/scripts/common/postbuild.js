const path = require('path');
const fs = require('fs');

const postBuild = () => {
  const distPath = path.resolve(__dirname, '..', '..', '..', 'dist', 'yuuvis-flokfugl');
  console.log('Post build: Copying safety-worker.js to ngsw-worker.js');
  fs.copyFileSync(path.resolve(distPath, 'safety-worker.js'), path.resolve(distPath, 'ngsw-worker.js'));
};

process.argv.forEach(function (val, index, array) {
  postBuild();
});

exports.postBuild = postBuild;
