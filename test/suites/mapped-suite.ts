import test = require('tape');
import {ReadableSignal, Signal} from '../../src';
import {LeakDetectionSignal} from '../lib/leak-detection-signal';

export type MappedSignalCreationFunction
    = <T, U>(baseSignal: ReadableSignal<T>, transform: (payload: T) => U) => ReadableSignal<T>;

export function mappedSuite(prefix: string, createMappedSignal: MappedSignalCreationFunction) {
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
        let mappedSignal = createMappedSignal(signal, () => true);

        const binding = mappedSignal.add(() => { /* empty listener */ });
        signal.dispatch(undefined);
        binding.detach();

        t.equal(signal.listenerCount, 0);
        t.end();
    });
}
