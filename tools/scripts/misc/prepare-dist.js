const path = require('path');
const replace = require('replace-in-file');

const replaceTimestamp = () => {
  const indexPath = path.resolve(__dirname, '..', '..', '..', 'dist', 'yuuvis-flokfugl', 'index.html');
  const timestamp = (new Date()).toISOString();
  replace.sync({
    from: '__timestamp__',
    to: timestamp,
    files: [indexPath]
  });
};

replaceTimestamp();

exports.replaceTimestamp = replaceTimestamp;
