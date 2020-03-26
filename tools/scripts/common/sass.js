const fs = require('fs-extra');
const path = require('path');
const sass = require('node-sass');
const bundleScss = require('bundle-scss');
const { copyToNodeModules } = require('./node-copy');

const processSass = async library => {
  const destPath = path.resolve(__dirname, '..', '..', '..', 'dist', 'yuuvis', library, `${library}.css`);
  const tmpScssPath = path.resolve(__dirname, 'dist', `${library}.scss`);
  try {
    const mainScss = path.resolve(__dirname, '..', '..', '..', 'projects', 'yuuvis', library, 'src', 'scss', 'styles.scss');
    let renderedMainScss;
    if (fs.existsSync(mainScss)) {
      renderedMainScss = sass.renderSync({
        file: mainScss
      });
    }
    await bundleScss(`./projects/yuuvis/${library}/src/lib/**/*.scss`, tmpScssPath);
    const rendered = sass.renderSync({
      file: tmpScssPath
    });
    const css = renderedMainScss ? renderedMainScss.css + rendered.css : rendered.css;
    fs.writeFileSync(destPath, css);
    fs.unlinkSync(tmpScssPath);
  } catch (e) {
    throw e;
  }
};

process.argv.forEach(function(val, index, array) {
  if (val.indexOf('--lib') !== -1) {
    const lib = val.substr(val.lastIndexOf('=') + 1);
    processSass(lib);
    copyToNodeModules(lib);
  }
});

exports.processSass = processSass;
