import test = require('tape');
import {MergedSignal, Signal} from '../src';

test('MergedSignal should dispatch when any of the provided signals are dispatched', t => {
    const baseSignalString = new Signal<string>();
    const baseSignalNumber = new Signal<number>();
    const baseSignalBoolean = new Signal<boolean>();

    const mergedSignal = new MergedSignal<string|number|boolean>(
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
