![micro-signals](https://rawgit.com/lelandmiller/micro-signals/master/micro-signals.svg)

A tiny typed messaging system inspired by js-signals that uses ES2015 sets

[![Build Status](https://travis-ci.org/lelandmiller/micro-signals.svg?branch=master)](https://travis-ci.org/lelandmiller/micro-signals)
[![codecov](https://codecov.io/gh/lelandmiller/micro-signals/branch/master/graph/badge.svg)](https://codecov.io/gh/lelandmiller/micro-signals)
[![The Aj](https://img.shields.io/badge/The_Aj-verified-brightgreen.svg)](https://www.linkedin.com/in/ajay-kodali-1281553/)

## About

micro-signals is an attempt to provide a simple and flexible signal library for TypeScript and
JavaScript consumption. It borrows ideas from libraries such as
[RxJS](https://github.com/Reactive-Extensions/RxJS) and
[js-signals](https://millermedeiros.github.io/js-signals/).

The library has no relation to [mini-signals](https://github.com/Hypercubed/mini-signals) and the
name micro-signals is not meant to imply that this library is smaller than mini-signals in any way.
The package was named and published before it was noticed that there already was a mini-signals
library. Also, it may not seem very "micro" at this point. The original implementation was
[much smaller](https://github.com/lelandmiller/micro-signals/blob/v0.1.0/src/micro-signals.ts) and
at the time the name made more sense. However, the hope is that this library can provide a very
useful signal interface and remain as "micro" as possible.

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

#### Signal.promisify

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

### Signal.promisify

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

### ExtendedSignal

An ExtendedSignal class is provided for the creation of a custom signal or wrapping a basic signal
(containing only an add method) with the remainder of the methods found on a micro-signals Signal
(such as map, filter, and so on). In many cases this gives us an easy way to ensure an intermediate
Signal does not block garbage collection, and in some cases may present a simpler way to obtain a
desired interface. For example, this makes it possible to extend the ExtendedSignal class to get the
Signal interface without having to expose the add method anywhere.

Compare the following code examples:

```ts
import {ExtendedSignal} from 'micro-signals';
import EventEmitter = require('events');
import * as assert from 'assert';

const emitter = new EventEmitter();

const signal = new ExtendedSignal<number>({
    add(listener) {
        const cb = (value: number) => listener(value);
        emitter.on('event', cb);
        return {
            detach() {
                emitter.removeListener('event', cb);
            }
        };
    },
});

const received: number[] = [];

signal.map(x => x + 1).add(payload => received.push(payload));

emitter.emit('event', 1);
emitter.emit('event', 2);

assert.deepEqual(received, [2, 3]);
```

```ts
import {Signal} from 'micro-signals';
import EventEmitter = require('events');
import * as assert from 'assert';

const emitter = new EventEmitter();

const signal = new Signal<number>();

emitter.on('event', payload => signal.dispatch(payload));

const received: number[] = [];

signal.map(x => x + 1).add(payload => received.push(payload));

emitter.emit('event', 1);
emitter.emit('event', 2);

assert.deepEqual(received, [2, 3]);
```

Though the second is more terse, there is always a listener connected underlying emitter object. In
some cases this may prevent proper garbage collection. In the top example, the Signal only acts as a
transformation layer on listeners to provide the interface of a Signal without storing any state
itself. This is how the internal signal transformations work in order to provide unnecessary
intermediate signals. Feel free to use it or ignore it at your discretion.

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
