import test = require('tape');
import {ReadableSignal, Signal} from '../../src';
import {LeakDetectionSignal} from '../lib/leak-detection-signal';
import {parentChildSuite} from './parent-child-suite';

export type ReadableSignalCreationFunction = <T>(...signals: ReadableSignal<T>[]) => ReadableSignal<T>;

export function mergedSuite(prefix: string, createMergedSignal: ReadableSignalCreationFunction) {
    parentChildSuite(prefix, () => {
        const parentSignal = new Signal();
        const childSignal = createMergedSignal(parentSignal);
        return { parentSignal, childSignal };
    });

    test(`${prefix} should dispatch when any of the provided signals are dispatched`, t => {
        const baseSignalString = new Signal<string>();
        const baseSignalNumber = new Signal<number>();
        const baseSignalBoolean = new Signal<boolean>();

        const mergedSignal = createMergedSignal<string|number|boolean>(
            baseSignalString,
            baseSignalNumber,
            baseSignalBoolean,
        );

        const receivedPayloads: (string|number|boolean)[] = [];
        const receivedPayloadsOnce: (string|number|boolean)[] = [];

        mergedSignal.add(payload => receivedPayloads.push(payload));
        mergedSignal.addOnce(payload => receivedPayloadsOnce.push(payload));

        baseSignalString.dispatch('a');
        baseSignalNumber.dispatch(0);
        baseSignalBoolean.dispatch(false);
        baseSignalNumber.dispatch(1);
        baseSignalString.dispatch('b');

        t.deepEqual(receivedPayloads, ['a', 0, false, 1, 'b']);
        t.deepEqual(receivedPayloadsOnce, ['a']);

        t.end();
    });

    test('MergedSignal should not leak', t => {
        const signal1 = new LeakDetectionSignal<void>();
        const signal2 = new LeakDetectionSignal<void>();
        const mergedSignal = createMergedSignal(signal1, signal2);

        const listener = () => { /* empty listener */ };
        mergedSignal.add(listener);
        signal1.dispatch(undefined);
        signal2.dispatch(undefined);
        mergedSignal.remove(listener);

        t.equal(signal1.listenerCount, 0);
        t.equal(signal2.listenerCount, 0);
        t.end();
    });

}
