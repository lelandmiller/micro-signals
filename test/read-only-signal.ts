import test = require('tape');

import {ReadOnlySignal, Signal} from '../src/signal';

test('ReadOnlySignal', t => {
    const signal = new Signal<string>();

    signal.dispatch('a');

    const readOnlySignal = new ReadOnlySignal(signal);

    const receivedPayloadsAddListener: string[] = [];
    const receivedPayloadsAddOnceListener: string[] = [];

    const addBinding = readOnlySignal.add(payload => {
        receivedPayloadsAddListener.push(payload);
    });

    const addOnceBinding = readOnlySignal.addOnce(payload => {
        receivedPayloadsAddOnceListener.push(payload);
    });

    signal.dispatch('b');
    signal.dispatch('c');

    addBinding.detach();
    addOnceBinding.detach();

    signal.dispatch('d');

    t.deepEqual(receivedPayloadsAddListener, ['b', 'c']);
    t.deepEqual(receivedPayloadsAddOnceListener, ['b']);

    t.equal((readOnlySignal as any).dispatch, undefined);
    t.end();
});
