import test = require('tape');
import {LeakDetectionSignal} from '../lib/leak-detection-signal';

import {
    ReadableSignal,
    Signal,
} from '../../src';

export type PromisifyFunction
    = <T>(resolveSignal: ReadableSignal<T>, rejectSignal?: ReadableSignal<any>) => Promise<T>;

export function promisifySuite(prefix: string, promisifyFunction: PromisifyFunction) {
    test(`${prefix} created promise resolves with the signal payload if resolve signal is fired`, t => {
        const rejectSignal = new Signal<string>();
        const resolveSignal = new Signal<string>();

        promisifyFunction<string>(resolveSignal, rejectSignal).then(payload => {
            t.equal(payload, 'foo');
            t.end();
        });

        resolveSignal.dispatch('foo');
    });

    test(`${prefix} created promise rejects with the payload if reject signal is fired`, t => {
        const rejectSignal = new Signal<string>();
        const resolveSignal = new Signal<string>();

        promisifyFunction<string>(resolveSignal, rejectSignal).catch(reason => {
            t.equal(reason, 'foo');
            t.end();
        });

        rejectSignal.dispatch('foo');
    });

    test(`${prefix} should not leak given only an acceptSignal`, t => {
        const acceptSignal = new LeakDetectionSignal<void>();

        const acceptedPromise = promisifyFunction(acceptSignal);
        acceptedPromise.then(() => { /* empty callback */ });
        acceptSignal.dispatch(undefined);

        t.equal(acceptSignal.listenerCount, 0);
        t.end();
    });

    test(`${prefix} should not leak on accept`, t => {
        const acceptSignal = new LeakDetectionSignal<void>();
        const rejectSignal = new LeakDetectionSignal<void>();

        const promise = promisifyFunction(acceptSignal, rejectSignal);
        promise.then(() => { /* empty callback */ });

        acceptSignal.dispatch(undefined);

        t.equal(acceptSignal.listenerCount, 0);
        t.equal(rejectSignal.listenerCount, 0);
        t.end();
    });

    test(`${prefix} should not leak on reject`, t => {
        const acceptSignal = new LeakDetectionSignal<void>();
        const rejectSignal = new LeakDetectionSignal<void>();

        const promise = promisifyFunction(acceptSignal, rejectSignal);
        promise.catch(() => { /* used to suppress unhandled promise error */ });

        rejectSignal.dispatch(undefined);

        t.equal(acceptSignal.listenerCount, 0);
        t.equal(rejectSignal.listenerCount, 0);
        t.end();
    });
}
