const path = require('path');

const getVersion = () => {
  return getPackageJson().version;
};

const getReleaseDate = () => {
  return getPackageJson().releaseDate;
};

const getCompany = () => {
  return getPackageJson().author;
};

const getProductName = () => {
  return getPackageJson().productName;
};

const getPackageJson = () => {
  return require(path.join(__dirname, '..', '..', '..', '..', 'package.json'));
};


const dynamicSort = (property) => {
  var sortOrder = 1;
  if (property[0] === "-") {
    sortOrder = -1;
    property = property.substr(1);
  }
  return function (a, b) {
    var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
    return result * sortOrder;
  }
};

const removeDuplicates = (arr) => {
  const unique = arr.map(e => e.name)
    .map((e, i, final) => final.indexOf(e) === i && i)
    .filter(e => arr[e])
    .map(e => arr[e]);

  return unique;
};


module.exports = {
  getVersion,
  getReleaseDate,
  getPackageJson,
  getCompany,
  getProductName,
  dynamicSort,
  removeDuplicates
};
