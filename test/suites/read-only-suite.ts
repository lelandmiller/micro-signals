import test = require('tape');

import {LeakDetectionSignal} from '../lib/leak-detection-signal';
import {parentChildSuite} from './parent-child-suite';

import {PayloadOf, ReadableSignal, ReadOnlyVersionOf, Signal} from '../../src';

export type ReadOnlySignalCreationFunction = <T>(baseSignal: ReadableSignal<T>) => ReadableSignal<T>;

export function readOnlySuite(prefix: string, createReadOnlySignal: ReadOnlySignalCreationFunction) {
    parentChildSuite(prefix, () => {
        const parentSignal = new Signal();
        const childSignal = createReadOnlySignal(parentSignal);
        return { parentSignal, childSignal };
    });

    test(`${prefix} forwards payloads and cannot be dispatched`, t => {
        const signal = new Signal<string>();

        signal.dispatch('a');

        const readOnlySignal = createReadOnlySignal(signal);

        const receivedPayloadsAddListener: string[] = [];
        const receivedPayloadsAddOnceListener: string[] = [];

        const addListener = (payload: string) => {
            receivedPayloadsAddListener.push(payload);
        };
        readOnlySignal.add(addListener);

        const addOnceListener = (payload: string) => {
            receivedPayloadsAddOnceListener.push(payload);
        };
        readOnlySignal.addOnce(addOnceListener);

        signal.dispatch('b');
        signal.dispatch('c');

        readOnlySignal.remove(addListener);
        readOnlySignal.remove(addOnceListener);

        signal.dispatch('d');

        t.deepEqual(receivedPayloadsAddListener, ['b', 'c']);
        t.deepEqual(receivedPayloadsAddOnceListener, ['b']);

        t.equal((readOnlySignal as any).dispatch, undefined);
        t.end();
    });

    test(`${prefix} should not leak`, t => {
        const signal = new LeakDetectionSignal<void>();
        const readOnlySignal = createReadOnlySignal(signal);

        const listener = () => { /* empty listener */ };
        readOnlySignal.add(listener);
        signal.dispatch(undefined);
        readOnlySignal.remove(listener);

        t.equal(signal.listenerCount, 0);
        t.end();
    });

    test(`${prefix} should compile`, t => {
        interface FooBar {
            foo: 'foo';
            bar: 'bar';
        }

        const takesFooBar = (_fb: FooBar) => void 0;

        const writable = new Signal<FooBar>();
        const readonly: ReadOnlyVersionOf<typeof writable> = writable.readOnly();
        const payload: PayloadOf<typeof writable> = {foo: 'foo' , bar: 'bar'};
        writable.dispatch(payload);

        readonly.add(takesFooBar);

        t.end();
    });

}
