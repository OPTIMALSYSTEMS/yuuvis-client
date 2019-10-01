const dir = require('node-dir');
const fs = require('fs-extra');
const path = require('path');

// merge language resources from yuuvis libraries with the ones from the app
const mergeTranslations = async () => {
  await _merge('de');
  await _merge('en');

  console.log('i18n succesfull!');
};

const _merge = async lang => {
  const lisJsonPath = path.resolve(__dirname, '..', '..', '..', 'dist', 'yuuvis');
  const resDe = await _readLanguageFiles(lisJsonPath, lang);
  const appJsonPath = path.resolve(__dirname, '..', '..', '..', 'src', 'assets', 'default', 'i18n', lang + '.json');
  let merged = JSON.parse(resDe),
    __merged = {};
  if (fs.existsSync(appJsonPath)) {
    __merged = JSON.parse(fs.readFileSync(appJsonPath, { encoding: 'utf8' }));
    merged = { ...merged, ...__merged };
  }

  // copy the merged data to the apps language file
  fs.writeFileSync(appJsonPath, JSON.stringify(merged, null, 2).replace(/\n/g, '\r\n'), {
    encoding: 'utf8'
  });

  console.log('Merged translations for ' + lang);
};

const _readLanguageFiles = (path, lang) => {
  return new Promise((resolve, reject) => {
    const contents = [];
    dir.readFiles(
      path,
      {
        match: new RegExp(`${lang}\.json$`),
        exclude: /^\./
      },
      (err, content, next) => {
        if (err) reject(err);
        contents.push(content);
        next();
      },
      (err, files) => {
        if (err) reject(err);
        resolve(contents.join('\n'));
      }
    );
  });
};

process.argv.forEach(function(val, index, array) {
  if (val.indexOf('--run') !== -1) {
    mergeTranslations();
  }
});

exports.mergeTranslations = mergeTranslations;
