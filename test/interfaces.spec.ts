import test = require('tape');

test('the interfaces module should only export type information', t => {
    const interfaces = require('../src/interfaces');
    // all exports should be TypeScript only and will not show up at runtime
    t.deepEqual(interfaces, {});
    t.end();
});
