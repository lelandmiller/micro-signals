import test = require('tape');
import {LeakDetectionSignal} from '../lib/leak-detection-signal';

import {ReadableSignal, Signal} from '../../src';

export type ReadOnlySignalCreationFunction = <T>(baseSignal: ReadableSignal<T>) => ReadableSignal<T>;

export function readOnlySuite(prefix: string, createReadOnlySignal: ReadOnlySignalCreationFunction) {
    test(`${prefix} forwards payloads and cannot be dispatched`, t => {
        const signal = new Signal<string>();

        signal.dispatch('a');

        const readOnlySignal = createReadOnlySignal(signal);

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

    test(`${prefix} should not leak`, t => {
        const signal = new LeakDetectionSignal<void>();
        const readOnlySignal = createReadOnlySignal(signal);

        const binding = readOnlySignal.add(() => { /* empty listener */ });
        signal.dispatch(undefined);
        binding.detach();

        t.equal(signal.listenerCount, 0);
        t.end();
    });
}
