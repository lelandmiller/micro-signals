import test = require('tape');
import {ReadableSignal, Signal} from '../../src';
import {LeakDetectionSignal} from '../lib/leak-detection-signal';
import {parentChildSuite} from './parent-child-suite';

export type MappedSignalCreationFunction
    = <T, U>(baseSignal: ReadableSignal<T>, transform: (payload: T) => U) => ReadableSignal<U>;

export function mappedSuite(prefix: string, createMappedSignal: MappedSignalCreationFunction) {
    parentChildSuite(prefix, () => {
        const parentSignal = new Signal();
        const childSignal = createMappedSignal(parentSignal, payload => payload);
        return { parentSignal, childSignal };
    });

    test(`${prefix} should dispatch with a transformed payload`, t => {
        const baseSignal = new Signal<number>();

        const mappedSignal = createMappedSignal(baseSignal, x => -x);

        const addResults: number[] = [];
        const addOnceResults: number[] = [];

        mappedSignal.add(x => addResults.push(x));
        mappedSignal.addOnce(x => addOnceResults.push(x));

        baseSignal.dispatch(50);
        baseSignal.dispatch(0);
        baseSignal.dispatch(100);

        t.deepEqual(addResults, [-50, 0, -100]);
        t.deepEqual(addOnceResults, [-50]);

        t.end();
    });

    test('MappedSignal should not leak', t => {
        const signal = new LeakDetectionSignal<void>();
        const mappedSignal = createMappedSignal(signal, () => true);

        const listener = () => { /* empty listener */ };
        mappedSignal.add(listener);
        signal.dispatch(undefined);
        mappedSignal.remove(listener);

        t.equal(signal.listenerCount, 0);
        t.end();
    });
}
