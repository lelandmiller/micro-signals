import test = require('tape');

import {
    ReadableSignal,
    Signal,
} from '../src';

import {filteredSuite} from './suites/filtered-suite';
import {mappedSuite} from './suites/mapped-suite';
import {mergedSuite} from './suites/merged-suite';
import {promisifySuite} from './suites/promisify-suite';
import {readOnlySuite} from './suites/read-only-suite';

// TODO run the signal suite on the converted signals as well?

filteredSuite(
    'Signal#filter',
    (baseSignal, filter) => baseSignal.filter(filter),
);

mappedSuite(
    'Signal#map',
    (baseSignal, transform) => baseSignal.map(transform),
);

mergedSuite(
    'Signal#merge',
    (baseSignal, ...signals) => baseSignal.merge(...signals),
);

mergedSuite(
    'Signal.merge',
    (baseSignal, ...signals) => Signal.merge(baseSignal, ...signals),
);

promisifySuite(
    'Signal#promisify',
    (resolveSignal, rejectSignal?) => resolveSignal.promisify(rejectSignal),
);

promisifySuite(
    'Signal.promisify',
    (resolveSignal, rejectSignal?) => Signal.promisify(resolveSignal, rejectSignal),
);

readOnlySuite(
    'Signal#readOnly',
    signal => signal.readOnly(),
);

test('Signal listeners should received dispatched payloads', t => {
    const signal = new Signal<string>();

    const sentPayloads = ['a', 'b', 'c'];

    const receivedPayloadsListener1: string[] = [];
    const receivedPayloadsListener2: string[] = [];

    signal.add((payload: string) => receivedPayloadsListener1.push(payload));
    signal.add((payload: string) => receivedPayloadsListener2.push(payload));
    sentPayloads.forEach(payload => signal.dispatch(payload));

    t.deepEqual(receivedPayloadsListener1, sentPayloads);
    t.deepEqual(receivedPayloadsListener2, sentPayloads);

    t.end();
});

test('All listeners should receive dispatched payloads even with exceptions', t => {
    const signal = new Signal<string>();

    const sentPayloads = ['a', 'b', 'c'];

    const receivedPayloadsListener1: string[] = [];
    const receivedPayloadsListener2: string[] = [];

    signal.add(payload => {
        receivedPayloadsListener1.push(payload);
        throw new Error('');
    });
    signal.add(payload => {
        receivedPayloadsListener2.push(payload);
        throw new Error('');
    });

    sentPayloads.forEach(payload => signal.dispatch(payload));

    t.deepEqual(receivedPayloadsListener1, sentPayloads);
    t.deepEqual(receivedPayloadsListener2, sentPayloads);

    t.end();
});

test('Catchers should receive exceptions', t => {
    const signal = new Signal<string>();

    const error1 = new Error('error1');
    const error2 = new Error('error2');
    const receivedExceptions: Error[] = [];
    const receivedPayloadsListener: string[] = [];

    signal.catch(exception => receivedExceptions.push(exception));

    signal.add(() => { throw error1; });
    signal.add(() => { throw error2; });
    signal.add(payload => receivedPayloadsListener.push(payload));

    signal.dispatch('Hallo Welt!');

    t.deepEqual(receivedExceptions, [error1, error2]);
    t.deepEqual(receivedPayloadsListener, ['Hallo Welt!']);

    t.end();
});

test('Catchers should receive no exceptions after being removed', t => {
    const signal = new Signal<string>();

    const error1 = new Error('error1');
    const error2 = new Error('error2');
    const receivedExceptions: Error[] = [];
    const receivedPayloadsListener: string[] = [];

    const catcher = (exception: any) => receivedExceptions.push(exception);
    signal.catch(catcher);

    signal.add(() => { throw error1; });
    signal.add(() => { throw error2; });
    signal.add(payload => receivedPayloadsListener.push(payload));

    signal.dispatch('Hallo Welt!');
    signal.removeCatcher(catcher);
    signal.dispatch('Hello World!');

    t.deepEqual(receivedExceptions, [error1, error2]);
    t.deepEqual(receivedPayloadsListener, ['Hallo Welt!', 'Hello World!']);

    t.end();
});

test('Catchers should receive exceptions for derived Signals too', t => {
    const signal = new Signal<number>();
    const filtered = signal.filter(x => x > 2);

    const e1 = new Error('error1');
    const e2 = new Error('error2');

    const receivedExceptions1: Error[] = [];
    const receivedExceptions2: Error[] = [];
    const receivedPayloadsListener1: number[] = [];
    const receivedPayloadsListener2: number[] = [];

    const expectedExceptions = [
        e1,     // 1
        e1,     // 2
        e1, e2, // 3
        e1, e2, // 4
    ];

    signal.catch(exception => receivedExceptions1.push(exception));
    filtered.catch(exception => receivedExceptions2.push(exception));

    signal.add(() => { throw e1; });
    filtered.add(() => { throw e2; });

    signal.add(payload => receivedPayloadsListener1.push(payload));
    filtered.add(payload => receivedPayloadsListener2.push(payload));

    [1, 2, 3, 4].forEach(x => signal.dispatch(x));

    t.deepEqual(receivedExceptions1, expectedExceptions);
    t.deepEqual(receivedExceptions2, expectedExceptions);
    t.deepEqual(receivedPayloadsListener1, [1, 2, 3, 4]);
    t.deepEqual(receivedPayloadsListener2, [3, 4]);

    t.end();
});

