import test = require('tape');
import {Signal} from '../src/micro-signals';

test('listeners should received dispatched payloads', t => {
    const signal = new Signal<string>();

    const sentPayloads = ['a', 'b', 'c'];

    const receivedPayloadsListener1: string[] = [];
    const receivedPayloadsListener2: string[] = [];

    signal.add(payload => {
        receivedPayloadsListener1.push(payload);
    });

    signal.add(payload => {
        receivedPayloadsListener2.push(payload);
    });

    sentPayloads.forEach(payload => {
        signal.dispatch(payload);
    });

    t.deepEqual(receivedPayloadsListener1, sentPayloads);
    t.deepEqual(receivedPayloadsListener2, sentPayloads);

    t.end();
});

test('calling detach on a binding should prevent that listener from receiving dispatched', t => {
    const receivedPayloadsListener1: string[] = [];
    const receivedPayloadsListener2: string[] = [];

    const signal = new Signal<string>();

    const binding1 = signal.add(payload => {
        receivedPayloadsListener1.push(payload);
    });

    const binding2 = signal.add(payload => {
        receivedPayloadsListener2.push(payload);
    });

    signal.dispatch('a');
    binding1.detach();
    signal.dispatch('b');
    binding2.detach();
    signal.dispatch('c');

    t.deepEqual(receivedPayloadsListener1, ['a']);
    t.deepEqual(receivedPayloadsListener2, ['a', 'b']);

    t.end();
});
