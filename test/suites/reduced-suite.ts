import test = require('tape');
import {Accumulator, ReadableSignal, Signal} from '../../src';
import {LeakDetectionSignal} from '../lib/leak-detection-signal';
import {parentChildSuite} from './parent-child-suite';

export type ReducedSignalCreationFunction = <T, U>(
    baseSignal: ReadableSignal<T>,
    accumulator: Accumulator<T, U>,
    initialValue: U,
) => ReadableSignal<U>;

export function reducedSuite(prefix: string, createReducedSignal: ReducedSignalCreationFunction) {
    parentChildSuite(prefix, () => {
        const parentSignal = new Signal();
        const childSignal = createReducedSignal(parentSignal, (_, payload) => payload, undefined);
        return { parentSignal, childSignal };
    });

    test(`${prefix} should dispatch with the accumulated payload`, t => {
        const baseSignal = new Signal<number>();

        const reducedSignal = baseSignal.reduce((accum, curr) => accum + curr, 5);

        const addResults: number[] = [];
        const addOnceResults: number[] = [];

        reducedSignal.add(x => addResults.push(x));
        reducedSignal.addOnce(x => addOnceResults.push(x));

        baseSignal.dispatch(50);
        baseSignal.dispatch(0);
        baseSignal.dispatch(100);

        t.deepEqual(addResults, [55, 55, 155]);
        t.deepEqual(addOnceResults, [55]);

        t.end();
    });

    test('ReducedSignal should not leak', t => {
        const signal = new LeakDetectionSignal<void>();
        const mappedSignal = createReducedSignal(signal, () => true, false);

        const listener = () => { /* empty listener */ };
        mappedSignal.add(listener);
        signal.dispatch(undefined);
        mappedSignal.remove(listener);

        t.equal(signal.listenerCount, 0);
        t.end();
    });
}
