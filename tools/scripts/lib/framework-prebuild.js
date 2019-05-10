
var fs = require('fs-extra');
const path = require('path');


// create `svg.generated.ts` from svg files used by this library
const processSVG = () => {
    const svgFolder = path.resolve(__dirname, '..', '..', '..', 'projects', 'yuuvis', 'framework', 'src', 'assets', 'svg');
    const outputFolder = path.resolve(__dirname, '..', '..', '..', 'projects', 'yuuvis', 'framework', 'src', 'lib');
    let ts = 'export const SVGIcons = {\n'
    fs.readdirSync(svgFolder).forEach(f => {
        // split the name
        const splitIndex = f.lastIndexOf('.')
        const name = f.substr(0, splitIndex);
        const extension = f.substr(splitIndex + 1);
        if (extension === 'svg') {
            ts += `'${name}': '${fs.readFileSync(`${svgFolder}/${f}`, { encoding: 'utf8' })}',\n`;
        }
    });
    ts += '}';
    // write the file
    fs.writeFileSync(`${outputFolder}${path.sep}svg.generated.ts`, ts);
}

processSVG();