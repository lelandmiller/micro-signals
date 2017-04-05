// tslint:disable:no-eval
import test = require('tape');
import { extractCode } from 'erasmus';
import * as fs from 'fs';
import * as ts from 'typescript';

// NOTE: this test does not catch semantic errors due to behavior of transpileModule
test('examples in the README should not throw', t => {
    extractCode(fs.readFileSync(`${__dirname}/../README.md`, 'utf8')).forEach((example, index)  => {
        const output = ts.transpileModule(example, {
            renamedDependencies: {
                'micro-signals': `${__dirname}/..`,
            },
            reportDiagnostics: true,
        });
        if (output.diagnostics && output.diagnostics.length > 0) {
            t.fail(`TypeScript compilation issue in code block #${index}: ${JSON.stringify(output.diagnostics)}`);
        }
        t.doesNotThrow(() => eval(output.outputText));
    });
    t.end();
});
