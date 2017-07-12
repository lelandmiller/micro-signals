import test = require('tape');

import {LeakDetectionSignal} from './lib/leak-detection-signal';

test('extended signal should provide correct listener count', t => {
    const s = new LeakDetectionSignal();
    t.equal(s.listenerCount, 0);
    const binding = s.add(() => { /* empty listener */ });
    t.equal(s.listenerCount, 1);
    binding.detach();
    t.equal(s.listenerCount, 0);
    t.end();
});
