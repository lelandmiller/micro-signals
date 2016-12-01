import test = require('tape');
import {Signal} from '../src/signal';

test('listeners should received dispatched payloads', t => {
    const signal = new Signal<string>();

    const sentPayloads = ['a', 'b', 'c'];

    const receivedPayloadsListener1: string[] = [];
    const receivedPayloadsListener2: string[] = [];

    signal.add((payload: string) => receivedPayloadsListener1.push(payload));
    signal.add((payload: string) => receivedPayloadsListener2.push(payload));
    sentPayloads.forEach(payload => signal.dispatch(payload));

    t.deepEqual(receivedPayloadsListener1, sentPayloads);
    t.deepEqual(receivedPayloadsListener2, sentPayloads);

    t.end();
});

test('listener should be called only once when using addOnce', t => {
    const signal = new Signal<void>();
    let callCount = 0;

    signal.addOnce(() => callCount++);

    for (let i = 0; i < 3; i++) {
        signal.dispatch(undefined);
    }

    t.equal(callCount, 1);

    t.end();
});

test('calling detach on a binding should prevent that listener from receiving dispatched', t => {
    const receivedPayloadsListener1: string[] = [];
    const receivedPayloadsListener2: string[] = [];
    const receivedPayloadsListener3: string[] = [];

    const signal = new Signal<string>();

    const binding1 = signal.add((payload: string) => receivedPayloadsListener1.push(payload));
    const binding2 = signal.add((payload: string) => receivedPayloadsListener2.push(payload));
    const addOnceBinding = signal.addOnce((payload: string) => receivedPayloadsListener3.push(payload));

    addOnceBinding.detach();
    signal.dispatch('a');
    binding1.detach();
    signal.dispatch('b');
    binding2.detach();
    signal.dispatch('c');

    t.deepEqual(receivedPayloadsListener1, ['a']);
    t.deepEqual(receivedPayloadsListener2, ['a', 'b']);
    t.deepEqual(receivedPayloadsListener3, []);

    t.end();
});
