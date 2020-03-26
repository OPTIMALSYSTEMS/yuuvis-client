var fs = require('fs-extra');
const path = require('path');

// create `svg.generated.ts` from svg files used by this library
const processSVG = () => {
  const svgFolder = path.resolve(__dirname, '..', '..', '..', 'projects', 'yuuvis', 'framework', 'src', 'assets', 'svg');
  const outputFolder = path.resolve(__dirname, '..', '..', '..', 'projects', 'yuuvis', 'framework', 'src', 'lib');
  // const outputFile = `${outputFolder}${path.sep}svg.generated.ts`;
  const outputFileNew = `${outputFolder}${path.sep}svg.generated.ts`;
  // let ts = 'export const SVGIcons = {\r\n';
  let svgTs = '';
  fs.readdirSync(svgFolder).forEach(f => {
    // split the name
    const splitIndex = f.lastIndexOf('.');
    const name = f.substr(0, splitIndex);
    const extension = f.substr(splitIndex + 1);
    if (extension === 'svg') {
      const newName = sanitizeName(name);
      // ts += `'${name}': '${fs.readFileSync(`${svgFolder}/${f}`, { encoding: 'utf8' }).replace(/\r?\n|\r/g, '')}',\r\n`;
      svgTs += `export const ${newName} = {\r\n name: '${newName}', \r\n data: '${fs.readFileSync(`${svgFolder}/${f}`, { encoding: 'utf8' }).replace(/\r?\n|\r/g, '')}',\r\n};\r\n`
    }
  });
  // ts += '}';
  // write the file
  // fs.writeFileSync(outputFile, ts);
  fs.writeFileSync(outputFileNew, svgTs);
};

const sanitizeName = (name) => {
  let title = name.split(/[-,_]/).map(value => `${value.charAt(0).toUpperCase()}${value.slice(1)}`).join('')
  title = `${title.charAt(0).toLowerCase()}${title.slice(1)}`;
  return title === 'delete' ? `${title}Icon` : title;
}

processSVG();