const fs = require('fs-extra');
const path = require('path');
const dir = require('node-dir');
const sass = require('node-sass');
const {copyToNodeModules} = require('./node-copy');


const processSass = async (library) => {
    const destPath = path.resolve(__dirname, '..', '..', '..', 'dist', 'yuuvis', library);
    const srcPath = path.resolve(__dirname, '..', '..', '..', 'projects', 'yuuvis', library, 'src', 'lib');
    try {

        const mainScss = path.resolve(__dirname, '..', '..', '..', 'projects', 'yuuvis', library, 'src', 'scss', 'styles.scss');
        let renderedMainScss;
        if(fs.existsSync(mainScss)){
            // mainScss = fs.readFileSync(scss, {encoding: 'utf8'});
            renderedMainScss = sass.renderSync({
                file: mainScss
            });
        }

        const sassContent = await readScssFiles(srcPath);
        const rendered = sass.renderSync({
            data: sassContent
        });
        const css = renderedMainScss ? (renderedMainScss.css + rendered.css) : rendered.css;
        fs.writeFileSync(`${destPath}/${library}.css`, css)
    } catch (e) {
        throw e;
    }

}

const readScssFiles = (path) => {
    return new Promise((resolve, reject) => {

        const contents = [];
        dir.readFiles(path, {
            match: /.scss$/,
            exclude: /^\./
        }, (err, content, next) => {
            if (err) reject(err);
            contents.push(content);
            next();
        }, (err, files) => {
            if (err) reject(err);
            resolve(contents.join('\n'));
        });
    });
}


process.argv.forEach(function (val, index, array) {
    if (val.indexOf('--lib') !== -1) {
        const lib = val.substr(val.lastIndexOf('=') + 1);
        processSass(lib);
        copyToNodeModules(lib);
    }
});

exports.processSass = processSass;