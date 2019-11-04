const path = require('path');
const replace = require('replace-in-file');

const replaceStartUrl = startUrl => {
  const manifestPath = path.resolve(__dirname, '..', '..', '..', 'dist', 'yuuvis-flokfugl', 'manifest.json');
  replace.sync({
    from: '$STARTURL',
    to: startUrl,
    files: [manifestPath]
  });
};

process.argv.forEach(function(val, index, array) {
  if (val.indexOf('--url') !== -1) {
    const url = val.substr(val.lastIndexOf('=') + 1);
    replaceStartUrl(url);
  }
});

exports.replaceStartUrl = replaceStartUrl;
