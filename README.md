# micro-signals

A tiny typed messaging system inspired by js-signals that uses ES2015 sets

[![Build Status](https://travis-ci.org/lelandmiller/micro-signals.svg?branch=master)](https://travis-ci.org/lelandmiller/micro-signals)
[![codecov](https://codecov.io/gh/lelandmiller/micro-signals/branch/master/graph/badge.svg)](https://codecov.io/gh/lelandmiller/micro-signals)
[![The Aj](https://img.shields.io/badge/The_Aj-verified-brightgreen.svg)](https://www.linkedin.com/in/ajay-kodali-1281553/)

## Usage

Install using `npm install micro-signals`.

## Signal Types

micro-signals is a collection of very simple signal types that can be combined in powerful ways.

### Signal

Signals return a binding with a detach method, similar to js-signals, but with a simplified
interface. The example below shows all of the functionality for the basic signal.

```ts
import {Signal} from 'micro-signals';
import * as assert from 'assert';

const signal = new Signal<string>();

const received: string[] = [];

const binding = signal.add(payload => {
    received.push(payload);
});

signal.dispatch('a');

binding.detach();

signal.dispatch('b');

assert.deepEqual(received, ['a']);
```

### ReadOnlySignal

ReadOnlySignals provide a wrapper around a signal with no dispatch method. This is primarily used to
publicly expose a signal while indicating that consumers of the signal should not dispatch the
signal.

```ts
import {Signal, ReadOnlySignal} from 'micro-signals';
import * as assert from 'assert';

const signal = new Signal<string>();
const readOnlySignal = new ReadOnlySignal(signal);

const received: string[] = [];

readOnlySignal.add(payload => {
    received.push(payload);
});

assert.equal((readOnlySignal as any).dispatch, undefined);

signal.dispatch('a');

assert.deepEqual(received, ['a']);
```

### FilteredSignal

FilteredSignals are capable of filtering values coming through a Signal, similar to filtering an
array in JavaScript.

```ts
import {Signal, FilteredSignal} from 'micro-signals';
import * as assert from 'assert';

const signal = new Signal<number>();
const filteredSignal = new FilteredSignal(signal, x => x >= 0);

const received: number[] = [];

filteredSignal.add(payload => {
    received.push(payload);
});

[-4, 0, 6, -2, 8, 0].forEach(x => signal.dispatch(x));

assert.deepEqual(received, [0, 6, 8, 0]);
```

### MappedSignal

MappedSignals are able to transform payloads coming through a Signal, similar to mapping an array
in JavaScript.

```ts
import {Signal, MappedSignal} from 'micro-signals';
import * as assert from 'assert';

const signal = new Signal<string>();
const mappedSignal = new MappedSignal(signal, x => `${x}!`);

const received: string[] = [];

mappedSignal.add(payload => {
    received.push(payload);
});

['cat', 'dog', 'frog', 'sloth'].forEach(x => signal.dispatch(x));

assert.deepEqual(received, ['cat!', 'dog!', 'frog!', 'sloth!']);
```

### MergedSignal

MergedSignals take an arbitrary number of signals as constructor arguments and forward payloads from
all of the provided signals. They allow multiplexing of Signals.

```ts
import {Signal, MergedSignal} from 'micro-signals';
import * as assert from 'assert';

const signal1 = new Signal<string>();
const signal2 = new Signal<string>();

const mergedSignal = new MergedSignal(signal1, signal2);

const received: string[] = [];

mergedSignal.add(payload => {
    received.push(payload);
});

signal1.dispatch('Hello');
signal2.dispatch('world');
signal1.dispatch('!');

assert.deepEqual(received, ['Hello', 'world', '!']);
```

### promisifySignal

Turn signals into promises. The first argument is a resolution signal. When the resolution signal is
dispatched the promise will be resolved with the dispatched value. The second argument is an
optional rejection signal. When the rejection signal is dispatched the promise will be rejected with
the dispatched value.

```ts
import {Signal, promisifySignal} from 'micro-signals';

const successSignal = new Signal<void>();
const failureSignal = new Signal<void>();

const promise = promisifySignal(successSignal, failureSignal);

promise.then(() => console.log('success')).catch(() => console.error('failure'));
```

### Interfaces

Several interfaces are exported as well for convenience:

-   Listener is an interface that defines a function that can be passed to Signal methods taking a
    listener (such as add or addOnce).
-   SignalBinding is what is returned from adding a listener, it is the object with the detach
    method.
-   ReadableSignal is an interface for a Signal without dispatch.
-   WritableSignal only defines the dispatch method.

```ts
import {Signal, Listener, ReadableSignal, SignalBinding, WritableSignal} from 'micro-signals';

const listener: Listener<string> = payload => console.log(payload);

// SignalBindings are returned when attaching a listener
let binding: SignalBinding;

const signal = new Signal<string>();

// A ReadableSignal cannot be dispatched
const readable: ReadableSignal<string> = signal;

binding = readable.add(listener);

// A WritableSignal can only be dispatched
const writable: WritableSignal<string> = signal;

writable.dispatch('hello!');
```
