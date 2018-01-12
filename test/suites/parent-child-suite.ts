import test = require('tape');

import { BaseSignal, WritableSignal } from '../../src';

export interface SignalSet {
    parentSignal: WritableSignal<any>;
    childSignal: BaseSignal<any>;
}

export type UniqueListenerSetup = () => SignalSet;

function setupListeners(
    setup: UniqueListenerSetup,
): SignalSet & { payloads: number[]; listener: (payload: number) => void } {
    const { parentSignal, childSignal } = setup();

    const payloads: number[] = [];

    const listener = (payload: number) => payloads.push(payload);

    parentSignal.add(listener);
    childSignal.add(listener);

    return { parentSignal, childSignal, listener, payloads };
}

/**
 * parentChildSuite tests the relationship between two signals including ensuring that each signal
 * has a unique set of listeners and that they behave as separate signals regarding the addition and
 * removal of listeners.
 */
export function parentChildSuite(prefix: string, setup: UniqueListenerSetup) {
    test(`${prefix} should maintain a listener when listener is removed from its parent`, t => {
        const { parentSignal, payloads, listener } = setupListeners(setup);

        parentSignal.remove(listener);

        parentSignal.dispatch(5);

        t.deepEqual(payloads, [5]);

        t.end();
    });

    test(`${prefix} should maintain a listener when listener is removed from its child`, t => {
        const { parentSignal, childSignal, payloads, listener } = setupListeners(setup);

        childSignal.remove(listener);

        parentSignal.dispatch(5);

        t.deepEqual(payloads, [5]);

        t.end();
    });

    test(`${prefix} should add the same listener to both parent and child`, t => {
        const { parentSignal, payloads } = setupListeners(setup);

        parentSignal.dispatch(5);

        t.deepEqual(payloads, [5, 5]);

        t.end();
    });
}
