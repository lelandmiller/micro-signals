/**
 * These tests insure that signals do not leak listeners. Signals should not leave listeners
 * attached to their base signals unless needed. This prevents memory leak that could occur when
 * using these extended signal types.
 */
import test = require('tape');

import {
    FilteredSignal,
    MappedSignal,
    MergedSignal,
    promisifySignal,
    ReadOnlySignal,
    Signal as BaseSignal,
} from '../src';

class Signal<T> extends BaseSignal<T> {
    get listenerCount(): number {
        return this._listeners.size;
    }
}

test('extended signal should provide correct listener count', t => {
    const s = new Signal();
    t.equal(s.listenerCount, 0);
    const binding = s.add(() => { /* empty listener */ });
    t.equal(s.listenerCount, 1);
    binding.detach();
    t.equal(s.listenerCount, 0);
    t.end();
});

test('FilteredSignal should not leak', t => {
    const signal = new Signal<void>();
    let filteredSignal = new FilteredSignal<void>(signal);

    const binding = filteredSignal.add(() => { /* empty listener */ });
    signal.dispatch(undefined);
    binding.detach();

    t.equal(signal.listenerCount, 0);
    t.end();
});

test('MappedSignal should not leak', t => {
    const signal = new Signal<void>();
    let mappedSignal = new MappedSignal(signal, () => true);

    const binding = mappedSignal.add(() => { /* empty listener */ });
    signal.dispatch(undefined);
    binding.detach();

    t.equal(signal.listenerCount, 0);
    t.end();
});

test('MergedSignal should not leak', t => {
    const signal1 = new Signal<void>();
    const signal2 = new Signal<void>();
    let mergedSignal = new MergedSignal(signal1, signal2);

    const binding = mergedSignal.add(() => { /* empty listener */ });
    signal1.dispatch(undefined);
    signal2.dispatch(undefined);
    binding.detach();

    t.equal(signal1.listenerCount, 0);
    t.equal(signal2.listenerCount, 0);
    t.end();
});

test('promisifySignal should not leak given only an acceptSignal', t => {
    const acceptSignal = new Signal<void>();

    const acceptedPromise = promisifySignal(acceptSignal);
    acceptedPromise.then(() => { /* empty callback */ });
    acceptSignal.dispatch(undefined);

    t.equal(acceptSignal.listenerCount, 0);
    t.end();
});

test('promisifySignal should not leak on accept', t => {
    const acceptSignal = new Signal<void>();
    const rejectSignal = new Signal<void>();

    let promise = promisifySignal(acceptSignal, rejectSignal);
    promise.then(() => { /* empty callback */ });

    acceptSignal.dispatch(undefined);

    t.equal(acceptSignal.listenerCount, 0);
    t.equal(rejectSignal.listenerCount, 0);
    t.end();
});

test('promisifySignal should not leak on reject', t => {
    const acceptSignal = new Signal<void>();
    const rejectSignal = new Signal<void>();

    let promise = promisifySignal(acceptSignal, rejectSignal);
    promise.catch(() => { /* used to suppress unhandled promise error */ });

    rejectSignal.dispatch(undefined);

    t.equal(acceptSignal.listenerCount, 0);
    t.equal(rejectSignal.listenerCount, 0);
    t.end();
});

test('ReadOnlySignal should not leak', t => {
    const signal = new Signal<void>();
    let readOnlySignal = new ReadOnlySignal(signal);

    const binding = readOnlySignal.add(() => { /* empty listener */ });
    signal.dispatch(undefined);
    binding.detach();

    t.equal(signal.listenerCount, 0);
    t.end();
});
