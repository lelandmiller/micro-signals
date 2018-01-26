import test = require('tape');

import {ReadableSignal, Signal} from '../../src/index';
import {LeakDetectionSignal} from '../lib/leak-detection-signal';
import {parentChildSuite} from './parent-child-suite';

export type FilteredSignalCreationFunction
    = <T>(baseSignal: ReadableSignal<T>, filter: (payload: T) => boolean) => ReadableSignal<T>;

export function filteredSuite(prefix: string, createFilteredSignal: FilteredSignalCreationFunction) {
    parentChildSuite(prefix, () => {
        const parentSignal = new Signal();
        const childSignal = createFilteredSignal(parentSignal, () => true);
        return { parentSignal, childSignal };
    });

    test(`${prefix} listeners should received dispatched payloads when filter returns true`, t => {
        const signal = new Signal<string>();
        const filteredSignal = createFilteredSignal(signal, payload => payload === 'a');

        const sentPayloads = ['a', 'b', 'c'];

        const receivedPayloadsListener1: string[] = [];
        const receivedPayloadsListener2: string[] = [];

        filteredSignal.add(payload => {
            receivedPayloadsListener1.push(payload);
        });

        filteredSignal.add(payload => {
            receivedPayloadsListener2.push(payload);
        });

        sentPayloads.forEach(payload => {
            signal.dispatch(payload);
        });

        t.deepEqual(receivedPayloadsListener1, ['a']);
        t.deepEqual(receivedPayloadsListener2, ['a']);

        t.end();
    });

    test(`${prefix} listener should be called only once when using addOnce and filter returns true`, t => {
        const signal = new Signal<string>();
        const filteredSignal = createFilteredSignal(signal, payload => payload === 'a');
        let callCount = 0;

        filteredSignal.addOnce(() => callCount++);

        for (let i = 0; i < 3; i++) {
            signal.dispatch('a');
        }

        t.equal(callCount, 1);

        t.end();
    });

    test(`${prefix} removing a listener should prevent further updates`, t => {
        const receivedPayloads1: string[] = [];
        const receivedPayloads2: string[] = [];
        const receivedPayloads3: string[] = [];
        const addOncePayloads: string[] = [];

        const signal = new Signal<string>();
        const filteredSignal = createFilteredSignal(signal, payload => payload === 'a');

        const listener1 = (payload: string) => {
            receivedPayloads1.push(payload);
        };
        filteredSignal.add(listener1);

        const listener2 = (payload: string) => {
            receivedPayloads2.push(payload);
        };
        filteredSignal.add(listener2);

        const listener3 = (payload: string) => {
            receivedPayloads3.push(payload);
        };
        filteredSignal.add(listener3);

        const addOnceListener = (payload: string) => {
            addOncePayloads.push(payload);
        };
        filteredSignal.addOnce(addOnceListener);

        filteredSignal.remove(addOnceListener);
        filteredSignal.remove(listener1);
        signal.dispatch('a');
        filteredSignal.remove(listener2);
        signal.dispatch('a');
        filteredSignal.remove(listener3);

        t.deepEqual(receivedPayloads1, []);
        t.deepEqual(receivedPayloads2, ['a']);
        t.deepEqual(receivedPayloads3, ['a', 'a']);
        t.deepEqual(addOncePayloads, []);

        t.end();
    });

    test('FilteredSignal should not leak', t => {
        const signal = new LeakDetectionSignal<void>();
        const filteredSignal = createFilteredSignal(signal, () => true);

        const listener = () => { /* empty listener */ };
        filteredSignal.add(listener);
        signal.dispatch(undefined);
        filteredSignal.remove(listener);

        t.equal(signal.listenerCount, 0);
        t.end();
    });
}
