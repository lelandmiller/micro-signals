import test = require('tape');

import {
    Signal,
} from '../src';

test('Signal removing an added listener by tags should work after a dispatch', t => {
    const receivedPayloads: string[] = [];

    const signal = new Signal<string>();

    const tag = {};

    signal.add(payload => receivedPayloads.push(payload), tag);

    signal.dispatch('a');
    signal.remove(tag);
    signal.dispatch('b');

    t.deepEqual(receivedPayloads, ['a']);

    t.end();
});

test('Signal removing an added listener by tags should work before any dispatches', t => {
    const receivedPayloads: string[] = [];

    const signal = new Signal<string>();

    const tag = {};

    signal.add(payload => receivedPayloads.push(payload), tag);

    signal.remove(tag);
    signal.dispatch('a');
    signal.dispatch('b');

    t.deepEqual(receivedPayloads, []);

    t.end();
});

test('Signal removing an added once listener by tags should stop further updates', t => {
    const receivedPayloads: string[] = [];

    const signal = new Signal<string>();

    const tag = {};

    signal.addOnce(payload => receivedPayloads.push(payload), tag);

    signal.remove(tag);
    signal.dispatch('a');
    signal.dispatch('b');

    t.deepEqual(receivedPayloads, []);

    t.end();
});

test('Signal should support multiple tags per added listener', t => {
    const receivedPayloads: string[] = [];

    const signal = new Signal<string>();

    const tag1 = {};
    const tag2 = {};
    const tag3 = {};

    signal.add(payload => receivedPayloads.push(payload), tag1, tag2, tag3);

    signal.dispatch('a');
    signal.remove(tag3);
    signal.dispatch('b');

    t.deepEqual(receivedPayloads, ['a']);

    t.end();
});

test('Signal should support multiple listener per tag', t => {
    const receivedPayloads1: string[] = [];
    const receivedPayloads2: string[] = [];
    const receivedPayloads3: string[] = [];

    const signal = new Signal<string>();

    const tag1 = {};
    const tag2 = {};

    signal.add(payload => receivedPayloads1.push(payload), tag1, tag2);
    signal.add(payload => receivedPayloads2.push(payload), tag1);
    signal.add(payload => receivedPayloads3.push(payload), tag2);

    signal.dispatch('a');
    signal.remove(tag1);
    signal.dispatch('b');
    signal.remove(tag2);
    signal.dispatch('c');

    t.deepEqual(receivedPayloads1, ['a']);
    t.deepEqual(receivedPayloads2, ['a']);
    t.deepEqual(receivedPayloads3, ['a', 'b']);

    t.end();
});

test('Signal after removing a listener by tag the tag no longer apply', t => {
    const receivedPayloads: string[] = [];

    const signal = new Signal<string>();

    const tag1 = {};
    const tag2 = {};

    const listener = (payload: string) => receivedPayloads.push(payload);

    signal.add(listener, tag1, tag2);

    signal.dispatch('a');
    signal.remove(tag1);
    signal.dispatch('b');
    signal.add(listener);
    signal.remove(tag1);
    signal.remove(tag2);
    signal.dispatch('c');

    t.deepEqual(receivedPayloads, ['a', 'c']);

    t.end();
});

test('Signal after removing a listener by listener the tag no longer applies', t => {
    const receivedPayloads: string[] = [];

    const signal = new Signal<string>();

    const tag1 = {};
    const tag2 = {};

    const listener = (payload: string) => receivedPayloads.push(payload);

    signal.add(listener, tag1, tag2);

    signal.dispatch('a');
    signal.remove(listener);
    signal.dispatch('b');
    signal.add(listener);
    signal.remove(tag1);
    signal.remove(tag2);
    signal.dispatch('c');

    t.deepEqual(receivedPayloads, ['a', 'c']);

    t.end();
});

test('Signal after removing a tag the tag should no longer apply to multiple listeners', t => {
    const receivedPayloads1: string[] = [];
    const receivedPayloads2: string[] = [];

    const signal = new Signal<string>();

    const tag = {};

    const listener1 = (payload: string) => receivedPayloads1.push(payload);
    const listener2 = (payload: string) => receivedPayloads2.push(payload);

    signal.add(listener1, tag);
    signal.add(listener2, tag);

    signal.dispatch('a');
    signal.remove(tag);
    signal.dispatch('b');
    signal.add(listener1);
    signal.add(listener2);
    signal.remove(tag);
    signal.dispatch('c');

    t.deepEqual(receivedPayloads1, ['a', 'c']);
    t.deepEqual(receivedPayloads2, ['a', 'c']);

    t.end();
});

test('Signal removing a tagged listener should not affect other listeners with the same tag', t => {
    const receivedPayloads1: string[] = [];
    const receivedPayloads2: string[] = [];

    const signal = new Signal<string>();

    const tag = {};

    const listener1 = (payload: string) => receivedPayloads1.push(payload);
    const listener2 = (payload: string) => receivedPayloads2.push(payload);

    signal.add(listener1, tag);
    signal.add(listener2, tag);

    signal.dispatch('a');
    signal.remove(listener1);
    signal.dispatch('b');
    signal.add(listener1);
    signal.remove(tag);
    signal.dispatch('c');

    t.deepEqual(receivedPayloads1, ['a', 'c']);
    t.deepEqual(receivedPayloads2, ['a', 'b']);

    t.end();
});

test('Signal listener should be able to add again with the same tag', t => {
    const receivedPayloads1: string[] = [];
    const receivedPayloads2: string[] = [];

    const signal = new Signal<string>();

    const tag = {};

    const listener1 = (payload: string) => receivedPayloads1.push(payload);
    const listener2 = (payload: string) => receivedPayloads2.push(payload);

    signal.add(listener1, tag);
    signal.add(listener2, tag);
    signal.dispatch('a');
    signal.remove(tag);
    signal.dispatch('b');
    signal.add(listener1, tag);
    signal.add(listener2, tag);
    signal.dispatch('c');
    signal.remove(tag);
    signal.dispatch('d');

    t.deepEqual(receivedPayloads1, ['a', 'c']);
    t.deepEqual(receivedPayloads2, ['a', 'c']);

    t.end();
});
