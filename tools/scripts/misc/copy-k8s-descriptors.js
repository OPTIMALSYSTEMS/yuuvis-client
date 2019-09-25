const fs = require('fs-extra');
const replace = require('replace-in-file');

const copyK8sDescriptors = () => {
  fs.mkdirpSync('./dist/k8s');
  fs.emptyDirSync('./dist/k8s');
  fs.copySync('./k8s/local/descriptors', './dist/k8s');

  replace.sync({
    from: '$BUILDTAG',
    to: process.env.npm_config_yuvrandom,
    files: ['./dist/k8s/deployment.yaml']
  });
};

copyK8sDescriptors();
