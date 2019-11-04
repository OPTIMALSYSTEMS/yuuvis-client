const randomHex = require('randomhex');

const createRandom = () => {
  console.log('using current tag (yuvrandom): ' + process.env.npm_config_yuvrandom);

  const tag = randomHex(16).substring(2, 10);
  require('child_process').execSync('npm config set yuvrandom ' + tag);

  console.log('generated new random tag (yuvrandom): ' + tag);
};
createRandom();
