const fs = require('fs-extra');

const argv = require('yargs')
  .usage('Usage: $0  [options]')
  .option('before', {
    alias: 'b',
    describe: 'file path before translation',
    demand: false,
    default: './src/assets/default/i18n/en.json'
  })
  .option('after', {
    alias: 'a',
    describe: 'file path after translation',
    demand: false,
    default: './tmp/en_after.json'
  })
  .option('output', {
    alias: 'o',
    describe: 'output file containing diff',
    demand: false,
    default: './tmp/diff_' + getTimestamp() + '.json'
}).help().argv;

printSettings();
createDiff();

function createDiff() {
  const before = fs.readJsonSync(argv.b);
  const after = fs.readJsonSync(argv.a);
  const diff = {
    report: {
      beforeTotal: Object.keys(before).length,
      afterTotal: Object.keys(after).length,
      unchangedTotal: 0,
      changedTotal: 0,
      missingTotal: 0,
      addedTotal: 0
    },
    changed: {},
    missing: {},
    added: {}
  };

  for(let befKey in before) {
    if(after[befKey] !== undefined) {
      if(before[befKey] != after[befKey]) {
        diff.changed[befKey] = {
          old: before[befKey],
          new: after[befKey]
        };
        ++diff.report.changedTotal;
      } else {
        ++diff.report.unchangedTotal;
      }

      delete after[befKey];
    } else {
      // missing in after
      diff.missing[befKey] = before[befKey];
      ++diff.report.missingTotal;
    }
  }

  diff.added = after;
  diff.report.addedTotal = Object.keys(after).length;

  saveDiff(diff);
  printReport(diff);
}

function saveDiff(diff) {
  fs.ensureFileSync(argv.o);
  fs.writeJson(argv.o, diff, {spaces: 2});
  fs.writeJson(argv.o.split('diff_')[0] + 'diff_latest.json', diff, {spaces: 2});
}

function getTimestamp() {
  function pad(n) {
    return n < 10 ? '0' + n : n
  }
  const curr = new Date();
  return '' + curr.getUTCFullYear()
    + pad(curr.getUTCMonth() + 1)
    + pad(curr.getUTCDate())
    + pad(curr.getUTCHours())
    + pad(curr.getUTCMinutes())
    + pad(curr.getUTCSeconds());
}

function printSettings() {
  console.log('********** diff-i18n tool **********');
  console.log('Using the following settings:');
  console.log('  before translation file path: ' + argv.b);
  console.log('  after translation file path: ' + argv.a);
  console.log('  diff output file path: ' + argv.o);
}

function printReport(diff) {
  console.log('Finished. Report:');
  console.log('  total before: ' + diff.report.beforeTotal);
  console.log('  total after: ' + diff.report.afterTotal);
  console.log('  total unchanged: ' + diff.report.unchangedTotal);
  console.log('  total changed: ' + diff.report.changedTotal);
  console.log('  total missing: ' + diff.report.missingTotal);
  console.log('  total added: ' + diff.report.addedTotal);
}
