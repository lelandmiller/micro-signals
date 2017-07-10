import test = require('tape');
import {FilterFunction, ReadableSignal, Signal} from '../../src/index';
import {LeakDetectionSignal} from '../lib/leak-detection-signal';

export type FilteredSignalCreationFunction
    = <T>(baseSignal: ReadableSignal<T>, filter: FilterFunction<T>) => ReadableSignal<T>;

export function filteredSuite(prefix: string, createFilteredSignal: FilteredSignalCreationFunction) {
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

    test(`${prefix} calling detach on a binding should prevent that listener from receiving dispatched`, t => {
        const receivedPayloadsListener1: string[] = [];
        const receivedPayloadsListener2: string[] = [];
        const receivedPayloadsListener3: string[] = [];

        const signal = new Signal<string>();
        const filteredSignal = createFilteredSignal(signal, payload => payload === 'a');

        const binding1 = filteredSignal.add(payload => {
            receivedPayloadsListener1.push(payload);
        });

        const binding2 = filteredSignal.add(payload => {
            receivedPayloadsListener2.push(payload);
        });

        const addOnceBinding = filteredSignal.addOnce(payload => {
            receivedPayloadsListener3.push(payload);
        });

        addOnceBinding.detach();
        signal.dispatch('a');
        binding1.detach();
        signal.dispatch('a');
        binding2.detach();
        signal.dispatch('a');

        t.deepEqual(receivedPayloadsListener1, ['a']);
        t.deepEqual(receivedPayloadsListener2, ['a', 'a']);
        t.deepEqual(receivedPayloadsListener3, []);

        t.end();
    });

    test('FilteredSignal should not leak', t => {
        const signal = new LeakDetectionSignal<void>();
        let filteredSignal = createFilteredSignal(signal, () => true);

        const binding = filteredSignal.add(() => { /* empty listener */ });
        signal.dispatch(undefined);
        binding.detach();

        t.equal(signal.listenerCount, 0);
        t.end();
    });
}
