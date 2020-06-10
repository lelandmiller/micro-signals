import test = require('tape');
import {ReadableSignal, Signal} from '../../src';
import {LeakDetectionSignal} from '../lib/leak-detection-signal';
import {parentChildSuite} from './parent-child-suite';

export type PeekedSignalCreationFunction = <T>(
    baseSignal: ReadableSignal<T>,
    peekaboo: (payload: T) => void,
) => ReadableSignal<T>;
export function peekedSuite(prefix: string, createPeekedSignal: PeekedSignalCreationFunction) {
    parentChildSuite(prefix, () => {
        const parentSignal = new Signal();
        const childSignal = createPeekedSignal(parentSignal, _payload => void 0);
        return { parentSignal, childSignal };
    });

    test(`${prefix} should not modify the payload`, t => {
        const baseSignal = new Signal<number>();

        let sideEffectCatcher!: number;
        let actualReceiver!: number;
        baseSignal
            .map(x => x * 3)
            .peek(x => { sideEffectCatcher = x; })
            .add(x => { actualReceiver = x; });

        baseSignal.dispatch(4);

        t.deepEqual(sideEffectCatcher, 12);
        t.deepEqual(actualReceiver, 12);

        baseSignal.dispatch(7);

        t.deepEqual(sideEffectCatcher, 21);
        t.deepEqual(actualReceiver, 21);

        t.end();
    });

    test(`${prefix} should not modify the payload (multiple peeks)`, t => {
        const baseSignal = new Signal<number>();

        const sideEffectCatcher1: number[] = [];
        const sideEffectCatcher2: number[] = [];
        const actualReceiver: number[] = [];

        baseSignal
            .peek(x => { sideEffectCatcher1.push(x); })
            .map(x => x * 3)
            .peek(x => { sideEffectCatcher2.push(x); })
            .filter(x => x % 2 === 0)
            .add(x => { actualReceiver.push(x); });

        [1, 5, 6, 7, 12].forEach(x => baseSignal.dispatch(x));

        t.deepEqual(sideEffectCatcher1, [1, 5, 6, 7, 12]);
        t.deepEqual(sideEffectCatcher2, [3, 15, 18, 21, 36]);

        t.deepEqual(actualReceiver, [18, 36]);

        t.end();
    });

    test('PeekedSignal should not leak', t => {
        const signal = new LeakDetectionSignal<void>();
        const mappedSignal = createPeekedSignal(signal, () => true);

        const listener = () => { /* empty listener */ };
        mappedSignal.add(listener);
        signal.dispatch(undefined);
        mappedSignal.remove(listener);

        t.equal(signal.listenerCount, 0);
        t.end();
    });
}
