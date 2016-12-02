import {promisifySignal} from '../src/promisify-signal';
import {Signal} from '../src/signal';
import test = require('tape');

test('created promise resolves with the signal payload if resolve signal is fired', t => {
    const rejectSignal = new Signal<string>();
    const resolveSignal = new Signal<string>();

    promisifySignal<string>(resolveSignal, rejectSignal).then(payload => {
        t.equal(payload, 'foo');
        t.end();
    });

    resolveSignal.dispatch('foo');
});

test('created promise rejects with the payload if reject signal is fired', t => {
    const rejectSignal = new Signal<string>();
    const resolveSignal = new Signal<string>();

    promisifySignal<string>(resolveSignal, rejectSignal).catch(reason => {
        t.equal(reason, 'foo');
        t.end();
    });

    rejectSignal.dispatch('foo');
});
