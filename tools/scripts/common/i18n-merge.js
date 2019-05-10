const dir = require('node-dir');
const fs = require('fs-extra');
const path = require('path');

// merge language resources from yuuvis libraries with the ones from the app
const mergeTranslations = async () => {
    await _merge('de');
    await _merge('en');
    console.log("Merged translations from libraraies with app");
    // check for translations from good old brummfugl
    checkForBrummfuglTranslations('de');
    checkForBrummfuglTranslations('en');
}

const _merge = async (lang) => {
    const nodeModulesFolder = path.resolve(__dirname, '..', '..', '..', 'node_modules', '@yuuvis');
    const resDe = await _readLanguageFiles(nodeModulesFolder, lang);
    const appJsonPath = path.resolve(__dirname, '..', '..', '..', 'src', 'assets', '_default', 'i18n', lang + '.json');
    let merged;
    if (fs.existsSync(appJsonPath)) {
        const langApp = fs.readFileSync(appJsonPath, { encoding: 'utf8' });
        merged = { ...JSON.parse(resDe), ...JSON.parse(langApp) };
    } else {
        merged = JSON.parse(resDe);
    }
    
    // copy the merged data to the apps language file
    fs.writeFileSync(appJsonPath, JSON.stringify(merged, 2, 2), {encoding: 'utf8'});
}

const _readLanguageFiles = (path, lang) => {
    return new Promise((resolve, reject) => {
        const contents = [];
        dir.readFiles(path, {
            match: new RegExp(`${lang}\.json$`),
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

const checkForBrummfuglTranslations = (lang) => {
    const brummfuglResourcePath = path.resolve(__dirname, 'i18n-brummfugl', lang + '.json');
    const flokfuglResourcePath = path.resolve(__dirname, '..', '..', '..', 'src', 'assets', '_default', 'i18n', lang + '.json');

    const brummfugl = JSON.parse(fs.readFileSync(brummfuglResourcePath, { encoding: 'utf8' }));
    const flokfugl = JSON.parse(fs.readFileSync(flokfuglResourcePath, { encoding: 'utf8' }));

    Object.keys(flokfugl).forEach(k => {
        if (flokfugl[k].length === 0) {
            flokfugl[k] = brummfugl[k];
        }
    });
    fs.writeFileSync(flokfuglResourcePath, JSON.stringify(flokfugl, 2, 2), {encoding: 'utf8'});  
}

process.argv.forEach(function (val, index, array) {
    if (val.indexOf('--run') !== -1) {
        mergeTranslations();
    }
});

exports.mergeTranslations = mergeTranslations;