test('Signal listener should be called only once when using addOnce', t => {
    const signal = new Signal<void>();
    let callCount = 0;

    signal.addOnce(() => callCount++);

    for (let i = 0; i < 3; i++) {
        signal.dispatch(undefined);
    }

    t.equal(callCount, 1);

    t.end();
});

test('Signal listener should only be added once when using addOnce to match behavior of add', t => {
    const signal = new Signal<void>();
    let callCount = 0;

    const listener = () => callCount++;

    signal.addOnce(listener);
    signal.addOnce(listener);

    signal.dispatch(undefined);

    t.equal(callCount, 1);

    t.end();
});

/**
 * This tests the type of the filter function exclusively. There is no runtime assertion in this
 * test, but this test will fail the TypeScript typechecker if we have broken this functionality.
 */
test('Signal.filter types should allow for filtering using type predicates correctly', t => {
    function isString(x: any): x is string {
        return typeof x === 'string';
    }

    const signal = new Signal<undefined | string>();
    const readableSignal: ReadableSignal<undefined | string> = new Signal();

    const filteredSignal = signal.filter(isString);
    const filteredReadableSignal = readableSignal.filter(isString);

    filteredSignal.add(s => s.length);
    filteredReadableSignal.add(s => s.length);

    t.end();
});

test('Signal removing a one time listener should prevent it from being called ', t => {
    const receivedPayloads: string[] = [];

    const signal = new Signal<string>();

    const addOnceListener = (payload: string) => receivedPayloads.push(payload);
    signal.addOnce(addOnceListener);

    signal.remove(addOnceListener);
    signal.dispatch('a');

    t.deepEqual(receivedPayloads, []);

    t.end();
});

test('Signal removing a listener should stop further updates', t => {
    const receivedPayloadsListener1: string[] = [];
    const receivedPayloadsListener2: string[] = [];
    const receivedPayloadsListener3: string[] = [];

    const signal = new Signal<string>();

    const listener1 = (payload: string) => receivedPayloadsListener1.push(payload);
    signal.add(listener1);
    const listener2 = (payload: string) => receivedPayloadsListener2.push(payload);
    signal.add(listener2);
    const addOnceListener = (payload: string) => receivedPayloadsListener3.push(payload);
    signal.addOnce(addOnceListener);

    signal.remove(addOnceListener);
    signal.dispatch('a');
    signal.remove(listener1);
    signal.dispatch('b');
    signal.remove(listener2);
    signal.dispatch('c');

    t.deepEqual(receivedPayloadsListener1, ['a']);
    t.deepEqual(receivedPayloadsListener2, ['a', 'b']);
    t.deepEqual(receivedPayloadsListener3, []);

    t.end();
});

test('Signal methods should be chainable', t => {
    const s1 = new Signal<number>();
    const s2 = new Signal<string>();

    const addPayloads: string[] = [];
    const addOncePayloads: string[] = [];

    const s3 = s1
        .filter(x => x < 10)
        .map(x => `a${x}`)
        .merge(s2)
        .readOnly();

    s3.add(payload => addPayloads.push(payload));
    s3.addOnce(payload => addOncePayloads.push(payload));

    s1.dispatch(1);
    s1.dispatch(15);
    s1.dispatch(5);
    s2.dispatch('14');
    s1.dispatch(-5);

    t.deepEqual(addPayloads, ['a1', 'a5', '14', 'a-5']);
    t.deepEqual(addOncePayloads, ['a1']);
    t.end();
});

test('addOnce should the same as add when adding a listener multiple times', t => {
    const s1 = new Signal<number>();

    const payloads: number[] = [];

    const listener = (payload: number) => payloads.push(payload);

    s1.addOnce(listener);
    s1.addOnce(listener);

    s1.remove(listener);

    s1.dispatch(1);

    t.deepEqual(payloads, []);

    t.end();
});

test('dispatches to static default listener if no instance default listener is set', t => {
    const staticCalls: any[][] = [];
    const staticDefaultListener = (...args: any[]) => staticCalls.push(args);
    Signal.setDefaultListener(staticDefaultListener);
    const s = new Signal<number>();
    s.dispatch(1);
    t.equal(staticCalls[0][0], 1);
    t.end();
});

test('dispatches to instance default listener when it is set', t => {
    const staticCalls: any[][] = [];
    const instanceCalls: any[][] = [];
    const staticDefaultListener = (...args: any[]) => staticCalls.push(args);
    const instanceDefaultListener = (...args: any[]) => instanceCalls.push(args);
    Signal.setDefaultListener(staticDefaultListener);
    const s = new Signal<number>();
    s.setDefaultListener(instanceDefaultListener);
    s.dispatch(1);
    t.equal(staticCalls.length, 0);
    t.equal(instanceCalls[0][0], 1);
    t.end();
});

test('does not dispatch to static default listener when other listeners have been added', t => {
    const staticCalls: number[] = [];
    const staticDefaultListener = (payload: number) => staticCalls.push(payload);
    Signal.setDefaultListener(staticDefaultListener);
    const s = new Signal<number>();
    s.add(() => {
        // no-op
    });

    s.dispatch(1);

    t.equal(staticCalls.length, 0);
    t.end();
});

test('does not dispatch to static default listener when other listeners have been added', t => {
    const instanceCalls: number[] = [];
    const instanceDefaultListener = (payload: number) => instanceCalls.push(payload);
    const s = new Signal<number>();
    s.setDefaultListener(instanceDefaultListener);
    s.add(() => {
        // no-op
    });

    s.dispatch(1);

    t.equal(instanceCalls.length, 0);
    t.end();
});
