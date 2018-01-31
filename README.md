![micro-signals](https://rawgit.com/lelandmiller/micro-signals/master/micro-signals.svg)

A tiny typed messaging system inspired by js-signals that uses ES2015 sets

[![Build Status](https://travis-ci.org/lelandmiller/micro-signals.svg?branch=master)](https://travis-ci.org/lelandmiller/micro-signals)
[![codecov](https://codecov.io/gh/lelandmiller/micro-signals/branch/master/graph/badge.svg)](https://codecov.io/gh/lelandmiller/micro-signals)
[![The Aj](https://img.shields.io/badge/The_Aj-verified-brightgreen.svg)](https://www.linkedin.com/in/ajay-kodali-1281553/)

## Path to Version 2

Version 2 of micro-signals will introduce some breaking interface changes. Most notably will be a
shift from using bindings to a remove method on the signal itself. While bindings were a very nice
interface, these changes will allow us to achieve late listener support (memorized signals) in a
synchronous signal with a reduced chance for user error.

Previously, adding late listener support had been put off due to the inability to access the return
value of a listener during the initial cached dispatch of the signal (which would need to happen
while adding the signal). In addition, attempting to use the binding could throw an error during
the initial call if the user did not check for the availability of a binding. We considered
several ways around these issues:

1.  Make micro-signals asynchronous

    If a dispatch always calls the listener asynchronously then the binding is always available
    during the initial call of the listener function, whether a cached value or not. However, some
    projects may require the use of micro-signals in an environment where asynchronous behavior
    is not desirable or easy to implement. A synchronous signal still supports asynchronous
    dispatching (an asynchronous action can be triggered from the listener), but an asynchronous
    signal does not allow for synchronous action dispatching.

2.  Pass a binding to the listener

    This would ensure that the listener always had a valid reference to the binding. However, the
    user still needs a way to detach a listener that has not been called yet which, if we
    continued to use the binding interface, would mean there is still a binding returned from the
    add function. This could be an easy spot for user error, as forgetting to use the binding
    passed into a listener would cause the same errors mentioned above.

3.  Do not use bindings

    If we use add and remove methods on signals, we can be sure we are always able to remove during
    a listener add operation.

Several variations of the above were considered, but at the end of it all, option 3 seemed to be the
cleanest way to provide a synchronous signal with late listener support that avoided the most
opportunities for user error.

In order to add some of the convenience of bindings back to the API, there are plans to add the
ability to tag a listener and then remove listeners based on either listener or tags.

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

Signals allow adding and removing listeners, similar to js-signals, but with methods that can
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

const listener = (payload: string) => {
    received.push(payload);
};
signal.add(listener);

signal.dispatch('a');

signal.remove(listener);

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

#### Signal.cache

Signal.cache is used to provide late listener support to signals. It takes a cache instance that
is responsible for determining what values are dispatched to late listeners, and returns a signal
that will provide all cached values to new listeners.

These caches implement a simple interface consisting of an add function to process values
that have been dispatched by the base signal and a forEach function to iterate over values that
should be provided to late listeners.

Two basic cache types are provided to cover the most common use cases for cached signals.
ValueCache replays the most recent value (similar to memorize in js-signals) and CollectionCache
replays all dispatched values.

```ts
import {Signal, ValueCache, CollectionCache} from 'micro-signals';
import * as assert from 'assert';

const signal = new Signal<string>();
const valueCached = signal.cache(new ValueCache());
const collectionCached = signal.cache(new CollectionCache());

const valueCachedReceived: string[] = [];
const collectionCachedReceived: string[] = [];

['a', 'b', 'c'].forEach(payload => signal.dispatch(payload));

valueCached.add(payload => valueCachedReceived.push(payload));
collectionCached.add(payload => collectionCachedReceived.push(payload));

['d', 'e'].forEach(payload => signal.dispatch(payload));

assert.deepEqual(valueCachedReceived, ['c', 'd', 'e']);
assert.deepEqual(collectionCachedReceived, ['a', 'b', 'c', 'd', 'e']);
```

Please note, there is currently not a way to unbind the cached signal from its base signal. This has
the potential to leak attached listeners. In practice this may not be an issue for most use cases.
Many use cases may have the base signal and the cached signal on the same object. For example:

```ts
import {Signal, ValueCache} from 'micro-signals';
import * as assert from 'assert';

class ToggleState {
    private _stateChanged = new Signal<boolean>();
    public stateChanged = this._stateChanged.cache(new ValueCache());

    public setState(state: boolean) {
        this._stateChanged.dispatch(state);
    }
}

const toggleState = new ToggleState();

toggleState.setState(true);
let state = undefined;
toggleState.stateChanged.add(toggleState => state = toggleState);

assert.strictEqual(state, true);
```

In this case both signals will become unreachable at the same time, and therefore the base signal
will never prevent any cleanup of the cached signal and its context. In many other cases this
leaking may be negligible as well. However, if this functionality is desired, please file an issue
or pull request against the repository.

#### Signal.readOnly

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

#### Signal.filter

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

Signal.filter also returns a signal of the correct type when filtering using a type predicate.

```ts
import {Signal} from 'micro-signals';
import * as assert from 'assert';

const signal = new Signal<string | null>();
const filteredSignal = signal.filter((x: string | null): x is string => typeof x === 'string');

const received: number[] = [];

filteredSignal.add(payload => {
    // note that the payload type is `string` instead of `string | null`
    received.push(payload.length);
});

['1', null, '12', null, '123'].forEach(x => signal.dispatch(x));

assert.deepEqual(received, [1, 2, 3]);
```

#### Signal.map

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

#### Signal.merge

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

#### Signal.promisify

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
        emitter.on('event', listener);
    },
    remove(listener) {
        emitter.removeListener('event', listener);
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

Though the second is more terse, there is always a listener connected to the underlying emitter
object. In some cases this may prevent proper garbage collection. In the top example, the Signal
only acts as a transformation layer, transforming listeners to provide the interface of a Signal
without storing any state itself. This is how the internal signal transformations work in order to
remove unnecessary intermediate signals. Feel free to use or ignore the ExtendedSignal at your
discretion.

### Interfaces

Several interfaces are exported as well for convenience:

-   Listener is an interface that defines a function that can be passed to Signal methods taking a
    listener (such as add or addOnce).
-   ReadableSignal is an interface for a Signal without dispatch.
-   WritableSignal only defines the dispatch method.

```ts
import {Signal, Listener, ReadableSignal, WritableSignal} from 'micro-signals';

const listener: Listener<string> = payload => console.log(payload);

const signal = new Signal<string>();

// A ReadableSignal cannot be dispatched
const readable: ReadableSignal<string> = signal;

readable.add(listener);

// A WritableSignal can be dispatched
const writable: WritableSignal<string> = signal;

writable.dispatch('hello!');
```
