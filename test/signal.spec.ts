import test = require('tape');

import {
    FilterFunction,
    ReadableSignal,
    Signal,
} from '../src';

import {filteredSuite} from './suites/filtered-suite';
import {mappedSuite} from './suites/mapped-suite';
import {mergedSuite} from './suites/merged-suite';
import {promisifySuite} from './suites/promisify-suite';
import {readOnlySuite} from './suites/read-only-suite';

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

test('Signal calling detach on a binding should prevent that listener from receiving dispatched', t => {
    const receivedPayloadsListener1: string[] = [];
    const receivedPayloadsListener2: string[] = [];
    const receivedPayloadsListener3: string[] = [];

    const signal = new Signal<string>();

    const binding1 = signal.add((payload: string) => receivedPayloadsListener1.push(payload));
    const binding2 = signal.add((payload: string) => receivedPayloadsListener2.push(payload));
    const addOnceBinding = signal.addOnce((payload: string) => receivedPayloadsListener3.push(payload));

    addOnceBinding.detach();
    signal.dispatch('a');
    binding1.detach();
    signal.dispatch('b');
    binding2.detach();
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

filteredSuite(
    'Signal#filter',
    <T>(baseSignal: ReadableSignal<T>, filter: FilterFunction<T>) => baseSignal.filter(filter),
);

mappedSuite(
    'Signal#map',
    <T, U>(baseSignal: ReadableSignal<T>, transform: (payload: T) => U) => baseSignal.map(transform),
);

mergedSuite(
    'Signal#merge',
    <T>(baseSignal: ReadableSignal<T>, ...signals: ReadableSignal<T>[]) => baseSignal.merge(...signals),
);

mergedSuite(
    'Signal.merge',
    <T>(baseSignal: ReadableSignal<T>, ...signals: ReadableSignal<T>[]) => Signal.merge(baseSignal, ...signals),
);

promisifySuite(
    'Signal#promisify',
    <T>(resolveSignal: ReadableSignal<T>, rejectSignal?: ReadableSignal<any>) => resolveSignal.promisify(rejectSignal),
);

promisifySuite(
    'Signal.promisify',
    <T>(resolveSignal: ReadableSignal<T>, rejectSignal?: ReadableSignal<any>) =>
        Signal.promisify(resolveSignal, rejectSignal),
);

readOnlySuite(
    'Signal#readOnly',
    <T>(signal: ReadableSignal<T>) => signal.readOnly(),
);
