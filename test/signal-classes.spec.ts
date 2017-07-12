import test = require('tape');

import {filteredSuite} from './suites/filtered-suite';
import {mappedSuite} from './suites/mapped-suite';
import {mergedSuite} from './suites/merged-suite';
import {promisifySuite} from './suites/promisify-suite';
import {readOnlySuite} from './suites/read-only-suite';

import {
    FilteredSignal,
    FilterFunction,
    MappedSignal,
    MergedSignal,
    promisifySignal,
    ReadableSignal,
    ReadOnlySignal,
    Signal,
} from '../src';

filteredSuite(
    'FilteredSignal',
    <T>(baseSignal: ReadableSignal<T>, filter: FilterFunction<T>) => new FilteredSignal(baseSignal, filter),
);

test('FilteredSignal uses a default filter that passes payloads through', t => {
    const dispatchedPayloads = [1, 2, 3];
    const baseSignal = new Signal<number>();
    const receivedPayloads: number[] = [];
    const filteredSignal = new FilteredSignal(baseSignal);

    filteredSignal.add(payload => receivedPayloads.push(payload));

    dispatchedPayloads.forEach(payload => baseSignal.dispatch(payload));

    t.deepEqual(receivedPayloads, dispatchedPayloads);
    t.end();
});

mappedSuite(
    'MappedSignal',
    <T, U>(baseSignal: ReadableSignal<T>, transform: (payload: T) => U) => new MappedSignal(baseSignal, transform),
);

mergedSuite(
    'MergedSignal',
    <T>(...signals: ReadableSignal<T>[]) => new MergedSignal(...signals),
);

promisifySuite(
    'promisifySignal',
    <T>(resolveSignal: ReadableSignal<T>, rejectSignal?: ReadableSignal<any>) =>
        promisifySignal(resolveSignal, rejectSignal),
);

readOnlySuite(
    'ReadOnlySignal',
    <T>(signal: ReadableSignal<T>) => new ReadOnlySignal(signal),
);
