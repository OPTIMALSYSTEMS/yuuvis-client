const path = require('path');
const cpx = require("cpx");
const { processSass } = require('../common/sass');
const { copyToNodeModules } = require('../common/node-copy');
const { mergeTranslations } = require('../common/i18n-merge');
const { copyLanguageFiles } = require('../common/i18n');


// copy fonts to the dist folder
const _copyFonts = () => {
    const sourcePath = path.resolve(__dirname, '..', '..', '..', 'projects', 'yuuvis', 'framework', 'src', 'assets', 'fonts');
    const destPath = path.resolve(__dirname, '..', '..', '..', 'dist', 'yuuvis', 'framework', 'fonts');
    const source = `${sourcePath}${path.sep}*`;
    cpx.copySync(source, destPath);
}

const postbuild = async () => {
    // process styles
    await processSass('framework');
    // copy fonts to the libs dist folder
    _copyFonts();
    // copy i18n resources to the libs dist folder
    copyLanguageFiles('framework');
    // copy libs dist folder to the projects node_modules
    copyToNodeModules('framework');
    // merge libraries language files withe the ones from yuuvis-web app
    mergeTranslations();    
}

postbuild();
