import test = require('tape');
import {MappedSignal, Signal} from '../src';

test('MappedSignal should dispatch with a transformed payload', t => {
    const baseSignal = new Signal<number>();
    const mappedSignal = new MappedSignal(baseSignal, x => -x);

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
