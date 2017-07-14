![micro-signals](https://rawgit.com/lelandmiller/micro-signals/master/micro-signals.svg)

A tiny typed messaging system inspired by js-signals that uses ES2015 sets

[![Build Status](https://travis-ci.org/lelandmiller/micro-signals.svg?branch=master)](https://travis-ci.org/lelandmiller/micro-signals)
[![codecov](https://codecov.io/gh/lelandmiller/micro-signals/branch/master/graph/badge.svg)](https://codecov.io/gh/lelandmiller/micro-signals)
[![The Aj](https://img.shields.io/badge/The_Aj-verified-brightgreen.svg)](https://www.linkedin.com/in/ajay-kodali-1281553/)

## Plans for 1.0.0

The current plan is to remove the alternate signal classes (MappedSignal, FilteredSignal, etc.) in
favor of using the extended Signal class with signal transformation methods. Once this is done the
Signal interface will be considered stable and 1.0.0 will be released. Static methods for merge and
promisifySignal will be added to the Signal class to address the lack of a MergedSignal class and
promisifySignal since those both took two signals, and it may seem more semantic in some cases to
have the static method.

## Usage

Install using `npm install micro-signals`.

## Signal

Signals return a binding with a detach method, similar to js-signals, but with methods that can
create new transformed signals (such as map and filter). These methods are similar to the matching
methods on a JavaScript array. Each provides a new Signal (it does not modify the current signal)
and is chainable. All of the Signals described below (MappedSignal, FilteredSignal, etc.) have a
matching method on the base Signal.

### Basic Usage of a Signal

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

### Using the Extended Signal Interface

```ts
import {Signal} from 'micro-signals';
import * as assert from 'assert';

const signal = new Signal<string>();

const received: string[] = [];

signal
    .filter(payload => payload === 'world')
    .map(payload => `hello ${payload}!`)
    .add(payload => received.push(payload));

signal
    .filter(payload => payload === 'moon')
    .map(payload => `goodnight ${payload}!`)
    .add(payload => received.push(payload));

signal.dispatch('world');
signal.dispatch('sun');
signal.dispatch('moon');

assert.deepEqual(received, ['hello world!', 'goodnight moon!']);
```

### Static Methods

#### Signal.merge

Signal.merge takes an arbitrary number of signals as constructor arguments and forward payloads from
all of the provided signals to the returned signal. This allow multiplexing of Signals. This matches
the behavior of the Signal.merge instance method.

```ts
import {Signal} from 'micro-signals';
import * as assert from 'assert';

const signal1 = new Signal<string>();
const signal2 = new Signal<string>();

const mergedSignal = Signal.merge(signal1, signal2);

const received: string[] = [];

mergedSignal.add(payload => {
    received.push(payload);
});

signal1.dispatch('Hello');
signal2.dispatch('world');
signal1.dispatch('!');

assert.deepEqual(received, ['Hello', 'world', '!']);
```

#### Signal.promisifySignal

Turn signals into promises. The first argument is a resolution signal. When the resolution signal is
dispatched the promise will be resolved with the dispatched value. The second argument is an
optional rejection signal. When the rejection signal is dispatched the promise will be rejected with
the dispatched value. This matches the behavior of the Signal.promisify instance method.

```ts
import {Signal} from 'micro-signals';

const successSignal = new Signal<void>();
const failureSignal = new Signal<void>();

const promise = Signal.promisify(successSignal, failureSignal);

promise.then(() => console.log('success')).catch(() => console.error('failure'));
```

### Instance Methods

### Signal.readOnly

readOnly provides a wrapper around a signal with no dispatch method. This is primarily used to
publicly expose a signal while indicating that consumers of the signal should not dispatch the
signal.

```ts
import {Signal} from 'micro-signals';
import * as assert from 'assert';

const signal = new Signal<string>();
const readOnlySignal = signal.readOnly();

const received: string[] = [];

readOnlySignal.add(payload => {
    received.push(payload);
});

assert.equal((readOnlySignal as any).dispatch, undefined);

signal.dispatch('a');

assert.deepEqual(received, ['a']);
```

### Signal.filter

Signal.filter provides the ability to filter values coming through a Signal, similar to filtering an
array in JavaScript.

```ts
import {Signal} from 'micro-signals';
import * as assert from 'assert';

const signal = new Signal<number>();
const filteredSignal = signal.filter(x => x >= 0);

const received: number[] = [];

filteredSignal.add(payload => {
    received.push(payload);
});

[-4, 0, 6, -2, 8, 0].forEach(x => signal.dispatch(x));

assert.deepEqual(received, [0, 6, 8, 0]);
```

### Signal.map

Signal.map provides the ability to transform payloads coming through a Signal, similar to mapping an
array in JavaScript.

```ts
import {Signal} from 'micro-signals';
import * as assert from 'assert';

const signal = new Signal<string>();
const mappedSignal = signal.map(x => `${x}!`);

const received: string[] = [];

mappedSignal.add(payload => {
    received.push(payload);
});

['cat', 'dog', 'frog', 'sloth'].forEach(x => signal.dispatch(x));

assert.deepEqual(received, ['cat!', 'dog!', 'frog!', 'sloth!']);
```

### Signal.merge

Signal.merge takes an arbitrary number of signals as constructor arguments and forward payloads from
all of the provided signals and the base signal. This allow multiplexing of Signals. Effectively it
merges the provided signals with the base signal.

```ts
import {Signal} from 'micro-signals';
import * as assert from 'assert';

const signal1 = new Signal<string>();
const signal2 = new Signal<string>();

const mergedSignal = signal1.merge(signal2);

const received: string[] = [];

mergedSignal.add(payload => {
    received.push(payload);
});

signal1.dispatch('Hello');
signal2.dispatch('world');
signal1.dispatch('!');

assert.deepEqual(received, ['Hello', 'world', '!']);
```

### Signal.promisifySignal

Turn signals into promises. The base signal is a resolution signal. When the resolution signal is
dispatched the promise will be resolved with the dispatched value. The second argument is an
optional rejection signal. When the rejection signal is dispatched the promise will be rejected with
the dispatched value.

```ts
import {Signal} from 'micro-signals';

const successSignal = new Signal<void>();
const failureSignal = new Signal<void>();

const promise = successSignal.promisify(failureSignal);

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
