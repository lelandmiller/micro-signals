/**
 * This test extracts the code examples from the README and requires them. Since tests are run in
 * ts-node, this catches both semantic and syntactic errors at compilation and runtime errors (which
 * also allows the asserts to test properly). Currently this test writes the examples to temporary
 * TypeScript files in the file system, previously other methods were tried. The transpileModule
 * function from the TypeScript module catches syntactic but not semantic errors. typescript-simple
 * was also experimented with, but there was difficulty pulling in node modules correctly. If this
 * could move to a solution that didn't require depending on ts-node require and writing to the file
 * system that would be ideal. Using ts-node require means that we are dependent on its behavior,
 * which also means that we cannot load the module multiple times in the same process without adding
 * hashes to the filenames or something similar. Writing to the system temporary directory would
 * also be nice, but outputting in the project directory ensures we have access to any locally
 * installed dependencies.
 */
import { extractCode } from 'erasmus';
import * as fs from 'fs';
import rimraf = require('rimraf');
import test = require('tape');

const outPath = `${__dirname}/generated-readme-examples`;

/**
 * Replace module paths in import statements in a provided code block.
 */
function renameDependencies(originalSource: string, dependencies: {[key: string]: string}): string {
    const reg = (dependency: string) => new RegExp(`import (.*) from '${dependency}'`);
    const rep = (dependency: string) => `import $1 from '${dependency}'`;
    return Object.keys(dependencies).reduce(
        (source, dependency) => source.replace(reg(dependency), rep(dependencies[dependency])),
        originalSource,
    );
}

/**
 * Extracts code examples from the README to outPath.
 * @returns An array containing the paths to all extracted code blocks.
 */
function extractReadmeExamples(): string[] {
    const filenames: string[] = [];

    rimraf.sync(outPath);
    fs.mkdirSync(outPath);

    extractCode(fs.readFileSync(`${__dirname}/../README.md`, 'utf8')).forEach((example, index) => {
        const converted = renameDependencies(example, {
            'micro-signals': `${__dirname}/../src/index`,
        });
        const filename = `README-${index}.ts`;
        const path = `${outPath}/${filename}`;
        filenames.push(path);
        fs.writeFileSync(path, converted);
    });

    // throw new Error('pause');
    return filenames;
}

function cleanupReadmeExamples() {
    rimraf.sync(outPath);
}

test(`code blocks from the README should compile and run`, t => {
    const exampleFilePaths = extractReadmeExamples();
    exampleFilePaths.forEach((path, index) => {
        t.doesNotThrow(() => require(path), `code block ${index} (zero-based) failed`);
    });
    cleanupReadmeExamples();
    t.end();
});
