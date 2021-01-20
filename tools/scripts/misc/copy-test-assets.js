const fs = require('fs-extra');

const copyTestAssets = () => {
  fs.copySync('./src/assets/default/i18n/en.json', './src-component-tests/assets/default/i18n/en.json');
  fs.copySync('./src/assets/default/i18n/de.json', './src-component-tests/assets/default/i18n/de.json');
  fs.copySync('./src/assets/default/config/main.json', './src-component-tests/assets/default/config/main.json');
};

copyTestAssets();
