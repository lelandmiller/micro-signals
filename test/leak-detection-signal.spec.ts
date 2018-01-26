import test = require('tape');

import {LeakDetectionSignal} from './lib/leak-detection-signal';

test('extended signal should provide correct listener count', t => {
    const s = new LeakDetectionSignal();
    t.equal(s.listenerCount, 0);
    const listener = () => { /* empty listener */ };
    s.add(listener);
    t.equal(s.listenerCount, 1);
    s.remove(listener);
    t.equal(s.listenerCount, 0);
    t.end();
});
