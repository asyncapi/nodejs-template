const fs = require('fs');
const path = require('path');
const examplePath = path.resolve(__dirname, '..', 'test', 'integration-tests');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const { exit } = require('process');

const promises = fs.readdirSync(examplePath)
  .map((file) => { return path.resolve(examplePath, file); })
  .filter((exampleDir) => { return fs.lstatSync(exampleDir).isDirectory(); })
  .map((exampleDir) => {
    let command = 'generate:client';
    const generatedLibraryPath = path.resolve(exampleDir, 'nodejs-client');
    if (fs.existsSync(generatedLibraryPath)) {
      fs.rmSync(generatedLibraryPath, {
        recursive: true,
        force: true
      });
    }
    return exec(`cd ${exampleDir} && npm run setup`);
  });

/*
async function main() {
  for (let promise of promises) {
    await promise;
  }
}

main();
*/

Promise.all(promises).catch((err) => {
  console.error(err);
  exit(1);
});
